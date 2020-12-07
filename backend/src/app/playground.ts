import { entrypoint, Result } from './app'
import { Input, InputRuleType, InputStatementType } from '../input/input'
import { SupportedLanguages } from '../langs/translatorUtils'

const res = entrypoint(
    {
        input: new Input({
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
                    'type': InputRuleType.REGEX,
                    'is': 'a\\}'
                }
            ]
        }),
        metadata: {
            'ignoreWhitespace': true,
            'language': SupportedLanguages.JAVASCRIPT,
            'name': 'testlang',
            'first': 'regex'
        }
    }
)

res.then((val) => {
    console.log((val.body as Result).parser.source)
})
