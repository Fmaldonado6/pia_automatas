
const input = document.getElementById("fileInput");
const validateButton = document.getElementById("validateButton")
const reader = new FileReader();
let result: string

if (input) input.addEventListener('change', onChange);

if (validateButton) validateButton.addEventListener('click', validar)


function onChange(event: any) {
  let file = event.target.files[0];

  reader.readAsText(file);

  reader.onload = onLoad;

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

  try {
    const lineas = result.split("\n")

    for (let i = 0; i < lineas.length; i++) {
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
    M.toast({ html: 'Syntax error!' });

  }

}

function validateInstruction(linea: string) {
  const instructions = linea.split(";").filter(x => x != "\r").map(x => x + ";")
  console.log(instructions)
}

function validateStart(linea: string) {
  const regex = new RegExp(/^programa .*;[ \t\n\r]*$/g)
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

function validateTerminar(linea: string) {
  const regex = new RegExp(/^terminar.[ \t\n\r]*$/g)
  if (regex.test(linea))
    return true
  throw new Error("Syntax error")
}