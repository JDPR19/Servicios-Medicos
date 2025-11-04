import React from "react";
import styles from '../styles/modal.module.css';

function InfoModal({ isOpen, onClose, title = "Información", children }) {
if (!isOpen) return null;
return (
<div className={styles["modal-overlay"]}>
    <div className={styles["modal-content3"]}>
    <div className={styles["modal-header"]}>
        <h2>{title}</h2>
        <button className="btn btn-xs btn-outline" onClick={onClose}>X</button>
    </div>
    <div className={styles["modal-body"]}>{children}</div>
    </div>
</div>
);
}

export default InfoModal;