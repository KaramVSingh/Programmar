"use strict";
exports.__esModule = true;
var cfg_1 = require("./cfg");
var input_1 = require("./../input/input");
var assert_1 = require("../testutils/assert");
testRule();
function testRule() {
    var test = cfg_1.Rule.fromInput(new input_1.InputRule({
        'name': 'myrule',
        'type': input_1.InputRuleType.RULE,
        'is': []
    }));
    assert_1.assert(test.length === 1);
    assert_1.assert(JSON.stringify(test[0]) === '{"name":"myrule","is":[],"isGenerated":false}');
    test = cfg_1.Rule.fromInput(new input_1.InputRule({
        'name': 'myrule',
        'type': input_1.InputRuleType.REGEX,
        'is': 'a'
    }));
    assert_1.assert(JSON.stringify(test) === '[{"name":"_myrule_0","is":[[{"type":"RANGE","data":{"isAffirmative":true,"ranges":[["a","a"]]}}]],"isGenerated":true},{"name":"myrule","is":[[{"type":"RULE","data":"_myrule_0"}]],"isGenerated":false}]');
    test = cfg_1.Rule.fromInput(new input_1.InputRule({
        'name': 'myrule',
        'type': input_1.InputRuleType.REGEX,
        'is': 'a+(bsh(t)|bh[65-9]*){12}done+'
    }));
}
testGatherLiterals();
function testGatherLiterals() {
    var in1 = new input_1.Input({
        'rules': [
            {
                'name': 'myrule',
                'type': input_1.InputRuleType.RULE,
                'is': [
                    [{ 'type': input_1.InputStatementType.LITERAL, 'ref': 'a token' }, { 'type': input_1.InputStatementType.LITERAL, 'ref': 'a' }],
                    [{ 'type': input_1.InputStatementType.LITERAL, 'ref': '>=' }, { 'type': input_1.InputStatementType.LITERAL, 'ref': '<=' }]
                ]
            }
        ]
    });
    input_1.Input.validate(in1);
    var test = cfg_1.Cfg.fromInput(in1);
    assert_1.assert(JSON.stringify(cfg_1.gatherLiterals(test)) === '["a token",">=","<="]');
}
