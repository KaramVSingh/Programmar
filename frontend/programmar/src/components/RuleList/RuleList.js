import RegexRule from '../RegexRule/RegexRule';
import GrammarRule from '../GrammarRule/GrammarRule';

const validRuleRegexFE = /^[A-Za-z_]*$/
const validRuleRegexBE = /^\S+$/

function RuleList({ rules, deleteRule, setRule, firstRule, setFirstRule }) {
    const ruleIdMapping = {};
    Object.keys(rules).forEach(id => {
        const name = rules[id].name;
        if (name.match(validRuleRegexBE)) {
            ruleIdMapping[id] = name;
        }
    });

    const ruleBoxes = Object.keys(rules).map(id => {
        const setThisToFirstRule = () => { setFirstRule(id) };
        const isFirstRule = id === firstRule;
        const deleteThisRule = () => { deleteRule(id); if (isFirstRule) { setFirstRule(null) } }

        const setRuleName = (newName) => { const newRule = { ...rules[id], name: newName }; setRule(id, newRule) }
        const setRuleData = (newData) => { const newRule = { ...rules[id], data: newData }; setRule(id, newRule) }

        const isVisible = rules[id].visible;
        const toggleVisibility = () => { const newRule = { ...rules[id], visible: !isVisible }; setRule(id, newRule) }

        return rules[id].type === 'regex' 
            ? <RegexRule 
                key={id} 
                validRuleRegex={validRuleRegexFE} 
                deleteRule={deleteThisRule} 
                setName={setRuleName} 
                setRegex={setRuleData} 
                isVisible={isVisible} 
                toggleVisibility={toggleVisibility} /> 
            : <GrammarRule 
                key={id} 
                ruleIdMapping={ruleIdMapping} 
                validRuleRegex={validRuleRegexFE} 
                deleteRule={deleteThisRule} 
                setFirst={setThisToFirstRule} 
                isFirstRule={isFirstRule} 
                setName={setRuleName} 
                setOptions={setRuleData} 
                options={rules[id].data} 
                isVisible={isVisible} 
                toggleVisibility={toggleVisibility} /> 
    });

    return (
        <div>
            {ruleBoxes}
        </div>
    );
}

export default RuleList;