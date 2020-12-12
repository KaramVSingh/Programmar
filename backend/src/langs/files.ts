import { Cfg, StatementType, Statement, Range, Rule } from '../cfg/cfg'
import { GrandLanguageTranslator } from './translator'
import { Var, Lines, STRING_LIST, STRING_LIST_VALUE, TOKEN, STRING_VALUE, TOKEN_VALUE, Func, STRING, INT, INT_VALUE, Condition, ConditionalOperator, BREAK_LINE, BOOLEAN_VALUE, AST, AST_VALUE, AST_LIST, AST_LIST_VALUE, TabbedLines, BOOLEAN } from './translatorUtils'
import { Metadata } from './../app/app'

// common variable to grab all whitespace options
const _SPACE = new STRING_VALUE(' ')
const _TAB = new STRING_VALUE('\\t')
const _RETURN = new STRING_VALUE('\\r')
const _NEWLINE = new STRING_VALUE('\\n')
const literals = new Var('literals', STRING_LIST)

const genVar = () => new Var(Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12), STRING)

function getCfgLiterals(cfg: Cfg): string[] {
    const literals = []
    cfg.rules.map(rule => {
        if (rule.isGenerated) { return [] }
        const flat: Statement[] = [].concat(...(rule.is))
        const flatArray = flat.map(stmt => {
            if (stmt.type === StatementType.RANGE) {
                const asRanges = (stmt.data as Range).ranges
                if (asRanges.length === 1 && asRanges[0][0] === asRanges[0][1]) {
                    return asRanges[0][0]
                }
            }

            return null
        })

        flatArray
            .filter(is => is)
            .forEach(literal => literals.push(literal))
    })

    return literals
        .sort((a: string, b: string) => { return b.length - a.length })
        .filter((item, index) => literals.indexOf(item) === index)
}

function parserHeader(t: GrandLanguageTranslator, cfg: Cfg): Lines {
    // Lets not bother with this until C
    return Lines.of()
}

function parserSrc(metadata: Metadata, cfg: Cfg, t: GrandLanguageTranslator): Lines {
    // some helper variables
    const ERROR = new Var('ERROR', AST)
    const token = new Var('tokens', TOKEN)
    const parsed = new Var('parsed', AST)

    // first_rule name
    const firstRule = metadata.first

    // generate functions for each rule
    const ruleFunctions = cfg.rules.map(rule => _generate_rule_parser(t, rule, token))

    return t.parserSrc(
        [
            [ERROR, new AST_VALUE(new STRING_VALUE('-ERROR-'), null, null, null)]
        ],
        Lines.of(
            t.if(
                new Condition(token, ConditionalOperator.EQUALS, t.none()),
                Lines.of(
                    t.exit(new STRING_VALUE("Parse Error: Unable to parse empty file."))
                ),
                Lines.of(
                    t.var(parsed, t.call(new Func(AST, `_parse_${firstRule}`, [token], Lines.of()), [token])),
                    t.if(
                        new Condition(parsed, ConditionalOperator.EQUALS, ERROR),
                        Lines.of(
                            t.exit(t.get(ERROR, new Var('data', STRING)))
                        ),
                        Lines.of(
                            t.if(
                                new Condition(t.get(parsed, new Var('token', TOKEN)), ConditionalOperator.NOT_EQUALS, t.none()),
                                Lines.of(
                                    t.exit(new STRING_VALUE("Parse Error: Unexpected tokens at the end of file."))
                                ),
                                Lines.of(
                                    t.ret(parsed)
                                )
                            )
                        )
                    )
                )
            )
        ),
        [
            _lookahead(t, token),
            _in_range(t, new Var('tokens', STRING), new Var('start', STRING), new Var('end', STRING)),
            ...ruleFunctions
        ]
    )
}

