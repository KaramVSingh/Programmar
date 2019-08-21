class Tuple {
    public start: String
    public end: String

    constructor(start: string, end: string) {
        this.validate(start, end)
        this.start = start
        this.end = end
    }

    private validate(start: string, end: string) {
        if(start.length === 0 || end.length === 0) {
            throw Error('Range cannot have empty string.')
        }

        if(start.length !== end.length) {
            throw Error('Range must have same length for start and end.')
        }

        if(start.length !== 1 && start !== end) {
            throw Error('Range length > 1 must have same value.')
        }

        if(start.length === 1 && start.charCodeAt(0) > end.charCodeAt(0)) {
            throw Error('Range must be x, y such that x <= y.')
        }
    }

    public toObject(): Array<Object> {
        let object = [this.start, this.end]
        return object
    }
}

class Statement {
    public type: string
    public reference: string
    public ranges: Tuple[]
    public metadata: string

    constructor(input: Object) {
        this.validate(input)
        this.type = input['Type']
        if(this.type === 'RULE') {
            this.reference = input['Reference']
            this.ranges = null
            this.metadata = null
        } else if(this.type === 'RANGE') {
            this.reference = null
            this.metadata = input['Metadata']
            this.ranges = []

            for(let i: number = 0; i < input['Ranges'].length; i++) {
                const rangeArray: string[] = input['Ranges'][i]
                if(rangeArray.length === 2) {
                    this.ranges.push(new Tuple(rangeArray[0], rangeArray[1]))
                } else {
                    throw Error('CFG ERROR: Range provided without start and end.')
                }
            }
        } else if(this.type === 'LITERAL') {
            // We should convert it to a range
            // Reference will contain the match value
            this.type = 'RANGE'
            this.reference = null
            this.ranges = [new Tuple(input['Reference'], input['Reference'])]
            this.metadata = 'POSITIVE'
        }
    }

    private validate(input: Object) {
        if(input['Type'] === undefined) {
            throw Error('Type must be defined for statement.')
        }

        if(input['Type'] !== 'RULE' && input['Type'] !== 'RANGE' && input['Type'] !== 'LITERAL') {
            throw Error('Type must be RULE/RANGE/LITERAL.')
        }

        if(input['Type'] === 'RULE' && (input['Reference'] === undefined)) {
            throw Error('Reference cannot be undefined for type RULE.')
        }

        if(input['Type'] === 'RANGE' && (input['Metadata'] === undefined || input['Ranges'] === undefined)) {
            throw Error('Range and Metadata cannot be undefined for type RANGE.')
        } else if(input['Type'] === 'RANGE' && (input['Metadata'] !== 'POSITIVE' && input['Metadata'] !== 'NEGATIVE')) {
            throw Error('Metadata must be enum of values POSITIVE/NEGATIVE.')
        }

        if(input['Type'] === 'LITERAL' && (input['Reference'] === undefined)) {
            throw Error('Reference cannot be undefined for LITERAL.')
        }
    }

    public toObject(): Object {
        let hasRanges: boolean = this.ranges !== null
        let object: Object = {
            'Type': this.type,
            'Reference': this.reference,
            'Metadata': this.metadata,
            'Ranges': (hasRanges ? [] : null)
        }

        if(hasRanges) {
            for(let i: number = 0; i < this.ranges.length; i++) {
                object['Ranges'].push(this.ranges[i].toObject())
            }
        }

        return object
    }
}

class Format {
    public statements: Statement[]
    constructor(input: Object[]) {
        this.statements = []
        
        for(let i: number = 0; i < input.length; i++) {
            const statementInput: Object = input[i]
            this.statements.push(new Statement(statementInput))
        }
    }

    public toObject(): Object[] {
        let object: Object[] = []

        for(let i: number = 0; i < this.statements.length; i++) {
            object.push(this.statements[i].toObject())
        }

        return object
    }
}

class Rule {
    public internal: boolean
    public name: string
    public is: Format[]

