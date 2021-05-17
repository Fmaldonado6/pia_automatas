
const input = document.getElementById("fileInput") as HTMLInputElement;
const validateButton = document.getElementById("validateButton")
const reader = new FileReader();
const variables = new Set<string>()
let result: string

if (input) input.addEventListener('change', onChange);

if (validateButton) validateButton.addEventListener('click', validar)


function onChange(event: any) {
  let file = event.target.files[0];

  reader.readAsText(file);

  reader.onload = onLoad;

  input.value = ""

}

function onLoad() {


  if (!reader.result)
    return

  result = reader.result as string

  let lineas = result.split('\n');

  let codigoHTML = "";

  for (let linea of lineas) {
    codigoHTML += '<p>' + linea + '</p>'
  }

  const element = document.getElementById("text")
  if (element) element.innerHTML = codigoHTML;

}

function validar() {
  let i = 0
  try {
    const lineas = result.split("\n")

    for (i = 0; i < lineas.length; i++) {
      const current = lineas[i]
      switch (i) {
        case lineas.length - 1: validateTerminar(current); break;
        case 1: validateInicio(current); break;
        case 0: validateStart(current); break;
        default: validateInstruction(current); break;
      }

    }
    M.toast({ html: 'Archivo valido' });

  } catch (error) {
    M.toast({ html: `${error} en línea ${i + 1}` });

  }

}

function validateInstruction(linea: string) {
  const instructions = linea.split(";").filter(x => x != "\r").map(x => x + ";")

  for (let instruction of instructions) {
    const firstWord = instruction.split(" ").shift()

    console.log(firstWord)
    switch (firstWord) {
      case "leer": validateLeer(instruction); break;
      case "imprimir": validateImprimir(instruction); break;
      default: validateExpresion(instruction); break;
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

  if (variables.has(varName) == null)
    throw new Error("La variable no existe")

  const regex = new RegExp(/^imprimir ([a-z])([0-9a-z]*);[ \t\n\r]*$/g)

  if (regex.test(linea))
    return true

  throw new Error("Syntax error")
}

function validateExpresion(linea: string) {
  const regex = new RegExp(/^([a-z])([0-9a-z]*)( )*:=.*;$/g);
  if (!regex.test(linea))
    throw new Error("Syntax error")

  const expresion = linea.split("=").pop()

  const newVarName = linea.split(":").filter(x => x != " ").shift()

  if (newVarName == null)
    throw new Error("Syntax error")

  const operators = ['*', '+', '-', '/']

  const parenthresis = []

  let lastCharacter

  let variableName = ""

  for (let x of expresion!!.split("")) {
    if (x == " ")
      continue;

    if (x == "0" && lastCharacter == "/")
      throw new Error(`Division entre 0`)

    if (operators.includes(x)) {

      if (variables.has(variableName) == null)
        throw new Error(`La variable '${variableName}' no esta definida al momenta de usarse`)

      variableName = ""
    }

    if (x == "(")
      parenthresis.push(x)

    if (x == ")") {

      if (parenthresis.length == 0)
        throw new Error(`Error de sintaxis`)

      parenthresis.pop()
    }

    variableName += x

    lastCharacter = x
  }

  if (parenthresis.length != 0)
    throw new Error(`Error de sintaxis`)

  variables.add(newVarName)

}

// function validateExpresion(linea: string){
//   const regex = new RegExp(/^([a-z])([0-9a-z]*) := ([(]?([0-9]*|[a-z]*)[+|-|\/|*|^]([0-9]*|[a-z]*)[)]?)*;$/g);
//   const regex1 = new RegExp(/^([a-z])([0-9a-z]*) := [(]?([(]?([-]?[0-9]+|([a-z])([0-9a-z]*)+)[)]?[+|-|\/|*|^][(]?([-]?[0-9]*|([a-z])([0-9a-z]*))[)]*)+;$/g);
// }

function validateTerminar(linea: string) {
  const regex = new RegExp(/^terminar.[ \t\n\r]*$/g)
  if (regex.test(linea))
    return true
  throw new Error("Syntax error")
}