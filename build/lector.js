"use strict";
var input = document.getElementById("fileInput");
var validateButton = document.getElementById("validateButton");
var reader = new FileReader();
var variables = new Set();
var result;
if (input)
    input.addEventListener('change', onChange);
if (validateButton)
    validateButton.addEventListener('click', validar);
function onChange(event) {
    var file = event.target.files[0];
    reader.readAsText(file);
    reader.onload = onLoad;
    input.value = "";
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
    var i = 0;
    try {
        var lineas = result.split("\n");
        for (i = 0; i < lineas.length; i++) {
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
        M.toast({ html: error + " en l\u00EDnea " + (i + 1) });
    }
}
function validateInstruction(linea) {
    var instructions = linea.split(";").filter(function (x) { return x != "\r"; }).map(function (x) { return x + ";"; });
    for (var _i = 0, instructions_1 = instructions; _i < instructions_1.length; _i++) {
        var instruction = instructions_1[_i];
        var firstWord = instruction.split(" ").shift();
        console.log(firstWord);
        switch (firstWord) {
            case "leer":
                validateLeer(instruction);
                break;
            case "imprimir":
                validateImprimir(instruction);
                break;
            default:
                validateExpresion(instruction);
                break;
        }
    }
}
function validateStart(linea) {
    var regex = new RegExp(/^programa ([a-z])([0-9a-z]*);[ \t\n\r]*$/g);
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
function validateLeer(linea) {
    var _a;
    var lineaSplit = linea.split(" ");
    if (lineaSplit.length > 2)
        throw new Error("Syntax error");
    var varName = (_a = lineaSplit.pop()) === null || _a === void 0 ? void 0 : _a.split(";").shift();
    if (varName == null)
        throw new Error("Syntax error");
    var regex = new RegExp(/^leer ([a-z])([0-9a-z]*);[ \t\n\r]*$/g);
    if (regex.test(linea)) {
        variables.add(varName);
        return true;
    }
    throw new Error("Syntax error");
}
function validateImprimir(linea) {
    var _a;
    var lineaSplit = linea.split(" ");
    if (lineaSplit.length > 2)
        throw new Error("Syntax error");
    var varName = (_a = lineaSplit.pop()) === null || _a === void 0 ? void 0 : _a.split(";").shift();
    if (varName == null)
        throw new Error("Syntax error");
    if (variables.has(varName) == null)
        throw new Error("La variable no existe");
    var regex = new RegExp(/^imprimir ([a-z])([0-9a-z]*);[ \t\n\r]*$/g);
    if (regex.test(linea))
        return true;
    throw new Error("Syntax error");
}
function validateExpresion(linea) {
    var regex = new RegExp(/^([a-z])([0-9a-z]*)( )*:=.*;$/g);
    if (!regex.test(linea))
        throw new Error("Syntax error");
    var expresion = linea.split("=").pop();
    var newVarName = linea.split(":").filter(function (x) { return x != " "; }).shift();
    if (newVarName == null)
        throw new Error("Syntax error");
    var operators = ['*', '+', '-', '/'];
    var parenthresis = [];
    var lastCharacter;
    var variableName = "";
    for (var _i = 0, _a = expresion.split(""); _i < _a.length; _i++) {
        var x = _a[_i];
        if (x == " ")
            continue;
        if (x == "0" && lastCharacter == "/")
            throw new Error("Division entre 0");
        if (operators.includes(x)) {
            if (variables.has(variableName) == null)
                throw new Error("La variable '" + variableName + "' no esta definida al momenta de usarse");
            variableName = "";
        }
        if (x == "(")
            parenthresis.push(x);
        if (x == ")") {
            if (parenthresis.length == 0)
                throw new Error("Error de sintaxis");
            parenthresis.pop();
        }
        variableName += x;
        lastCharacter = x;
    }
    if (parenthresis.length != 0)
        throw new Error("Error de sintaxis");
    variables.add(newVarName);
}
// function validateExpresion(linea: string){
//   const regex = new RegExp(/^([a-z])([0-9a-z]*) := ([(]?([0-9]*|[a-z]*)[+|-|\/|*|^]([0-9]*|[a-z]*)[)]?)*;$/g);
//   const regex1 = new RegExp(/^([a-z])([0-9a-z]*) := [(]?([(]?([-]?[0-9]+|([a-z])([0-9a-z]*)+)[)]?[+|-|\/|*|^][(]?([-]?[0-9]*|([a-z])([0-9a-z]*))[)]*)+;$/g);
// }
function validateTerminar(linea) {
    var regex = new RegExp(/^terminar.[ \t\n\r]*$/g);
    if (regex.test(linea))
        return true;
    throw new Error("Syntax error");
}
