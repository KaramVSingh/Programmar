import { GrandLanguageTranslator } from '../translator'
import { Cfg } from '../../cfg/cfg'
import { Lines, BREAK_LINE, Var, Func, Line, Value, TabbedLines, TOKEN, STRING, STRING_LIST_VALUE, STRING_LIST, STRING_VALUE, TOKEN_VALUE, INT_VALUE, INT, Condition, ConditionalOperator, Type, CHAR, BOOLEAN, BOOLEAN_VALUE, AST_VALUE, AST, AST_LIST, AST_LIST_VALUE, CHAR_VALUE } from '../translatorUtils';

class Javascript implements GrandLanguageTranslator {

    // ----- files ----- //

    lexerSrc(consts: [Var, Value][], body: Lines, functions: Func[]): Lines {
        const constLines = consts.map(c => this.var(c[0], c[1]))
        const lexFunction = new Func(TOKEN, 'lex', [new Var('str', STRING)], body)
        const functionLines = functions.map(f => this.func(f))

        return Lines.of(
            // top level variable declarations
            new Lines(constLines),
            BREAK_LINE,
            // lex function
            this.func(lexFunction),
            // helper functions
            new Lines(functionLines)
        )
    }

    parserSrc(consts: [Var, Value][], body: Lines, functions: Func[]): Lines {
        const constLines = consts.map(c => this.var(c[0], c[1]))
        const parseFunction = new Func(AST, 'parse', [new Var('tokens', TOKEN)], body)
        const functionLines = functions.map(f => this.func(f))

        return Lines.of(
            // top level variable declarations
            new Lines(constLines),
            BREAK_LINE,
            // lex function
            this.func(parseFunction),
            // helper functions
            new Lines(functionLines)
        )
    }

    // ----- language specifics ----- //

    var(variable: Var, value: Value|Var): Line {
        if (value instanceof Var) {
            const v = value as Var
            return new Line(`let ${variable.name} = ${v.name}`)
        } else {
            return new Line(`let ${variable.name} = ${this.value(value).name}`)
        }
    }

    set(variable: Var, value: Value|Var): Line {
        if (value instanceof Var) {
            const v = value as Var
            return new Line(`${variable.name} = ${v.name}`)
        } else {
            return new Line(`${variable.name} = ${this.value(value).name}`)
        }
    }

    func(f: Func): Lines {
        const argNames = f.args.map(arg => arg.name)
        return Lines.of(
            new Line(`function ${f.name}(${argNames.join(', ')}) {`),
            TabbedLines.of(
                f.body
            ),
            new Line('}'),
            BREAK_LINE
        )
    }

    call(f: Func, args: (Var|Value)[]): Var {
        const argVals = args.map(arg => {
            if (arg instanceof Var) {
                return (arg as Var).name
            } else {
                return this.value(arg as Value).name
            }
        })

        return new Var(`${f.name}(${argVals.join(', ')})`, f.returnType)
    }

    ret(v: Var): Line {
        return new Line(`return ${v.name}`)
    }

    if(c: Condition, body: Lines, other: Lines): Lines {
        const open = [
            new Line(`if ${this._condition(c)} {`),
            new TabbedLines([body]),
        ]

        if (other) {
            open.push(new Line('} else {'))
            open.push(new TabbedLines([other]))
        }

        open.push(new Line('}'))
        return new Lines(open)
    }

    forEach(v: Var, arr: Var, body: Lines): Lines {
        const open = [
            new Line(`for (const ${v.name} of ${arr.name}) {`),
            new TabbedLines([body]),
            new Line(`}`)
        ]

        return new Lines(open)
    }

    none(): Var { return new Var('null', null) }

    get(v: Var, prop: Var): Var {
        return new Var(`${v.name}.${prop.name}`, prop.type)
    }

    add(a: INT_VALUE|Var, b: INT_VALUE|Var): Var {
        let aConv: string
        if (a instanceof Var) {
            aConv = a.name
        } else {
            aConv = a.value.toString()
        }

        let bConv: string
        if (b instanceof Var) {
            bConv = b.name
        } else {
            bConv = b.value.toString()
        }

        return new Var(`(${aConv} + ${bConv})`, INT)
    }

