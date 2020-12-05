import styles from './LabeledCheck.module.css';

function LabeledCheck({ text, onChange, checked }) {
    const checkStyle = checked ? styles.checked : styles.unchecked
    return (
        <label className={styles.root}>
            <span className={checkStyle}></span>
            <input className={styles.box} type='checkbox' onChange={onChange} checked={checked} />
            <span className={styles.text}> {text}</span>
        </label>
    );
}

export default LabeledCheck;