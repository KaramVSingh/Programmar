import RegexRule from '../RegexRule/RegexRule';
import GrammarRule from '../GrammarRule/GrammarRule';

function RuleList({ rules, deleteRule, setRule, firstRule, setFirstRule }) {
    console.log(rules)
    const ruleBoxes = Object.keys(rules).map(id => {
        const setThisToFirstRule = () => { setFirstRule(id) };
        const isFirstRule = id === firstRule;
        const deleteThisRule = () => { deleteRule(id); if (isFirstRule) { setFirstRule(null) } }

        const setRuleName = (newName) => { const newRule = { ...rules[id], name: newName }; setRule(id, newRule) }
        const setRuleData = (newData) => { const newRule = { ...rules[id], data: newData }; setRule(id, newRule) }

        return rules[id].type === 'regex' 
            ? <RegexRule deleteRule={deleteThisRule} setName={setRuleName} setRegex={setRuleData} /> 
            : <GrammarRule deleteRule={deleteThisRule} setFirst={setThisToFirstRule} isFirstRule={isFirstRule} setName={setRuleName} setOptions={setRuleData} options={rules[id].data} /> 
    });

    return (
        <div>
            {ruleBoxes}
        </div>
    );
}

export default RuleList;