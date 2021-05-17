
const input = document.getElementById("fileInput") as HTMLInputElement;
const editor = document.getElementById("editor") as HTMLInputElement;
const validateButton = document.getElementById("validateButton")
const reader = new FileReader();
const variables = new Set<string>()
const operators = new RegExp(/\+|-|\*|\/|\^|;/g)
const isVariableRegex = new RegExp(/^([a-z])([0-9a-z]*)$/g)
const numberRegex = new RegExp(/^[0-9]*$/g)
let result: string

if (input) input.addEventListener('change', onChange);

if (validateButton) validateButton.addEventListener('click', validar)


function onChange(event: any) {
  let file = event.target.files[0];

  const extension = file.name.split(".").pop()

  if (extension != "txt")
    return M.toast({ html: `Por favor ingrese un archivo txt`, classes: "toast error-toast" });

  reader.readAsText(file);

  reader.onload = onLoad;

  input.value = ""

}

function onLoad() {


  if (!reader.result)
    return


  result = reader.result as string

  editor.value = result

}

function validar() {
  let i = 0
  try {

    const value = editor.value
    const lineas = value.split("\n");

    for (i; i < lineas.length; i++) {
      const current = lineas[i]
      switch (i) {
        case lineas.length - 1: validateTerminar(current); break;
        case 1: validateInicio(current); break;
        case 0: validateStart(current); break;
        default: validateInstruction(current); break;
      }

    }
    M.toast({ html: 'Archivo válido', classes: "toast success-toast" });

  } catch (error) {
    M.toast({ html: `${error} en línea ${i + 1}`, classes: "toast error-toast" });

  }

}

function validateInstruction(linea: string) {

  const instructions = linea.split(";").filter(x => x != "\r"
    && x != "\n"
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
  const regex = new RegExp(/^programa ([a-z])([0-9a-z]*);[ \t\n\r]*$/g)
  if (regex.test(linea))
    return true
  throw new Error("Syntax error")
}

function validateInicio(linea: string) {
  const regex = new RegExp(/^iniciar[ \t\n\r]*$/g)
  if (regex.test(linea))
    return true
  throw new Error("Syntax error")
}

function validateLeer(linea: string) {

  const lineaSplit = linea.split(" ")


  if (lineaSplit.length > 2)
    throw new Error("Syntax error")

  const varName = lineaSplit.pop()?.split(";").shift()

  if (varName == null)
    throw new Error("Syntax error")

  const regex = new RegExp(/^leer ([a-z])([0-9a-z]*);[ \t\n\r]*$/g)

  if (regex.test(linea)) {
    variables.add(varName)
    return true
  }
  throw new Error("Syntax error")
}

function validateImprimir(linea: string) {

  const lineaSplit = linea.split(" ")

  if (lineaSplit.length > 2)
    throw new Error("Syntax error")


  const varName = lineaSplit.pop()?.split(";").shift()

  if (varName == null)
    throw new Error("Syntax error")


  if (!variables.has(varName))
    throw new Error(`La variable '${varName}' no esta definida al momento de utilizarse`)

  const regex = new RegExp(/^imprimir ([a-z])([0-9a-z]*);[ \t\n\r]*$/g)

  if (regex.test(linea))
    return true

  throw new Error("Syntax error")
}

function validateExpresionSyntax(linea: string) {
  const regex = new RegExp(/^([a-z])([0-9a-z]*)( )*:=.*;$/g);

  if (!regex.test(linea))
    throw new Error("Syntax error")

  const expresion = linea.split("=").pop()

  if (expresion == null)
    throw new Error("Syntax error")

  const newVarName = linea.split(":").filter(x => x != " ").shift()

  if (newVarName == null)
    throw new Error("Syntax error")

  validateExpresion(expresion)

  variables.add(newVarName)

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
        if (validateExpresionItem(variableName, x))
          variableName = ""
        else variableName += x
        break;
    }
    lastCharacter = x
  }

  if (parenthresis.length != 0)
    throw new Error(`Error de sintaxis`)

}

function validateExpresionItem(item: string, currentChar: string): boolean {


  const isVariable = isVariableRegex.test(item)


  if (operators.test(currentChar)) {
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
  const regex = new RegExp(/^terminar.[ \t\n\r]*$/g)
  if (regex.test(linea))
    return true
  throw new Error("Syntax error")
}