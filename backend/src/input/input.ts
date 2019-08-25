class Input {
    readonly rules: InputRule[]

    constructor(input: { 'rules': InputRule[] }) {
        this.rules = input.rules
    }

    /**
     * Things to validate:
     * 1. Rules reference existing rules (no bad names)
     * 2. No repeat names
     * 3. Valid CFG
     */
    static validate(input: Input) {
        let names: Set<string> = new Set()
        let firsts: Map<string, string[]> = new Map()

        // validate all the rules
        for(let i = 0; i < input.rules.length; i++) {
            InputRule.validate(input.rules[i])
            if(names.has(input.rules[i].name)) {
                throw `Illegal Argument: ${input.rules[i].name} has multiple declarations.`
            } else {
                names.add(input.rules[i].name)
                firsts.set(input.rules[i].name, [])
                if(input.rules[i].type === InputRuleType.RULE) {
                    const statements: InputStatement[][] = input.rules[i].is as InputStatement[][]
                    for(let j = 0; j < statements.length; j++) {
                        if(statements[j].length > 0 && statements[j][0].type === InputStatementType.RULE) {
                            firsts.get(input.rules[i].name).push(statements[j][0].ref)
                        }
                    }
                }
            }
        }

        // validate all rules reference valid rule names
        for(let i = 0; i < input.rules.length; i++) {
            if(input.rules[i].type === InputRuleType.RULE) {
                const flat: InputStatement[] = [].concat(...(input.rules[i].is as InputStatement[][]))
                for(let j = 0; j < flat.length; j++) {
                    if(flat[j].type === InputStatementType.RULE && !names.has(flat[j].ref)) {
                        throw `Illegal Argument: Rule ${flat[j].ref} does not exist.`
                    }
                }
            }
        }

        // validate that the CFG is valid
        // Because we are adding exceptions for control flow to help widen the number of grammars we can support, we do
        // not need to check for overlapping first sets. The only thing we need to check for is infinite left recursion
        // DO: traverse all paths and check if the path recycles
        for(let [key] of firsts) {
            Input.checkPath(firsts, new Set<string>([key]), key)
        }
    }

    private static checkPath(firsts: Map<string, string[]>, path: Set<string>, curr: string) {
        const next: string[] = firsts.get(curr)
        for(let rule of next) {
            if(path.has(rule)) {
                path.add(rule)
                throw `Illegal Argument: Path containing ${Array.from(path)} has left recursion error.`
            } else {
                const nPath: Set<string> = new Set(path)
                nPath.add(rule)
                Input.checkPath(firsts, nPath, rule)
            }
        }
    }
}

enum InputRuleType {
    RULE = 'RULE',
    REGEX = 'REGEX'
}

class InputRule {
    readonly name: string
    readonly type: InputRuleType
    readonly is: InputStatement[][] | string

    constructor(input: { 'name': string, 'type': InputRuleType, 'is': InputStatement[][] | string }) {
        this.name = input.name
        this.type = input.type
        this.is = input.is
    }

    /**
     * Things to validate:
     * 1. Name matches the format for an external name (must work for all languages, must not start with _)
     * 2. Type matches RuleType.
     * 3. Regex is valid maybe dont and just check this at new cfg generation
     */
    static validate(input: InputRule) {
        // validate the name (must be a combination of a-zA-Z0-9_ where the first char is not _0-9)
        const functionReg: RegExp = /^[a-zA-Z][a-zA-Z0-9_]*$/
        if(!functionReg.test(input.name)) {
            throw `Illegal Argument: Rule name ${input.name} is not a valid rule name.`
        }

        // validate that the type matches the implementation
        if(input.type === InputRuleType.REGEX && (input.is as InputStatement[][]).push !== undefined || input.type === InputRuleType.RULE && (input.is as InputStatement[][]).push === undefined) {
            throw `Illegal Argument: Rule ${input.name} type and implementation.`
        }

        // validate all the statements
        if(input.type === InputRuleType.RULE) {
            for(let i = 0; i < input.is.length; i++) {
                for(let j = 0; j < input.is[i].length; j++) {
                    InputStatement.validate(input.is[i][j] as InputStatement)
                }
            }
        }
    }
}

enum InputStatementType {
    LITERAL = 'LITERAL',
    RULE = 'RULE'
}

class InputStatement {
    readonly type: InputStatementType
    readonly ref: string

    constructor(input: { 'type': InputStatementType, 'ref': string }) {
        this.type = input.type
        this.ref = input.ref
    }

    /**
     * Things to validate:
     * 1. Nothing
     */
    static validate(input: InputStatement) {}
}

export { Input, InputRule, InputRuleType, InputStatement, InputStatementType }