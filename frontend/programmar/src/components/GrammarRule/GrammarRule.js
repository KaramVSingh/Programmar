import EditText from '../EditText/EditText';
import IconButton from '../IconButton/IconButton';
import styles from './GrammarRule.module.css';
import { ReactComponent as DeleteIcon } from './../../assets/delete-bin-line.svg';
import PressButton from '../PressButton/PressButton';

function GrammarRule({ deleteRule, setFirst, isFirstRule, setName, setOptions, options }) {

    const addOption = () => { setOptions([...options, []]) }
    const optionBoxes = options.map((option) => <div><p>pick me!</p></div>);

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <span>
                    <EditText size='medium' placeholder='Rule Name' onChange={(value) => { setName(value) }} regex={/^[A-Za-z_]*$/}/>
                </span>
                <span>
                    {/* TODO: find a permanent solution for first rule */}
                    First Rule <input className={styles.firstRuleBox} type='checkbox' onChange={setFirst} checked={isFirstRule} />
                    <IconButton Svg={DeleteIcon} color='red' onClick={deleteRule} />
                </span>               
            </div>
            <div>
                {optionBoxes}
                <PressButton size='small' text='Add option' onClick={addOption} />
            </div>
        </div>
    );
}

export default GrammarRule;