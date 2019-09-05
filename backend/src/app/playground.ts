import { handleRequest } from './app'
import { Input, InputRuleType, InputStatementType } from '../input/input';
import { SupportedLanguages } from '../langs/language';

handleRequest(new Input({
    'rules': [
        {
            'name': 'sampleRule',
            'type': InputRuleType.RULE,
            'is': [
                [ { 'type': InputStatementType.RULE, 'ref': 'number' }, { 'type': InputStatementType.LITERAL, 'ref': '+' }, { 'type': InputStatementType.RULE, 'ref': 'number' } ],
                [ { 'type': InputStatementType.RULE, 'ref': 'number' }, { 'type': InputStatementType.LITERAL, 'ref': '-' }, { 'type': InputStatementType.RULE, 'ref': 'number' } ],
                [ { 'type': InputStatementType.RULE, 'ref': 'number' }, { 'type': InputStatementType.LITERAL, 'ref': '==' }, { 'type': InputStatementType.RULE, 'ref': 'number' } ],
                [ { 'type': InputStatementType.RULE, 'ref': 'number' }, { 'type': InputStatementType.LITERAL, 'ref': '<=>' }, { 'type': InputStatementType.RULE, 'ref': 'number' } ],
                [ { 'type': InputStatementType.RULE, 'ref': 'number' }, { 'type': InputStatementType.LITERAL, 'ref': '=' }, { 'type': InputStatementType.RULE, 'ref': 'number' } ],
            ]
        },
        {
            'name': 'number',
            'type': InputRuleType.REGEX,
            'is': '[0-9]+'
        }
    ]
}), {
    'ignoreWhitespace': false,
    'language': SupportedLanguages.JAVASCRIPT,
    'name': 'testlang'
})