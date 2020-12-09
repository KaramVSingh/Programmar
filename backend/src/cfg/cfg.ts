import { Input, InputRule, InputRuleType, InputStatement, InputStatementType } from '../input/input'
import { regexToRules } from './regex/regex'

/**
 * A _CFG_ is different from an _Input_ in that it does not support regex rules. To create
 * A _CFG_ from an _Input_, each regex must be converted from a rule to a list of rules. This also
 * has a few side effects on the way _CFG_ must support literals. _CFGs_ must now support ranges instead of literals
 * and each range must be signed (positive match or negative match).
 */
class Cfg {
    readonly rules: Rule[]

    constructor(rules: Rule[]) {
        this.rules = rules
    }

    static fromInput(input: Input): Cfg {
        let nRules: Rule[] = []
        
        for(let rule of input.rules) {
            nRules = nRules.concat(Rule.fromInput(rule))
        }

        return new Cfg(nRules)
    }
}

/**
 * A _Rule_ is very similar to an _InputRule_, however it cannot be a regular expression. This means it has no need for a type,
 * it will always be a rule. We also have to keep track if the rule is generated or user defined. This will be nessesary at the parser level.
 */
class Rule {
    readonly name: string
    readonly isGenerated: boolean
    readonly is: Statement[][]

    constructor(name: string, is: Statement[][], isGenerated: boolean) {
        this.name = name
        this.is = is
        this.isGenerated = isGenerated
    }

    static fromInput(input: InputRule): Rule[] {
        if(input.type === InputRuleType.RULE) {
            const statements: Statement[][] = []

            for(let i = 0; i < input.is.length; i++) {
                const format: Statement[] = []
                for(let j = 0; j < input.is[i].length; j++) {
                    format.push(Statement.fromInput(input.is[i][j] as InputStatement))
                }

                statements.push(format)
            }

            return [ new Rule(input.name, statements, false) ]
        } else {
            return regexToRules(input.is as string, input.name)
        }
    }
}

enum StatementType {
    RULE = 'RULE',
    RANGE = 'RANGE'
}

/**
 * A _Statement_ is different from an _InputStatment_ in that it does not support literals. Instead, it supports ranges that
 * can be both positive, or negative. It implements literals with a (x,x) range
 */
class Statement {
    readonly type: StatementType
    readonly data: string | Range

    constructor(type: StatementType, data: string | Range) {
        this.type = type
        this.data = data
    }

    static fromInput(input: InputStatement): Statement {
        if(input.type === InputStatementType.RULE) {
            return new Statement(StatementType.RULE, input.ref)
        } else {
            return new Statement(StatementType.RANGE, new Range(true, [ [input.ref, input.ref] ]))
        }
    }
}

/**
 * A _Range_ represents a set of possible characters. _Ranges_ can be either positive or negative.
 */
class Range {
    readonly isAffirmative: boolean
    readonly ranges: [string, string][]

    constructor(isAffirmative: boolean, ranges: [string, string][]) {
        this.isAffirmative = isAffirmative
        this.ranges = ranges
    }
}

// /**
//  * This function grabs all literals which are defined in the cfg. All literals are identified as having len > 1.
//  * @param cfg the cfg to be read
//  */
// function gatherLiterals(cfg: Cfg): string[] {
//     let literals: string[] = []
//     for(let rule of cfg.rules) {
//         const flat: Statement[] = [].concat(...(rule.is))
//         for(let statement of flat) {
//             if(statement.type === StatementType.RANGE) {
//                 if((statement.data as Range).ranges.length === 1 && (statement.data as Range).ranges[0][0] === (statement.data as Range).ranges[0][1] && (statement.data as Range).ranges[0][0].length > 1) {
//                     literals.push((statement.data as Range).ranges[0][0])
//                 }
//             }
//         }
//     }

//     literals =  literals.sort((a: string, b: string) => { return b.length - a.length })
//     return literals.filter((item, index) => literals.indexOf(item) === index)
// }

export { Cfg, Rule, Statement, StatementType, Range }