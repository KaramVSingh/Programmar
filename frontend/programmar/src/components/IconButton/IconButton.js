import cx from 'classnames';
import styles from './IconButton.module.css';

const colors = {
    red: styles.red,
    grey: styles.grey,
    white: styles.white,
    clear: styles.clear
}

const sizes = {
    almostMedium: styles.almostMedium,
    medium: styles.medium
}

function IconButton({ Svg, color, onClick, size }) {
    const colorStyle = colors[color];
    const sizeStyle = sizes[size]

    return (
        <button className={styles.root} onClick={onClick}>
            <span className={cx(styles.container, colorStyle, sizeStyle)}>
                <Svg className={styles.icon} />
            </span>
        </button>
    );
}

export default IconButton;