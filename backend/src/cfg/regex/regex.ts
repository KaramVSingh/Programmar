import { Rule, Statement, StatementType, Range } from './../cfg'

/**
 * This function takes a regular expression and returns the CFG representing this regex
 * @param regex the regex which has to be converted
 * @param name the name of the regex to be converted
 */
function regexToRules(regex: string, name: string): Rule[] {
    const tokens: Token = lex(prelex(regex))
    const ast: Ast = parseRegex(tokens)
    const generated: Rule[] =  toRules(ast, [], name)
    generated.push(new Rule(name, [[ new Statement(StatementType.RULE, `_${name}_${generated.length - 1}`) ]], false))
    return generated
}

/**
 * 
 * @param ast this is the ast to be converted
 * @param rules this is the resulting rules list
 */
function toRules(ast: Ast, rules: Rule[], name: string): Rule[] {
    // The last rule is the most recent rule always
    if(ast.type === NodeType.OR) {
        rules = toRules(ast.children[0], rules, name)
        const left = rules.length - 1

        rules = toRules(ast.children[1], rules, name)
        const right = rules.length - 1

        rules.push(new Rule(`_${name}_${rules.length}`, [
            [ new Statement(StatementType.RULE, `_${name}_${left}`) ],
            [ new Statement(StatementType.RULE, `_${name}_${right}`) ] 
        ], true))

    } else if(ast.type === NodeType.CONCAT) {
        rules = toRules(ast.children[0], rules, name)
        const left = rules.length - 1

        rules = toRules(ast.children[1], rules, name)
        const right = rules.length - 1

        rules.push(new Rule(`_${name}_${rules.length}`, [
            [ new Statement(StatementType.RULE, `_${name}_${left}`), new Statement(StatementType.RULE, `_${name}_${right}`) ] 
        ], true))

    } else if(ast.type === NodeType.DUPL) {
        rules = toRules(ast.children[0], rules, name)
        const left = rules.length - 1

        if(ast.data === '*') {
            rules.push(new Rule(`_${name}_${rules.length}`, [
                [ new Statement(StatementType.RULE, `_${name}_${left}`), new Statement(StatementType.RULE, `_${name}_${rules.length}`) ],
                []
            ], true))

        } else if(ast.data === '?') {
            rules.push(new Rule(`_${name}_${rules.length}`, [
                [ new Statement(StatementType.RULE, `_${name}_${left}`) ],
                []
            ], true))

        } else if(ast.data === '+') {
            rules.push(new Rule(`_${name}_${rules.length}`, [
                [ new Statement(StatementType.RULE, `_${name}_${left}`), new Statement(StatementType.RULE, `_${name}_${rules.length}`) ],
                [ new Statement(StatementType.RULE, `_${name}_${left}`) ]
            ], true))

        } else {
            const pre: string[] = ast.data.substring(1, ast.data.length - 1).split(',')
            let vals: number[] = []

            for(let curr of pre) {
                if(curr === '') {
                    vals.push(null)
                } else {
                    const num: number = parseInt(curr)
                    if(num <= 0) {
                        throw `Regex Error: Cannot use non-positive number ${num}.`
                    } else {
                        vals.push(num)
                    }
                }
            }

            if(vals.length === 1) {
                const nStatements: Statement[] = []
                for(let i = 0; i < vals[0]; i++) {
                    nStatements.push(new Statement(StatementType.RULE, `_${name}_${left}`))
                }

                rules.push(new Rule(`_${name}_${rules.length}`, [nStatements], true))

            } else if(vals[0] === null && vals[1] !== null) {
                const nIs: Statement[][] = []
                for(let i = 1; i < vals[1] + 1; i++) {
                    const nStatements: Statement[] = []
                    for(let j = 0; j < i; j++) {
                        nStatements.push(new Statement(StatementType.RULE, `_${name}_${left}`))
                    }

                    nIs.push(nStatements)
                }

                rules.push(new Rule(`_${name}_${rules.length}`, nIs, true))

            } else if(vals[0] !== null && vals[1] === null) {
                throw 'Regex Error: Unsupported operation {X,}.'

            } else {
                if(vals[0] >= vals[1]) {
                    throw 'Regex Error: Must have {X,Y} such that Y > X.'
                }

                const nIs: Statement[][] = []
                for(let i = vals[0]; i < vals[1] + 1; i++) {
                    const nStatements: Statement[] = []
                    for(let j = 0; j < i; j++) {
                        nStatements.push(new Statement(StatementType.RULE, `_${name}_${left}`))
                    }

                    nIs.push(nStatements)
                }

                rules.push(new Rule(`_${name}_${rules.length}`, nIs, true))

            }
        }

    } else if(ast.type === NodeType.PAREN) {
        rules = toRules(ast.children[0], rules, name)
        const left = rules.length - 1

        rules.push(new Rule(`_${name}_${rules.length}`, [
            [ new Statement(StatementType.RULE, `_${name}_${left}`) ]
        ], true))

    } else if(ast.type === NodeType.GROUP) {
        let body: string = ast.data.substring(1, ast.data.length - 1)
        let isAffirmative: boolean = true
        if(body[0] === '^') {
            isAffirmative = false
            body = body.substring(1)
        }

        const lexed: Token = prelex(body)
        const ranges: Range = parseBracket(lexed, isAffirmative)

        rules.push(new Rule(`_${name}_${rules.length}`, [
            [ new Statement(StatementType.RANGE, ranges) ]
        ], true))

    } else if(ast.type === NodeType.UNIT) {
        if(ast.data[0] === '\\') {
            if(ast.data[1] === 's') {
                rules.push(new Rule(`_${name}_${rules.length}`, [
                    [ new Statement(StatementType.RANGE, new Range(true, [ [' ', ' '], ['\n', '\n'], ['\r', '\r'], ['\t', '\t'] ])) ]
                ], true))
            } else if(ast.data[1] === 'S') {
                rules.push(new Rule(`_${name}_${rules.length}`, [
                    [ new Statement(StatementType.RANGE, new Range(false, [ [' ', ' '], ['\n', '\n'], ['\r', '\r'], ['\t', '\t'] ])) ]
                ], true))
            } else if(ast.data[1] === 'd') {
                rules.push(new Rule(`_${name}_${rules.length}`, [
                    [ new Statement(StatementType.RANGE, new Range(true, [ ['0', '9'] ])) ]
                ], true))
            } else if(ast.data[1] === 'D') {
                rules.push(new Rule(`_${name}_${rules.length}`, [
                    [ new Statement(StatementType.RANGE, new Range(false, [ ['0', '9'] ])) ]
                ], true))
            } else if(ast.data[1] === 'w') {
                rules.push(new Rule(`_${name}_${rules.length}`, [
                    [ new Statement(StatementType.RANGE, new Range(true, [ ['0', '9'], ['a', 'z'], ['A', 'Z'], ['_', '_'] ])) ]
                ], true))
            } else if(ast.data[1] === 'W') {
                rules.push(new Rule(`_${name}_${rules.length}`, [
                    [ new Statement(StatementType.RANGE, new Range(false, [ ['0', '9'], ['a', 'z'], ['A', 'Z'], ['_', '_'] ])) ]
                ], true))
            } else if(ast.data[1] === '.') {
                rules.push(new Rule(`_${name}_${rules.length}`, [
                    [ new Statement(StatementType.RANGE, new Range(false, [])) ]
                ], true))
            } else {
                rules.push(new Rule(`_${name}_${rules.length}`, [
                    [ new Statement(StatementType.RANGE, new Range(true, [ [ast.data[1], ast.data[1]] ])) ]
                ], true))
            }
        } else {
            rules.push(new Rule(`_${name}_${rules.length}`, [
                [ new Statement(StatementType.RANGE, new Range(true, [ [ast.data, ast.data] ])) ]
            ], true))
        }
    }

    return rules
}

