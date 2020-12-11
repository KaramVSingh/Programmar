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
exports.__esModule = true;
exports.parserSrc = exports.parserHeader = exports.lexerSrc = exports.lexerHeader = void 0;
var cfg_1 = require("../cfg/cfg");
var translatorUtils_1 = require("./translatorUtils");
// common variable to grab all whitespace options
var _SPACE = new translatorUtils_1.STRING_VALUE(' ');
var _TAB = new translatorUtils_1.STRING_VALUE('\\t');
var _RETURN = new translatorUtils_1.STRING_VALUE('\\r');
var _NEWLINE = new translatorUtils_1.STRING_VALUE('\\n');
var literals = new translatorUtils_1.Var('literals', translatorUtils_1.STRING_LIST);
function getCfgLiterals(cfg) {
    var literals = [];
    cfg.rules.map(function (rule) {
        if (rule.isGenerated) {
            return [];
        }
        var flat = [].concat.apply([], __spread((rule.is)));
        var flatArray = flat.map(function (stmt) {
            if (stmt.type === cfg_1.StatementType.RANGE) {
                var asRanges = stmt.data.ranges;
                if (asRanges.length === 1 && asRanges[0][0] === asRanges[0][1]) {
                    return asRanges[0][0];
                }
            }
            return null;
        });
        flatArray
            .filter(function (is) { return is; })
            .forEach(function (literal) { return literals.push(literal); });
    });
    return literals
        .sort(function (a, b) { return b.length - a.length; })
        .filter(function (item, index) { return literals.indexOf(item) === index; });
}
function lexerHeader(t) {
    // Lets not bother with this until C
    return translatorUtils_1.Lines.of();
}
exports.lexerHeader = lexerHeader;
function lexerSrc(cfg, t) {
    // ----- We need all the string literals to lex out ----- //
    var cfgLiterals = getCfgLiterals(cfg);
    var cfgLiteralsAsValues = cfgLiterals.map(function (literal) { return new translatorUtils_1.STRING_VALUE(literal); });
    // some helper variables
    var str = new translatorUtils_1.Var('str', translatorUtils_1.STRING);
    var index = new translatorUtils_1.Var('index', translatorUtils_1.INT);
    var onSpace = new translatorUtils_1.Var('onSpace', translatorUtils_1.INT);
    return t.lexerSrc(
    // ----- top level variables to be referenced in either lex or helpers ----- //
    [
        [literals, new translatorUtils_1.STRING_LIST_VALUE(cfgLiteralsAsValues)]
    ], 
    // ----- main lex function body ----- //
    translatorUtils_1.Lines.of(t.ret(t.call(_lex(t, str, index, onSpace), [str, new translatorUtils_1.INT_VALUE(0), new translatorUtils_1.BOOLEAN_VALUE(false)]))), 
    // ----- helper functions ----- // 
    [
        _next_space_index(t, str, index),
        _lex(t, str, index, onSpace)
    ]);
}
exports.lexerSrc = lexerSrc;
/**
 * A recursive function to grab the index of the next space/end of string. This will be used to evaluate if a token is a
 * CFG literal token.
 */
