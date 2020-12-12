"use strict";
exports.__esModule = true;
var app_1 = require("./app");
var input_1 = require("../input/input");
var translatorUtils_1 = require("../langs/translatorUtils");
var res = app_1.entrypoint({
    input: new input_1.Input({
        'rules': [
            {
                'name': 'string',
                'type': input_1.InputRuleType.RULE,
                'is': [
                    [ { 'type': input_1.InputStatementType.LITERAL, 'ref': 'y' }, { 'type': input_1.InputStatementType.RULE, 'ref': 'part' }, { 'type': input_1.InputStatementType.LITERAL, 'ref': 'y' } ]
                ]
            },
            {
                'name': 'part',
                'type': input_1.InputRuleType.RULE,
                'is': [
                    [ { 'type': input_1.InputStatementType.RULE, 'ref': 'data' }, { 'type': input_1.InputStatementType.RULE, 'ref': 'part' } ],
                    [ { 'type': input_1.InputStatementType.RULE, 'ref': 'data' } ],
                ]
            },
            {
                'name': 'data',
                'type': input_1.InputRuleType.REGEX,
                'is': '[^y]*'
            }
        ]
    }),
    metadata: {
        'ignoreWhitespace': true,
        'language': translatorUtils_1.SupportedLanguages.JAVASCRIPT,
        'name': 'testlang',
        'first': 'string'
    }
});
res.then(function (val) {
    console.log(val.body.lexer.source)
    console.log(val.body.parser.source)
});
