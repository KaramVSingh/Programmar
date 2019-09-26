"use strict";
exports.__esModule = true;
var translator_1 = require("../translator");
var Javascript = /** @class */ (function () {
    function Javascript() {
    }
    // THE FILE FUNCTIONS
    Javascript.prototype.lexerHeader = function () {
        return new translator_1.Line('');
    };
    Javascript.prototype.preLexer = function () {
        return new translator_1.Line('');
    };
    Javascript.prototype.postLexer = function () {
        return this.makeExport([new translator_1.TypedVariable(null, 'lex')]);
    };
    Javascript.prototype.parserHeader = function (cfg) {
        return null;
    };
    Javascript.prototype.preParser = function () {
        return null;
    };
    Javascript.prototype.postParser = function () {
        return null;
    };
    Javascript.prototype.fileExtention = function (isHeader) {
        return 'js';
    };
    // THE STATEMENT FUNCTIONS
    Javascript.prototype.makeExport = function (variables) {
        var head = new translator_1.Line('');
        for (var i = 0; i < variables.length; i++) {
            var variable = variables[i];
            head.add(new translator_1.Line("exports." + variable.name + " = " + variable.name));
        }
        return head.next;
    };
    Javascript.prototype.makeImport = function (variables, file) {
        var head = new translator_1.Line('');
        for (var i = 0; i < variables.length; i++) {
            var variable = variables[i];
            head.add(new translator_1.Line("const " + variable.name + " = require('./" + file + "')"));
        }
        return head.next;
    };
    Javascript.prototype.makeStruct = function (name, variables) {
        var head = new translator_1.Line("class " + name + " {");
        head.next = this._makeStruct(variables).tabUp();
        head.getLast().next = new translator_1.Line('}');
        return head;
    };
    Javascript.prototype._makeStruct = function (variables) {
        if (variables.length === 0) {
            return null;
        }
        return new translator_1.Line(variables[0].name, this._makeStruct(variables.slice(1)));
    };
    Javascript.prototype.makeStaticArray = function (values) {
        return "[" + values.join(', ') + "]";
    };
    Javascript.prototype.makeVariableDeclaration = function (variable, value) {
        return new translator_1.Line("let " + variable.name + " = " + value);
    };
    Javascript.prototype.makeBoolean = function (bool) {
        return bool.toString();
    };
    Javascript.prototype.makeFunctionDeclaration = function (func, params, body) {
        return new translator_1.Line("function " + func.name + "(" + params.map(function (value) { return value.name; }).join(', ') + ") {").add(body.tabUp()).add(new translator_1.Line('}'));
    };
    Javascript.prototype.makeClassicFor = function (variable, start, end, body) {
        return new translator_1.Line("for(" + this.makeVariableDeclaration(variable, start.toString()).line + "; " + variable.name + " < " + end + "; " + variable.name + "++) {").add(body.tabUp()).add(new translator_1.Line('}'));
    };
    Javascript.prototype.makeFunctionCall = function (name, args) {
        return name + "(" + args.join(', ') + ")";
    };
    Javascript.prototype.makeConditionalOperator = function (operator) {
        switch (operator) {
            case translator_1.ConditionalOperator.EQUALS:
                return '===';
            case translator_1.ConditionalOperator.NOT_EQUALS:
                return '!==';
            case translator_1.ConditionalOperator.LESS:
                return '<';
            case translator_1.ConditionalOperator.GREATER:
                return '>';
            case translator_1.ConditionalOperator.LESS_OR_EQUAL:
                return '<=';
            default:
                throw 'Internal Error: Unimplemented.';
        }
    };
    Javascript.prototype.makeCondition = function (condition) {
        return condition.left + " " + this.makeConditionalOperator(condition.operator) + " " + condition.right;
    };
    Javascript.prototype.makeJoin = function (join) {
        switch (join) {
            case translator_1.Join.AND:
                return '&&';
            case translator_1.Join.OR:
                return '||';
            default:
                throw 'Internal Error: Unimplemented.';
        }
    };
    Javascript.prototype.makeTree = function (tree) {
        if (tree.join === null) {
            return "(" + this.makeCondition(tree.child) + ")";
        }
        else {
            return "(" + this.makeTree(tree.child[0]) + " " + this.makeJoin(tree.join) + " " + this.makeTree(tree.child[1]) + ")";
        }
    };
    Javascript.prototype.makeIf = function (tree, body, alternative) {
        var line = new translator_1.Line("if" + this.makeTree(tree) + " {").add(body.tabUp());
        if (alternative !== null) {
            line.add(new translator_1.Line('} else {')).add(alternative.tabUp());
        }
        return line.add(new translator_1.Line('}'));
    };
    Javascript.prototype.makeGetProperty = function (variable, property) {
        return variable + "." + property;
    };
    Javascript.prototype.makeGetArrayAccess = function (variable, index) {
        return variable + "[" + index + "]";
    };
    Javascript.prototype.makeReturn = function (value) {
        return new translator_1.Line("return " + value);
    };
    Javascript.prototype.makeObject = function (def) {
        return '{}';
    };
    Javascript.prototype.makeSetVariable = function (variable, set) {
        return new translator_1.Line(variable + " = " + set);
    };
    Javascript.prototype.makeNothing = function () {
        return 'null';
    };
    Javascript.prototype.makeStringLength = function (variable) {
        return variable + ".length";
    };
    Javascript.prototype.makeWhile = function (tree, body) {
        return new translator_1.Line("while" + this.makeTree(tree) + " {").add(body.tabUp()).add(new translator_1.Line('}'));
    };
    Javascript.prototype.makeAddition = function (left, right) {
        return left + " + " + right;
    };
    Javascript.prototype.makeBreak = function () {
        return new translator_1.Line('break');
    };
    Javascript.prototype.makeContinue = function () {
        return new translator_1.Line('continue');
    };
    Javascript.prototype.makeStringStartingAt = function (str, index) {
        return str + ".slice(" + index + ")";
    };
    Javascript.prototype.makeStringFromChar = function (variable) {
        return variable;
    };
    return Javascript;
}());
exports.Javascript = Javascript;
