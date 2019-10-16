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
        var e_1, _a;
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
        try {
            // validate that the CFG is valid
            // Because we are adding exceptions for control flow to help widen the number of grammars we can support, we do
            // not need to check for overlapping first sets. The only thing we need to check for is infinite left recursion
            // DO: traverse all paths and check if the path recycles
            for (var firsts_1 = __values(firsts), firsts_1_1 = firsts_1.next(); !firsts_1_1.done; firsts_1_1 = firsts_1.next()) {
                var _b = __read(firsts_1_1.value, 1), key = _b[0];
                Input.checkPath(firsts, new Set([key]), key);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (firsts_1_1 && !firsts_1_1.done && (_a = firsts_1["return"])) _a.call(firsts_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    Input.checkPath = function (firsts, path, curr) {
        var e_2, _a;
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
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (next_1_1 && !next_1_1.done && (_a = next_1["return"])) _a.call(next_1);
            }
            finally { if (e_2) throw e_2.error; }
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
