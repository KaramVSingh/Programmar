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
exports.parseBracket = exports.toRules = exports.parseRegex = exports.lex = exports.Token = exports.prelex = exports.regexToRules = void 0;
var cfg_1 = require("./../cfg");
/**
 * This function takes a regular expression and returns the CFG representing this regex
 * @param regex the regex which has to be converted
 * @param name the name of the regex to be converted
 */
function regexToRules(regex, name) {
    var tokens = lex(prelex(regex));
    validateToken(tokens);
    var ast = parseRegex(tokens);
    var generated = toRules(ast, [], name);
    generated.push(new cfg_1.Rule(name, [[new cfg_1.Statement(cfg_1.StatementType.RULE, "_" + name + "_" + (generated.length - 1))]], false));
    return generated;
}
exports.regexToRules = regexToRules;
/**
 * This function ensures that no regexes contain whitespace
 * @param lexed regex
 */
function validateToken(token) {
    if (token === null) {
        return;
    }
    if ([' ', '\t', '\n', '\r', '\\ ', '\\\t', '\\\n', '\\\r', '\\s'].includes(token.curr)) {
        throw "Regex Error: Regex cannot contain whitespace.";
    }
    if (token.curr.startsWith('[') && token.curr.endsWith(']') && token.curr[1] !== '^') {
        // we want to make sure the group does not have a space if its an affirmative grouping (negative grouping will auto omit space)
        // we can do more checking for if space lands in a range but its not really worth it.
        if (token.curr.match(/\t| |\n|\r/)) {
            throw "Regex Error: Regex cannot contain whitespace.";
        }
    }
    validateToken(token.next);
}
/**
 *
 * @param ast this is the ast to be converted
 * @param rules this is the resulting rules list
 */
