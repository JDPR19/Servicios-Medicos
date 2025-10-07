import BaseModal from './BaseModal';

function InfoModal({ isOpen, onClose, message }) {
    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Información" animation="slide-down">
            <p>{message}</p>
        </BaseModal>
    );
}

export default InfoModal;
