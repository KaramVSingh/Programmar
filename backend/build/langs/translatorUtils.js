"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.getTranslator = exports.SupportedLanguages = exports.TabbedLines = exports.Lines = exports.Line = exports.BREAK_LINE = exports.Condition = exports.Join = exports.ConditionalOperator = exports.Func = exports.Var = exports.Type = exports.BaseType = exports.STRING_LIST_VALUE = exports.STRING_LIST = exports.STRING = exports.TOKEN = void 0;
var javascript_1 = require("./languages/javascript");
// ----- We're gonna do some hardcore meta programming so lets define some basics ----- //
var BaseType;
(function (BaseType) {
    BaseType[BaseType["TOKEN"] = 0] = "TOKEN";
    BaseType[BaseType["AST"] = 1] = "AST";
    BaseType[BaseType["INT"] = 2] = "INT";
    BaseType[BaseType["CHAR"] = 3] = "CHAR";
    BaseType[BaseType["BOOLEAN"] = 4] = "BOOLEAN";
})(BaseType || (BaseType = {}));
exports.BaseType = BaseType;
var Type = /** @class */ (function () {
    function Type(baseType, pointerDepth) {
        if (pointerDepth === void 0) { pointerDepth = 0; }
        this.type = baseType;
        this.pointerDepth = pointerDepth;
    }
    return Type;
}());
exports.Type = Type;
var Var = /** @class */ (function () {
    function Var(name, type) {
        this.name = name;
        this.type = type;
    }
    return Var;
}());
exports.Var = Var;
var ConditionalOperator;
(function (ConditionalOperator) {
    ConditionalOperator[ConditionalOperator["LESS"] = 0] = "LESS";
    ConditionalOperator[ConditionalOperator["LESS_OR_EQUAL"] = 1] = "LESS_OR_EQUAL";
    ConditionalOperator[ConditionalOperator["GREATER"] = 2] = "GREATER";
    ConditionalOperator[ConditionalOperator["GREATER_OR_EQUALS"] = 3] = "GREATER_OR_EQUALS";
    ConditionalOperator[ConditionalOperator["EQUALS"] = 4] = "EQUALS";
    ConditionalOperator[ConditionalOperator["NOT_EQUALS"] = 5] = "NOT_EQUALS";
})(ConditionalOperator || (ConditionalOperator = {}));
exports.ConditionalOperator = ConditionalOperator;
var Join;
(function (Join) {
    Join[Join["AND"] = 0] = "AND";
    Join[Join["OR"] = 1] = "OR";
})(Join || (Join = {}));
exports.Join = Join;
var Condition = /** @class */ (function () {
    function Condition(left, operator, right, type) {
        this.left = left;
        this.right = right;
        this.operator = operator;
        this.type = type;
    }
    return Condition;
}());
exports.Condition = Condition;
var Func = /** @class */ (function () {
    function Func(returnType, name, args, body) {
        this.returnType = returnType;
        this.args = args;
        this.name = name;
        this.body = body;
    }
    return Func;
}());
exports.Func = Func;
// ----- Constants to avoid repetition ----- //
var TOKEN = new Type(BaseType.TOKEN, 1);
exports.TOKEN = TOKEN;
var STRING = new Type(BaseType.CHAR, 1);
exports.STRING = STRING;
var STRING_LIST = new Type(BaseType.CHAR, 2);
exports.STRING_LIST = STRING_LIST;
var STRING_LIST_VALUE = /** @class */ (function () {
    function STRING_LIST_VALUE(value) {
        this.value = value;
        this.type = STRING_LIST;
    }
    return STRING_LIST_VALUE;
}());
exports.STRING_LIST_VALUE = STRING_LIST_VALUE;
// ----- Classes to facilitate storing generated code ----- //
var Line = /** @class */ (function () {
    function Line(data) {
        this.tabbed = false;
        this.data = data;
    }
    Line.prototype.render = function (tabLevel) {
        return "" + '\t'.repeat(tabLevel) + this.data;
    };
    return Line;
}());
exports.Line = Line;
var BREAK_LINE = new Line("");
exports.BREAK_LINE = BREAK_LINE;
var Lines = /** @class */ (function () {
    function Lines(lines) {
        this.tabbed = false;
        this.lines = lines;
    }
    Lines.of = function () {
        var lines = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            lines[_i] = arguments[_i];
        }
        return new Lines(lines);
    };
    Lines.prototype.render = function (tabLevel) {
        return this.lines
            .map(function (data) { return data.render(data.tabbed ? tabLevel + 1 : tabLevel); })
            .join('\n');
    };
    return Lines;
}());
exports.Lines = Lines;
var TabbedLines = /** @class */ (function (_super) {
    __extends(TabbedLines, _super);
    function TabbedLines() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.tabbed = true;
        return _this;
    }
    TabbedLines.of = function () {
        var lines = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            lines[_i] = arguments[_i];
        }
        return new TabbedLines(lines);
    };
    return TabbedLines;
}(Lines));
exports.TabbedLines = TabbedLines;
// ----- Now lets define what we want a language to be able to do ----- //
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
