import cx from 'classnames';
import styles from './TestingModal.module.css';
import IconButton from '../IconButton/IconButton';
import { ReactComponent as CloseIcon } from './../../assets/close-line.svg';
import ContentEditable from 'react-contenteditable';
import React, { useState, useRef } from 'react';

function TestingModal({ parser, error, isVisible, closeModal }) {
    const [modalError, setModalError] = useState(error);
    const ref = useRef("Type here...");

    const onChange = (event) => {
        const text = event.nativeEvent.target.innerText;
        ref.current = event.nativeEvent.target.innerHTML;
        let errorMsg = undefined;
        try {
            parser(text);
            setModalError(undefined);
        } catch (parseError) {
            errorMsg = parseError;
        }

        setModalError(errorMsg)
    }

    const visibilityStyle = isVisible ? styles.visible : styles.notVisible;
    const headerColorStyle = error ? styles.red : (modalError ? styles.red : styles.green);
    const headerText = error || modalError || "";

    const inputField = error
        ? <div className={styles.input}></div>
        : <ContentEditable className={styles.input} html={ref.current} onChange={onChange} />

    return (
        <div className={cx(styles.root, visibilityStyle)}>
            <div className={styles.content}>
                <div className={cx(headerColorStyle, styles.header)}>
                    {headerText}
                    <span className={styles.closeButton}>
                        <IconButton Svg={CloseIcon} color="clear" onClick={closeModal} size="almostMedium" />
                    </span>
                </div>
                <div className={styles.body}>
                    {inputField}
                </div>
            </div>
        </div>
    );
}

export default TestingModal;