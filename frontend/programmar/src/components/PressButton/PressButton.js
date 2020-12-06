import cx from 'classnames';
import styles from './PressButton.module.css';
import { ReactComponent as PlusIcon } from './../../assets/add-line.svg';

const sizes = {
    large: styles.large,
    small: styles.small
}

const colors = {
    green: styles.green,
    blue: styles.blue
}

function PressButton({ text, size, color, svg, onClick }) {
    const sizeStyle = sizes[size];
    const colorStyle = colors[color] || styles.blue;
    const Icon = svg || PlusIcon;

    return (
        <button className={cx(styles.root, sizeStyle)} onClick={onClick}>
            <span className={cx(styles.container, sizeStyle, colorStyle)}>
                <Icon className={cx(styles.plusIcon, sizeStyle)}/>
            </span>
            <span className={cx(styles.text, sizeStyle)}>
                {text}
            </span>
        </button>
    );
}

export default PressButton