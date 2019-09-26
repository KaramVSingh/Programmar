"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
exports.__esModule = true;
var javascript_1 = require("./javascript");
var fs = require("fs");
/**
 * Here lies the heart of the program. This function will use the lang handle passed in to define a parser
 * the language requested by the user.
 *
 * @param id The environment id for the files
 * @param cfg The CFG to be converted
 * @param langHandle The handle to get syntax rules
 */
function createParser(id, cfg, langHandle, first) {
    var parser = '';
    parser += langHandle.parserImports();
    parser += langHandle.variableDeclaration(null, 'ERROR', langHandle.createObject('Ast'));
    parser += '\n';
    // first we have to create the lookahead and consume token functions
    parser += langHandle["function"]('lookahead', null, [[null, 'token']], langHandle["if"]([langHandle.equality(true, 'token', langHandle.nothing())], [], langHandle["return"](langHandle.nothing()), langHandle["return"](langHandle.property('token', 'curr'))));
    parser += langHandle["function"]('matchToken', null, [[null, 'token'], [null, 'expected']], langHandle["if"]([langHandle.equality(true, langHandle.functionCall('lookahead', ['token']), 'expected')], [], langHandle["return"](langHandle.property('token', 'next')), langHandle.setVariable(langHandle.property('ERROR', 'data'), langHandle.errorString('expected', langHandle.property('token', 'curr'))) + '\n' +
        langHandle["return"]('ERROR')));
    parser += langHandle["function"]('parse', null, [[null, 'token']], langHandle["if"]([langHandle.equality(true, 'token', langHandle.nothing())], [], langHandle.exception('"Parse Error: Unable to parse empty file."'), langHandle.variableDeclaration(null, 'parsed', langHandle.functionCall("parse_" + first, ['token'])) +
        langHandle["if"]([langHandle.equality(true, 'parsed', 'ERROR')], [], langHandle.exception(langHandle.property('ERROR', 'data')), langHandle["return"]('parsed'))));
    parser += langHandle.parserExports();
    fs.writeFileSync("environments/" + id + "/parser." + langHandle.fileExtention(), parser);
}
exports.createParser = createParser;
function getLang(input) {
    switch (input) {
        case SupportedLanguages.JAVASCRIPT:
            return new javascript_1.Javascript();
        default:
            throw 'Illegal Argument: Language specified does not exist.';
    }
}
exports.getLang = getLang;
function tabUp(body) {
    var e_1, _a;
    var output = '';
    var bodyLines = [];
    bodyLines = body.split('\n');
    try {
        for (var bodyLines_1 = __values(bodyLines), bodyLines_1_1 = bodyLines_1.next(); !bodyLines_1_1.done; bodyLines_1_1 = bodyLines_1.next()) {
            var line = bodyLines_1_1.value;
            output += "\t" + line + "\n";
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (bodyLines_1_1 && !bodyLines_1_1.done && (_a = bodyLines_1["return"])) _a.call(bodyLines_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return output;
}
exports.tabUp = tabUp;
var SupportedLanguages;
(function (SupportedLanguages) {
    SupportedLanguages[SupportedLanguages["JAVASCRIPT"] = 0] = "JAVASCRIPT";
})(SupportedLanguages || (SupportedLanguages = {}));
exports.SupportedLanguages = SupportedLanguages;