/**
 * This function will parse a bracketed group into an AST
 * @param token this is the lexed token list tp be parsed
 * @param isAffirmative the status of the range
 */
function parseBracket(token: Token, isAffirmative: boolean): Range {
    if(token === null || token.curr === '') {
        throw 'Regex Error: Cannot parse an empty group.'
    } else {
        let start = true
        let temp = token

        // Check for errors
        while(temp !== null) {
            if(start === true && temp.curr === '-') {
                throw 'Regex Error: Cannot parse -.'
            } else if(temp.next === null && temp.curr === '-') {
                throw 'Regex Error: Cannot parse -.'
            } else if(temp.curr === '-' && temp.next !== null && temp.next.curr === '-') {
                throw 'Regex Error: Cannot parse -.'
            } else if(temp.curr === '-' && temp.next !== null && temp.next.next !== null && temp.next.next.curr === '-') {
                throw 'Regex Error: Cannot parse -.'
            } else if(['\\s', '\\S', '\\w', '\\W', '\\d', '\\D', '\\.'].includes(temp.curr)) {
                throw 'Regex Error: Cannot have escaped group in brackets.'
            }

            temp = temp.next
            start = false
        }

        temp = token
        const ranges: [string, string][] = []
        while(temp !== null) {
            if(temp.next === null || temp.next.curr !== '-') {
                ranges.push([temp.curr, temp.curr])
                temp = temp.next
            } else {
                if(temp.curr > temp.next.next.curr) {
                    throw 'Regex Error: Range X-Y must be formatted such that Y >= X'
                }
                ranges.push([temp.curr, temp.next.next.curr])
                temp = temp.next.next.next
            }
        }

        return new Range(isAffirmative, ranges)
    }
}

