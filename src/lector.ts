
const input = document.getElementById("fileInput") as HTMLInputElement;
const editor = document.getElementById("editor") as HTMLInputElement;
const validateButton = document.getElementById("validateButton")
const reader = new FileReader();
const variables = new Set<string>()
const operators = new RegExp(/\+|\-|\*|\/|\^/)
const whiteSpacesRegex = new RegExp(/^[\n\t \r]*$/)
const validCharacters = new RegExp(/^([a-z0-9 ;()/\*\-\+\^\/\:\=\n\t\r\.])*$/)
const isVariableRegex = new RegExp(/^([a-z])([0-9a-z]*)$/)
const numberRegex = new RegExp(/^[0-9]*$/)

let result: string

if (input) input.addEventListener('change', onChange);

if (validateButton) validateButton.addEventListener('click', validar)



function onChange(event: any) {
  let file = event.target.files[0];

  const extension = file.name.split(".").pop()

  input.value = ""

  if (extension != "txt")
    return M.toast({ html: `Por favor ingrese un archivo txt`, classes: "toast error-toast", displayLength: 2000 });

  reader.readAsText(file);

  reader.onload = onLoad;


}

function onLoad() {


  if (!reader.result)
    return


  result = reader.result as string

  editor.value = result

}

function validar() {
  variables.clear()
  let i = 0
  try {

    const value = editor.value
    const lineas = value.split("\n");


    for (let j = lineas.length - 1; j > 0; j--) {
      const linea = lineas[j]
      if (linea.length == 0 || whiteSpacesRegex.test(linea))
        lineas.pop()
    }



    for (i; i < lineas.length; i++) {
      const current = lineas[i]
      if (!validCharacters.test(current))
        throw new Error(`Caracter inválido`)

      switch (i) {
        case lineas.length - 1: validateTerminar(current); break;
        case 1: validateInicio(current); break;
        case 0: validateStart(current); break;
        default: validateInstruction(current); break;
      }

    }

    if (lineas.length <= 3)
      throw new Error("El programa debe tener al menos una instrucción")

    M.toast({ html: 'Archivo válido', classes: "toast success-toast", displayLength: 2000 });

  } catch (error) {
    console.error(error)
    M.toast({ html: `${error}, línea ${i + 1}`, classes: "toast error-toast", displayLength: 2000 });

  }

}

function validateInstruction(linea: string) {

  const validInstruction = new RegExp(/^(([a-z0-9 ()/\*\-\+\^\/\:\=\n\t\r\.])*(;[\n\t \r]*))*$/)

  if (!validInstruction.test(linea))
    throw new Error("Instrucción mal construida")

  const startsWithWhiteSpace = new RegExp(/^([ \n\t\r])/)

  if (startsWithWhiteSpace.test(linea))
    throw new Error("No puede haber espacios al inicio de la línea")

  const instructions = linea.split(";").filter(x =>
    !whiteSpacesRegex.test(x)
    && x.length > 0).map(x => {

      x = x.replace(/^ */, "")

      return x + ";"
    })

  if (instructions.length == 0)
    throw new Error("No puede haber líneas en blanco")

  if (instructions.length > 1)
    throw new Error("Una línea no puede tener más de una instrucción")

  for (let instruction of instructions) {
    const firstWord = instruction.split(" ").shift()
    switch (firstWord) {
      case "leer": validateLeer(instruction); break;
      case "imprimir": validateImprimir(instruction); break;
      default: validateExpresionSyntax(instruction); break;
    }

  }

}

function validateStart(linea: string) {
  const regex = new RegExp(/^programa ([a-z])([0-9a-z]*);[ \t\n\r]*$/)
  if (regex.test(linea))
    return true
  throw new Error("Error de sintaxis")
}

function validateInicio(linea: string) {
  const regex = new RegExp(/^iniciar[ \t\n\r]*$/)
  if (regex.test(linea))
    return true
  throw new Error("Error de sintaxis")
}

function validateLeer(linea: string) {

  const regex = new RegExp(/^leer .*;$/)
  if (!regex.test(linea))
    throw new Error("Instrucción mal construida")

  const regexCaracteresValidos = new RegExp(/^leer ([a-z])([0-9a-z]*)[ \t\n\r]*(;[ \t\n\r]*)$/)

  if (!regexCaracteresValidos.test(linea))
    throw new Error("Caractér inválido")


  const lineaSplit = linea.split("leer")

  const varName = lineaSplit.pop()?.replace(";", "")
  if (varName == null)
    throw new Error("Error de sintaxis")

  const realVarName = varName.replace(/\s/g, "")
  const regexPalabrasReservadas = new RegExp(/^(leer|imprimir|programa|terminar|iniciar)$/)
  if (regexPalabrasReservadas.test(realVarName))
    throw new Error("Palabra reservada como nombre de variable")
  variables.add(realVarName)

  return true

}

