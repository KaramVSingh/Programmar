import style from './RuleRef.module.css'

function RuleRef({ ruleId, ruleName }) {
    return (
        <span contentEditable="false" className={style.root} rule_id={ruleId}>{ruleName}</span>
    );
}

export default RuleRef;