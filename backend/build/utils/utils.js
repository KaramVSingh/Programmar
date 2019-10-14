"use strict";
exports.__esModule = true;
function validate(input, key) {
    if (!input[key]) {
        throw "Illegal Argument: " + key + " not found in input.";
    }
}
exports.validate = validate;
