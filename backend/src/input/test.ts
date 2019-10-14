import { Input, InputRule, InputRuleType, InputStatementType, InputStatement } from './input'
import { assert, assertThrows } from '../testutils/assert'

/**
 * This file contains all tests for the input class as defined in input.ts
 * This file also contains all tests for dependencies of the input class.
 */

testCheckInputRuleType()
function testCheckInputRuleType() {
    assert(InputRule.isInputRule({'name': 'hello', 'type': 'RULE', 'is': 'rule'}))
    assert(InputRule.isInputRule({}) === false)
    assert(InputRule.isInputRule({'name': {}, 'type': 'RULE', 'is': 'rule'}) === false)

    assert(InputRule.isInputRule({'name': 'hello', 'type': {}, 'is': 'rule'}) === false)
    assert(InputRule.isInputRule({'name': 'hello', 'type': 'NOT A RULE', 'is': 'rule'}) === false)

    assert(InputRule.isInputRule({'name': 'hello', 'type': 'RULE', 'is': {}}) === false)
    assert(InputRule.isInputRule({'name': 'hello', 'type': 'RULE', 'is': []}))
    assert(InputRule.isInputRule({'name': 'hello', 'type': 'RULE', 'is': [[]]}))
    assert(InputRule.isInputRule({'name': 'hello', 'type': 'RULE', 'is': [[{}]]}) === false)
    assert(InputRule.isInputRule({'name': 'hello', 'type': 'RULE', 'is': [[{'type': 'LITERAL', 'ref': 'hello'}]]}))
}

testCheckInputType()
function testCheckInputType() {
    assert(Input.isInput({'rules': []}))
    assert(Input.isInput({}) === false)
    assert(Input.isInput({'rules': {}}) === false)
}

testInputWorks()
function testInputWorks() {
    const inputEmpty = new Input({
        'rules': [
        ]
    })

    assert(inputEmpty.rules.toString() === [].toString())

    const inputSimple = new Input({
        'rules': [
            {
                'name': 'WOW',
                'type': InputRuleType.RULE,
                'is': []
            }
        ]
    })

    assert(inputSimple.rules.length === 1)
}

testRuleWorks()
function testRuleWorks() {
    const ruleEmpty = new InputRule({
        'name': 'myrule',
        'type': InputRuleType.RULE,
        'is': []
    })

    assert(ruleEmpty.is.toString() === [].toString())

    const regexWorks = new InputRule({
        'name': 'myregex',
        'type': InputRuleType.REGEX,
        'is': 'myregex'
    })

    assert(regexWorks.is == 'myregex')
}

testCreateInput()
function testCreateInput() {
    const input = new Input({
        'rules': [
            {
                'name': 'myrule',
                'type': InputRuleType.RULE,
                'is': [
                    [ 
                        { 'type': InputStatementType.RULE, 'ref': 'expression' },
                        { 'type': InputStatementType.LITERAL, 'ref': '+' },
                        { 'type': InputStatementType.RULE, 'ref': 'expression' }
                    ],
                    [ 
                        { 'type': InputStatementType.RULE, 'ref': 'expression' },
                        { 'type': InputStatementType.LITERAL, 'ref': '-' },
                        { 'type': InputStatementType.RULE, 'ref': 'expression' }
                    ]
                ]
            },
            {
                'name': 'myregex',
                'type': InputRuleType.REGEX,
                'is': '(wow[34]*)|12'
            }
        ]
    })
}

testValidateRule()
function testValidateRule() {
    InputRule.validate(new InputRule({
        'name': 'myname',
        'type': InputRuleType.REGEX,
        'is': 'myregex'
    }))

    assertThrows(() => {
        InputRule.validate(new InputRule({
            'name': 'myregex',
            'type': InputRuleType.REGEX,
            'is': []
        }))
    })

    InputRule.validate(new InputRule({
        'name': 'myname',
        'type': InputRuleType.RULE,
        'is': [
            [ { 'type': InputStatementType.LITERAL, 'ref': '+' } ]
        ]
    }))

    assertThrows(() => {
        InputRule.validate(new InputRule({
            'name': 'myname',
            'type': InputRuleType.RULE,
            'is': 'a regex'
        }))
    })

    assertThrows(() => {
        InputRule.validate(new InputRule({
            'name': '_name',
            'type': InputRuleType.REGEX,
            'is': 'myregex'
        }))
    })
}