/**
 * This function will parse a lexed regex into an AST
 * @param token this is the lexed token list to be parsed
 */
function parseRegex(token: Token): Ast {
    if(token === null || token.curr === '') {
        throw 'Regex Error: Cannot parse an empty regex.'
    } else {
        return parseOr(token)[0]
    }
}

function parseOr(token: Token): [Ast, Token] {
    if(!['|', ']', ')', '}'].includes(lookahead(token))) {
        const left = parseConcat(token)

        if(left[1] === null) {
            return left
        } else if(lookahead(left[1]) === '|') {
            const middle = consumeToken(left[1], '|')
            const right = parseOr(middle[1] as Token)

            return [ new Ast(NodeType.OR, '|', [left[0], right[0]]), right[1] ]
        } else {
            return left
        }
    } else {
        throw `Regex Error: Unable to parse ${lookahead(token)}.`
    }
}

function parseConcat(token: Token): [Ast, Token] {
    if(!['|', ']', ')', '}'].includes(lookahead(token))) {
        const left = parseDupl(token)

        if(left[1] === null) {
            return left
        } else if(lookahead(left[1]) !== null && !['|', ']', ')', '}'].includes(lookahead(left[1]))) {
            const right = parseConcat(left[1])
            return [ new Ast(NodeType.CONCAT, '', [left[0], right[0]]), right[1] ]
        } else {
            return left
        }
    } else {
        throw `Regex Error: Unable to parse ${lookahead(token)}.`
    }
}

function parseDupl(token: Token): [Ast, Token] {
    if(!['{', '*', '?', '+', '|', ']', ')', '}'].includes(lookahead(token))) {
        const left = parseParen(token)

        if(left[1] === null) {
            return left
        } else if(['+', '*', '?', '{'].includes(lookahead(left[1])[0])) {
            const middle = consumeToken(left[1], lookahead(left[1]))
            return [ new Ast(NodeType.DUPL, middle[0] as string, [left[0]]), middle[1] as Token ]
        } else {
            return left
        }
    } else {
        throw `Regex Error: Unable to parse ${lookahead(token)}.`
    }
}

function parseParen(token: Token): [Ast, Token] {
    if(lookahead(token) === '(') {
        const leftParen = consumeToken(token, '(')
        const middle = parseOr(leftParen[1] as Token)
        const rightParen = consumeToken(middle[1], ')')
        return [ new Ast(NodeType.PAREN, '', [middle[0]]), rightParen[1] as Token ]
    } else if(!['(', '{', '*', '?', '+', '|', ']', ')', '}'].includes(lookahead(token))) {
        return parseGroup(token)
    } else {
        throw `Regex Error: Unable to parse ${lookahead(token)}.`
    }
}

function parseGroup(token: Token): [Ast, Token] {
    if(lookahead(token)[0] === '[') {
        const middle = consumeToken(token, lookahead(token))
        return [ new Ast(NodeType.GROUP, middle[0] as string, []), middle[1] as Token ]
    } else if(!['[', '(', '{', '*', '?', '+', '|', ']', ')', '}'].includes(lookahead(token))) {
        const middle = consumeToken(token, lookahead(token))
        return [ new Ast(NodeType.UNIT, middle[0] as string, []), middle[1] as Token ]
    } else {
        throw `Regex Error: Unable to parse ${lookahead(token)}.`
    }
}