function part(
    t: GrandLanguageTranslator,
    stmts: Statement[],
    ruleName: string,
    curr: Var,
    data: Var,
    ERROR: Var,
    result: Var,
    children: Var
): Lines {
    if (stmts.length === 0) {
        return Lines.of(
            t.set(result, new AST_VALUE(new STRING_VALUE(ruleName), data, curr, children))
        )
    }

    const p = stmts.shift()
    if (p.type === StatementType.RANGE) {
        const range = p.data as Range
        if (range.isAffirmative && range.ranges.length === 1 && range.ranges[0][0] === range.ranges[0][1]) {
            // If we're looking at what might as well be a constant.
            const literal = range.ranges[0][0]
            return Lines.of(
                t.if(
                    t.strEquals(t.call(_lookahead(t, curr), [curr]), new STRING_VALUE(literal)),
                    Lines.of(
                        t.set(data, t.strAdd(data, t.strAdd(new STRING_VALUE(" "), new STRING_VALUE(literal)))),
                        t.set(curr, t.get(curr, new Var('next', TOKEN))),
                        BREAK_LINE,
                        // recurse
                        part(t, stmts, ruleName, curr, data, ERROR, result, children)
                    ),
                    Lines.of(
                        t.if(
                            new Condition(t.call(_lookahead(t, curr), [curr]), ConditionalOperator.EQUALS, t.none()),
                            Lines.of(
                                t.set(t.get(ERROR, data), new STRING_VALUE("Parse Error: Unexpected end of file.")),
                                t.set(result, ERROR)
                            ),
                            Lines.of(
                                t.set(t.get(ERROR, data), t.strAdd(new STRING_VALUE("Parse Error: Unexpected token -- "), t.call(_lookahead(t, curr), [curr]))),
                                t.set(result, ERROR)
                            )
                        )
                    )
                )
            )
        } else {
            // If we're looking at a real life range!
            const gen = (isAffirmative: boolean, ranges: [string, string][]) => {
                if (ranges.length === 0) { return new BOOLEAN_VALUE(true) }

                const range = ranges.shift()
                const currString = t.get(curr, new Var(`curr`, STRING))
                return new Condition(
                    new Condition(
                        t.call(_in_range(t, currString, t.value(new STRING_VALUE(range[0])), t.value(new STRING_VALUE(range[1]))), [currString, t.value(new STRING_VALUE(range[0])), t.value(new STRING_VALUE(range[1]))]),
                        ConditionalOperator.EQUALS,
                        new BOOLEAN_VALUE(isAffirmative)
                    ),
                    ConditionalOperator.AND,
                    gen(isAffirmative, ranges)
                )
            }

            let condition: Condition
            if (range.ranges.length === 0) {
                condition = new Condition(new BOOLEAN_VALUE(range.isAffirmative), ConditionalOperator.EQUALS, new BOOLEAN_VALUE(true))
            } else {
                condition = new Condition(
                    new Condition(t.call(_lookahead(t, curr), [curr]), ConditionalOperator.NOT_EQUALS, t.none()),
                    ConditionalOperator.AND,
                    gen(range.isAffirmative, range.ranges)
                )
            }

            return Lines.of(
                t.if(
                    condition,
                    Lines.of(
                        t.set(data, t.strAdd(data, t.strAdd(new STRING_VALUE(" "), t.call(_lookahead(t, curr), [curr])))),
                        t.set(curr, t.get(curr, new Var('next', TOKEN))),
                        BREAK_LINE,
                        // recurse
                        part(t, stmts, ruleName, curr, data, ERROR, result, children)
                    ),
                    Lines.of(
                        t.if(
                            new Condition(t.call(_lookahead(t, curr), [curr]), ConditionalOperator.EQUALS, t.none()),
                            Lines.of(
                                t.set(t.get(ERROR, data), new STRING_VALUE("Parse Error: Unexpected end of file.")),
                                t.set(result, ERROR)
                            ),
                            Lines.of(
                                t.set(t.get(ERROR, data), t.strAdd(new STRING_VALUE("Parse Error: Unexpected token -- "), t.call(_lookahead(t, curr), [curr]))),
                                t.set(result, ERROR)
                            )
                        )
                    )
                )
            )
        }
    } else {
        const rule = p.data as string
        const toCall = new Func(AST, `_parse_${rule}`, [curr], Lines.of())
        const helper = genVar()
        return Lines.of(
            t.var(helper, t.call(toCall, [curr])),
            t.if(
                new Condition(helper, ConditionalOperator.NOT_EQUALS, ERROR),
                Lines.of(
                    t.set(curr, t.get(helper, new Var('token', TOKEN))),
                    t.pushAstArray(children, helper),
                    BREAK_LINE,
                    // recurse
                    part(t, stmts, ruleName, curr, data, ERROR, result, children)
                ),
                null
            )
        )
    }
}

