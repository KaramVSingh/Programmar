import RuleBox from './../RuleBox/RuleBox';
import styles from './RuleList.module.css';

function RuleList({ rules }) {
    const ruleBoxes = rules.map((ruleData) => <RuleBox ruleData={ruleData} />);
    return (
        <div>
            {ruleBoxes}
        </div>
    );
}

export default RuleList;