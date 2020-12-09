"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
exports.Range = exports.StatementType = exports.Statement = exports.Rule = exports.Cfg = void 0;
var input_1 = require("../input/input");
var regex_1 = require("./regex/regex");
/**
 * A _CFG_ is different from an _Input_ in that it does not support regex rules. To create
 * A _CFG_ from an _Input_, each regex must be converted from a rule to a list of rules. This also
 * has a few side effects on the way _CFG_ must support literals. _CFGs_ must now support ranges instead of literals
 * and each range must be signed (positive match or negative match).
 */
var Cfg = /** @class */ (function () {
    function Cfg(rules) {
        this.rules = rules;
    }
    Cfg.fromInput = function (input) {
        var e_1, _a;
        var nRules = [];
        try {
            for (var _b = __values(input.rules), _c = _b.next(); !_c.done; _c = _b.next()) {
                var rule = _c.value;
                nRules = nRules.concat(Rule.fromInput(rule));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return new Cfg(nRules);
    };
    return Cfg;
}());
exports.Cfg = Cfg;
/**
 * A _Rule_ is very similar to an _InputRule_, however it cannot be a regular expression. This means it has no need for a type,
 * it will always be a rule. We also have to keep track if the rule is generated or user defined. This will be nessesary at the parser level.
 */
var Rule = /** @class */ (function () {
    function Rule(name, is, isGenerated) {
        this.name = name;
        this.is = is;
        this.isGenerated = isGenerated;
    }
    Rule.fromInput = function (input) {
        if (input.type === input_1.InputRuleType.RULE) {
            var statements = [];
            for (var i = 0; i < input.is.length; i++) {
                var format = [];
                for (var j = 0; j < input.is[i].length; j++) {
                    format.push(Statement.fromInput(input.is[i][j]));
                }
                statements.push(format);
            }
            return [new Rule(input.name, statements, false)];
        }
        else {
            return regex_1.regexToRules(input.is, input.name);
        }
    };
    return Rule;
}());
exports.Rule = Rule;
var StatementType;
(function (StatementType) {
    StatementType["RULE"] = "RULE";
    StatementType["RANGE"] = "RANGE";
})(StatementType || (StatementType = {}));
exports.StatementType = StatementType;
/**
 * A _Statement_ is different from an _InputStatment_ in that it does not support literals. Instead, it supports ranges that
 * can be both positive, or negative. It implements literals with a (x,x) range
 */
var Statement = /** @class */ (function () {
    function Statement(type, data) {
        this.type = type;
        this.data = data;
    }
    Statement.fromInput = function (input) {
        if (input.type === input_1.InputStatementType.RULE) {
            return new Statement(StatementType.RULE, input.ref);
        }
        else {
            return new Statement(StatementType.RANGE, new Range(true, [[input.ref, input.ref]]));
        }
    };
    return Statement;
}());
exports.Statement = Statement;
/**
 * A _Range_ represents a set of possible characters. _Ranges_ can be either positive or negative.
 */
var Range = /** @class */ (function () {
    function Range(isAffirmative, ranges) {
        this.isAffirmative = isAffirmative;
        this.ranges = ranges;
    }
    return Range;
}());
exports.Range = Range;