    constructor(input: Object) {
        this.validate(input)
        this.internal = input['Internal']
        this.name = input['Name']
        this.is = []
        
        for(let i: number = 0; i < input['Is'].length; i++) {
            const formatInput: Object[] = input['Is'][i]
            this.is.push(new Format(formatInput))
        }
    }

    private validate(input: Object) {
        if(input['Internal'] === undefined || input['Name'] === undefined || input['Is'] === undefined) {
            throw Error('Internal, Name, and Is must be defined in a rule.')
        }

        if(input['Name'].length < 1 || input['Name'][0] == '_' && input['Internal'] !== true) {
            throw Error('Namespace Error for rule.')
        }
    }

    public toObject(): Object {
        let object: Object = {
            'Internal': this.internal,
            'Name': this.name,
            'Is': []
        }

        for(let i: number = 0; i < this.is.length; i++) {
            object['Is'].push(this.is[i].toObject())
        }

        return object
    }
}

class Cfg {
    private rules: Rule[]
    constructor(input: Object) {
        this.validate(input)
        this.rules = []
        for(let i: number = 0; i < input['Rules'].length; i++) {
            this.rules.push(new Rule(input['Rules'][i]))
        }
    }

    public addRule(input: Object) {
        const rule = new Rule(input)
        for(let i = 0; i < this.rules.length; i++) {
            if(this.rules[i].name === rule.name) {
                throw Error('Cannot have rules with same name.')
            }
        }

        this.rules.push(rule)
    }

    public removeRule(name: string) {
        this.rules = this.rules.filter(rule => rule.name !== name)
    }

    private validate(input: Object) {
        if(input['Rules'] === undefined) {
            throw Error('Rules must be declared in CFG.')
        }

        let memo = {}
        for(let i = 0; i < input['Rules'].length; i++) {
            if(input['Rules'][i]['Name'] in memo) {
                throw Error('Cannot have rules with same name.')
            }

            memo[input['Rules'][i]['Name']] = true
        }
    }

    public toObject(): Object {
        let object: Object = {
            'Rules': []
        }

        for(let i: number = 0; i < this.rules.length; i++) {
            object['Rules'].push(this.rules[i].toObject())
        }

        return object
    }

    /* 
     * Establishing the shape of a CFG in json (Not a parser request, just the CFG)
     *
     * {
     *     Rules: [
     *         {
     *             // 'Type': 'Rule' <- Unnessesary because without regex we always have rules
     *             'Internal': true/false <- Is this a programatically generated rule or a user inputted rule (will it need to squash)
     *             'Name': 'MyRule' <- User inputted rules must not start with an _ character, this will be reserved for internal rules
     *             'Is': [ <- This is the implementation of the rule, it will be constructed of either more rules, or literals (or both)
     *                 [
     *                     {
     *                         'Type': 'RULE' <- This is a reference to another rule
     *                         'Reference': 'MyOtherRule' <- Other rule name
     *                         'Metadata': null <- Not nessesary for rules
     *                     }, {
     *                         'Type': 'LITERAL' <- This means that we expect an explicit match
     *                         'Reference': '<=' <- string that we expect to see at this point
     *                         'Metadata': null <- Not nessesary for literals
     *                     }, {
     *                         'Type': 'RANGE' <- This means that the correct character falls within a range of characters
     *                         'Ranges': [
     *                             ['0', '9'], ['a', 'z'], ['A', 'Z']
     *                         ] <- List of ranges that work here
     *                         'Metadata': 'POSITIVE/NEGATIVE' <- Indicates if match is positive or negative match
     *                     }, {
     *                         'Type': 'RANGE' <- Lets say we dont want literals (Because we want less things to think about)
     *                         'Ranges': [
     *                             ['<=', '<=']
     *                         ]
     *                         'Metadata': 'POSITIVE' <- We can match by checking the range of each character (same as explicit match)
     *                     }
     *                 ], ...
     *             ]
     *         }
     *     ]
     * }
     * 
     */
}

function validate(input: Cfg) {
    // TODO: Check that the cfg is a valid cfg (name loops, etc.)
}

export { Cfg, validate }