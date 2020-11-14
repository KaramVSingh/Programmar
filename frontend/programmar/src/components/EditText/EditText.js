import cx from 'classnames';
import styles from './EditText.module.css';
import React, { useState } from 'react';

const sizes = {
    large: styles.large,
    medium: styles.medium,
    small: styles.small
}

function EditText({ size, placeholder, onChange, regex }) {
    const sizeStyle = sizes[size];
    const [value, setValue] = useState('');
    const onChangeLogic = (event) => {
        const newValue = event.target.value
        onChange(newValue);
        setValue(newValue);
    }

    const validationStyle = regex ? ((value.match(regex)) ? styles.valid : styles.error) : styles.valid

    return (
        <input className={cx(styles.root, sizeStyle, validationStyle)} placeholder={placeholder} onChange={onChangeLogic} />
    );
}

export default EditText;