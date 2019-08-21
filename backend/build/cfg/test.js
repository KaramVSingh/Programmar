"use strict";
exports.__esModule = true;
var cfg_1 = require("./cfg");
var assert_1 = require("../testutils/assert");
// This file will contain unit tests for the cfg class
// simple tests like creating, adding rules, and serializing the CFG
function testEmptyCfgThrowsError() {
    assert_1.assertThrows(function () {
        new cfg_1.Cfg({});
    });
}
function testSimpleCfg() {
    var cfg = new cfg_1.Cfg({
        'Rules': []
    });
    assert_1.assert(JSON.stringify({ 'Rules': [] }) === JSON.stringify(cfg.toObject()));
}
function testRuleMissingParameters() {
    assert_1.assertThrows(function () {
        new cfg_1.Cfg({
            'Rules': [
                {
                    'Internal': false,
                    'Is': []
                }
            ]
        });
    });
}
function testBiggerCfg() {
    var cfg = new cfg_1.Cfg({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': []
            }
        ]
    });
    assert_1.assert(JSON.stringify(cfg.toObject()) === JSON.stringify({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': []
            }
        ]
    }));
}
function testCfgWithRuleReference() {
    var cfg = new cfg_1.Cfg({
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
    });
    assert_1.assert(JSON.stringify(cfg.toObject()) === JSON.stringify({
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
    }));
}
function testCfgWithMultipleFormats() {
    var cfg = new cfg_1.Cfg({
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
    });
    assert_1.assert(JSON.stringify(cfg.toObject()) === JSON.stringify({
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
    }));
}
function testInvalidRuleNames() {
    assert_1.assertThrows(function () {
        new cfg_1.Cfg({
            'Rules': [
                {
                    'Internal': false,
                    'Name': '_MyRule',
                    'Is': []
                }
            ]
        });
    });
    assert_1.assertThrows(function () {
        new cfg_1.Cfg({
            'Rules': [
                {
                    'Internal': false,
                    'Name': '',
                    'Is': []
                }
            ]
        });
    });
}
function testStatementWithMissingReference() {
    assert_1.assertThrows(function () { return new cfg_1.Cfg({
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
    }); });
}
function testCfgWithLiteralReference() {
    var cfg = new cfg_1.Cfg({
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
    });
    assert_1.assert(JSON.stringify(cfg.toObject()) === JSON.stringify({
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
    }));
}
function testStatementWithMissingLiteral() {
    assert_1.assertThrows(function () { return new cfg_1.Cfg({
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
    }); });
}
function testCfgWithRangeReference() {
    var cfg = new cfg_1.Cfg({
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
    });
    assert_1.assert(JSON.stringify(cfg.toObject()) === JSON.stringify({
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
    }));
}
function testBadType() {
    assert_1.assertThrows(function () { return new cfg_1.Cfg({
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
    }); });
}
function testCfgWithInvalidRange() {
    assert_1.assertThrows(function () { return new cfg_1.Cfg({
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
    }); });
    assert_1.assertThrows(function () { return new cfg_1.Cfg({
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
    }); });
    assert_1.assertThrows(function () { return new cfg_1.Cfg({
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
    }); });
    assert_1.assertThrows(function () { return new cfg_1.Cfg({
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
    }); });
    assert_1.assertThrows(function () { return new cfg_1.Cfg({
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
    }); });
}
function testRepeatedNamesFails() {
    assert_1.assertThrows(function () { return new cfg_1.Cfg({
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
    }); });
}
function testAddAndRemoveRules() {
    var cfg = new cfg_1.Cfg({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': []
            }
        ]
    });
    cfg.addRule({
        'Internal': false,
        'Name': 'OtherRule',
        'Is': []
    });
    assert_1.assert(JSON.stringify(cfg.toObject()) === JSON.stringify({
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
    }));
    cfg.removeRule('MyRule');
    assert_1.assert(JSON.stringify(cfg.toObject()) === JSON.stringify({
        'Rules': [
            {
                'Internal': false,
                'Name': 'OtherRule',
                'Is': []
            }
        ]
    }));
}
function testCfgAddRuleFailsOnRepeat() {
    var cfg = new cfg_1.Cfg({
        'Rules': [
            {
                'Internal': false,
                'Name': 'MyRule',
                'Is': []
            }
        ]
    });
    assert_1.assertThrows(function () {
        cfg.addRule({
            'Internal': false,
            'Name': 'MyRule',
            'Is': []
        });
    });
}
testEmptyCfgThrowsError();
testSimpleCfg();
testRuleMissingParameters();
testBiggerCfg();
testCfgWithRuleReference();
testCfgWithMultipleFormats();
testInvalidRuleNames();
testStatementWithMissingReference();
testCfgWithLiteralReference();
testStatementWithMissingLiteral();
testCfgWithRangeReference();
testBadType();
testCfgWithInvalidRange();
testRepeatedNamesFails();
testAddAndRemoveRules();
testCfgAddRuleFailsOnRepeat();
