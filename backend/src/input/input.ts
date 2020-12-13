class Input {
    readonly rules: InputRule[]

    constructor(input: { 'rules': InputRule[] }) {
        this.rules = input.rules
    }

    /**
     * This function checks that an input is a valid Input
     * @param input a javascript any object
     */
    static isInput(input: any): input is Input {
        if(Array.isArray(input.rules)) {
            for(let i = 0; i < input.rules.length; i++) {
                if(!InputRule.isInputRule(input.rules[i])) {
                    return false
                }
            }

            return true
        } else {
            return false
        }
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
        const ruleMap: Map<string, string[][]> = new Map()
        input.rules.forEach(rule => {
            if(rule.type === InputRuleType.RULE) {
                const options = (rule.is as InputStatement[][]).map(option => {
                    return option
                        .filter(part => part.type === InputStatementType.RULE)
                        .map(part => part.ref)
                })

                ruleMap.set(rule.name, options)
            } else {
                ruleMap.set(rule.name, [])
            }
        })

        for(let [name] of ruleMap) {
            Input.checkSafety(name, ruleMap)
        }
    }

    private static checkSafety(ruleName: string, ruleMap: Map<string, string[][]>) {
        // we want to do a traversal of the options, if all of the options have to loop back, we have an issue, otherwise we're safe
        ruleMap.get(ruleName).forEach(option => {
            if(Input._only_loops(ruleName, option[0], [], ruleMap)) {
                throw `Illegal Argument: Rule ${ruleName} contains a left recursion error.` 
            }
        })
    }

    private static _only_loops(startRule: string, currRule: string, path: string[], ruleMap: Map<string, string[][]>): Boolean {
        if (currRule === startRule) {
            return true
        }

        if (path.includes(currRule)) { 
            return true 
        }

        const newPath = path.concat(currRule)

        const ruleLoops: Boolean[] = []
        for(let option of ruleMap.get(currRule)) {
            // [false, true], [false]
            const optionLoops: Boolean[] = []
            for(let ruleRef of option) {
                optionLoops.push(Input._only_loops(startRule, ruleRef, newPath, ruleMap))
            }

            // if any rule_refs in an option loop, then the option loops
            ruleLoops.push(optionLoops.reduce((acc: Boolean, curr: Boolean) => { return acc || curr }, false))
        }

        if (ruleLoops.filter(option => option === false).length > 0 || ruleLoops.length === 0) { return false } else { return true }
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

    static isInputRule(input: any): input is InputRule {
        if(typeof input.name === 'string') {
            if(typeof input.type === 'string' && Object.values(InputRuleType).includes(input.type)) {
                if(typeof input.is === 'string') {
                    return true
                } else if(Array.isArray(input.is)) {
                    if(input.is.length === 0) { return true }
                    for(let i = 0; i < input.is.length; i++) {
                        if(Array.isArray(input.is[i])) {
                            for(let j = 0; j < input.is[i].length; j++) {
                                if(!InputStatement.isInputStatement(input.is[i][j])) {
                                    return false
                                }
                            }

                            return true
                        } else {
                            return false
                        }
                    }
                }
            }
        }

        return false
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

    static isInputStatement(input: any): input is InputStatement {
        return (typeof input.ref === 'string') && (typeof input.type === 'string' && Object.values(InputStatementType).includes(input.type))
    }

    /**
     * Things to validate:
     * 1. Nothing
     */
    static validate(input: InputStatement) {}
}

export { Input, InputRule, InputRuleType, InputStatement, InputStatementType }