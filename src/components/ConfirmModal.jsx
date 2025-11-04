import React from "react";
import styles from "../styles/modal.module.css";

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  message = "¿Estás seguro?",
  title = "Confirmar acción",
  confirmText = "Confirmar",
  cancelText = "Cancelar"
}) {
  if (!isOpen) return null;
  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-content2"]}>
        <div className={styles["modal-header"]}>
          <h2>{title}</h2>
          <button className="btn btn-xs btn-outline" onClick={onClose}>X</button>
        </div>
        <div className={styles["modal-body"]}>
          <p>{message}</p>
          <div className={styles["modal-actions"]}>
            <button className="btn btn-outline" onClick={onClose}>{cancelText}</button>
            <button className="btn btn-danger" onClick={onConfirm}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;