function option(
    t: GrandLanguageTranslator, 
    stmts: Statement[], 
    name: string, 
    ERROR: Var,
    result: Var,
    token: Var,
    curr: Var,
    children: Var,
    data: Var
): Lines {
    return Lines.of(
        t.if(
            new Condition(result, ConditionalOperator.EQUALS, ERROR),
            Lines.of(
                t.var(curr, token),
                t.var(children, new AST_LIST_VALUE([])),
                t.var(data, new STRING_VALUE("")),
                BREAK_LINE,
                part(t, stmts, name, curr, data, ERROR, result, children)
            ),
            null
        ),
        BREAK_LINE
    )
}

function _generate_rule_parser(t: GrandLanguageTranslator, r: Rule, token: Var): Func {
    const result = new Var('result', AST)
    const ERROR = new Var('ERROR', AST)

    const curr = new Var('curr', TOKEN)
    const children = new Var('children', AST_LIST)
    const data = new Var('data', STRING)

    const noEmpty = r.is
        .sort((a: Statement[], b: Statement[]) => a.length - b.length)
        .filter((a: Statement[]) => a.length > 0)

    const tackedOn = noEmpty.length === r.is.length ? noEmpty : noEmpty.concat([[]])
    const options = tackedOn.map(optn => {
        return option(t, optn, r.name, ERROR, result, token, curr, children, data)
    })

    return new Func(
        AST,
        `_parse_${r.name}`,
        [token],
        Lines.of(
            t.var(result, ERROR),
            BREAK_LINE,
            ...options,
            BREAK_LINE,
            t.ret(result)
        )
    )
}

function _lookahead(t: GrandLanguageTranslator, token: Var): Func {
    return new Func(
        STRING,
        '_lookahead',
        [token],
        Lines.of(
            t.if(
                new Condition(token, ConditionalOperator.EQUALS, t.none()),
                Lines.of(
                    t.ret(token)
                ),
                Lines.of(
                    t.ret(t.get(token, new Var('curr', STRING)))
                )
            )
        )
    )
}

function _in_range(t: GrandLanguageTranslator, token: Var, start: Var, end: Var): Func {
    const currCode = t.getCharCode(t.access(token, new INT_VALUE(0)))
    const startCode = t.getCharCode(t.access(start, new INT_VALUE(0)))
    const endCode = t.getCharCode(t.access(end, new INT_VALUE(0)))

    return new Func(
        BOOLEAN,
        '_in_range',
        [token, start, end],
        Lines.of(
            // start and end are 1 letter strings
            t.if(
                new Condition(token, ConditionalOperator.EQUALS, t.none()),
                Lines.of(
                    t.ret(t.none())
                ),
                null
            ),
            BREAK_LINE,
            t.if(
                new Condition(
                    new Condition(t.sub(currCode, startCode), ConditionalOperator.GREATER_OR_EQUALS, new INT_VALUE(0)),
                    ConditionalOperator.AND,
                    new Condition(t.sub(endCode, currCode), ConditionalOperator.GREATER_OR_EQUALS, new INT_VALUE(0))
                ),
                Lines.of(t.ret(t.value(new BOOLEAN_VALUE(true)))),
                Lines.of(t.ret(t.value(new BOOLEAN_VALUE(false))))
            )
        )
    )
}

function lexerHeader(t: GrandLanguageTranslator): Lines {
    // Lets not bother with this until C
    return Lines.of()
}

function lexerSrc(cfg: Cfg, t: GrandLanguageTranslator): Lines {
    // ----- We need all the string literals to lex out ----- //
    const cfgLiterals = getCfgLiterals(cfg)
    const cfgLiteralsAsValues = cfgLiterals.map(literal => new STRING_VALUE(literal))

    // some helper variables
    const str = new Var('str', STRING)
    const index = new Var('index', INT)
    const onSpace = new Var('onSpace', INT)

    return t.lexerSrc(
        // ----- top level variables to be referenced in either lex or helpers ----- //
        [
            [literals, new STRING_LIST_VALUE(cfgLiteralsAsValues)]
        ],
        // ----- main lex function body ----- //
        Lines.of(
            t.ret(t.call(_lex(t, str, index, onSpace), [str, new INT_VALUE(0), new BOOLEAN_VALUE(false)]) )
        ),
        // ----- helper functions ----- // 
        [
            _next_space_index(t, str, index),
            _lex(t, str, index, onSpace)
        ]
    )
}

/**
 * A recursive function to grab the index of the next space/end of string. This will be used to evaluate if a token is a
 * CFG literal token.
 */