function _next_space_index(t, str, index) {
    var _next_space_index_call = new translatorUtils_1.Func(translatorUtils_1.INT, '_next_space_index', [str, index], translatorUtils_1.Lines.of());
    return new translatorUtils_1.Func(translatorUtils_1.INT, '_next_space_index', [str, index], translatorUtils_1.Lines.of(t["if"](new translatorUtils_1.Condition(t.length(str), translatorUtils_1.ConditionalOperator.EQUALS, index), translatorUtils_1.Lines.of(t.ret(index)), null), translatorUtils_1.BREAK_LINE, t["if"](new translatorUtils_1.Condition(new translatorUtils_1.Condition(new translatorUtils_1.Condition(t.access(str, index), translatorUtils_1.ConditionalOperator.EQUALS, _NEWLINE), translatorUtils_1.ConditionalOperator.OR, new translatorUtils_1.Condition(t.access(str, index), translatorUtils_1.ConditionalOperator.EQUALS, _RETURN)), translatorUtils_1.ConditionalOperator.OR, new translatorUtils_1.Condition(new translatorUtils_1.Condition(t.access(str, index), translatorUtils_1.ConditionalOperator.EQUALS, _SPACE), translatorUtils_1.ConditionalOperator.OR, new translatorUtils_1.Condition(t.access(str, index), translatorUtils_1.ConditionalOperator.EQUALS, _TAB))), translatorUtils_1.Lines.of(t.ret(index)), null), translatorUtils_1.BREAK_LINE, t.ret(t.call(_next_space_index_call, [str, t.add(index, new translatorUtils_1.INT_VALUE(1))]))));
}
/**
 * A recursive abstract function to convert the string into a linked list of characters.
 * There is no technical reason to convert the string other than ease of use and better opportunities to avoid loop constructs
 * which would require more definitions
 */
