import { GrandLanguageTranslator } from './translator'
import { Javascript } from './languages/javascript'

// ----- We're gonna do some hardcore meta programming so lets define some basics ----- //
enum BaseType {
    TOKEN,
    AST,
    INT,
    CHAR,
    BOOLEAN
}

class Type {
    type: BaseType
    pointerDepth: number

    constructor(baseType: BaseType, pointerDepth: number = 0) {
        this.type = baseType
        this.pointerDepth = pointerDepth
    }
}

class Var {
    name: string
    type: Type

    constructor(name: string, type: Type) {
        this.name = name
        this.type = type
    }
}

interface Value {
    type: Type
}

enum ConditionalOperator {
    LESS,
    LESS_OR_EQUAL,
    GREATER,
    GREATER_OR_EQUALS,
    EQUALS,
    NOT_EQUALS,
    OR,
    AND
}

enum Join {
    AND,
    OR
}

class Condition {
    operator: ConditionalOperator
    left: Condition | Var | Value
    right: Condition | Var | Value

    constructor(left: Condition | Var | Value, operator: ConditionalOperator, right: Condition | Var | Value) {
        this.left = left
        this.right = right
        this.operator = operator
    }
}

class Func {
    returnType: Type
    args: Var[]
    name: string
    body: Lines

    constructor(returnType: Type, name: string, args: Var[], body: Lines) {
        this.returnType = returnType
        this.args = args
        this.name = name
        this.body = body
    }
}

// ----- Constants to avoid repetition ----- //
const TOKEN = new Type(BaseType.TOKEN, 1)
class TOKEN_VALUE implements Value {
    curr: STRING_VALUE|Var
    next: TOKEN_VALUE|Var
    type: Type

    constructor(curr: STRING_VALUE|Var, next: TOKEN_VALUE|Var) {
        this.curr = curr
        this.next = next
        this.type = TOKEN
    }
}

const BOOLEAN = new Type(BaseType.BOOLEAN, 0)
class BOOLEAN_VALUE implements Value {
    value: Boolean
    type: Type

    constructor(value: Boolean) {
        this.value = value
        this.type = BOOLEAN
    }
}

const INT = new Type(BaseType.INT, 0)
class INT_VALUE implements Value {
    value: number
    type: Type

    constructor(value: number) {
        this.value = value
        this.type = INT
    }
}

const CHAR = new Type(BaseType.CHAR, 0)
class CHAR_VALUE implements Value {
    value: string
    type: Type

    constructor(value: string) {
        this.value = value
        this.type = CHAR
    }
}

const STRING = new Type(BaseType.CHAR, 1)
class STRING_VALUE implements Value {
    value: string
    type: Type

    constructor(value: string) {
        this.value = value
        this.type = STRING
    }
}

const STRING_LIST = new Type(BaseType.CHAR, 2)
class STRING_LIST_VALUE implements Value {
    value: STRING_VALUE[]
    type: Type

    constructor(value: STRING_VALUE[]) {
        this.value = value
        this.type = STRING_LIST
    }
}

// ----- Classes to facilitate storing generated code ----- //
class Line {
    tabbed = false
    data: string

    constructor(data: string) {
        this.data = data
    }

    render(tabLevel: number): string {
        return `${'\t'.repeat(tabLevel)}${this.data}`
    }
}

const BREAK_LINE = new Line("")

class Lines {
    tabbed = false
    lines: (Line | Lines)[]

    static of(...lines: (Line | Lines)[]) {
        return new Lines(lines)
    }

    constructor(lines: (Line | Lines)[]) {
        this.lines = lines
    }

    render(tabLevel: number): string {
        return this.lines
            .map(data => data.render(data.tabbed ? tabLevel + 1 : tabLevel))
            .join('\n')
    }
}

class TabbedLines extends Lines {
    tabbed = true

    static of(...lines: (Line | Lines)[]) {
        return new TabbedLines(lines)
    }
}

// ----- Now lets define what we want a language to be able to do ----- //

enum SupportedLanguages {
    JAVASCRIPT = 'JAVASCRIPT'
}

function getTranslator(lang: SupportedLanguages): GrandLanguageTranslator {
    switch(lang) {
        case SupportedLanguages.JAVASCRIPT:
        return new Javascript()

        default:
        throw 'Internal Error: Unsupported language.'
    }
}

export { 
    TOKEN, TOKEN_VALUE, BOOLEAN, BOOLEAN_VALUE, INT, INT_VALUE, CHAR, CHAR_VALUE, STRING, STRING_VALUE, STRING_LIST, STRING_LIST_VALUE,
    BaseType, Type, Var, Value, Func, ConditionalOperator, Join, Condition, 
    BREAK_LINE, Line, Lines, TabbedLines, 
    SupportedLanguages, getTranslator 
}