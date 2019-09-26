import { GrandLanguageTranslator, TypedVariable, Line, Condition, Tree, Join, ConditionalOperator, Type } from '../translator'
import { Cfg } from '../../cfg/cfg'

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
        return null
    }

    preParser(): Line {
        return null
    }

    postParser(): Line {
        return null
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

    makeTree(tree: Tree): string {
        if(tree.join === null) {
            return `(${this.makeCondition(tree.child as Condition)})`
        } else {
            return `(${this.makeTree(tree.child[0])} ${this.makeJoin(tree.join)} ${this.makeTree(tree.child[1])})`
        }
    }

    makeIf(tree: Tree, body: Line, alternative: Line): Line {
        const line: Line = new Line(`if${this.makeTree(tree)} {`).add(
            body.tabUp()
        )

        if(alternative !== null) {
            line.add(new Line('} else {')).add(alternative.tabUp())
        }

        return line.add(new Line('}'))
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

    makeWhile(tree: Tree, body: Line): Line {
        return new Line(`while${this.makeTree(tree)} {`).add(
            body.tabUp()
        ).add(new Line('}'))
    }

    makeAddition(left: string, right: string): string {
        return `${left} + ${right}`
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
}

export { Javascript }