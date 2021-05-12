

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

  result = reader.result as string;

  if (!result)
    return

  let lineas = result.split('\n');

  let codigoHTML = '<br/>';

  for (let linea of lineas) {
    codigoHTML += '<p>' + linea + '</p>'
  }

  const element = document.getElementById("p")
  if (element) element.innerHTML = codigoHTML;

}

function validar() {

  console.log(result)

}