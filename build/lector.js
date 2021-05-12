"use strict";
var input = document.getElementById("fileInput");
var validateButton = document.getElementById("validate");
var reader = new FileReader();
var result;
if (input)
    input.addEventListener('change', onChange);
if (validateButton)
    validateButton.addEventListener('onclick', validar);
function onChange(event) {
    var file = event.target.files[0];
    reader.readAsText(file);
    reader.onload = onLoad;
}
function onLoad() {
    result = reader.result;
    if (!result)
        return;
    var lineas = result.split('\n');
    var codigoHTML = '<br/>';
    for (var _i = 0, lineas_1 = lineas; _i < lineas_1.length; _i++) {
        var linea = lineas_1[_i];
        codigoHTML += '<p>' + linea + '</p>';
    }
    var element = document.getElementById("p");
    if (element)
        element.innerHTML = codigoHTML;
}
function validar() {
    console.log(result);
}