    sub(a: INT_VALUE|Var, b: INT_VALUE|Var): Var {
        let aConv: string
        if (a instanceof Var) {
            aConv = a.name
        } else {
            aConv = a.value.toString()
        }

        let bConv: string
        if (b instanceof Var) {
            bConv = b.name
        } else {
            bConv = b.value.toString()
        }

        return new Var(`(${aConv} - ${bConv})`, INT)
    }

    access(v: Var, index: INT_VALUE|Var): Var {
        let newType: Type
        switch(v.type) {
            case STRING:
                newType = CHAR
                break
            default:
                throw 'unimplemented'
        }

        if(index instanceof Var) {
            return new Var(`${v.name}[${index.name}]`, newType)
        } else {
            return new Var(`${v.name}[${index.value}]`, newType)
        }
    }

    exit(m: STRING_VALUE|Var): Line {
        if (m instanceof Var) {
            return new Line(`throw ${m.name}`)
        } else {
            return new Line(`throw ${this.value(m).name}`)
        }
    }

    // ----- more complex functions ----- //
    length(v: Var): Var {
        return this.get(v, new Var('length', INT))
    }

    substring(str: Var, start: Var, end_exclude: Var): Var {
        const substr = new Func(STRING, 'substring', [start, end_exclude], Lines.of())
        const call = this.call(substr, [start, end_exclude])
        return this.get(str, call)
    }

    strEquals(a: Var, b: STRING_VALUE|Var): Condition {
        return new Condition(a, ConditionalOperator.EQUALS, b)
    }

    strAdd(a: STRING_VALUE|Var, b: STRING_VALUE|Var): Var {
        let a1: string
        if (a instanceof Var) {
            a1 = a.name
        } else {
            a1 = this.value(a).name
        }

        let b1: string
        if (b instanceof Var) {
            b1 = b.name
        } else {
            b1 = this.value(b).name
        }

        return new Var(`${a1} + ${b1}`, STRING)
    }

    pushAstArray(arr: Var, v: AST_VALUE|Var): Line {
        let asVar: Var
        if (v instanceof Var) {
            asVar = v
        } else {
            this.value(v)
        }

        return new Line(`${arr.name}.push(${asVar.name})`)
    }

    getCharCode(a: CHAR_VALUE|Var): Var {
        let asVar: Var
        if (a instanceof Var) {
            asVar = a
        } else {
            asVar = this.value(a)
        }

        return this.get(asVar, new Var(`charCodeAt(0)`, INT))
    }

    // ----- internal ----- //

    _condition(c: Condition): string {
        const left = c.left
        const right = c.right

        let leftConv: string
        let rightConv: string

        if(left instanceof Condition) {
            leftConv = this._condition(left)
        } else if(left instanceof Var) {
            leftConv = (left as Var).name
        } else {
            leftConv = this.value(left as Value).name
        }

        if(right instanceof Condition) {
            rightConv = this._condition(right)
        } else if(right instanceof Var) {
            rightConv = (right as Var).name
        } else {
            rightConv = this.value(right as Value).name
        }

        let operator: string
        switch(c.operator) {
            case ConditionalOperator.EQUALS:
                operator = '==='
                break
            case ConditionalOperator.GREATER:
                operator = '>'
                break
            case ConditionalOperator.GREATER_OR_EQUALS:
                operator = '>='
                break
            case ConditionalOperator.LESS:
                operator = '<'
                break
            case ConditionalOperator.LESS_OR_EQUAL:
                operator = '<='
                break
            case ConditionalOperator.NOT_EQUALS:
                operator = '!=='
                break
            case ConditionalOperator.OR:
                operator = '||'
                break
            case ConditionalOperator.AND:
                operator = '&&'
                break
        }

        return `(${leftConv} ${operator} ${rightConv})`
    }

