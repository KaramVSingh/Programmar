import cx from 'classnames';
import styles from './PressButton.module.css';
import { ReactComponent as PlusIcon } from './../../assets/add-line.svg';

const sizes = {
    large: styles.large,
    small: styles.small
}

function PressButton({ text, size, onClick }) {
    const sizeStyle = sizes[size];

    return (
        <button className={cx(styles.root, sizeStyle)} onClick={onClick}>
            <span className={cx(styles.container, sizeStyle)}>
                <PlusIcon className={cx(styles.plusIcon, sizeStyle)}/>
            </span>
            <span className={cx(styles.text, sizeStyle)}>
                {text}
            </span>
        </button>
    );
}

export default PressButton