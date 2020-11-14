import EditText from '../EditText/EditText';
import IconButton from '../IconButton/IconButton';
import styles from './RegexRule.module.css';
import { ReactComponent as DeleteIcon } from './../../assets/delete-bin-line.svg';

function RegexRule({ deleteRule, setName, setRegex }) {
    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <span>
                    <EditText size='medium' placeholder='Rule Name' onChange={(value) => { setName(value) }} regex={/^[A-Za-z_]*$/}/>
                </span>
                <span>
                    <IconButton Svg={DeleteIcon} color='red' onClick={deleteRule} />
                </span>               
            </div>
            <div>
                <EditText size='small' placeholder='Regular Expression' onChange={(value) => { setRegex(value) }} />
            </div>
        </div>
    );
}

export default RegexRule;