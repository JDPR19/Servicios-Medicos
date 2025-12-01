import React, { useEffect, useState } from 'react';
import '../index.css';
import axios from 'axios';
import { BaseUrl } from '../utils/Constans';
import { validateField, getValidationRule } from '../utils/validation';
import Spinner from '../components/spinner';
import { useToast } from '../components/userToasd';
import SingleSelect from '../components/SingleSelect';

function ForEnfermedades({ initialData = {}, onSave, onClose }) {
    const [loading, setLoading] = useState(false);
    const showToast = useToast();
    const isEdit = !!initialData?.id;
    const initialForm = {
        nombre: "",
        descripcion: "",
        categoria_e_id: null,
        ...initialData,
    };
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [categoria, setCategoria] = useState([]);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const getAuthorization = () => {
        const token = (localStorage.getItem("token") || "").trim();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    const validate = (field, value) => {
        if (field === "confirmPassword") {
            return value !== form.password ? "Las contraseñas no coinciden" : "";
        }
        const rule = getValidationRule(field);
        if (rule && rule.regex) {
            const result = validateField(value, { text: v => rule.regex.test(v) }, rule.errorMessage);
            return result.valid ? "" : result.message;
        }
        return "";
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: validate(name, type === "checkbox" ? checked : value),
        }));
    };


    const validateAll = () => {
        const newErrors = {};
        Object.keys(form).forEach((field) => {
            if (field === "estado") return;
            const err = validate(field, form[field]);
            if (err) newErrors[field] = err;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const fetchCatalogos = async () => {
        setLoading(true);
        try {
            const categoria = await axios.get(`${BaseUrl}enfermedades/All_categorias_e`, { headers: getAuthorization() });
            setCategoria(categoria.data);
        } catch (error) {
            console.error('Error al cargar catalogos', error);
            showToast('error al cargar catalogos', 'error', 3000);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCatalogos();
    }, []);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateAll()) {
            showToast?.("corrige los errores antes de guardar", "warning");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${BaseUrl}enfermedades/registrar`, form, { headers: getAuthorization() });
            showToast?.("registro exitoso", "success");
            if (onSave) onSave(response.data);
            if (onClose) onClose();
        } catch (error) {
            const msg = error?.response?.data?.message || 'Error al registrar problemas con el servidor';
            showToast?.(msg, 'error');
        } finally {
            setLoading(false);
        }
    }

    const handleEdit = async (e) => {
        e.preventDefault();
        if (!validateAll()) {
            showToast?.('Corrige los errores de guardar', 'warning');
            return;
        }
        setLoading(true);

        try {
            const response = await axios.put(`${BaseUrl}enfermedades/actualizar/${initialData.id}`, form, { headers: getAuthorization() });
            showToast?.('Registro exitoso', 'success');
            if (onSave) onSave(response.data);
            if (onClose) onClose();
        } catch (error) {
            const msg = error?.response?.data?.message || 'Error al actualizar ';
            showToast?.(msg, 'error');
        } finally {
            setLoading(false);
        }
    }


    const handleClear = () => {
        setForm(initialForm);
        setErrors({});
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    return (
        <form onSubmit={isEdit ? handleEdit : handleRegister}>
            <div className='forc-section-title'>
            </div>

            <div className='forc-grid'>

                <div className='fc-field'>
                    <label><span className='unique'>*</span>Enfermedades</label>
                    <input
                        type="text"
                        value={form.nombre}
                        placeholder='Ej: Gripe'
                        onChange={handleChange}
                        required
                        name='nombre'
                    />
                    {errors.nombre && <span style={{ color: "red" }}>{errors.nombre}</span>}
                </div>

                <div className='fc-field'>
                    <label><span className='unique'>*</span>Descripción</label>
                    <textarea
                        placeholder='Describa enfermedad (Opcional)'
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                    >
                    </textarea>
                </div>

                <div className='fc-field'>
                    <label><span>*</span>Categoria a la que Pertenece</label>
                    <SingleSelect
                        options={categoria.map(p => ({ value: p.id, label: p.nombre }))}
                        value={categoria.find(p => p.id === form.categoria_e_id) ? { value: form.categoria_e_id, label: categoria.find(p => p.id === form.categoria_e_id)?.nombre } : null}
                        onChange={opt => setForm(f => ({ ...f, categoria_e_id: opt ? opt.value : null }))}
                        placeholder='Selecciones...'
                        isClearable={false}
                    />
                </div>

            </div>

            <div className="forc-actions" style={{ marginTop: 30, marginBottom: 20 }}>
                <button className="btn btn-outline" type="button" onClick={onClose} disabled={loading}>
                    Cancelar
                </button>
                <div className="forc-actions-right">
                    <button className="btn btn-secondary" type="button" onClick={handleClear} disabled={loading}>
                        Limpiar
                    </button>
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? <Spinner size={10} inline label="Procesando..." /> : "Guardar"}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default ForEnfermedades;