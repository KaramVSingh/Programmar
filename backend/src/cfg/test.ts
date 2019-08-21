import { Cfg, validate } from './cfg'
import { assert, assertThrows } from '../testutils/assert'

// This file will contain unit tests for the cfg class
// simple tests like creating, adding rules, and serializing the CFG

function testEmptyCfgThrowsError() {
    assertThrows(() => {
        new Cfg({})
    })
}

function testSimpleCfg() {
    const cfg = new Cfg({
        'Rules': []
    })

    assert(JSON.stringify({ 'Rules': [] }) === JSON.stringify(cfg.toObject()))
}

function testRuleMissingParameters() {
    assertThrows(() => {
        new Cfg({
            'Rules': [
                {
                    'Internal': false,
                    'Is': []
                }
            ]
        })
    })
}

function testBiggerCfg() {
    const cfg = new Cfg({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': []
            }
        ]
    })

    assert(JSON.stringify(cfg.toObject()) === JSON.stringify({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': []
            }
        ]
    }))
}

function testCfgWithRuleReference() {
    const cfg = new Cfg({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': [
                    [
                        {
                            'Type': 'RULE',
                            'Reference': 'SomeRule'
                        }
                    ]
                ]
            }
        ]
    })

    assert(JSON.stringify(cfg.toObject()) === JSON.stringify({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': [
                    [
                        {
                            'Type': 'RULE',
                            'Reference': 'SomeRule',
                            'Metadata': null,
                            'Ranges': null
                        }
                    ]
                ]
            }
        ]
    }))
}

function testCfgWithMultipleFormats() {
    const cfg = new Cfg({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': [
                    [
                        {
                            'Type': 'RULE',
                            'Reference': 'SomeRule'
                        }
                    ],
                    [
                        {
                            'Type': 'RULE',
                            'Reference': 'OtherRule'
                        }
                    ]
                ]
            }
        ]
    })

    assert(JSON.stringify(cfg.toObject()) === JSON.stringify({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': [
                    [
                        {
                            'Type': 'RULE',
                            'Reference': 'SomeRule',
                            'Metadata': null,
                            'Ranges': null
                        }
                    ],
                    [
                        {
                            'Type': 'RULE',
                            'Reference': 'OtherRule',
                            'Metadata': null,
                            'Ranges': null
                        }
                    ]
                ]
            }
        ]
    }))
}

function testInvalidRuleNames() {
    assertThrows(() => {
        new Cfg({
            'Rules': [
                {
                    'Internal': false,
                    'Name': '_MyRule',
                    'Is': []
                }
            ]
        })
    })

    assertThrows(() => {
        new Cfg({
            'Rules': [
                {
                    'Internal': false,
                    'Name': '',
                    'Is': []
                }
            ]
        })
    })
}

function testStatementWithMissingReference() {
    assertThrows(() => new Cfg({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': [
                    [
                        {
                            'Type': 'RULE'
                        }
                    ]
                ]
            }
        ]
    }))
}

function testCfgWithLiteralReference() {
    const cfg = new Cfg({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': [
                    [
                        {
                            'Type': 'LITERAL',
                            'Reference': '<=>'
                        }
                    ]
                ]
            }
        ]
    })

    assert(JSON.stringify(cfg.toObject()) === JSON.stringify({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': [
                    [
                        {
                            'Type': 'RANGE',
                            'Reference': null,
                            'Metadata': 'POSITIVE',
                            'Ranges': [['<=>', '<=>']]
                        }
                    ]
                ]
            }
        ]
    }))
}

function testStatementWithMissingLiteral() {
    assertThrows(() => new Cfg({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': [
                    [
                        {
                            'Type': 'LITERAL'
                        }
                    ]
                ]
            }
        ]
    }))
}

