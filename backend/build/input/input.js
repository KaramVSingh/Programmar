"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
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
exports.InputStatementType = exports.InputStatement = exports.InputRuleType = exports.InputRule = exports.Input = void 0;
var Input = /** @class */ (function () {
    function Input(input) {
        this.rules = input.rules;
    }
    /**
     * This function checks that an input is a valid Input
     * @param input a javascript any object
     */
    Input.isInput = function (input) {
        if (Array.isArray(input.rules)) {
            for (var i = 0; i < input.rules.length; i++) {
                if (!InputRule.isInputRule(input.rules[i])) {
                    return false;
                }
            }
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * Things to validate:
     * 1. Rules reference existing rules (no bad names)
     * 2. No repeat names
     * 3. Valid CFG
     */
    Input.validate = function (input) {
        var e_1, _a, e_2, _b;
        var names = new Set();
        var firsts = new Map();
        // validate all the rules
        for (var i = 0; i < input.rules.length; i++) {
            InputRule.validate(input.rules[i]);
            if (names.has(input.rules[i].name)) {
                throw "Illegal Argument: " + input.rules[i].name + " has multiple declarations.";
            }
            else {
                names.add(input.rules[i].name);
                firsts.set(input.rules[i].name, []);
                if (input.rules[i].type === InputRuleType.RULE) {
                    var statements = input.rules[i].is;
                    for (var j = 0; j < statements.length; j++) {
                        if (statements[j].length > 0 && statements[j][0].type === InputStatementType.RULE) {
                            firsts.get(input.rules[i].name).push(statements[j][0].ref);
                        }
                    }
                }
            }
        }
        // validate all rules reference valid rule names
        for (var i = 0; i < input.rules.length; i++) {
            if (input.rules[i].type === InputRuleType.RULE) {
                var flat = [].concat.apply([], __spread(input.rules[i].is));
                for (var j = 0; j < flat.length; j++) {
                    if (flat[j].type === InputStatementType.RULE && !names.has(flat[j].ref)) {
                        throw "Illegal Argument: Rule " + flat[j].ref + " does not exist.";
                    }
                }
            }
        }
        // validate that the CFG is valid
        // Because we are adding exceptions for control flow to help widen the number of grammars we can support, we do
        // not need to check for overlapping first sets. The only thing we need to check for is infinite left recursion
        // DO: traverse all paths and check if the path recycles
        var ruleMap = new Map();
        input.rules.forEach(function (rule) {
            if (rule.type === InputRuleType.RULE) {
                var options = rule.is.map(function (option) {
                    return option
                        .filter(function (part) { return part.type === InputStatementType.RULE; })
                        .map(function (part) { return part.ref; });
                });
                ruleMap.set(rule.name, options);
            }
            else {
                ruleMap.set(rule.name, []);
            }
        });
        try {
            for (var ruleMap_1 = __values(ruleMap), ruleMap_1_1 = ruleMap_1.next(); !ruleMap_1_1.done; ruleMap_1_1 = ruleMap_1.next()) {
                var _c = __read(ruleMap_1_1.value, 1), name_1 = _c[0];
                Input.checkSafety(name_1, ruleMap);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (ruleMap_1_1 && !ruleMap_1_1.done && (_a = ruleMap_1["return"])) _a.call(ruleMap_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            for (var firsts_1 = __values(firsts), firsts_1_1 = firsts_1.next(); !firsts_1_1.done; firsts_1_1 = firsts_1.next()) {
                var _d = __read(firsts_1_1.value, 1), key = _d[0];
                Input.checkPath(firsts, new Set([key]), key);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (firsts_1_1 && !firsts_1_1.done && (_b = firsts_1["return"])) _b.call(firsts_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    Input.checkSafety = function (ruleName, ruleMap) {
        // we want to do a traversal of the options, if all of the options have to loop back, we have an issue, otherwise we're safe
        ruleMap.get(ruleName).forEach(function (option) {
            if (Input._only_loops(ruleName, option[0], [], ruleMap)) {
                throw "Illegal Argument: Rule " + ruleName + " contains a left recursion error.";
            }
        });
    };
    Input._only_loops = function (startRule, currRule, path, ruleMap) {
        var e_3, _a, e_4, _b;
        if (currRule === startRule) {
            return true;
        }
        if (path.includes(currRule)) {
            return true;
        }
        var newPath = path.concat(currRule);
        var ruleLoops = [];
        try {
            for (var _c = __values(ruleMap.get(currRule)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var option = _d.value;
                // [false, true], [false]
                var optionLoops = [];
                try {
                    for (var option_1 = (e_4 = void 0, __values(option)), option_1_1 = option_1.next(); !option_1_1.done; option_1_1 = option_1.next()) {
                        var ruleRef = option_1_1.value;
                        optionLoops.push(Input._only_loops(startRule, ruleRef, newPath, ruleMap));
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (option_1_1 && !option_1_1.done && (_b = option_1["return"])) _b.call(option_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                // if any rule_refs in an option loop, then the option loops
                ruleLoops.push(optionLoops.reduce(function (acc, curr) { return acc || curr; }, false));
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c["return"])) _a.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
        if (ruleLoops.filter(function (option) { return option === false; }).length > 0 || ruleLoops.length === 0) {
            return false;
        }
        else {
            return true;
        }
    };
    Input.checkPath = function (firsts, path, curr) {
        var e_5, _a;
        var next = firsts.get(curr);
        try {
            for (var next_1 = __values(next), next_1_1 = next_1.next(); !next_1_1.done; next_1_1 = next_1.next()) {
                var rule = next_1_1.value;
                if (path.has(rule)) {
                    path.add(rule);
                    throw "Illegal Argument: Path containing " + Array.from(path) + " has left recursion error.";
                }
                else {
                    var nPath = new Set(path);
                    nPath.add(rule);
                    Input.checkPath(firsts, nPath, rule);
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (next_1_1 && !next_1_1.done && (_a = next_1["return"])) _a.call(next_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
    };
    return Input;
}());
exports.Input = Input;
var InputRuleType;
(function (InputRuleType) {
    InputRuleType["RULE"] = "RULE";
    InputRuleType["REGEX"] = "REGEX";
})(InputRuleType || (InputRuleType = {}));
exports.InputRuleType = InputRuleType;
var InputRule = /** @class */ (function () {
    function InputRule(input) {
        this.name = input.name;
        this.type = input.type;
        this.is = input.is;
    }
    InputRule.isInputRule = function (input) {
        if (typeof input.name === 'string') {
            if (typeof input.type === 'string' && Object.values(InputRuleType).includes(input.type)) {
                if (typeof input.is === 'string') {
                    return true;
                }
                else if (Array.isArray(input.is)) {
                    if (input.is.length === 0) {
                        return true;
                    }
                    for (var i = 0; i < input.is.length; i++) {
                        if (Array.isArray(input.is[i])) {
                            for (var j = 0; j < input.is[i].length; j++) {
                                if (!InputStatement.isInputStatement(input.is[i][j])) {
                                    return false;
                                }
                            }
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                }
            }
        }
        return false;
    };
    /**
     * Things to validate:
     * 1. Name matches the format for an external name (must work for all languages, must not start with _)
     * 2. Type matches RuleType.
     * 3. Regex is valid maybe dont and just check this at new cfg generation
     */
    InputRule.validate = function (input) {
        // validate the name (must be a combination of a-zA-Z0-9_ where the first char is not _0-9)
        var functionReg = /^[a-zA-Z][a-zA-Z0-9_]*$/;
        if (!functionReg.test(input.name)) {
            throw "Illegal Argument: Rule name " + input.name + " is not a valid rule name.";
        }
        // validate that the type matches the implementation
        if (input.type === InputRuleType.REGEX && input.is.push !== undefined || input.type === InputRuleType.RULE && input.is.push === undefined) {
            throw "Illegal Argument: Rule " + input.name + " type and implementation.";
        }
        // validate all the statements
        if (input.type === InputRuleType.RULE) {
            for (var i = 0; i < input.is.length; i++) {
                for (var j = 0; j < input.is[i].length; j++) {
                    InputStatement.validate(input.is[i][j]);
                }
            }
        }
    };
    return InputRule;
}());
exports.InputRule = InputRule;
var InputStatementType;
(function (InputStatementType) {
    InputStatementType["LITERAL"] = "LITERAL";
    InputStatementType["RULE"] = "RULE";
})(InputStatementType || (InputStatementType = {}));
exports.InputStatementType = InputStatementType;
var InputStatement = /** @class */ (function () {
    function InputStatement(input) {
        this.type = input.type;
        this.ref = input.ref;
    }
    InputStatement.isInputStatement = function (input) {
        return (typeof input.ref === 'string') && (typeof input.type === 'string' && Object.values(InputStatementType).includes(input.type));
    };
    /**
     * Things to validate:
     * 1. Nothing
     */
    InputStatement.validate = function (input) { };
    return InputStatement;
}());
exports.InputStatement = InputStatement;
