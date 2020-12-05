import EditText from '../EditText/EditText';
import IconButton from '../IconButton/IconButton';
import styles from './GrammarRule.module.css';
import PressButton from '../PressButton/PressButton';
import GrammarOption from '../GrammarOption/GrammarOption';
import LabeledCheck from '../LabeledCheck/LabeledCheck';
import { ReactComponent as DeleteIcon } from './../../assets/delete-bin-line.svg';
import { ReactComponent as ChevIcon } from './../../assets/chevron.svg';
import { ReactComponent as DownChevIcon } from './../../assets/chevron-down.svg';

function GrammarRule({ id, ruleIdMapping, validRuleRegex, deleteRule, setFirst, isFirstRule, setName, setOptions, options, isVisible, toggleVisibility }) {

    const addOption = () => { setOptions([...options, { endingSpace: false, parts: [] }]) };
    const setSingleOption = (option, newOption) => { setOptions(options.map((optionArray) => optionArray === option ? newOption : optionArray)) };
    const optionBoxes = options.map((option) => {
        const deleteOption = () => { setOptions(options.filter(element => element !== option)) }
        return <GrammarOption ruleIdMapping={ruleIdMapping} option={option} setOption={(newOption) => setSingleOption(option, newOption)} deleteOption={deleteOption} />
    });

    const visibilityIcon = isVisible ? DownChevIcon : ChevIcon;
    const visibilityStyle = isVisible ? styles.visible : styles.notVisible

    return (
        <div key={id} className={styles.root}>
            <div className={styles.header}>
                <span>
                    <EditText size='medium' placeholder='Rule Name' onChange={(value) => { setName(value) }} regex={validRuleRegex}/>
                </span>
                <span>
                    <LabeledCheck text="First rule" onChange={setFirst} checked={isFirstRule} />
                    <IconButton Svg={visibilityIcon} color='grey' onClick={toggleVisibility} />
                    <IconButton Svg={DeleteIcon} color='red' onClick={deleteRule} />
                </span>               
            </div>
            <div className={visibilityStyle}>
                {optionBoxes}
                <span className={styles.footer}>
                    <PressButton size='small' text='Add option' onClick={addOption} />
                </span>
            </div>
        </div>
    );
}

export default GrammarRule;