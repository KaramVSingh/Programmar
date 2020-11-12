import cx from 'classnames';
import styles from './EditText.module.css';

const sizes = {
    large: styles.large,
    medium: styles.medium,
    small: styles.small
}

function EditText({ size, placeholder, onChange }) {
    const sizeStyle = sizes[size];

    return (
        <input className={cx(styles.root, sizeStyle)} placeholder={placeholder} onChange={onChange} />
    );
}

export default EditText;