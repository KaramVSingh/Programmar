import { Cfg, Rule } from './cfg'
import { Input, InputRule, InputRuleType, InputStatementType } from './../input/input'
import { assert } from '../testutils/assert';

testRule()
function testRule() {
    let test: Rule[] = Rule.fromInput(new InputRule({
        'name': 'myrule',
        'type': InputRuleType.RULE,
        'is': []
    }))

    assert(test.length === 1)
    assert(JSON.stringify(test[0]) === '{"name":"myrule","is":[],"isGenerated":false}')

    test = Rule.fromInput(new InputRule({
        'name': 'myrule',
        'type': InputRuleType.REGEX,
        'is': 'a'
    }))

    assert(JSON.stringify(test) === '[{"name":"_myrule_0","is":[[{"type":"RANGE","data":{"isAffirmative":true,"ranges":[["a","a"]]}}]],"isGenerated":true},{"name":"myrule","is":[[{"type":"RULE","data":"_myrule_0"}]],"isGenerated":false}]')

    test = Rule.fromInput(new InputRule({
        'name': 'myrule',
        'type': InputRuleType.REGEX,
        'is': 'a+(bsh(t)|bh[65-9]*){12}done+'
    }))
}