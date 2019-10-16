"use strict";
exports.__esModule = true;
var javascript_1 = require("./languages/javascript");
var SupportedLanguages;
(function (SupportedLanguages) {
    SupportedLanguages["JAVASCRIPT"] = "JAVASCRIPT";
})(SupportedLanguages || (SupportedLanguages = {}));
exports.SupportedLanguages = SupportedLanguages;
function getTranslator(lang) {
    switch (lang) {
        case SupportedLanguages.JAVASCRIPT:
            return new javascript_1.Javascript();
        default:
            throw 'Internal Error: Unsupported language.';
    }
}
exports.getTranslator = getTranslator;
