"use strict";
var input = document.getElementById("fileInput");
var validateButton = document.getElementById("validateButton");
var reader = new FileReader();
var result;
if (input)
    input.addEventListener('change', onChange);
if (validateButton)
    validateButton.addEventListener('click', validar);
function onChange(event) {
    var file = event.target.files[0];
    reader.readAsText(file);
    reader.onload = onLoad;
}
function onLoad() {
    if (!reader.result)
        return;
    result = reader.result;
    var lineas = result.split('\n');
    var codigoHTML = "";
    for (var _i = 0, lineas_1 = lineas; _i < lineas_1.length; _i++) {
        var linea = lineas_1[_i];
        codigoHTML += '<p>' + linea + '</p>';
    }
    var element = document.getElementById("text");
    if (element)
        element.innerHTML = codigoHTML;
}
function validar() {
    try {
        var lineas = result.split("\n");
        for (var i = 0; i < lineas.length; i++) {
            var current = lineas[i];
            switch (i) {
                case lineas.length - 1:
                    validateTerminar(current);
                    break;
                case 1:
                    validateInicio(current);
                    break;
                case 0:
                    validateStart(current);
                    break;
                default:
                    validateInstruction(current);
                    break;
            }
        }
        M.toast({ html: 'Archivo valido' });
    }
    catch (error) {
        M.toast({ html: 'Syntax error!' });
    }
}
function validateInstruction(linea) {
    var instructions = linea.split(";").filter(function (x) { return x != "\r"; }).map(function (x) { return x + ";"; });
    console.log(instructions);
}
function validateStart(linea) {
    var regex = new RegExp(/^programa .*;[ \t\n\r]*$/g);
    if (regex.test(linea))
        return true;
    throw new Error("Syntax error");
}
function validateInicio(linea) {
    var regex = new RegExp(/^iniciar[ \t\n\r]*$/g);
    if (regex.test(linea))
        return true;
    throw new Error("Syntax error");
}
function validateTerminar(linea) {
    var regex = new RegExp(/^terminar.[ \t\n\r]*$/g);
    if (regex.test(linea))
        return true;
    throw new Error("Syntax error");
}
