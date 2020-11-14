import cx from 'classnames';
import styles from './IconButton.module.css';

const colors = {
    red: styles.red
}

function IconButton({ Svg, color, onClick }) {
    const colorStyle = colors[color];

    return (
        <button className={styles.root} onClick={onClick}>
            <span className={cx(styles.container, colorStyle)}>
                <Svg className={styles.icon} />
            </span>
        </button>
    );
}

export default IconButton;