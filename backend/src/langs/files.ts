import { Cfg, gatherLiterals } from '../cfg/cfg'
import { GrandLanguageTranslator, Line, TypedVariable, Type, Tree, Condition, ConditionalOperator, DecoratedType, Join } from './translator'
import { Metadata } from './../app/app'
import fs = require('fs')

const TOKEN_OBJECT: DecoratedType = new DecoratedType(Type.TOKEN, 1)
const STRING_ARRAY: DecoratedType = new DecoratedType(Type.CHAR, 2)
const STRING: DecoratedType = new DecoratedType(Type.CHAR, 1)
const CHAR: DecoratedType = new DecoratedType(Type.CHAR, 0)
const BOOLEAN: DecoratedType = new DecoratedType(Type.BOOLEAN, 0)
const INT: DecoratedType = new DecoratedType(Type.INT, 0)

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
            translator.makeIf(new Tree(new Condition(translator.makeStringLength('prefix'), translator.makeStringLength('str'), ConditionalOperator.LESS_OR_EQUAL, INT), null),
                translator.makeClassicFor(new TypedVariable(INT, 'i'), '0', translator.makeStringLength('prefix'), 
                    translator.makeIf(new Tree(new Condition(translator.makeGetArrayAccess('prefix', 'i'), translator.makeGetArrayAccess('str', 'i'), ConditionalOperator.NOT_EQUALS, CHAR), null),
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
            translator.makeIf(new Tree(new Condition(translator.makeStringLength('a'), translator.makeStringLength('b'), ConditionalOperator.EQUALS, INT), null),
                translator.makeReturn(translator.makeFunctionCall('matchPrefix', ['a', 'b'])),
                translator.makeReturn(translator.makeBoolean(false))
            )
        )
    ).add(new Line('')).add(
        translator.makeFunctionDeclaration(new TypedVariable(BOOLEAN, 'contains'), [ new TypedVariable(STRING, 'tst'), new TypedVariable(STRING_ARRAY, 'arr') ],
            translator.makeClassicFor(new TypedVariable(INT, 'i'), '0', translator.makeGetProperty('arr', 'length'),
                translator.makeIf(new Tree(new Condition(translator.makeFunctionCall('equals', ['tst', translator.makeGetArrayAccess('arr', 'i')]), translator.makeBoolean(true), ConditionalOperator.EQUALS, BOOLEAN), null),
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
                translator.makeWhile(new Tree(new Condition('index', translator.makeStringLength('str'), ConditionalOperator.LESS, INT), null),
                    translator.makeVariableDeclaration(new TypedVariable(TOKEN_OBJECT, 'newToken'), translator.makeNothing()).add(
                        translator.makeClassicFor(new TypedVariable(INT, 'i'), '0', translator.makeGetProperty('literals', 'length'),
                            translator.makeVariableDeclaration(new TypedVariable(STRING, 'literal'), translator.makeGetArrayAccess('literals', 'i')).add(new Line('')).add(
                                translator.makeIf(new Tree(new Condition(translator.makeFunctionCall('matchPrefix', ['literal', translator.makeStringStartingAt('str', 'index')]), translator.makeBoolean(true), ConditionalOperator.EQUALS, BOOLEAN), null),
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
                            translator.makeIf(new Tree(new Condition('newToken', translator.makeNothing(), ConditionalOperator.EQUALS, TOKEN_OBJECT), null),
                                translator.makeIf(new Tree([ new Tree(new Condition('ignoreWhitespace', translator.makeBoolean(true), ConditionalOperator.EQUALS, BOOLEAN), null), new Tree(new Condition(translator.makeFunctionCall('contains', [translator.makeGetArrayAccess('str', 'index'), 'whitespace']), translator.makeBoolean(true), ConditionalOperator.EQUALS, BOOLEAN), null) ], Join.AND),
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

function parserHeader(translator: GrandLanguageTranslator): Line {
    return new Line("")
}

function parserSrc(metadata: Metadata, cfg: Cfg, translator: GrandLanguageTranslator): Line {
    return new Line("")
}

function createLexer(id: string, metadata: Metadata, cfg: Cfg, translator: GrandLanguageTranslator) {
    const header = lexerHeader(translator)
    fs.writeFileSync(`environments/${id}/lexer_h.${translator.fileExtention(true)}`, header.toString())

    const src = lexerSrc(metadata, cfg, translator)
    fs.writeFileSync(`environments/${id}/lexer.${translator.fileExtention(false)}`, src.toString())
}

function createParser(id: string, metadata: Metadata, cfg: Cfg, translator: GrandLanguageTranslator) {
    const header = parserHeader(translator)
    fs.writeFileSync(`environments/${id}/parser_h.${translator.fileExtention(true)}`, header.toString())

    const src = parserSrc(metadata, cfg, translator)
    fs.writeFileSync(`environments/${id}/parser.${translator.fileExtention(false)}`, src.toString())
}

export { createLexer, createParser }