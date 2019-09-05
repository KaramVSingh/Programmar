"use strict";
exports.__esModule = true;
var javascript_1 = require("./javascript");
var SupportedLanguages;
(function (SupportedLanguages) {
    SupportedLanguages[SupportedLanguages["JAVASCRIPT"] = 0] = "JAVASCRIPT";
})(SupportedLanguages || (SupportedLanguages = {}));
exports.SupportedLanguages = SupportedLanguages;
function getLang(input) {
    switch (input) {
        case SupportedLanguages.JAVASCRIPT:
            return new javascript_1.Javascript();
        default:
            throw 'Illegal Argument: Language specified does not exist.';
    }
}
exports.getLang = getLang;