    value(v: Value): Var {
        if (!v) { return this.none() }
        switch(v.type) {
            case STRING_LIST:
                const convSL = v as STRING_LIST_VALUE
                const stringValues = convSL.value.map(strValue => this.value(strValue).name)
                return new Var(`[${stringValues.join(', ')}]`, STRING_LIST)
            case STRING:
                const convS = v as STRING_VALUE
                const normalized = convS.value
                    .replace(/\t/g, "\\t")
                    .replace(/\n/g, "\\n")
                    .replace(/\r/g, "\\r")
                    .replace(/\\/g, "\\\\")
                    .replace(/'/g, "\\'")

                return new Var(`'${normalized}'`, STRING)
            case AST_LIST:
                const convAL = v as AST_LIST_VALUE
                return new Var(`[]`, AST_LIST)
            case AST:
                const convA = v as AST_VALUE
                let rule: string
                if (convA.rule instanceof Var) {
                    rule = convA.rule.name
                } else {
                    rule = this.value(convA.rule).name
                }

                let data: string
                if (convA.data instanceof Var) {
                    data = convA.data.name
                } else {
                    data = this.value(convA.data).name
                }

                let token: string
                if (convA.token instanceof Var) {
                    token = convA.token.name
                } else {
                    token = this.value(convA.token).name
                }

                let children: string
                if (convA.children instanceof Var) {
                    children = convA.children.name
                } else {
                    token = this.value(convA.children).name
                }

                return new Var(`{ 'rule': ${rule}, 'data': ${data}, 'token': ${token}, 'children': ${children} }`, AST)
            case TOKEN:
                const convT = v as TOKEN_VALUE
                let curr: string
                if (convT.curr instanceof Var) {
                    curr = convT.curr.name
                } else {
                    curr = this.value(convT.curr).name
                }

                let next: string
                if (convT.next instanceof Var) {
                    next = convT.next.name
                } else {
                    next = this.value(convT.next).name
                }
                
                return new Var(`{ 'curr': ${curr}, 'next': ${next} }`, TOKEN)
            case INT:
                const convI = v as INT_VALUE
                return new Var(`${convI.value}`, INT)
            case BOOLEAN:
                const convB = v as BOOLEAN_VALUE
                return new Var(`${convB.value.toString()}`, BOOLEAN)
            default:
                throw 'unimplemented'
        }
    }
}

export { Javascript }

/*
class Javascript implements GrandLanguageTranslator {
    // THE FILE FUNCTIONS

    lexerHeader(): Line {
        return new Line('')
    }

    preLexer(): Line {
        return new Line('')
    }

    postLexer(): Line {
        return this.makeExport([ new TypedVariable(null, 'lex') ])
    }

    parserHeader(cfg: Cfg): Line {
        return new Line('')
    }

    preParser(): Line {
        return new Line('')
    }

    postParser(): Line {
        return this.makeExport([ new TypedVariable(null, 'parse') ])
    }

    fileExtention(isHeader: boolean): string {
        return 'js'
    }

    // THE STATEMENT FUNCTIONS

    makeExport(variables: TypedVariable[]): Line {
        const head = new Line('')
        for(let i = 0; i < variables.length; i++) {
            let variable: TypedVariable = variables[i]
            head.add(new Line(`exports.${variable.name} = ${variable.name}`))
        }
        
        return head.next
    }

    makeImport(variables: TypedVariable[], file: string) {
        const head = new Line('')
        for(let i = 0; i < variables.length; i++) {
            let variable: TypedVariable = variables[i]
            head.add(new Line(`const ${variable.name} = require(\'./${file}\')`))
        }

        return head.next
    }

    makeStruct(name: string, variables: TypedVariable[]): Line {
        const head: Line = new Line(`class ${name} {`)
        head.next = this._makeStruct(variables).tabUp()
        head.getLast().next = new Line('}')
        return head
    }

    private _makeStruct(variables: TypedVariable[]): Line {
        if(variables.length === 0) {
            return null
        }

        return new Line(variables[0].name, this._makeStruct(variables.slice(1)))
    }

    makeStaticArray(values: string[]): string {
        return `[${values.join(', ')}]`
    }

    makeVariableDeclaration(variable: TypedVariable, value: string): Line {
        return new Line(`let ${variable.name} = ${value}`)
    }

    makeBoolean(bool: boolean): string {
        return bool.toString()
    }

    makeFunctionDeclaration(func: TypedVariable, params: TypedVariable[], body: Line): Line {
        return new Line(`function ${func.name}(${params.map((value) => value.name).join(', ')}) {`).add(
            body.tabUp()
        ).add(new Line('}'))
    }

    makeClassicFor(variable: TypedVariable, start: string, end: string, body: Line): Line {
        return new Line(`for(${this.makeVariableDeclaration(variable, start.toString()).line}; ${variable.name} < ${end}; ${variable.name}++) {`).add(
            body.tabUp()
        ).add(new Line('}'))
    }

    makeFunctionCall(name: string, args: string[]): string {
        return `${name}(${args.join(', ')})`
    }

    makeConditionalOperator(operator: ConditionalOperator): string {
        switch(operator) {
            case ConditionalOperator.EQUALS:
            return '==='
            case ConditionalOperator.NOT_EQUALS:
            return '!=='
            case ConditionalOperator.LESS:
            return '<'
            case ConditionalOperator.GREATER:
            return '>'
            case ConditionalOperator.GREATER_OR_EQUALS:
            return '>='
            case ConditionalOperator.LESS_OR_EQUAL:
            return '<='
            default:
            throw 'Internal Error: Unimplemented.'
        }
    }

    makeCondition(condition: Condition): string {
        return `${condition.left} ${this.makeConditionalOperator(condition.operator)} ${condition.right}`
    }

    makeJoin(join: Join): string {
        switch(join) {
            case Join.AND:
            return '&&'
            case Join.OR:
            return '||'
            default:
            throw 'Internal Error: Unimplemented.'
        }
    }

    makeIf(conditions: Condition[], join: Join, body: Line, alternative: Line): Line {
        let gates: string[] = []
        for(let i = 0; i < conditions.length; i++) {
            gates.push(this.makeCondition(conditions[i]))
        }

        const line: Line = new Line('')
        if(gates.length === 1) {
            line.add(new Line(`if(${gates[0]}) {`))
        } else {
            let enclosed: string[] = gates.map((value: string) => `(${value})`)
            let spacedJoin: string = ` ${this.makeJoin(join)} `
            line.add(new Line(`if(${enclosed.join(spacedJoin)}) {`))
        }

        line.add(body.tabUp())

        if(alternative !== null) {
            line.add(new Line('} else {')).add(alternative.tabUp())
        }

        return line.add(new Line('}')).next
    }

    makeGetProperty(variable: string, property: string): string {
        return `${variable}.${property}`
    }

    makeGetArrayAccess(variable: string, index: string): string {
        return `${variable}[${index}]`
    }

    makeReturn(value: string): Line {
        return new Line(`return ${value}`)
    }

    makeObject(def: Type): string {
        return '{}'
    }

    makeSetVariable(variable: string, set: string): Line {
        return new Line(`${variable} = ${set}`)
    }

    makeNothing(): string {
        return 'null'
    }

    makeStringLength(variable: string): string {
        return `${variable}.length`
    }

    makeWhile(condition: Condition, body: Line): Line {
        return new Line(`while(${this.makeCondition(condition)}) {`).add(
            body.tabUp()
        ).add(new Line('}'))
    }

    makeAddition(left: string, right: string): string {
        return `${left} + ${right}`
    }

    makeSubtraction(left: string, right: string): string {
        return `${left} - ${right}`
    }

    makeBreak(): Line {
        return new Line('break')
    }

    makeContinue(): Line {
        return new Line('continue')
    }

    makeStringStartingAt(str: string, index: string): string {
        return `${str}.slice(${index})`
    }

    makeStringFromChar(variable: string): string {
        return variable
    }

    makeStringTemplate(template: string, variables: TypedVariable[]): string {
        let variableIndex = 0
        let newTemplate = '`'

        for(let i = 0; i < template.length; i++) {
            if(template[i] === '#') {
                newTemplate += '${' + variables[variableIndex++].name + '}'
            } else {
                newTemplate += template[i]
            }
        }

        return newTemplate + '`'
    }

    makeExit(message: string): Line {
        return new Line(`throw ${message}`)
    }

    makeEmptyList(type: DecoratedType): string {
        return '[]'
    }

    makeEmptyString(): string {
        return '""'
    }

    makeGetCharValue(char: string): string {
        return `${char}.charCodeAt(0)`
    }

    makeAddToArray(arr: string, index: string): Line {
        return new Line(`${arr}.push(${index})`)
    }
}

export { Javascript }
*/