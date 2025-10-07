import BaseModal from './BaseModal';

function FormModal({ isOpen, onClose, onSubmit }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = Object.fromEntries(formData.entries());
        onSubmit(values);
        onClose();
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} title="Formulario" animation="slide-up">
            <form onSubmit={handleSubmit}>
                <label>
                    Nombre:
                    <input type="text" name="nombre" required />
                </label>
                <label>
                    Email:
                    <input type="email" name="email" required />
                </label>
                <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
                    <button type="submit" className="btn-confirm">Enviar</button>
                </div>
            </form>
        </BaseModal>
    );
}

export default FormModal;
