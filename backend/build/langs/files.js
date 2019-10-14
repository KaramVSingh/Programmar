"use strict";
exports.__esModule = true;
var cfg_1 = require("../cfg/cfg");
var translator_1 = require("./translator");
var TOKEN_OBJECT = new translator_1.DecoratedType(translator_1.Type.TOKEN, 1);
var STRING_ARRAY = new translator_1.DecoratedType(translator_1.Type.CHAR, 2);
var STRING = new translator_1.DecoratedType(translator_1.Type.CHAR, 1);
var CHAR = new translator_1.DecoratedType(translator_1.Type.CHAR, 0);
var BOOLEAN = new translator_1.DecoratedType(translator_1.Type.BOOLEAN, 0);
var INT = new translator_1.DecoratedType(translator_1.Type.INT, 0);
var AST = new translator_1.DecoratedType(translator_1.Type.AST, 1);
var AST_ARRAY = new translator_1.DecoratedType(translator_1.Type.AST, 2);
var PAIR = new translator_1.DecoratedType(translator_1.Type.PAIR, 1);
function lexerHeader(translator) {
    return translator.lexerHeader();
}
exports.lexerHeader = lexerHeader;
function lexerSrc(metadata, cfg, translator) {
    var literals = cfg_1.gatherLiterals(cfg);
    var whitespace = ['" "', '"\\t"', '"\\r"', '"\\n"'];
    return translator.preLexer().add(new translator_1.Line('')).add(translator.makeVariableDeclaration(new translator_1.TypedVariable(STRING_ARRAY, 'literals'), translator.makeStaticArray(literals.map(function (value) { return "\"" + value + "\""; })))).add(translator.makeVariableDeclaration(new translator_1.TypedVariable(STRING_ARRAY, 'whitespace'), translator.makeStaticArray(whitespace))).add(translator.makeVariableDeclaration(new translator_1.TypedVariable(BOOLEAN, 'ignoreWhitespace'), translator.makeBoolean(metadata.ignoreWhitespace))).add(new translator_1.Line('')).add(translator.makeFunctionDeclaration(new translator_1.TypedVariable(BOOLEAN, 'matchPrefix'), [new translator_1.TypedVariable(STRING, 'prefix'), new translator_1.TypedVariable(STRING, 'str')], translator.makeIf([new translator_1.Condition(translator.makeStringLength('prefix'), translator.makeStringLength('str'), translator_1.ConditionalOperator.LESS_OR_EQUAL, INT)], null, translator.makeClassicFor(new translator_1.TypedVariable(INT, 'i'), '0', translator.makeStringLength('prefix'), translator.makeIf([new translator_1.Condition(translator.makeGetArrayAccess('prefix', 'i'), translator.makeGetArrayAccess('str', 'i'), translator_1.ConditionalOperator.NOT_EQUALS, CHAR)], null, translator.makeReturn(translator.makeBoolean(false)), null)).add(new translator_1.Line('')).add(translator.makeReturn(translator.makeBoolean(true))), translator.makeReturn(translator.makeBoolean(false))))).add(new translator_1.Line('')).add(translator.makeFunctionDeclaration(new translator_1.TypedVariable(BOOLEAN, 'equals'), [new translator_1.TypedVariable(STRING, 'a'), new translator_1.TypedVariable(STRING, 'b')], translator.makeIf([new translator_1.Condition(translator.makeStringLength('a'), translator.makeStringLength('b'), translator_1.ConditionalOperator.EQUALS, INT)], null, translator.makeReturn(translator.makeFunctionCall('matchPrefix', ['a', 'b'])), translator.makeReturn(translator.makeBoolean(false))))).add(new translator_1.Line('')).add(translator.makeFunctionDeclaration(new translator_1.TypedVariable(BOOLEAN, 'contains'), [new translator_1.TypedVariable(STRING, 'tst'), new translator_1.TypedVariable(STRING_ARRAY, 'arr')], translator.makeClassicFor(new translator_1.TypedVariable(INT, 'i'), '0', translator.makeGetProperty('arr', 'length'), translator.makeIf([new translator_1.Condition(translator.makeFunctionCall('equals', ['tst', translator.makeGetArrayAccess('arr', 'i')]), translator.makeBoolean(true), translator_1.ConditionalOperator.EQUALS, BOOLEAN)], null, translator.makeReturn(translator.makeBoolean(true)), null)).add(new translator_1.Line('')).add(translator.makeReturn(translator.makeBoolean(false))))).add(new translator_1.Line('')).add(translator.makeFunctionDeclaration(new translator_1.TypedVariable(TOKEN_OBJECT, 'lex'), [new translator_1.TypedVariable(STRING, 'str')], translator.makeVariableDeclaration(new translator_1.TypedVariable(TOKEN_OBJECT, 'firstToken'), translator.makeObject(translator_1.Type.TOKEN)).add(translator.makeSetVariable(translator.makeGetProperty('firstToken', 'val'), '""')).add(translator.makeSetVariable(translator.makeGetProperty('firstToken', 'next'), translator.makeNothing())).add(new translator_1.Line('')).add(translator.makeVariableDeclaration(new translator_1.TypedVariable(INT, 'index'), '0')).add(translator.makeVariableDeclaration(new translator_1.TypedVariable(TOKEN_OBJECT, 'lastToken'), 'firstToken')).add(new translator_1.Line('')).add(translator.makeWhile(new translator_1.Condition('index', translator.makeStringLength('str'), translator_1.ConditionalOperator.LESS, INT), translator.makeVariableDeclaration(new translator_1.TypedVariable(TOKEN_OBJECT, 'newToken'), translator.makeNothing()).add(translator.makeClassicFor(new translator_1.TypedVariable(INT, 'i'), '0', translator.makeGetProperty('literals', 'length'), translator.makeVariableDeclaration(new translator_1.TypedVariable(STRING, 'literal'), translator.makeGetArrayAccess('literals', 'i')).add(new translator_1.Line('')).add(translator.makeIf([new translator_1.Condition(translator.makeFunctionCall('matchPrefix', ['literal', translator.makeStringStartingAt('str', 'index')]), translator.makeBoolean(true), translator_1.ConditionalOperator.EQUALS, BOOLEAN)], null, translator.makeSetVariable('newToken', translator.makeObject(translator_1.Type.TOKEN)).add(translator.makeSetVariable(translator.makeGetProperty('newToken', 'val'), 'literal')).add(translator.makeSetVariable(translator.makeGetProperty('newToken', 'next'), translator.makeNothing())).add(new translator_1.Line('')).add(translator.makeSetVariable('index', translator.makeAddition('index', translator.makeStringLength('literal')))).add(translator.makeBreak()), null))).add(new translator_1.Line('')).add(translator.makeIf([new translator_1.Condition('newToken', translator.makeNothing(), translator_1.ConditionalOperator.EQUALS, TOKEN_OBJECT)], null, translator.makeIf([new translator_1.Condition('ignoreWhitespace', translator.makeBoolean(true), translator_1.ConditionalOperator.EQUALS, BOOLEAN), new translator_1.Condition(translator.makeFunctionCall('contains', [translator.makeGetArrayAccess('str', 'index'), 'whitespace']), translator.makeBoolean(true), translator_1.ConditionalOperator.EQUALS, BOOLEAN)], translator_1.Join.AND, translator.makeSetVariable('index', translator.makeAddition('index', '1')).add(translator.makeContinue()), translator.makeSetVariable('newToken', translator.makeObject(translator_1.Type.TOKEN)).add(translator.makeSetVariable(translator.makeGetProperty('newToken', 'val'), translator.makeStringFromChar(translator.makeGetArrayAccess('str', 'index')))).add(translator.makeSetVariable(translator.makeGetProperty('newToken', 'next'), translator.makeNothing())).add(translator.makeSetVariable('index', translator.makeAddition('index', '1')))), null)).add(new translator_1.Line('')).add(translator.makeSetVariable(translator.makeGetProperty('lastToken', 'next'), 'newToken')).add(translator.makeSetVariable('lastToken', translator.makeGetProperty('lastToken', 'next'))))).add(new translator_1.Line('')).add(translator.makeReturn(translator.makeGetProperty('firstToken', 'next')))))).add(new translator_1.Line('')).add(translator.postLexer());
}
exports.lexerSrc = lexerSrc;
function parserHeader(translator, cfg) {
    return translator.parserHeader(cfg);
}
exports.parserHeader = parserHeader;
function makeBranch(statements, ruleName, translator) {
    if (statements.length === 0) {
        return translator.makeVariableDeclaration(new translator_1.TypedVariable(AST, 'ast'), translator.makeObject(translator_1.Type.AST)).add(translator.makeSetVariable(translator.makeGetProperty('ast', 'children'), 'children')).add(translator.makeSetVariable(translator.makeGetProperty('ast', 'data'), 'data')).add(translator.makeSetVariable(translator.makeGetProperty('ast', 'type'), "\"" + ruleName + "\"")).add(translator.makeSetVariable(translator.makeGetProperty('result', 'ast'), 'ast')).add(translator.makeSetVariable(translator.makeGetProperty('result', 'token'), 'curr'));
    }
    var ln = new translator_1.Line('');
    var curr = statements[0];
    if (curr.type === cfg_1.StatementType.RULE) {
        var rule = curr.data;
        ln.add(translator.makeSetVariable('helper', translator.makeFunctionCall("parse_" + rule, ['curr']))).add(translator.makeIf([new translator_1.Condition(translator.makeGetProperty('helper', 'ast'), 'ERROR', translator_1.ConditionalOperator.NOT_EQUALS, AST)], null, translator.makeAddToArray('children', translator.makeGetProperty('helper', 'ast')).add(translator.makeSetVariable('curr', translator.makeGetProperty('helper', 'token'))).add(new translator_1.Line('')).add(makeBranch(statements.slice(1), ruleName, translator)), null));
    }
    else if (curr.type === cfg_1.StatementType.RANGE) {
        var conditions = [];
        var range = curr.data;
        for (var i = 0; i < range.ranges.length; i++) {
            var currRange = range.ranges[i];
            var operator = range.isAffirmative ? translator_1.ConditionalOperator.EQUALS : translator_1.ConditionalOperator.NOT_EQUALS;
            if (currRange[0] === currRange[1]) {
                conditions.push(new translator_1.Condition(translator.makeFunctionCall('lookahead', ['curr']), "\"" + currRange[0] + "\"", operator, STRING));
            }
            else {
                conditions.push(new translator_1.Condition(translator.makeFunctionCall('inRange', [translator.makeFunctionCall('lookahead', ['curr']), "\"" + currRange[0] + "\"", "\"" + currRange[1] + "\""]), translator.makeBoolean(true), operator, BOOLEAN));
            }
        }
        ln.add(translator.makeIf(conditions, translator_1.Join.AND, translator.makeSetVariable('curr', translator.makeFunctionCall('matchToken', ['curr', translator.makeFunctionCall('lookahead', ['curr'])])).add(translator.makeSetVariable('data', translator.makeStringTemplate('##', [new translator_1.TypedVariable(STRING, 'data'), new translator_1.TypedVariable(STRING, translator.makeFunctionCall('lookahead', ['curr']))]))).add(new translator_1.Line('')).add(makeBranch(statements.slice(1), ruleName, translator)), translator.makeSetVariable(translator.makeGetProperty('ERROR', 'data'), translator.makeStringTemplate('Parse Error: Unexpected token -- \\"#\\"', [new translator_1.TypedVariable(STRING, translator.makeFunctionCall('lookahead', ['curr']))]))));
    }
    return ln.next;
}
function parserSrc(metadata, cfg, translator) {
    var beforeLogic = translator.preParser().add(translator.makeVariableDeclaration(new translator_1.TypedVariable(AST, 'ERROR'), translator.makeObject(translator_1.Type.AST))).add(translator.makeSetVariable(translator.makeGetProperty('ERROR', 'type'), '"_ERROR_"')).add(new translator_1.Line('')).add(
    // making char in range function
    translator.makeFunctionDeclaration(new translator_1.TypedVariable(BOOLEAN, 'inRange'), [new translator_1.TypedVariable(STRING, 'curr'), new translator_1.TypedVariable(STRING, 'start'), new translator_1.TypedVariable(STRING, 'end')], translator.makeIf([new translator_1.Condition('curr', translator.makeNothing(), translator_1.ConditionalOperator.EQUALS, STRING)], null, translator.makeReturn(translator.makeBoolean(false)), null).add(translator.makeIf([
        new translator_1.Condition(translator.makeSubtraction(translator.makeGetCharValue(translator.makeGetArrayAccess('curr', '0')), translator.makeGetCharValue(translator.makeGetArrayAccess('start', '0'))), '0', translator_1.ConditionalOperator.GREATER_OR_EQUALS, CHAR),
        new translator_1.Condition(translator.makeSubtraction(translator.makeGetCharValue(translator.makeGetArrayAccess('end', '0')), translator.makeGetCharValue(translator.makeGetArrayAccess('curr', '0'))), '0', translator_1.ConditionalOperator.GREATER_OR_EQUALS, CHAR)
    ], translator_1.Join.AND, translator.makeReturn(translator.makeBoolean(true)), translator.makeReturn(translator.makeBoolean(false)))))).add(new translator_1.Line('')).add(
    // making lookahead function
    translator.makeFunctionDeclaration(new translator_1.TypedVariable(STRING, 'lookahead'), [new translator_1.TypedVariable(TOKEN_OBJECT, 'token')], translator.makeIf([new translator_1.Condition('token', translator.makeNothing(), translator_1.ConditionalOperator.EQUALS, TOKEN_OBJECT)], null, translator.makeReturn('token'), translator.makeReturn(translator.makeGetProperty('token', 'val'))))).add(new translator_1.Line('')).add(
    // making matchToken function
    translator.makeFunctionDeclaration(new translator_1.TypedVariable(TOKEN_OBJECT, 'matchToken'), [new translator_1.TypedVariable(TOKEN_OBJECT, 'token'), new translator_1.TypedVariable(STRING, 'expected')], translator.makeIf([new translator_1.Condition(translator.makeFunctionCall('lookahead', ['token']), 'expected', translator_1.ConditionalOperator.EQUALS, STRING)], null, translator.makeReturn(translator.makeGetProperty('token', 'next')), translator.makeSetVariable(translator.makeGetProperty('ERROR', 'data'), translator.makeStringTemplate('Parse Error: Expected # -- got #', [new translator_1.TypedVariable(STRING, 'expected'), new translator_1.TypedVariable(STRING, translator.makeGetProperty('token', 'val'))])).add(translator.makeReturn('ERROR'))))).add(new translator_1.Line('')).add(
    // making parse handle
    translator.makeFunctionDeclaration(new translator_1.TypedVariable(PAIR, 'parse'), [new translator_1.TypedVariable(TOKEN_OBJECT, 'token')], translator.makeIf([new translator_1.Condition('token', translator.makeNothing(), translator_1.ConditionalOperator.EQUALS, TOKEN_OBJECT)], null, translator.makeExit('"Parse Error: Unable to parse empty file."'), translator.makeVariableDeclaration(new translator_1.TypedVariable(AST, 'parsed'), translator.makeFunctionCall("parse_" + metadata.first, ['token'])).add(translator.makeIf([new translator_1.Condition(translator.makeGetProperty('parsed', 'ast'), 'ERROR', translator_1.ConditionalOperator.EQUALS, AST)], null, translator.makeExit(translator.makeGetProperty('parsed', translator.makeGetProperty('ast', 'data'))), translator.makeIf([new translator_1.Condition(translator.makeGetProperty('parsed', 'token'), translator.makeNothing(), translator_1.ConditionalOperator.NOT_EQUALS, TOKEN_OBJECT)], null, translator.makeExit('"Parse Error: Unexpected tokens at end of file."'), translator.makeReturn(translator.makeGetProperty('parsed', 'ast')))))))).add(new translator_1.Line(''));
    for (var i = 0; i < cfg.rules.length; i++) {
        var rule = cfg.rules[i];
        var options = [];
        var is = rule.is.sort(function (a, b) { return b.length - a.length; });
        for (var j = 0; j < is.length; j++) {
            options.push(translator.makeIf([new translator_1.Condition(translator.makeGetProperty('result', 'ast'), 'ERROR', translator_1.ConditionalOperator.EQUALS, AST)], null, translator.makeVariableDeclaration(new translator_1.TypedVariable(TOKEN_OBJECT, 'curr'), 'token').add(translator.makeVariableDeclaration(new translator_1.TypedVariable(AST_ARRAY, 'children'), translator.makeEmptyList(AST))).add(translator.makeVariableDeclaration(new translator_1.TypedVariable(STRING, 'data'), translator.makeEmptyString())).add(translator.makeVariableDeclaration(new translator_1.TypedVariable(PAIR, 'helper'), translator.makeNothing())).add(new translator_1.Line('')).add(makeBranch(is[j], rule.name, translator)), null).add(new translator_1.Line('')));
        }
        var completedBody = new translator_1.Line('');
        for (var j = 0; j < options.length; j++) {
            completedBody.add(options[j]);
        }
        completedBody.add(translator.makeReturn('result'));
        beforeLogic.add(translator.makeFunctionDeclaration(new translator_1.TypedVariable(PAIR, "parse_" + rule.name), [new translator_1.TypedVariable(TOKEN_OBJECT, 'token')], translator.makeVariableDeclaration(new translator_1.TypedVariable(PAIR, 'result'), translator.makeObject(translator_1.Type.PAIR)).add(translator.makeSetVariable(translator.makeGetProperty('result', 'ast'), 'ERROR')).add(completedBody))).add(new translator_1.Line(''));
    }
    beforeLogic.add(translator.postParser());
    return beforeLogic;
}
exports.parserSrc = parserSrc;