testValidateInput()
function testValidateInput() {
    // sanity
    Input.validate(new Input({
        'rules': []
    }))

    // calls rule validate
    assertThrows(() => {
        Input.validate(new Input({
            'rules': [
                {
                    'name': 'myrulename',
                    'type': InputRuleType.REGEX,
                    'is': []
                }
            ]
        }))
    })

    // repeat names throws exception
    assertThrows(() => {
        Input.validate(new Input({
            'rules': [
                {
                    'name': 'myrulename',
                    'type': InputRuleType.REGEX,
                    'is': 'wow'
                },
                {
                    'name': 'myrulename',
                    'type': InputRuleType.REGEX,
                    'is': 'wow'
                }
            ]
        }))
    })

    // sanity
    Input.validate(new Input({
        'rules': [
            {
                'name': 'myrulename',
                'type': InputRuleType.RULE,
                'is': [
                    [ { 'type': InputStatementType.RULE, 'ref': 'myotherrule' } ]
                ]
            },
            {
                'name': 'myotherrule',
                'type': InputRuleType.REGEX,
                'is': 'wow'
            }
        ]
    }))

    // referencing bad rule throws exception
    assertThrows(() => {
        Input.validate(new Input({
            'rules': [
                {
                    'name': 'myrulename',
                    'type': InputRuleType.RULE,
                    'is': [
                        [ { 'type': InputStatementType.RULE, 'ref': 'notarule' } ]
                    ]
                },
                {
                    'name': 'myotherrule',
                    'type': InputRuleType.REGEX,
                    'is': 'wow'
                }
            ]
        }))
    })

    assertThrows(() => {
        Input.validate(new Input({
            'rules': [
                {
                    'name': 'myrulename',
                    'type': InputRuleType.RULE,
                    'is': [
                        [ { 'type': InputStatementType.RULE, 'ref': 'myotherrule' } ],
                        [ { 'type': InputStatementType.RULE, 'ref': 'doesnotexist' } ]
                    ]
                },
                {
                    'name': 'myotherrule',
                    'type': InputRuleType.REGEX,
                    'is': 'wow'
                }
            ]
        }))
    })

    // sanity
    Input.validate(new Input({
        'rules': [
            {
                'name': 'arule',
                'type': InputRuleType.RULE,
                'is': [
                    [ { 'type': InputStatementType.RULE, 'ref': 'rule1' } ],
                    [ { 'type': InputStatementType.RULE, 'ref': 'rule2' } ],
                    [ { 'type': InputStatementType.RULE, 'ref': 'rule3' }, { 'type': InputStatementType.LITERAL, 'ref': '+' } ],
                    []
                ]
            },
            {
                'name': 'rule1',
                'type': InputRuleType.REGEX,
                'is': 'aregex'
            },
            {
                'name': 'rule2',
                'type': InputRuleType.RULE,
                'is': [
                    [ { 'type': InputStatementType.RULE, 'ref': 'rule3' }, { 'type': InputStatementType.LITERAL, 'ref': '+' } ],
                    [ { 'type': InputStatementType.LITERAL, 'ref': '+' } ]
                ]
            },
            {
                'name': 'rule3',
                'type': InputRuleType.RULE,
                'is': [
                    [ { 'type': InputStatementType.LITERAL, 'ref': '+' } ]
                ]
            },
        ]
    }))

    // left recursion error
    assertThrows(() => {
        Input.validate(new Input({
            'rules': [
                {
                    'name': 'arule',
                    'type': InputRuleType.RULE,
                    'is': [
                        [ { 'type': InputStatementType.RULE, 'ref': 'rule1' } ],
                        [ { 'type': InputStatementType.RULE, 'ref': 'rule2' } ],
                        [ { 'type': InputStatementType.RULE, 'ref': 'rule3' }, { 'type': InputStatementType.LITERAL, 'ref': '+' } ],
                        []
                    ]
                },
                {
                    'name': 'rule1',
                    'type': InputRuleType.REGEX,
                    'is': 'aregex'
                },
                {
                    'name': 'rule2',
                    'type': InputRuleType.RULE,
                    'is': [
                        [ { 'type': InputStatementType.RULE, 'ref': 'rule3' }, { 'type': InputStatementType.LITERAL, 'ref': '+' } ],
                        [ { 'type': InputStatementType.LITERAL, 'ref': '+' } ]
                    ]
                },
                {
                    'name': 'rule3',
                    'type': InputRuleType.RULE,
                    'is': [
                        [ { 'type': InputStatementType.LITERAL, 'ref': '+' } ],
                        [ { 'type': InputStatementType.RULE, 'ref': 'arule' }]
                    ]
                },
            ]
        }))
    })
}