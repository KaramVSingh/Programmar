"use strict";
exports.__esModule = true;
var app_1 = require("./app");
var input_1 = require("../input/input");
var translatorUtils_1 = require("../langs/translatorUtils");
var res = app_1.entrypoint({
    input: new input_1.Input({
        'rules': [
            // {
            //     'name': '',
            //     'type': InputRuleType.RULE,
            //     'is': [
            //         [ { 'type': InputStatementType.RULE, 'ref': 'number' }, { 'type': InputStatementType.LITERAL, 'ref': '+' }, { 'type': InputStatementType.RULE, 'ref': 'number' } ],
            //         [ { 'type': InputStatementType.RULE, 'ref': 'number' }, { 'type': InputStatementType.LITERAL, 'ref': '-' }, { 'type': InputStatementType.RULE, 'ref': 'number' } ],
            //         [ { 'type': InputStatementType.RULE, 'ref': 'number' }, { 'type': InputStatementType.LITERAL, 'ref': '==' }, { 'type': InputStatementType.RULE, 'ref': 'number' } ],
            //         [ { 'type': InputStatementType.RULE, 'ref': 'number' }, { 'type': InputStatementType.LITERAL, 'ref': '<=>' }, { 'type': InputStatementType.RULE, 'ref': 'number' } ],
            //         [ { 'type': InputStatementType.RULE, 'ref': 'number' }, { 'type': InputStatementType.LITERAL, 'ref': '=' }, { 'type': InputStatementType.RULE, 'ref': 'number' } ],
            //     ]
            // },
            {
                'name': 'regex',
                'type': input_1.InputRuleType.REGEX,
                'is': 'a\\}'
            }
        ]
    }),
    metadata: {
        'ignoreWhitespace': true,
        'language': translatorUtils_1.SupportedLanguages.JAVASCRIPT,
        'name': 'testlang',
        'first': 'regex'
    }
});
res.then(function (val) {
    console.log(val.body.parser.source);
});
