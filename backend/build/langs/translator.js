"use strict";
exports.__esModule = true;
var Line = /** @class */ (function () {
    function Line(stmt, next) {
        if (next === void 0) { next = null; }
        this.line = stmt;
        this.next = next;
        this.tabLevel = 0;
    }
    Line.prototype.add = function (line) {
        this.getLast().next = line;
        return this;
    };
    Line.prototype.tabUp = function () {
        this.tabLevel++;
        if (this.next !== null) {
            this.next.tabUp();
        }
        return this;
    };
    Line.prototype.getLast = function () {
        if (this.next === null) {
            return this;
        }
        else {
            return this.next.getLast();
        }
    };
    Line.prototype.toString = function () {
        return '\t'.repeat(this.tabLevel) + this.line + '\n' + (this.next === null ? '' : this.next.toString());
    };
    return Line;
}());
exports.Line = Line;
var Type;
(function (Type) {
    Type[Type["TOKEN"] = 0] = "TOKEN";
    Type[Type["AST"] = 1] = "AST";
    Type[Type["INT"] = 2] = "INT";
    Type[Type["CHAR"] = 3] = "CHAR";
    Type[Type["BOOLEAN"] = 4] = "BOOLEAN";
})(Type || (Type = {}));
exports.Type = Type;
var DecoratedType = /** @class */ (function () {
    function DecoratedType(type, pointerDepth) {
        this.type = type;
        this.pointerDepth = pointerDepth;
    }
    return DecoratedType;
}());
exports.DecoratedType = DecoratedType;
var TypedVariable = /** @class */ (function () {
    function TypedVariable(type, name) {
        this.type = type;
        this.name = name;
    }
    return TypedVariable;
}());
exports.TypedVariable = TypedVariable;
var ConditionalOperator;
(function (ConditionalOperator) {
    ConditionalOperator[ConditionalOperator["LESS"] = 0] = "LESS";
    ConditionalOperator[ConditionalOperator["LESS_OR_EQUAL"] = 1] = "LESS_OR_EQUAL";
    ConditionalOperator[ConditionalOperator["GREATER"] = 2] = "GREATER";
    ConditionalOperator[ConditionalOperator["EQUALS"] = 3] = "EQUALS";
    ConditionalOperator[ConditionalOperator["NOT_EQUALS"] = 4] = "NOT_EQUALS";
})(ConditionalOperator || (ConditionalOperator = {}));
exports.ConditionalOperator = ConditionalOperator;
var Condition = /** @class */ (function () {
    function Condition(left, right, operator, type) {
        this.left = left;
        this.right = right;
        this.operator = operator;
        this.type = type;
    }
    return Condition;
}());
exports.Condition = Condition;
var Join;
(function (Join) {
    Join[Join["AND"] = 0] = "AND";
    Join[Join["OR"] = 1] = "OR";
})(Join || (Join = {}));
exports.Join = Join;
var Tree = /** @class */ (function () {
    function Tree(child, join) {
        this.child = child;
        this.join = join;
    }
    return Tree;
}());
exports.Tree = Tree;
