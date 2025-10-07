import BaseModal from './BaseModal';

function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Confirmar acción" animation="zoom">
            <p>{message}</p>
            <div className="modal-actions">
                <button className="btn-cancel" onClick={onClose}>Cancelar</button>
                <button className="btn-confirm" onClick={onConfirm}>Confirmar</button>
            </div>
        </BaseModal>
    );
}

export default ConfirmModal;
