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
var language_1 = require("./language");
var cfg_1 = require("../cfg/cfg");
var fs = require("fs");
var Javascript = /** @class */ (function () {
    function Javascript() {
    }
    Javascript.prototype.createLexerHeader = function (id) {
        var header = fs.readFileSync('scraps/javascript/lexer_h.js', 'UTF-8');
        fs.writeFileSync("environments/" + id + "/lexer_h.js", header);
    };
    Javascript.prototype.createLexerSrc = function (id, cfg, ignoreWhitespace) {
        var lexer = fs.readFileSync('scraps/javascript/lexer.js', 'UTF-8');
        var lines = lexer.split(/\r\n|\n/);
        var newFile = '';
        for (var i = 0; i < lines.length; i++) {
            if (i === 1) {
                newFile += "const literals = " + JSON.stringify(cfg_1.gatherLiterals(cfg));
            }
            else if (i === 2) {
                newFile += "const ignoreWhitespace = " + ignoreWhitespace;
            }
            else {
                newFile += lines[i];
            }
            newFile += '\n';
        }
        fs.writeFileSync("environments/" + id + "/lexer.js", newFile);
    };
    Javascript.prototype.createParserHeader = function (id, cfg) {
        var header = fs.readFileSync('scraps/javascript/parser_h.js', 'UTF-8');
        fs.writeFileSync("environments/" + id + "/parser_h.js", header);
    };
    Javascript.prototype.parserImports = function () {
        return 'import { Ast } from \'./parser_h\'\n\n';
    };
    Javascript.prototype.parserExports = function () {
        return 'export { parse }';
    };
    Javascript.prototype["function"] = function (name, type, args, body) {
        var e_1, _a;
        var output = '';
        var params = '';
        params += '(';
        try {
            for (var args_1 = __values(args), args_1_1 = args_1.next(); !args_1_1.done; args_1_1 = args_1.next()) {
                var arg = args_1_1.value;
                params += arg[1] + ", ";
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (args_1_1 && !args_1_1.done && (_a = args_1["return"])) _a.call(args_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (args.length !== 0) {
            params = params.slice(0, -2);
        }
        params += ')';
        output += "function " + name + params + " {\n";
        output += language_1.tabUp(body);
        output += '}\n\n';
        return output;
    };
    Javascript.prototype.functionCall = function (name, args) {
        var e_2, _a;
        var params = '';
        params += '(';
        try {
            for (var args_2 = __values(args), args_2_1 = args_2.next(); !args_2_1.done; args_2_1 = args_2.next()) {
                var arg = args_2_1.value;
                params += arg + ", ";
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (args_2_1 && !args_2_1.done && (_a = args_2["return"])) _a.call(args_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (args.length !== 0) {
            params = params.slice(0, -2);
        }
        params += ')';
        return "" + name + params;
    };
    Javascript.prototype["if"] = function (conditions, seperators, body, alternative) {
        if (seperators.length != conditions.length - 1) {
            throw 'Internal Error: Invalid if statements.';
        }
        var output = '';
        var guard = '';
        for (var i = 0; i < conditions.length; i++) {
            if (i === seperators.length) {
                guard += "" + conditions[i];
            }
            else {
                guard += conditions[i] + " " + seperators[i] + " ";
            }
        }
        output = "if(" + guard + ") {\n" + language_1.tabUp(body) + "}";
        if (alternative !== null) {
            output += " else {\n" + language_1.tabUp(alternative) + "}";
        }
        return "" + output;
    };
    Javascript.prototype.equality = function (affirmative, a, b) {
        return a + " " + (affirmative ? '===' : '!==') + " " + b;
    };
    Javascript.prototype.property = function (object, property) {
        return object + "." + property;
    };
    Javascript.prototype.nothing = function () {
        return 'null';
    };
    Javascript.prototype["return"] = function (object) {
        return "return " + object;
    };
    Javascript.prototype.and = function () {
        return '&&';
    };
    Javascript.prototype.or = function () {
        return '||';
    };
    Javascript.prototype.variableDeclaration = function (type, name, value) {
        return "let " + name + (value === null ? "" : " = " + value) + "\n";
    };
    Javascript.prototype.createObject = function (type) {
        return "new " + type + "()";
    };
    Javascript.prototype.setVariable = function (name, value) {
        return name + " = " + value;
    };
    Javascript.prototype.fileExtention = function () {
        return 'js';
    };
    Javascript.prototype.exception = function (message) {
        return "throw " + message;
    };
    Javascript.prototype.errorString = function (expected, got) {
        return "`Parse Error: Expected ${" + expected + "} -- got ${" + got + "}.`";
    };
    return Javascript;
}());
exports.Javascript = Javascript;