function _next_space_index(t: GrandLanguageTranslator, str: Var, index: Var): Func {
    const _next_space_index_call = new Func(INT, '_next_space_index', [str, index], Lines.of())
    return new Func(
        INT,
        '_next_space_index',
        [str, index],
        Lines.of(
            t.if(
                new Condition(t.length(str), ConditionalOperator.EQUALS, index),
                Lines.of(
                    t.ret(index)
                ),
                null
            ),
            BREAK_LINE,
            t.if(
                new Condition(
                    new Condition(
                        new Condition(t.access(str, index), ConditionalOperator.EQUALS, _NEWLINE),
                        ConditionalOperator.OR,
                        new Condition(t.access(str, index), ConditionalOperator.EQUALS, _RETURN)
                    ),
                    ConditionalOperator.OR,
                    new Condition(
                        new Condition(t.access(str, index), ConditionalOperator.EQUALS, _SPACE),
                        ConditionalOperator.OR,
                        new Condition(t.access(str, index), ConditionalOperator.EQUALS, _TAB),
                    )
                ),
                Lines.of(
                    t.ret(index)
                ),
                null
            ),
            BREAK_LINE,
            t.ret(t.call(_next_space_index_call, [str, t.add(index, new INT_VALUE(1))]))
        )
    )
}

/**
 * A recursive abstract function to convert the string into a linked list of characters.
 * There is no technical reason to convert the string other than ease of use and better opportunities to avoid loop constructs
 * which would require more definitions
 */
function _lex(t: GrandLanguageTranslator, str: Var, index: Var, onSpace: Var): Func {
    const _lex_call = new Func(TOKEN, '_lex', [str, index, onSpace], Lines.of())
    const untilSpace = new Var('untilSpace', STRING)
    const literal = new Var('literal', STRING)

    return new Func(
        TOKEN,
        '_lex',
        [str, index, onSpace],
        Lines.of(
            t.if(
                new Condition(t.length(str), ConditionalOperator.EQUALS, index),
                Lines.of(
                    t.ret(t.none())
                ),
                null
            ),
            BREAK_LINE,
            t.if(
                new Condition(
                    new Condition(
                        new Condition(t.access(str, index), ConditionalOperator.NOT_EQUALS, _NEWLINE),
                        ConditionalOperator.AND,
                        new Condition(t.access(str, index), ConditionalOperator.NOT_EQUALS, _RETURN)
                    ),
                    ConditionalOperator.AND,
                    new Condition(
                        new Condition(t.access(str, index), ConditionalOperator.NOT_EQUALS, _SPACE),
                        ConditionalOperator.AND,
                        new Condition(t.access(str, index), ConditionalOperator.NOT_EQUALS, _TAB),
                    )
                ),
                Lines.of(
                    t.if(
                        new Condition(
                            new Condition(onSpace, ConditionalOperator.EQUALS, new BOOLEAN_VALUE(true)),
                            ConditionalOperator.OR,
                            new Condition(index, ConditionalOperator.EQUALS, new INT_VALUE(0))
                        ),
                        Lines.of(
                            t.var(untilSpace, t.substring(str, index, t.call(_next_space_index(t, str, index), [str, index]))),
                            t.forEach(
                                literal, 
                                literals,
                                Lines.of(
                                    t.if(
                                        t.strEquals(literal, untilSpace),
                                        Lines.of(
                                            t.ret(
                                                t.value(new TOKEN_VALUE(untilSpace, t.call(_lex_call, [str, t.add(index, t.length(untilSpace)), new BOOLEAN_VALUE(false)])))
                                            )
                                        ),
                                        null
                                    )
                                )
                            ),
                            BREAK_LINE,
                            t.ret(
                                t.value(new TOKEN_VALUE(t.access(str, index), t.call(_lex_call, [str, t.add(index, new INT_VALUE(1)), new BOOLEAN_VALUE(false)])))
                            )
                        ),
                        Lines.of(
                            t.ret(
                                t.value(new TOKEN_VALUE(t.access(str, index), t.call(_lex_call, [str, t.add(index, new INT_VALUE(1)), new BOOLEAN_VALUE(false)])))
                            )
                        )
                    )
                ),
                Lines.of(
                    t.ret(
                        t.call(_lex_call, [str, t.add(index, new INT_VALUE(1)), new BOOLEAN_VALUE(true)])
                    )
                )
            )
        )
    )
}

export { lexerHeader, lexerSrc, parserHeader, parserSrc }