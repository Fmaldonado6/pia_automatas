var input = myForm.myInput;
var reader = new FileReader;

input.addEventListener('change', onChange);


function onChange(event) {
  var file = event.target.files[0];
  
  reader.readAsText(file);
  
  reader.onload = onLoad;
  
}

function onLoad() {
  var result = reader.result; // Obtienes el texto

  
  var lineas = result.split('\n');
  
  var codigoHTML='<br/>';
  
  for(var linea of lineas) {
    console.log('[linea]', linea)
    codigoHTML += '<p>'+linea+'</p>'
    
  }
  document.getElementById("p").innerHTML = codigoHTML;
  
}