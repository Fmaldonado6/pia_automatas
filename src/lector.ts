
const input = document.getElementById("fileInput") as HTMLInputElement;
const editor = document.getElementById("editor") as HTMLInputElement;
const validateButton = document.getElementById("validateButton")
const reader = new FileReader();
const variables = new Set<string>()
const operators = new RegExp(/\+|\-|\*|\/|\^|;/)
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
    M.toast({ html: 'Archivo válido', classes: "toast success-toast", displayLength: 2000 });

  } catch (error) {
    console.error(error)
    M.toast({ html: `${error} en línea ${i + 1}`, classes: "toast error-toast", displayLength: 2000 });

  }

}

function validateInstruction(linea: string) {

  const validInstruction = new RegExp(/^([a-z0-9 ()/\*\-\+\^\/\:\=\n\t\r\.])*(;[\n\t \r]*)$/)

  if (!validInstruction.test(linea))
    throw new Error("Error de sintaxis")

  const instructions = linea.split(";").filter(x =>
    !whiteSpacesRegex.test(x)
    && x.length > 0).map(x => x + ";")


  if (instructions.length == 0)
    throw new Error("Error de sintaxis")

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

  const regex = new RegExp(/^leer[ \t\n\r]*([a-z])([0-9a-z]*)[ \t\n\r]*(;[ \t\n\r]*)$/)
  console.log(linea)
  if (!regex.test(linea))
    throw new Error("Error de sintaxis")


  const lineaSplit = linea.split("leer")

  const varName = lineaSplit.pop()?.split(";").shift()
  if (varName == null)
    throw new Error("Error de sintaxis")


  variables.add(varName.replace(/\s/g, ""))

  return true

}

function validateImprimir(linea: string) {

  const regex = new RegExp(/^imprimir[ \t\n\r]*([a-z])([0-9a-z]*)[ \t\n\r]*;[ \t\n\r]*$/)

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
    throw new Error("Error de sintaxis")

  const expresion = linea.split("=").pop()

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

  let lastCharacter = ""

  let variableName = ""

  for (let x of expresion.split("")) {

    switch (x) {
      case " ": continue;
      case "0":
        if (lastCharacter == "/")
          throw new Error(`Division entre 0`)
        break;
      case "(":
        parenthresis.push(x);
        break;
      case ")":
        if (parenthresis.length == 0
          || lastCharacter == "("
          || operators.test(lastCharacter))
          throw new Error(`Error de sintaxis caracter ${x} inesperado`)
        parenthresis.pop()
        break;
      default:
        if (validateExpresionItem(variableName, x, lastCharacter))
          variableName = ""
        else variableName += x
        break;
    }
    lastCharacter = x
  }

  if (parenthresis.length != 0)
    throw new Error(`Error de sintaxis`)

}

function validateExpresionItem(item: string, currentChar: string, lastChar: string): boolean {

  const isVariable = isVariableRegex.test(item)

  if (operators.test(currentChar)) {

    if (lastChar == "(")
      throw new Error(`Error de sintaxis caracter ${currentChar} inesperado`)

    if (isVariable && !variables.has(item))
      throw new Error(`La variable ${item} no esta definida al momento de utilizarse`)
    return true
  }

  const number = Number.parseInt(item)
  const itemIsEmpty = item.split("").length == 0


  if (!isVariable && Number.isNaN(number) && !itemIsEmpty) {
    throw new Error(`Error de sintaxis caracter ${currentChar} inesperado`)
  }



  return false

}

function validateTerminar(linea: string) {
  const regex = new RegExp(/^terminar.[ \t\n\r]*$/)
  if (regex.test(linea))
    return true
  throw new Error("Error de sintaxis")
}