const lookahead = (token: Token) => { return token === null ? null : token.curr }
const consumeToken = (token: Token, expected: string) => {
    if(token === null) {
        throw `Regex Error: Unexpected end of regex - expected a ${expected}.`
    } else {
        if(lookahead(token) !== expected) {
            throw `Regex Error: Unexpected token ${lookahead(token)} - expected a ${expected}`
        } else {
            return [ token.curr, token.next ]
        }
    }
}

enum NodeType {
    OR,
    CONCAT,
    DUPL,
    PAREN,
    GROUP,
    UNIT
}

class Ast {
    readonly type: NodeType
    readonly data: string
    readonly children: Ast[]

    constructor(type: NodeType, data: string, children: Ast[]) {
        this.type = type
        this.data = data
        this.children = children
    }
}

enum Mode {
    NONE,
    BRACKETS,
    BRACES
}

/**
 * This function takes the prelexed input, and groups together multi char tokens ([] and {})
 * @param tokens a token linked list
 */
function lex(tokens: Token): Token {
    return _lex(tokens, Mode.NONE, 0)
}

function _lex(token: Token, mode: Mode, state: number): Token {
    if(mode === Mode.NONE) {
        if(token === null) {
            return null
        }

        if(token.curr === '[') {
            return _lex(token, Mode.BRACKETS, 0)
        } else if(token.curr === '{') {
            return _lex(token, Mode.BRACES, 0)
        } else {
            return new Token(token.curr, _lex(token.next, Mode.NONE, 0))
        }
    } else if(mode === Mode.BRACKETS) {
        if(token === null) {
            throw 'Regex Error: Bracket does not close.'
        }

        if(state === 0) {
            if(token.curr === '[') {
                const next: Token = _lex(token.next, Mode.BRACKETS, 1)
                if(next.curr === ']') {
                    throw 'Regex Error: Group [] is invalid.'
                }

                return new Token(token.curr + next.curr, next.next)
            } else {
                throw 'Regex Error: Bracket lexing error.'
            }
        } else {
            if(token.curr === ']') {
                return new Token(token.curr, _lex(token.next, Mode.NONE, 0))
            } else {
                const next: Token = _lex(token.next, Mode.BRACKETS, 1)
                return new Token(token.curr + next.curr, next.next)
            }
        }
    } else if(mode === Mode.BRACES) {
        if(token === null) {
            throw 'Regex Error: Braces do not close.'
        }

        if(state === 0) {
            if(token.curr === '{') {
                const next: Token = _lex(token.next, Mode.BRACES, 1)
                if(!/\d/.test(next.curr)) {
                    throw 'Regex Error: {} must contain a number.'
                }

                return new Token(token.curr + next.curr, next.next)
            } else {
                throw 'Regex Error: Braces lexing error.'
            }
        } else if(state === 1) {
            if(token.curr >= '0' && token.curr <= '9') {
                const next: Token = _lex(token.next, Mode.BRACES, 1)
                return new Token(token.curr + next.curr, next.next)
            } else if(token.curr === ',') {
                const next: Token = _lex(token.next, Mode.BRACES, 2)
                return new Token(token.curr + next.curr, next.next)
            } else if(token.curr === '}') {
                return new Token(token.curr, _lex(token.next, Mode.NONE, 0))
            } else {
                throw `Regex Error: character ${token.curr} is not valid.`
            }
        } else if(state === 2) {
            if(token.curr >= '0' && token.curr <= '9') {
                const next: Token = _lex(token.next, Mode.BRACES, 2)
                return new Token(token.curr + next.curr, next.next)
            } else if(token.curr === '}') {
                return new Token(token.curr, _lex(token.next, Mode.NONE, 0))
            } else {
                throw `Regex Error: character ${token.curr} is not valid.`
            }
        }
    }
}

/**
 * This function returns a linked list of tokens, grouping escaped characters
 * @param regex a regular expression which you plan to tokenize
 * @returns a token linked list which groups escaped characters
 */
function prelex(regex: string): Token {
    if(regex.length === 0) {
        return null
    }

    let curr: string = ''
    if(regex[0] === '\\') {
        if(regex.length === 1) {
            throw 'Regex Error: Cannot escape end of string.'
        } else {
            curr = regex.substring(0, 2)
        }
    } else {
        curr = regex[0]
    }

    return new Token(curr, prelex(regex.substring(curr.length)))
}

class Token {
    readonly curr: string
    readonly next: Token

    constructor(curr: string, next: Token) {
        this.curr = curr
        this.next = next
    }
}

export { regexToRules, prelex, Token, lex, parseRegex, toRules, parseBracket }