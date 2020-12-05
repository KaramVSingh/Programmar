import EditText from '../EditText/EditText';
import IconButton from '../IconButton/IconButton';
import styles from './RegexRule.module.css';
import { ReactComponent as DeleteIcon } from './../../assets/delete-bin-line.svg';
import { ReactComponent as ChevIcon } from './../../assets/chevron.svg';
import { ReactComponent as DownChevIcon } from './../../assets/chevron-down.svg';

function RegexRule({ id, validRuleRegex, deleteRule, setName, setRegex, isVisible, toggleVisibility }) {

    const visibilityIcon = isVisible ? DownChevIcon : ChevIcon;
    const visibilityStyle = isVisible ? styles.visible : styles.notVisible

    return (
        <div key={id} className={styles.root}>
            <div className={styles.header}>
                <span>
                    <EditText size='medium' placeholder='Rule Name' onChange={(value) => { setName(value) }} regex={validRuleRegex}/>
                </span>
                <span>
                    <IconButton Svg={visibilityIcon} color='grey' onClick={toggleVisibility} />
                    <IconButton Svg={DeleteIcon} color='red' onClick={deleteRule} />
                </span>               
            </div>
            <div className={visibilityStyle}>
                <EditText size='small' placeholder='Regular Expression' onChange={(value) => { setRegex(value) }} />
            </div>
        </div>
    );
}

export default RegexRule;