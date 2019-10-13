"use strict";
exports.__esModule = true;
var app_1 = require("./app");
var input_1 = require("../input/input");
var translatorUtils_1 = require("../langs/translatorUtils");
app_1.handleRequest(new input_1.Input({
    'rules': [
        {
            'name': 'sampleRule',
            'type': input_1.InputRuleType.RULE,
            'is': [
                [{ 'type': input_1.InputStatementType.RULE, 'ref': 'number' }, { 'type': input_1.InputStatementType.LITERAL, 'ref': '+' }, { 'type': input_1.InputStatementType.RULE, 'ref': 'number' }],
                [{ 'type': input_1.InputStatementType.RULE, 'ref': 'number' }, { 'type': input_1.InputStatementType.LITERAL, 'ref': '-' }, { 'type': input_1.InputStatementType.RULE, 'ref': 'number' }],
                [{ 'type': input_1.InputStatementType.RULE, 'ref': 'number' }, { 'type': input_1.InputStatementType.LITERAL, 'ref': '==' }, { 'type': input_1.InputStatementType.RULE, 'ref': 'number' }],
                [{ 'type': input_1.InputStatementType.RULE, 'ref': 'number' }, { 'type': input_1.InputStatementType.LITERAL, 'ref': '<=>' }, { 'type': input_1.InputStatementType.RULE, 'ref': 'number' }],
                [{ 'type': input_1.InputStatementType.RULE, 'ref': 'number' }, { 'type': input_1.InputStatementType.LITERAL, 'ref': '=' }, { 'type': input_1.InputStatementType.RULE, 'ref': 'number' }],
            ]
        },
        {
            'name': 'number',
            'type': input_1.InputRuleType.REGEX,
            'is': '[0-9]+'
        }
    ]
}), {
    'ignoreWhitespace': false,
    'language': translatorUtils_1.SupportedLanguages.JAVASCRIPT,
    'name': 'testlang',
    'first': 'sampleRule'
});