function validateImprimir(linea: string) {

  const regex = new RegExp(/^imprimir ([a-z])([0-9a-z]*)[ \t\n\r]*;[ \t\n\r]*$/)

  if (!regex.test(linea))
    throw new Error("Error de sintaxis")

  const lineaSplit = linea.split("imprimir")


  const varName = lineaSplit.pop()?.split(";").shift()
  if (varName == null)
    throw new Error("Error de sintaxis")

  const realVarName = varName.replace(/\s/g, "")

  if (!variables.has(realVarName))
    throw new Error(`La variable ${realVarName} no esta definida al momento de utilizarse`)
  return true

}

function validateExpresionSyntax(linea: string) {

  const regex = new RegExp(/^([a-z])([0-9a-z]*)( )*:=.*;$/);

  if (!regex.test(linea))
    throw new Error("Expresión mal construida")

  const regexCaracteres = new RegExp(/^([a-z])([0-9a-z]*)( )?:=([0-9a-z ()+\-\*\/\^]*);$/);


  if (!regexCaracteres.test(linea))
    throw new Error("Caractér inválido")

  const splitLinea = linea.split("=")

  splitLinea.shift()

  const expresion = splitLinea.join("")

  if (expresion == null)
    throw new Error("Error de sintaxis")


  const newVarName = linea.split(":").filter(x => x != " ").shift()

  if (newVarName == null)
    throw new Error("Error de sintaxis")

  validateExpresion(expresion)

  variables.add(newVarName.replace(/\s/g, ""))

}

function validateExpresion(expresion: string) {
  const parenthresis = []

  let lastCharacter = null

  let variableName = ""

  const expresionSplit = expresion.split("")
  let index = 0
  for (let x of expresionSplit) {

    index++
    const next = index < expresionSplit.length ? expresionSplit[index] : expresionSplit[index - 1]


    switch (x) {
      case " ":
        if (lastCharacter
          && !operators.test(lastCharacter)
          && lastCharacter != ")"
          && lastCharacter != "("
          && next != " "
          && next != ")"
          && !operators.test(next)
          && next != ";")
          throw new Error(`Caracter '${x}' inesperado`)

        continue;

      case "(":
        if (!operators.test(lastCharacter!!) && variableName.length > 0)
          throw new Error(`Caracter '${x}' inesperado`)
        parenthresis.push(x);
        variableName = ""
        break;
      case ")":
        if (parenthresis.length == 0
          || lastCharacter == "("
          || operators.test(lastCharacter!!))
          throw new Error(`Caracter '${x}' inesperado`)


        if (isVariableRegex.test(variableName) && !variables.has(variableName))
          throw new Error(`La variable ${variableName} no esta definida al momento de utilizarse`)

        parenthresis.pop()
        variableName = ""

        break;
      default:

        if (lastCharacter == "/" && x == "0")
          throw new Error(`Division entre 0`)



        if (validateExpresionItem(variableName, x, lastCharacter!!))
          variableName = ""
        else variableName += x
        break;
    }
    lastCharacter = x
  }


  if (parenthresis.length != 0)
    throw new Error(`Parentésis sin cerrar`)

}

function validateExpresionItem(item: string, currentChar: string, lastChar: string): boolean {


  if (lastChar == ")" && !operators.test(currentChar) && currentChar != ";")
    throw new Error(`Caracter '${currentChar}' inesperado`)

  if (item.split("").length == 0) {

    if (operators.test(currentChar) && currentChar != "-" && lastChar != ")")
      throw new Error(`Caracter '${currentChar}' inesperado`)

    item = currentChar
  }

  const isVariable = isVariableRegex.test(item)

  if (operators.test(currentChar) || currentChar == ";" || currentChar == ")") {

    if (operators.test(lastChar) && currentChar == "-" && lastChar != "-")
      return true

    if (lastChar == "(" && currentChar != "-" || operators.test(lastChar))
      throw new Error(`Caracter '${currentChar}' inesperado`)

    if (isVariable && !variables.has(item))
      throw new Error(`La variable ${item} no esta definida al momento de utilizarse`)
    return true
  }

  const number = Number.parseInt(item)

  if (!isVariable && Number.isNaN(number))
    throw new Error(`Caracter '${currentChar}' inesperado`)


  return false

}

function validateTerminar(linea: string) {
  const regex = new RegExp(/^terminar.[ \t\n\r]*$/)
  if (regex.test(linea))
    return true
  throw new Error("Error de sintaxis")
}