function _lex(t, str, index, onSpace) {
    var _lex_call = new translatorUtils_1.Func(translatorUtils_1.TOKEN, '_lex', [str, index, onSpace], translatorUtils_1.Lines.of());
    var untilSpace = new translatorUtils_1.Var('untilSpace', translatorUtils_1.STRING);
    var literal = new translatorUtils_1.Var('literal', translatorUtils_1.STRING);
    return new translatorUtils_1.Func(translatorUtils_1.TOKEN, '_lex', [str, index, onSpace], translatorUtils_1.Lines.of(t["if"](new translatorUtils_1.Condition(t.length(str), translatorUtils_1.ConditionalOperator.EQUALS, index), translatorUtils_1.Lines.of(t.ret(t.none())), null), translatorUtils_1.BREAK_LINE, t["if"](new translatorUtils_1.Condition(new translatorUtils_1.Condition(new translatorUtils_1.Condition(t.access(str, index), translatorUtils_1.ConditionalOperator.NOT_EQUALS, _NEWLINE), translatorUtils_1.ConditionalOperator.AND, new translatorUtils_1.Condition(t.access(str, index), translatorUtils_1.ConditionalOperator.NOT_EQUALS, _RETURN)), translatorUtils_1.ConditionalOperator.AND, new translatorUtils_1.Condition(new translatorUtils_1.Condition(t.access(str, index), translatorUtils_1.ConditionalOperator.NOT_EQUALS, _SPACE), translatorUtils_1.ConditionalOperator.AND, new translatorUtils_1.Condition(t.access(str, index), translatorUtils_1.ConditionalOperator.NOT_EQUALS, _TAB))), translatorUtils_1.Lines.of(t["if"](new translatorUtils_1.Condition(new translatorUtils_1.Condition(onSpace, translatorUtils_1.ConditionalOperator.EQUALS, new translatorUtils_1.BOOLEAN_VALUE(true)), translatorUtils_1.ConditionalOperator.OR, new translatorUtils_1.Condition(index, translatorUtils_1.ConditionalOperator.EQUALS, new translatorUtils_1.INT_VALUE(0))), translatorUtils_1.Lines.of(t["var"](untilSpace, t.substring(str, index, t.call(_next_space_index(t, str, index), [str, index]))), t.forEach(literal, literals, translatorUtils_1.Lines.of(t["if"](t.strEquals(literal, untilSpace), translatorUtils_1.Lines.of(t.ret(t.value(new translatorUtils_1.TOKEN_VALUE(untilSpace, t.call(_lex_call, [str, t.add(index, t.length(untilSpace)), new translatorUtils_1.BOOLEAN_VALUE(false)]))))), null))), translatorUtils_1.BREAK_LINE, t.ret(t.value(new translatorUtils_1.TOKEN_VALUE(t.access(str, index), t.call(_lex_call, [str, t.add(index, new translatorUtils_1.INT_VALUE(1)), new translatorUtils_1.BOOLEAN_VALUE(false)]))))), translatorUtils_1.Lines.of(t.ret(t.value(new translatorUtils_1.TOKEN_VALUE(t.access(str, index), t.call(_lex_call, [str, t.add(index, new translatorUtils_1.INT_VALUE(1)), new translatorUtils_1.BOOLEAN_VALUE(false)]))))))), translatorUtils_1.Lines.of(t.ret(t.call(_lex_call, [str, t.add(index, new translatorUtils_1.INT_VALUE(1)), new translatorUtils_1.BOOLEAN_VALUE(true)]))))));
}
function parserHeader(t, cfg) {
    // Lets not bother with this until C
    return translatorUtils_1.Lines.of();
}
exports.parserHeader = parserHeader;
function parserSrc(metadata, cfg, t) {
    return translatorUtils_1.Lines.of();
}
exports.parserSrc = parserSrc;
/*
const TOKEN_OBJECT: DecoratedType = new DecoratedType(Type.TOKEN, 1)
const STRING_ARRAY: DecoratedType = new DecoratedType(Type.CHAR, 2)
const STRING: DecoratedType = new DecoratedType(Type.CHAR, 1)
const CHAR: DecoratedType = new DecoratedType(Type.CHAR, 0)
const BOOLEAN: DecoratedType = new DecoratedType(Type.BOOLEAN, 0)
const INT: DecoratedType = new DecoratedType(Type.INT, 0)
const AST: DecoratedType = new DecoratedType(Type.AST, 1)
const AST_ARRAY: DecoratedType = new DecoratedType(Type.AST, 2)
const PAIR: DecoratedType = new DecoratedType(Type.PAIR, 1)

function lexerHeader(translator: GrandLanguageTranslator): Line {
    return translator.lexerHeader()
}

function lexerSrc(metadata: Metadata, cfg: Cfg, translator: GrandLanguageTranslator): Line {
    const literals: string[] = gatherLiterals(cfg)
    const whitespace: string[] = ['" "', '"\\t"', '"\\r"', '"\\n"']
    return translator.preLexer().add(new Line('')).add(
        translator.makeVariableDeclaration(
            new TypedVariable(STRING_ARRAY, 'literals'), translator.makeStaticArray(literals.map((value) => `"${value}"`))
        )
    ).add(
        translator.makeVariableDeclaration(
            new TypedVariable(STRING_ARRAY, 'whitespace'), translator.makeStaticArray(whitespace)
        )
    ).add(
        translator.makeVariableDeclaration(
            new TypedVariable(BOOLEAN, 'ignoreWhitespace'), translator.makeBoolean(metadata.ignoreWhitespace)
        )
    ).add(new Line('')).add(
        translator.makeFunctionDeclaration(new TypedVariable(BOOLEAN, 'matchPrefix'), [ new TypedVariable(STRING, 'prefix'), new TypedVariable(STRING, 'str') ],
            translator.makeIf([new Condition(translator.makeStringLength('prefix'), translator.makeStringLength('str'), ConditionalOperator.LESS_OR_EQUAL, INT)], null,
                translator.makeClassicFor(new TypedVariable(INT, 'i'), '0', translator.makeStringLength('prefix'),
                    translator.makeIf([new Condition(translator.makeGetArrayAccess('prefix', 'i'), translator.makeGetArrayAccess('str', 'i'), ConditionalOperator.NOT_EQUALS, CHAR)], null,
                        translator.makeReturn(translator.makeBoolean(false)),
                        null
                    )
                ).add(new Line('')).add(
                    translator.makeReturn(translator.makeBoolean(true))
                ),
                translator.makeReturn(translator.makeBoolean(false))
            )
        )
    ).add(new Line('')).add(
        translator.makeFunctionDeclaration(new TypedVariable(BOOLEAN, 'equals'), [ new TypedVariable(STRING, 'a'), new TypedVariable(STRING, 'b') ],
            translator.makeIf([new Condition(translator.makeStringLength('a'), translator.makeStringLength('b'), ConditionalOperator.EQUALS, INT)], null,
                translator.makeReturn(translator.makeFunctionCall('matchPrefix', ['a', 'b'])),
                translator.makeReturn(translator.makeBoolean(false))
            )
        )
    ).add(new Line('')).add(
        translator.makeFunctionDeclaration(new TypedVariable(BOOLEAN, 'contains'), [ new TypedVariable(STRING, 'tst'), new TypedVariable(STRING_ARRAY, 'arr') ],
            translator.makeClassicFor(new TypedVariable(INT, 'i'), '0', translator.makeGetProperty('arr', 'length'),
                translator.makeIf([new Condition(translator.makeFunctionCall('equals', ['tst', translator.makeGetArrayAccess('arr', 'i')]), translator.makeBoolean(true), ConditionalOperator.EQUALS, BOOLEAN)], null,
                    translator.makeReturn(translator.makeBoolean(true)),
                    null
                )
            ).add(new Line('')).add(
                translator.makeReturn(translator.makeBoolean(false))
            )
        )
    ).add(new Line('')).add(
        translator.makeFunctionDeclaration(new TypedVariable(TOKEN_OBJECT, 'lex'), [ new TypedVariable(STRING, 'str') ],
            translator.makeVariableDeclaration(new TypedVariable(TOKEN_OBJECT, 'firstToken'), translator.makeObject(Type.TOKEN)).add(
                translator.makeSetVariable(translator.makeGetProperty('firstToken', 'val'), '""')
            ).add(
                translator.makeSetVariable(translator.makeGetProperty('firstToken', 'next'), translator.makeNothing())
            ).add(new Line('')).add(
                translator.makeVariableDeclaration(new TypedVariable(INT, 'index'), '0')
            ).add(
                translator.makeVariableDeclaration(new TypedVariable(TOKEN_OBJECT, 'lastToken'), 'firstToken')
            ).add(new Line('')).add(
                translator.makeWhile(new Condition('index', translator.makeStringLength('str'), ConditionalOperator.LESS, INT),
                    translator.makeVariableDeclaration(new TypedVariable(TOKEN_OBJECT, 'newToken'), translator.makeNothing()).add(
                        translator.makeClassicFor(new TypedVariable(INT, 'i'), '0', translator.makeGetProperty('literals', 'length'),
                            translator.makeVariableDeclaration(new TypedVariable(STRING, 'literal'), translator.makeGetArrayAccess('literals', 'i')).add(new Line('')).add(
                                translator.makeIf([new Condition(translator.makeFunctionCall('matchPrefix', ['literal', translator.makeStringStartingAt('str', 'index')]), translator.makeBoolean(true), ConditionalOperator.EQUALS, BOOLEAN)], null,
                                    translator.makeSetVariable('newToken', translator.makeObject(Type.TOKEN)).add(
                                        translator.makeSetVariable(translator.makeGetProperty('newToken', 'val'), 'literal')
                                    ).add(
                                        translator.makeSetVariable(translator.makeGetProperty('newToken', 'next'), translator.makeNothing())
                                    ).add(new Line('')).add(
                                        translator.makeSetVariable('index', translator.makeAddition('index', translator.makeStringLength('literal')))
                                    ).add(
                                        translator.makeBreak()
                                    ),
                                    null
                                )
                            )
                        ).add(new Line('')).add(
                            translator.makeIf([new Condition('newToken', translator.makeNothing(), ConditionalOperator.EQUALS, TOKEN_OBJECT)], null,
                                translator.makeIf([new Condition('ignoreWhitespace', translator.makeBoolean(true), ConditionalOperator.EQUALS, BOOLEAN), new Condition(translator.makeFunctionCall('contains', [translator.makeGetArrayAccess('str', 'index'), 'whitespace']), translator.makeBoolean(true), ConditionalOperator.EQUALS, BOOLEAN)], Join.AND,
                                    translator.makeSetVariable('index', translator.makeAddition('index', '1')).add(
                                        translator.makeContinue()
                                    ),
                                    translator.makeSetVariable('newToken', translator.makeObject(Type.TOKEN)).add(
                                        translator.makeSetVariable(translator.makeGetProperty('newToken', 'val'), translator.makeStringFromChar(translator.makeGetArrayAccess('str', 'index')))
                                    ).add(
                                        translator.makeSetVariable(translator.makeGetProperty('newToken', 'next'), translator.makeNothing())
                                    ).add(
                                        translator.makeSetVariable('index', translator.makeAddition('index', '1'))
                                    )
                                ),
                                null
                            )
                        ).add(new Line('')).add(
                            translator.makeSetVariable(translator.makeGetProperty('lastToken', 'next'), 'newToken')
                        ).add(
                            translator.makeSetVariable('lastToken', translator.makeGetProperty('lastToken', 'next'))
                        )
                    )
                ).add(new Line('')).add(
                    translator.makeReturn(translator.makeGetProperty('firstToken', 'next'))
                )
            )
        )
    ).add(new Line('')).add(
        translator.postLexer()
    )
}

function parserHeader(translator: GrandLanguageTranslator, cfg: Cfg): Line {
    return translator.parserHeader(cfg)
}

function makeBranch(statements: Statement[], ruleName: string,  translator: GrandLanguageTranslator): Line {
    console.log("creating branch: " + ruleName)
    console.log(statements)
    if(statements.length === 0) {
        return translator.makeVariableDeclaration(new TypedVariable(AST, 'ast'), translator.makeObject(Type.AST)).add(
            translator.makeSetVariable(translator.makeGetProperty('ast', 'children'), 'children')
        ).add(
            translator.makeSetVariable(translator.makeGetProperty('ast', 'data'), 'data')
        ).add(
            translator.makeSetVariable(translator.makeGetProperty('ast', 'type'), `"${ruleName}"`)
        ).add(
            translator.makeSetVariable(translator.makeGetProperty('result', 'ast'), 'ast')
        ).add(
            translator.makeSetVariable(translator.makeGetProperty('result', 'token'), 'curr')
        )
    }

    let ln: Line = new Line('')
    let curr = statements[0]
    if(curr.type === StatementType.RULE) {
        let rule: string = curr.data as string

        ln.add(
            translator.makeSetVariable('helper', translator.makeFunctionCall(`parse_${rule}`, ['curr']))
        ).add(
            translator.makeIf([new Condition(translator.makeGetProperty('helper', 'ast'), 'ERROR', ConditionalOperator.NOT_EQUALS, AST)], null,
                translator.makeAddToArray('children', translator.makeGetProperty('helper', 'ast')).add(
                    translator.makeSetVariable('curr', translator.makeGetProperty('helper', 'token'))
                ).add(new Line('')).add(makeBranch(statements.slice(1), ruleName, translator)),
                null
            )
        )
    } else if(curr.type === StatementType.RANGE) {
        let conditions: Condition[] = []
        let range: Range = curr.data as Range

        if (range.ranges.length === 0) {
            conditions.push(new Condition(translator.makeBoolean(true), translator.makeBoolean(!range.isAffirmative), ConditionalOperator.EQUALS, BOOLEAN))
        }

        for(let i = 0; i < range.ranges.length; i++) {
            let currRange = range.ranges[i]
            let operator = range.isAffirmative ? ConditionalOperator.EQUALS : ConditionalOperator.NOT_EQUALS

            if(currRange[0] === currRange[1]) {
                let value
                if (currRange[0] == '\n') { value = '\\n' } else if (currRange[0] == '\t') { value = '\\t' } else if (currRange[0] == '\r') { value = '\\r' } else if (currRange[0] == '\\') { value = '\\\\' } else if (currRange[0] == '"') { value = '\\\"' } else { value = currRange[0] }
                conditions.push(new Condition(translator.makeFunctionCall('lookahead', ['curr']), `"${value}"`, operator, STRING))
            } else {
                conditions.push(new Condition(translator.makeFunctionCall('inRange', [translator.makeFunctionCall('lookahead', ['curr']), `"${currRange[0]}"`, `"${currRange[1]}"`]), translator.makeBoolean(true), operator, BOOLEAN))
            }
        }

        const acc = range.isAffirmative ? Join.OR : Join.AND

        ln.add(
            translator.makeIf([new Condition('curr', translator.makeNothing(), ConditionalOperator.NOT_EQUALS, TOKEN_OBJECT)], null,
                translator.makeIf(conditions, acc,
                    translator.makeSetVariable('curr', translator.makeFunctionCall('matchToken', ['curr', translator.makeFunctionCall('lookahead', ['curr'])])).add(
                        translator.makeSetVariable('data', translator.makeStringTemplate('##', [new TypedVariable(STRING, 'data'), new TypedVariable(STRING, translator.makeFunctionCall('lookahead', ['curr']))]))
                    ).add(new Line('')).add(makeBranch(statements.slice(1), ruleName, translator)),
                    translator.makeSetVariable(translator.makeGetProperty('ERROR', 'data'), translator.makeStringTemplate('Parse Error: Unexpected token -- \\"#\\"', [ new TypedVariable(STRING, translator.makeFunctionCall('lookahead', ['curr'])) ]))
                ),
                translator.makeSetVariable(translator.makeGetProperty('ERROR', 'data'), translator.makeStringTemplate('Parse Error: Unexpected end of file.', []))
            )
        )
    }

    return ln.next
}

function parserSrc(metadata: Metadata, cfg: Cfg, translator: GrandLanguageTranslator): Line {
    let beforeLogic: Line =  translator.preParser().add(
        translator.makeVariableDeclaration(new TypedVariable(AST, 'ERROR'), translator.makeObject(Type.AST))
    ).add(
        translator.makeSetVariable(translator.makeGetProperty('ERROR', 'type'), '"_ERROR_"')
    ).add(
        new Line('')
    ).add(
        // making char in range function
        translator.makeFunctionDeclaration(new TypedVariable(BOOLEAN, 'inRange'), [ new TypedVariable(STRING, 'curr'), new TypedVariable(STRING, 'start'), new TypedVariable(STRING, 'end') ],
            translator.makeIf([new Condition('curr', translator.makeNothing(), ConditionalOperator.EQUALS, STRING)], null,
                translator.makeReturn(translator.makeBoolean(false)),
                null
            ).add(
                translator.makeIf([
                    new Condition(translator.makeSubtraction(translator.makeGetCharValue(translator.makeGetArrayAccess('curr', '0')), translator.makeGetCharValue(translator.makeGetArrayAccess('start', '0'))), '0', ConditionalOperator.GREATER_OR_EQUALS, CHAR),
                    new Condition(translator.makeSubtraction(translator.makeGetCharValue(translator.makeGetArrayAccess('end', '0')), translator.makeGetCharValue(translator.makeGetArrayAccess('curr', '0'))), '0', ConditionalOperator.GREATER_OR_EQUALS, CHAR)
                ], Join.AND,
                    translator.makeReturn(translator.makeBoolean(true)),
                    translator.makeReturn(translator.makeBoolean(false))
                )
            )
        )
    ).add(new Line('')).add(
        // making lookahead function
        translator.makeFunctionDeclaration(new TypedVariable(STRING, 'lookahead'), [ new TypedVariable(TOKEN_OBJECT, 'token') ],
            translator.makeIf([new Condition('token', translator.makeNothing(), ConditionalOperator.EQUALS, TOKEN_OBJECT)], null,
                translator.makeReturn('token'),
                translator.makeReturn(translator.makeGetProperty('token', 'val'))
            )
        )
    ).add(
        new Line('')
    ).add(
        // making matchToken function
        translator.makeFunctionDeclaration(new TypedVariable(TOKEN_OBJECT, 'matchToken'), [ new TypedVariable(TOKEN_OBJECT, 'token'), new TypedVariable(STRING, 'expected') ],
            translator.makeIf([new Condition(translator.makeFunctionCall('lookahead', [ 'token' ]), 'expected', ConditionalOperator.EQUALS, STRING)], null,
                translator.makeReturn(translator.makeGetProperty('token', 'next')),
                translator.makeSetVariable(translator.makeGetProperty('ERROR', 'data'), translator.makeStringTemplate('Parse Error: Expected # -- got #', [ new TypedVariable(STRING, 'expected'), new TypedVariable(STRING, translator.makeGetProperty('token', 'val')) ])).add(
                    translator.makeReturn('ERROR')
                )
            )
        )
    ).add(
        new Line('')
    ).add(
        // making parse handle
        translator.makeFunctionDeclaration(new TypedVariable(PAIR, 'parse'), [ new TypedVariable(TOKEN_OBJECT, 'token') ],
            translator.makeIf([new Condition('token', translator.makeNothing(), ConditionalOperator.EQUALS, TOKEN_OBJECT)], null,
                translator.makeExit('"Parse Error: Unable to parse empty file."'),
                translator.makeVariableDeclaration(new TypedVariable(AST, 'parsed'), translator.makeFunctionCall(`parse_${metadata.first}`, ['token'])).add(
                    translator.makeIf([new Condition(translator.makeGetProperty('parsed', 'ast'), 'ERROR', ConditionalOperator.EQUALS, AST)], null,
                        translator.makeExit(translator.makeGetProperty('parsed', translator.makeGetProperty('ast', 'data'))),
                        translator.makeIf([new Condition(translator.makeGetProperty('parsed', 'token'), translator.makeNothing(), ConditionalOperator.NOT_EQUALS, TOKEN_OBJECT)], null,
                            translator.makeExit('"Parse Error: Unexpected tokens at end of file."'),
                            translator.makeReturn(translator.makeGetProperty('parsed', 'ast'))
                        )
                    )
                )
            )
        )
    ).add(
        new Line('')
    )

    for(let i = 0; i < cfg.rules.length; i++) {
        let rule: Rule = cfg.rules[i]

        let options: Line[] = []
        let is: Statement[][] = rule.is.sort((a: Statement[], b: Statement[]) => b.length - a.length)

        for(let j = 0; j < is.length; j++) {
            options.push(
                translator.makeIf([new Condition(translator.makeGetProperty('result', 'ast'), 'ERROR', ConditionalOperator.EQUALS, AST)], null,
                    translator.makeVariableDeclaration(new TypedVariable(TOKEN_OBJECT, 'curr'), 'token').add(
                        translator.makeVariableDeclaration(new TypedVariable(AST_ARRAY, 'children'), translator.makeEmptyList(AST))
                    ).add(
                        translator.makeVariableDeclaration(new TypedVariable(STRING, 'data'), translator.makeEmptyString())
                    ).add(
                        translator.makeVariableDeclaration(new TypedVariable(PAIR, 'helper'), translator.makeNothing())
                    ).add(new Line('')).add(
                        makeBranch(is[j], rule.name, translator)
                    ),
                    null
                ).add(new Line(''))
            )
        }

        let completedBody: Line = new Line('')
        for(let j = 0; j < options.length; j++) {
            completedBody.add(options[j])
        }

        completedBody.add(
            translator.makeReturn('result')
        )

        beforeLogic.add(
            translator.makeFunctionDeclaration(new TypedVariable(PAIR, `parse_${rule.name}`), [ new TypedVariable(TOKEN_OBJECT, 'token') ],
                translator.makeVariableDeclaration(new TypedVariable(PAIR, 'result'), translator.makeObject(Type.PAIR)).add(
                    translator.makeSetVariable(translator.makeGetProperty('result', 'ast'), 'ERROR')
                ).add(
                    completedBody
                )
            )
        ).add(new Line(''))
    }
    
    beforeLogic.add(
        translator.postParser()
    )

    return beforeLogic
}

export { lexerHeader, lexerSrc, parserHeader, parserSrc }
*/ 
