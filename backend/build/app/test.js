"use strict";
exports.__esModule = true;
var app_1 = require("./app");
var cfg_1 = require("./../cfg/cfg");
var input_1 = require("../input/input");
var assert_1 = require("../testutils/assert");
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
    assert_1.assert(JSON.stringify(app_1.gatherLiterals(test)) === '["a token",">=","<="]');
}
