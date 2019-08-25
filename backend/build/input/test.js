"use strict";
exports.__esModule = true;
var input_1 = require("./input");
var assert_1 = require("../testutils/assert");
/**
 * This file contains all tests for the input class as defined in input.ts
 * This file also contains all tests for dependencies of the input class.
 */
testInputWorks();
function testInputWorks() {
    var inputEmpty = new input_1.Input({
        'rules': []
    });
    assert_1.assert(inputEmpty.rules.toString() === [].toString());
    var inputSimple = new input_1.Input({
        'rules': [
            {
                'name': 'WOW',
                'type': input_1.InputRuleType.RULE,
                'is': []
            }
        ]
    });
    assert_1.assert(inputSimple.rules.length === 1);
}
testRuleWorks();
function testRuleWorks() {
    var ruleEmpty = new input_1.InputRule({
        'name': 'myrule',
        'type': input_1.InputRuleType.RULE,
        'is': []
    });
    assert_1.assert(ruleEmpty.is.toString() === [].toString());
    var regexWorks = new input_1.InputRule({
        'name': 'myregex',
        'type': input_1.InputRuleType.REGEX,
        'is': 'myregex'
    });
    assert_1.assert(regexWorks.is == 'myregex');
}
testCreateInput();
function testCreateInput() {
    var input = new input_1.Input({
        'rules': [
            {
                'name': 'myrule',
                'type': input_1.InputRuleType.RULE,
                'is': [
                    [
                        { 'type': input_1.InputStatementType.RULE, 'ref': 'expression' },
                        { 'type': input_1.InputStatementType.LITERAL, 'ref': '+' },
                        { 'type': input_1.InputStatementType.RULE, 'ref': 'expression' }
                    ],
                    [
                        { 'type': input_1.InputStatementType.RULE, 'ref': 'expression' },
                        { 'type': input_1.InputStatementType.LITERAL, 'ref': '-' },
                        { 'type': input_1.InputStatementType.RULE, 'ref': 'expression' }
                    ]
                ]
            },
            {
                'name': 'myregex',
                'type': input_1.InputRuleType.REGEX,
                'is': '(wow[34]*)|12'
            }
        ]
    });
}
testValidateRule();
function testValidateRule() {
    input_1.InputRule.validate(new input_1.InputRule({
        'name': 'myname',
        'type': input_1.InputRuleType.REGEX,
        'is': 'myregex'
    }));
    assert_1.assertThrows(function () {
        input_1.InputRule.validate(new input_1.InputRule({
            'name': 'myregex',
            'type': input_1.InputRuleType.REGEX,
            'is': []
        }));
    });
    input_1.InputRule.validate(new input_1.InputRule({
        'name': 'myname',
        'type': input_1.InputRuleType.RULE,
        'is': [
            [{ 'type': input_1.InputStatementType.LITERAL, 'ref': '+' }]
        ]
    }));
    assert_1.assertThrows(function () {
        input_1.InputRule.validate(new input_1.InputRule({
            'name': 'myname',
            'type': input_1.InputRuleType.RULE,
            'is': 'a regex'
        }));
    });
    assert_1.assertThrows(function () {
        input_1.InputRule.validate(new input_1.InputRule({
            'name': '_name',
            'type': input_1.InputRuleType.REGEX,
            'is': 'myregex'
        }));
    });
}
testValidateInput();
function testValidateInput() {
    // sanity
    input_1.Input.validate(new input_1.Input({
        'rules': []
    }));
    // calls rule validate
    assert_1.assertThrows(function () {
        input_1.Input.validate(new input_1.Input({
            'rules': [
                {
                    'name': 'myrulename',
                    'type': input_1.InputRuleType.REGEX,
                    'is': []
                }
            ]
        }));
    });
    // repeat names throws exception
    assert_1.assertThrows(function () {
        input_1.Input.validate(new input_1.Input({
            'rules': [
                {
                    'name': 'myrulename',
                    'type': input_1.InputRuleType.REGEX,
                    'is': 'wow'
                },
                {
                    'name': 'myrulename',
                    'type': input_1.InputRuleType.REGEX,
                    'is': 'wow'
                }
            ]
        }));
    });
    // sanity
    input_1.Input.validate(new input_1.Input({
        'rules': [
            {
                'name': 'myrulename',
                'type': input_1.InputRuleType.RULE,
                'is': [
                    [{ 'type': input_1.InputStatementType.RULE, 'ref': 'myotherrule' }]
                ]
            },
            {
                'name': 'myotherrule',
                'type': input_1.InputRuleType.REGEX,
                'is': 'wow'
            }
        ]
    }));
    // referencing bad rule throws exception
    assert_1.assertThrows(function () {
        input_1.Input.validate(new input_1.Input({
            'rules': [
                {
                    'name': 'myrulename',
                    'type': input_1.InputRuleType.RULE,
                    'is': [
                        [{ 'type': input_1.InputStatementType.RULE, 'ref': 'notarule' }]
                    ]
                },
                {
                    'name': 'myotherrule',
                    'type': input_1.InputRuleType.REGEX,
                    'is': 'wow'
                }
            ]
        }));
    });
    assert_1.assertThrows(function () {
        input_1.Input.validate(new input_1.Input({
            'rules': [
                {
                    'name': 'myrulename',
                    'type': input_1.InputRuleType.RULE,
                    'is': [
                        [{ 'type': input_1.InputStatementType.RULE, 'ref': 'myotherrule' }],
                        [{ 'type': input_1.InputStatementType.RULE, 'ref': 'doesnotexist' }]
                    ]
                },
                {
                    'name': 'myotherrule',
                    'type': input_1.InputRuleType.REGEX,
                    'is': 'wow'
                }
            ]
        }));
    });
    // sanity
    input_1.Input.validate(new input_1.Input({
        'rules': [
            {
                'name': 'arule',
                'type': input_1.InputRuleType.RULE,
                'is': [
                    [{ 'type': input_1.InputStatementType.RULE, 'ref': 'rule1' }],
                    [{ 'type': input_1.InputStatementType.RULE, 'ref': 'rule2' }],
                    [{ 'type': input_1.InputStatementType.RULE, 'ref': 'rule3' }, { 'type': input_1.InputStatementType.LITERAL, 'ref': '+' }],
                    []
                ]
            },
            {
                'name': 'rule1',
                'type': input_1.InputRuleType.REGEX,
                'is': 'aregex'
            },
            {
                'name': 'rule2',
                'type': input_1.InputRuleType.RULE,
                'is': [
                    [{ 'type': input_1.InputStatementType.RULE, 'ref': 'rule3' }, { 'type': input_1.InputStatementType.LITERAL, 'ref': '+' }],
                    [{ 'type': input_1.InputStatementType.LITERAL, 'ref': '+' }]
                ]
            },
            {
                'name': 'rule3',
                'type': input_1.InputRuleType.RULE,
                'is': [
                    [{ 'type': input_1.InputStatementType.LITERAL, 'ref': '+' }]
                ]
            },
        ]
    }));
    // left recursion error
    assert_1.assertThrows(function () {
        input_1.Input.validate(new input_1.Input({
            'rules': [
                {
                    'name': 'arule',
                    'type': input_1.InputRuleType.RULE,
                    'is': [
                        [{ 'type': input_1.InputStatementType.RULE, 'ref': 'rule1' }],
                        [{ 'type': input_1.InputStatementType.RULE, 'ref': 'rule2' }],
                        [{ 'type': input_1.InputStatementType.RULE, 'ref': 'rule3' }, { 'type': input_1.InputStatementType.LITERAL, 'ref': '+' }],
                        []
                    ]
                },
                {
                    'name': 'rule1',
                    'type': input_1.InputRuleType.REGEX,
                    'is': 'aregex'
                },
                {
                    'name': 'rule2',
                    'type': input_1.InputRuleType.RULE,
                    'is': [
                        [{ 'type': input_1.InputStatementType.RULE, 'ref': 'rule3' }, { 'type': input_1.InputStatementType.LITERAL, 'ref': '+' }],
                        [{ 'type': input_1.InputStatementType.LITERAL, 'ref': '+' }]
                    ]
                },
                {
                    'name': 'rule3',
                    'type': input_1.InputRuleType.RULE,
                    'is': [
                        [{ 'type': input_1.InputStatementType.LITERAL, 'ref': '+' }],
                        [{ 'type': input_1.InputStatementType.RULE, 'ref': 'arule' }]
                    ]
                },
            ]
        }));
    });
}