function toRules(ast, rules, name) {
    var e_1, _a;
    // The last rule is the most recent rule always
    if (ast.type === NodeType.OR) {
        rules = toRules(ast.children[0], rules, name);
        var left = rules.length - 1;
        rules = toRules(ast.children[1], rules, name);
        var right = rules.length - 1;
        rules.push(new cfg_1.Rule("_" + name + "_" + rules.length, [
            [new cfg_1.Statement(cfg_1.StatementType.RULE, "_" + name + "_" + left)],
            [new cfg_1.Statement(cfg_1.StatementType.RULE, "_" + name + "_" + right)]
        ], true));
    }
    else if (ast.type === NodeType.CONCAT) {
        rules = toRules(ast.children[0], rules, name);
        var left = rules.length - 1;
        rules = toRules(ast.children[1], rules, name);
        var right = rules.length - 1;
        rules.push(new cfg_1.Rule("_" + name + "_" + rules.length, [
            [new cfg_1.Statement(cfg_1.StatementType.RULE, "_" + name + "_" + left), new cfg_1.Statement(cfg_1.StatementType.RULE, "_" + name + "_" + right)]
        ], true));
    }
    else if (ast.type === NodeType.DUPL) {
        rules = toRules(ast.children[0], rules, name);
        var left = rules.length - 1;
        if (ast.data === '*') {
            rules.push(new cfg_1.Rule("_" + name + "_" + rules.length, [
                [new cfg_1.Statement(cfg_1.StatementType.RULE, "_" + name + "_" + left), new cfg_1.Statement(cfg_1.StatementType.RULE, "_" + name + "_" + rules.length)],
                []
            ], true));
        }
        else if (ast.data === '?') {
            rules.push(new cfg_1.Rule("_" + name + "_" + rules.length, [
                [new cfg_1.Statement(cfg_1.StatementType.RULE, "_" + name + "_" + left)],
                []
            ], true));
        }
        else if (ast.data === '+') {
            rules.push(new cfg_1.Rule("_" + name + "_" + rules.length, [
                [new cfg_1.Statement(cfg_1.StatementType.RULE, "_" + name + "_" + left), new cfg_1.Statement(cfg_1.StatementType.RULE, "_" + name + "_" + rules.length)],
                [new cfg_1.Statement(cfg_1.StatementType.RULE, "_" + name + "_" + left)]
            ], true));
        }
        else {
            var pre = ast.data.substring(1, ast.data.length - 1).split(',');
            var vals = [];
            try {
                for (var pre_1 = __values(pre), pre_1_1 = pre_1.next(); !pre_1_1.done; pre_1_1 = pre_1.next()) {
                    var curr = pre_1_1.value;
                    if (curr === '') {
                        vals.push(null);
                    }
                    else {
                        var num = parseInt(curr);
                        if (num <= 0) {
                            throw "Regex Error: Cannot use non-positive number " + num + ".";
                        }
                        else {
                            vals.push(num);
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (pre_1_1 && !pre_1_1.done && (_a = pre_1["return"])) _a.call(pre_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (vals.length === 1) {
                var nStatements = [];
                for (var i = 0; i < vals[0]; i++) {
                    nStatements.push(new cfg_1.Statement(cfg_1.StatementType.RULE, "_" + name + "_" + left));
                }
                rules.push(new cfg_1.Rule("_" + name + "_" + rules.length, [nStatements], true));
            }
            else if (vals[0] === null && vals[1] !== null) {
                var nIs = [];
                for (var i = 1; i < vals[1] + 1; i++) {
                    var nStatements = [];
                    for (var j = 0; j < i; j++) {
                        nStatements.push(new cfg_1.Statement(cfg_1.StatementType.RULE, "_" + name + "_" + left));
                    }
                    nIs.push(nStatements);
                }
                rules.push(new cfg_1.Rule("_" + name + "_" + rules.length, nIs, true));
            }
            else if (vals[0] !== null && vals[1] === null) {
                throw 'Regex Error: Unsupported operation {X,}.';
            }
            else {
                if (vals[0] >= vals[1]) {
                    throw 'Regex Error: Must have {X,Y} such that Y > X.';
                }
                var nIs = [];
                for (var i = vals[0]; i < vals[1] + 1; i++) {
                    var nStatements = [];
                    for (var j = 0; j < i; j++) {
                        nStatements.push(new cfg_1.Statement(cfg_1.StatementType.RULE, "_" + name + "_" + left));
                    }
                    nIs.push(nStatements);
                }
                rules.push(new cfg_1.Rule("_" + name + "_" + rules.length, nIs, true));
            }
        }
    }
    else if (ast.type === NodeType.PAREN) {
        rules = toRules(ast.children[0], rules, name);
        var left = rules.length - 1;
        rules.push(new cfg_1.Rule("_" + name + "_" + rules.length, [
            [new cfg_1.Statement(cfg_1.StatementType.RULE, "_" + name + "_" + left)]
        ], true));
    }
    else if (ast.type === NodeType.GROUP) {
        var body = ast.data.substring(1, ast.data.length - 1);
        var isAffirmative = true;
        if (body[0] === '^') {
            isAffirmative = false;
            body = body.substring(1);
        }
        var lexed = prelex(body);
        var ranges = parseBracket(lexed, isAffirmative);
        rules.push(new cfg_1.Rule("_" + name + "_" + rules.length, [
            [new cfg_1.Statement(cfg_1.StatementType.RANGE, ranges)]
        ], true));
    }
    else if (ast.type === NodeType.UNIT) {
        if (ast.data[0] === '\\') {
            if (ast.data[1] === 'S') {
                rules.push(new cfg_1.Rule("_" + name + "_" + rules.length, [
                    [new cfg_1.Statement(cfg_1.StatementType.RANGE, new cfg_1.Range(false, [[' ', ' '], ['\n', '\n'], ['\r', '\r'], ['\t', '\t']]))]
                ], true));
            }
            else if (ast.data[1] === 'd') {
                rules.push(new cfg_1.Rule("_" + name + "_" + rules.length, [
                    [new cfg_1.Statement(cfg_1.StatementType.RANGE, new cfg_1.Range(true, [['0', '9']]))]
                ], true));
            }
            else if (ast.data[1] === 'D') {
                rules.push(new cfg_1.Rule("_" + name + "_" + rules.length, [
                    [new cfg_1.Statement(cfg_1.StatementType.RANGE, new cfg_1.Range(false, [['0', '9'], [' ', ' '], ['\n', '\n'], ['\r', '\r'], ['\t', '\t']]))]
                ], true));
            }
            else if (ast.data[1] === 'w') {
                rules.push(new cfg_1.Rule("_" + name + "_" + rules.length, [
                    [new cfg_1.Statement(cfg_1.StatementType.RANGE, new cfg_1.Range(true, [['0', '9'], ['a', 'z'], ['A', 'Z'], ['_', '_']]))]
                ], true));
            }
            else if (ast.data[1] === 'W') {
                rules.push(new cfg_1.Rule("_" + name + "_" + rules.length, [
                    [new cfg_1.Statement(cfg_1.StatementType.RANGE, new cfg_1.Range(false, [['0', '9'], ['a', 'z'], ['A', 'Z'], ['_', '_'], [' ', ' '], ['\n', '\n'], ['\r', '\r'], ['\t', '\t']]))]
                ], true));
            }
            else {
                rules.push(new cfg_1.Rule("_" + name + "_" + rules.length, [
                    [new cfg_1.Statement(cfg_1.StatementType.RANGE, new cfg_1.Range(true, [[ast.data[1], ast.data[1]]]))]
                ], true));
            }
        }
        else if (ast.data[0] === '.') {
            rules.push(new cfg_1.Rule("_" + name + "_" + rules.length, [
                [new cfg_1.Statement(cfg_1.StatementType.RANGE, new cfg_1.Range(false, [[' ', ' '], ['\n', '\n'], ['\r', '\r'], ['\t', '\t']]))]
            ], true));
        }
        else {
            rules.push(new cfg_1.Rule("_" + name + "_" + rules.length, [
                [new cfg_1.Statement(cfg_1.StatementType.RANGE, new cfg_1.Range(true, [[ast.data, ast.data]]))]
            ], true));
        }
    }
    return rules;
}
exports.toRules = toRules;
/**
 * This function will parse a bracketed group into an AST
 * @param token this is the lexed token list tp be parsed
 * @param isAffirmative the status of the range
 */
function parseBracket(token, isAffirmative) {
    if (token === null || token.curr === '') {
        throw 'Regex Error: Cannot parse an empty group.';
    }
    else {
        var start = true;
        var temp = token;
        // Check for errors
        while (temp !== null) {
            if (start === true && temp.curr === '-') {
                throw 'Regex Error: Cannot parse -.';
            }
            else if (temp.next === null && temp.curr === '-') {
                throw 'Regex Error: Cannot parse -.';
            }
            else if (temp.curr === '-' && temp.next !== null && temp.next.curr === '-') {
                throw 'Regex Error: Cannot parse -.';
            }
            else if (temp.curr === '-' && temp.next !== null && temp.next.next !== null && temp.next.next.curr === '-') {
                throw 'Regex Error: Cannot parse -.';
            }
            else if (['\\s', '\\S', '\\w', '\\W', '\\d', '\\D', '\\.'].includes(temp.curr)) {
                throw 'Regex Error: Cannot have escaped group in brackets.';
            }
            temp = temp.next;
            start = false;
        }
        temp = token;
        var ranges = [];
        while (temp !== null) {
            if (temp.next === null || temp.next.curr !== '-') {
                ranges.push([temp.curr, temp.curr]);
                temp = temp.next;
            }
            else {
                if (temp.curr > temp.next.next.curr) {
                    throw 'Regex Error: Range X-Y must be formatted such that Y >= X';
                }
                ranges.push([temp.curr, temp.next.next.curr]);
                temp = temp.next.next.next;
            }
        }
        if (!isAffirmative) {
            ranges.push([' ', ' '], ['\n', '\n'], ['\r', '\r'], ['\t', '\t']);
        }
        return new cfg_1.Range(isAffirmative, ranges);
    }
}
exports.parseBracket = parseBracket;
/**
 * This function will parse a lexed regex into an AST
 * @param token this is the lexed token list to be parsed
 */
function parseRegex(token) {
    if (token === null || token.curr === '') {
        throw 'Regex Error: Cannot parse an empty regex.';
    }
    else {
        return parseOr(token)[0];
    }
}
exports.parseRegex = parseRegex;
function parseOr(token) {
    if (!['|', ']', ')', '}'].includes(lookahead(token))) {
        var left = parseConcat(token);
        if (left[1] === null) {
            return left;
        }
        else if (lookahead(left[1]) === '|') {
            var middle = consumeToken(left[1], '|');
            var right = parseOr(middle[1]);
            return [new Ast(NodeType.OR, '|', [left[0], right[0]]), right[1]];
        }
        else {
            return left;
        }
    }
    else {
        throw "Regex Error: Unable to parse " + lookahead(token) + ".";
    }
}
function parseConcat(token) {
    if (!['|', ']', ')', '}'].includes(lookahead(token))) {
        var left = parseDupl(token);
        if (left[1] === null) {
            return left;
        }
        else if (lookahead(left[1]) !== null && !['|', ']', ')', '}'].includes(lookahead(left[1]))) {
            var right = parseConcat(left[1]);
            return [new Ast(NodeType.CONCAT, '', [left[0], right[0]]), right[1]];
        }
        else {
            return left;
        }
    }
    else {
        throw "Regex Error: Unable to parse " + lookahead(token) + ".";
    }
}
function parseDupl(token) {
    if (!['{', '*', '?', '+', '|', ']', ')', '}'].includes(lookahead(token))) {
        var left = parseParen(token);
        if (left[1] === null) {
            return left;
        }
        else if (['+', '*', '?', '{'].includes(lookahead(left[1])[0])) {
            var middle = consumeToken(left[1], lookahead(left[1]));
            return [new Ast(NodeType.DUPL, middle[0], [left[0]]), middle[1]];
        }
        else {
            return left;
        }
    }
    else {
        throw "Regex Error: Unable to parse " + lookahead(token) + ".";
    }
}
function parseParen(token) {
    if (lookahead(token) === '(') {
        var leftParen = consumeToken(token, '(');
        var middle = parseOr(leftParen[1]);
        var rightParen = consumeToken(middle[1], ')');
        return [new Ast(NodeType.PAREN, '', [middle[0]]), rightParen[1]];
    }
    else if (!['(', '{', '*', '?', '+', '|', ']', ')', '}'].includes(lookahead(token))) {
        return parseGroup(token);
    }
    else {
        throw "Regex Error: Unable to parse " + lookahead(token) + ".";
    }
}
function parseGroup(token) {
    if (lookahead(token)[0] === '[') {
        var middle = consumeToken(token, lookahead(token));
        return [new Ast(NodeType.GROUP, middle[0], []), middle[1]];
    }
    else if (!['[', '(', '{', '*', '?', '+', '|', ']', ')', '}'].includes(lookahead(token))) {
        var middle = consumeToken(token, lookahead(token));
        return [new Ast(NodeType.UNIT, middle[0], []), middle[1]];
    }
    else {
        throw "Regex Error: Unable to parse " + lookahead(token) + ".";
    }
}
var lookahead = function (token) { return token === null ? null : token.curr; };
var consumeToken = function (token, expected) {
    if (token === null) {
        throw "Regex Error: Unexpected end of regex - expected a " + expected + ".";
    }
    else {
        if (lookahead(token) !== expected) {
            throw "Regex Error: Unexpected token " + lookahead(token) + " - expected a " + expected;
        }
        else {
            return [token.curr, token.next];
        }
    }
};
var NodeType;
(function (NodeType) {
    NodeType[NodeType["OR"] = 0] = "OR";
    NodeType[NodeType["CONCAT"] = 1] = "CONCAT";
    NodeType[NodeType["DUPL"] = 2] = "DUPL";
    NodeType[NodeType["PAREN"] = 3] = "PAREN";
    NodeType[NodeType["GROUP"] = 4] = "GROUP";
    NodeType[NodeType["UNIT"] = 5] = "UNIT";
})(NodeType || (NodeType = {}));
var Ast = /** @class */ (function () {
    function Ast(type, data, children) {
        this.type = type;
        this.data = data;
        this.children = children;
    }
    return Ast;
}());
var Mode;
(function (Mode) {
    Mode[Mode["NONE"] = 0] = "NONE";
    Mode[Mode["BRACKETS"] = 1] = "BRACKETS";
    Mode[Mode["BRACES"] = 2] = "BRACES";
})(Mode || (Mode = {}));
/**
 * This function takes the prelexed input, and groups together multi char tokens ([] and {})
 * @param tokens a token linked list
 */
function lex(tokens) {
    return _lex(tokens, Mode.NONE, 0);
}
exports.lex = lex;
function _lex(token, mode, state) {
    if (mode === Mode.NONE) {
        if (token === null) {
            return null;
        }
        if (token.curr === '[') {
            return _lex(token, Mode.BRACKETS, 0);
        }
        else if (token.curr === '{') {
            return _lex(token, Mode.BRACES, 0);
        }
        else {
            return new Token(token.curr, _lex(token.next, Mode.NONE, 0));
        }
    }
    else if (mode === Mode.BRACKETS) {
        if (token === null) {
            throw 'Regex Error: Bracket does not close.';
        }
        if (state === 0) {
            if (token.curr === '[') {
                var next = _lex(token.next, Mode.BRACKETS, 1);
                if (next.curr === ']') {
                    throw 'Regex Error: Group [] is invalid.';
                }
                return new Token(token.curr + next.curr, next.next);
            }
            else {
                throw 'Regex Error: Bracket lexing error.';
            }
        }
        else {
            if (token.curr === ']') {
                return new Token(token.curr, _lex(token.next, Mode.NONE, 0));
            }
            else {
                var next = _lex(token.next, Mode.BRACKETS, 1);
                return new Token(token.curr + next.curr, next.next);
            }
        }
    }
    else if (mode === Mode.BRACES) {
        if (token === null) {
            throw 'Regex Error: Braces do not close.';
        }
        if (state === 0) {
            if (token.curr === '{') {
                var next = _lex(token.next, Mode.BRACES, 1);
                if (!/\d/.test(next.curr)) {
                    throw 'Regex Error: {} must contain a number.';
                }
                return new Token(token.curr + next.curr, next.next);
            }
            else {
                throw 'Regex Error: Braces lexing error.';
            }
        }
        else if (state === 1) {
            if (token.curr >= '0' && token.curr <= '9') {
                var next = _lex(token.next, Mode.BRACES, 1);
                return new Token(token.curr + next.curr, next.next);
            }
            else if (token.curr === ',') {
                var next = _lex(token.next, Mode.BRACES, 2);
                return new Token(token.curr + next.curr, next.next);
            }
            else if (token.curr === '}') {
                return new Token(token.curr, _lex(token.next, Mode.NONE, 0));
            }
            else {
                throw "Regex Error: character " + token.curr + " is not valid.";
            }
        }
        else if (state === 2) {
            if (token.curr >= '0' && token.curr <= '9') {
                var next = _lex(token.next, Mode.BRACES, 2);
                return new Token(token.curr + next.curr, next.next);
            }
            else if (token.curr === '}') {
                return new Token(token.curr, _lex(token.next, Mode.NONE, 0));
            }
            else {
                throw "Regex Error: character " + token.curr + " is not valid.";
            }
        }
    }
}
/**
 * This function returns a linked list of tokens, grouping escaped characters
 * @param regex a regular expression which you plan to tokenize
 * @returns a token linked list which groups escaped characters
 */
function prelex(regex) {
    if (regex.length === 0) {
        return null;
    }
    var curr = '';
    if (regex[0] === '\\') {
        if (regex.length === 1) {
            throw 'Regex Error: Cannot escape end of string.';
        }
        else {
            curr = regex.substring(0, 2);
        }
    }
    else {
        curr = regex[0];
    }
    return new Token(curr, prelex(regex.substring(curr.length)));
}
exports.prelex = prelex;
var Token = /** @class */ (function () {
    function Token(curr, next) {
        this.curr = curr;
        this.next = next;
    }
    return Token;
}());
exports.Token = Token;
