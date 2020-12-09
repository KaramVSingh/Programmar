"use strict";
exports.__esModule = true;
exports.validate = void 0;
function validate(input, key) {
    if (!input[key]) {
        throw "Illegal Argument: " + key + " not found in input.";
    }
}
exports.validate = validate;