function testCfgWithRangeReference() {
    const cfg = new Cfg({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': [
                    [
                        {
                            'Type': 'RANGE',
                            'Metadata': 'POSITIVE',
                            'Ranges': [
                                ['a', 'z'], ['A', 'Z']
                            ]
                        }
                    ]
                ]
            }
        ]
    })

    assert(JSON.stringify(cfg.toObject()) === JSON.stringify({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': [
                    [
                        {
                            'Type': 'RANGE',
                            'Reference': null,
                            'Metadata': 'POSITIVE',
                            'Ranges': [
                                ['a', 'z'], ['A', 'Z']
                            ]
                        }
                    ]
                ]
            }
        ]
    }))
}

function testBadType() {
    assertThrows(() => new Cfg({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': [
                    [
                        {
                            'Type': 'notathing',
                            'Metadata': 'POSITIVE',
                            'Ranges': [
                                ['a', 'z'], ['A', 'Z']
                            ]
                        }
                    ]
                ]
            }
        ]
    }))
}

function testCfgWithInvalidRange() {
    assertThrows(() => new Cfg({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': [
                    [
                        {
                            'Type': 'RANGE',
                            'Metadata': 'POSITIVE',
                            'Ranges': [
                                ['a', 'z', 'lol']
                            ]
                        }
                    ]
                ]
            }
        ]
    }))

    assertThrows(() => new Cfg({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': [
                    [
                        {
                            'Type': 'RANGE',
                            'Metadata': 'POSITIVE',
                            'Ranges': [
                                ['ab', 'z']
                            ]
                        }
                    ]
                ]
            }
        ]
    }))

    assertThrows(() => new Cfg({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': [
                    [
                        {
                            'Type': 'RANGE',
                            'Metadata': 'POSITIVE',
                            'Ranges': [
                                ['ab', 'ba']
                            ]
                        }
                    ]
                ]
            }
        ]
    }))

    assertThrows(() => new Cfg({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': [
                    [
                        {
                            'Type': 'RANGE',
                            'Metadata': 'POSITIVE',
                            'Ranges': [
                                ['b', 'a']
                            ]
                        }
                    ]
                ]
            }
        ]
    }))

    assertThrows(() => new Cfg({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': [
                    [
                        {
                            'Type': 'RANGE',
                            'Metadata': 'POSITIVE',
                            'Ranges': [
                                ['', '']
                            ]
                        }
                    ]
                ]
            }
        ]
    }))
}

function testRepeatedNamesFails() {
    assertThrows(() => new Cfg({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': []
            },
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': []
            }
        ]
    }))
}

function testAddAndRemoveRules() {
    const cfg = new Cfg({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': []
            }
        ]
    })

    cfg.addRule({
        'Internal': false,
        'Name': 'OtherRule',
        'Is': []
    })

    assert(JSON.stringify(cfg.toObject()) === JSON.stringify({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': []
            },
            {
                'Internal': false,
                'Name': 'OtherRule',
                'Is': []
            }
        ]
    }))

    cfg.removeRule('MyRule')

    assert(JSON.stringify(cfg.toObject()) === JSON.stringify({
        'Rules': [
            {
                'Internal': false,
                'Name': 'OtherRule',
                'Is': []
            }
        ]
    }))
}

function testCfgAddRuleFailsOnRepeat() {
    const cfg = new Cfg({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': []
            }
        ]
    })

    assertThrows(() => {
        cfg.addRule({
            'Internal': false,
            'Name': 'MyRule',
            'Is': []
        })
    })
}

testEmptyCfgThrowsError()
testSimpleCfg()
testRuleMissingParameters()
testBiggerCfg()
testCfgWithRuleReference()
testCfgWithMultipleFormats()
testInvalidRuleNames()
testStatementWithMissingReference()
testCfgWithLiteralReference()
testStatementWithMissingLiteral()
testCfgWithRangeReference()
testBadType()
testCfgWithInvalidRange()
testRepeatedNamesFails()
testAddAndRemoveRules()
testCfgAddRuleFailsOnRepeat()