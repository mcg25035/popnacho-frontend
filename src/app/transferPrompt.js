import React from "react";
import styles from "./transferPrompt.module.css";
import PropTypes from "prop-types";

/**
 * @typedef {Object} TransferPromptProps
 * @property {function(string, string): void} acceptCallback
 */

/**
 * @param {TransferPromptProps} props
 * @returns 
 */
export default function TransferPrompt({acceptCallback}) {
    var uidRef = React.createRef();
    var transferIdRef = React.createRef();
    
    var callback = ()=>{
        acceptCallback(uidRef.current.value, transferIdRef.current.value);
    }

    return (
        <div className={styles['div']}>
            <input ref={uidRef} className={styles['input']} type="text" placeholder="UID" />
            <input ref={transferIdRef} className={styles['input']} type="text" placeholder="Transfer ID" />
            <button onClick={callback} className={styles['accept-button']}>Accept</button>
        </div>
    )
}

TransferPrompt.propsTypes = {
    acceptCallback: PropTypes.func.isRequired
}