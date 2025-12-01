import React from "react";
import ReactDOM from "react-dom";
import styles from "../styles/modal.module.css";

function FormModal({
    isOpen,
    onClose,
    title = "",
    children,
    animation = "fade",
    width = "",
    showClose = true
}) {
    if (!isOpen) return null;

    const modalContent = (
        <div className={styles["modal-overlay"]} onClick={onClose}>
            <div
                className={`${styles["modal-content5"]} ${styles[animation] || ""}`}
                style={{ width }}
                onClick={e => e.stopPropagation()}
            >
                <div className={styles["modal-header"]}>
                    <h2>{title}</h2>
                    {showClose && (
                        <button className="btn btn-xs btn-outline" onClick={onClose}>
                            ✖
                        </button>
                    )}
                </div>
                <div className={styles["modal-body"]}>{children}</div>
            </div>
        </div>
    );

    // Renderizar el modal en el body usando portal
    return ReactDOM.createPortal(modalContent, document.body);
}

export default FormModal;