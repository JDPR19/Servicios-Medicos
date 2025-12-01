import React, { useState, useEffect } from "react";
import "../index.css";
import axios from "axios";
import { BaseUrl } from "../utils/Constans";
import { validateField, validationRules } from "../utils/validation";
import Spinner from "../components/spinner";
import { useToast } from "../components/userToasd";
import SingleSelect from "../components/SingleSelect";


    const PREFIJOS = [
    { value: "V-", label: "V-" },
    { value: "E-", label: "E-" },
    { value: "J-", label: "J-" },
    { value: "G-", label: "G-" },
    ];

function ForDoctor({ initialData = {}, onSave, onClose }) {
const showToast = useToast();
const isEdit = !!initialData?.id;

 // Extraer prefijo y número de cédula inicial
const getPrefijo = cedula =>
    PREFIJOS.find(p => cedula?.startsWith(p.value))?.value || "V-";
const getNumero = cedula =>
    cedula ? cedula.replace(/^(V-|E-|J-|G-)/, "") : "";

const initialForm = {
cedula: "",
nombre: "",
apellido: "",
contacto: "",
cargos_id: null,
profesion_id: null,
estado: true,
...initialData,
};

const [form, setForm] = useState(initialForm);
const [prefijoCedula, setPrefijoCedula] = useState(getPrefijo(initialForm.cedula));
const [numeroCedula, setNumeroCedula] = useState(getNumero(initialForm.cedula));
const [errors, setErrors] = useState({});
const [cargos, setCargos] = useState([]);
const [profesiones, setProfesiones] = useState([]);
const [loading, setLoading] = useState(false);




// Cargar catálogos
useEffect(() => {
const fetchCatalogos = async () => {
setLoading(true);
try {
    const token = (localStorage.getItem('token') || '').trim();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    // Llama a los endpoints correctos
    const cargosRes = await axios.get(`${BaseUrl}doctores/cargos`, { headers });
    const profesionesRes = await axios.get(`${BaseUrl}doctores/profesiones`, { headers });
    setCargos(cargosRes.data);
    setProfesiones(profesionesRes.data);
} catch (error) {
    console.error('Error al cargar Catálogos', error);
    showToast?.("Error cargando catálogos", "error");
} finally {
    setLoading(false);
}
};

fetchCatalogos();
}, []);

useEffect(() => {
    const cedula = initialData?.cedula || "";
    setForm({ ...initialForm, ...initialData });
    setPrefijoCedula(getPrefijo(cedula));
    setNumeroCedula(getNumero(cedula));
}, []);

// Validación de campos
const validate = (field, value) => {
if (validationRules[field]) {
    const { regex, errorMessage } = validationRules[field];
    const result = validateField(value, { text: v => regex.test(v) }, errorMessage);
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

const handlePrefijoChange = opt => {
    const nuevoPrefijo = opt ? opt.value : "V-";
    setPrefijoCedula(nuevoPrefijo);
    setForm(f => ({ ...f, cedula: nuevoPrefijo + numeroCedula }));
};
const handleNumeroCedulaChange = e => {
    const numero = e.target.value.replace(/\D/g, "");
    setNumeroCedula(numero);
    setForm(f => ({ ...f, cedula: prefijoCedula + numero }));
};

// Validar todo antes de guardar
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

const handleClear = () => {
    setForm(initialForm);
    setErrors({});
    setPrefijoCedula(getPrefijo(initialForm.cedula));
    setNumeroCedula(getNumero(initialForm.cedula));
};

// ////////////////////////////////////////////////////////////////////////////////////

// Función para registrar un nuevo doctor
const handleRegister = async (e) => {
e.preventDefault();
if (!validateAll()) {
showToast?.("Corrige los errores antes de guardar", "warning");
return;
}
setLoading(true);
try {
const token = (localStorage.getItem('token') || '').trim();
const headers = token ? { Authorization: `Bearer ${token}` } : {};
const res = await axios.post(`${BaseUrl}doctores/registrar`, form, { headers });
showToast?.("Doctor registrado correctamente", "success");
if (onSave) onSave(res.data);
if (onClose) onClose();
} catch (err) {
const msg = err?.response?.data?.message || "Error registrando doctor";
showToast?.(msg, "error");
} finally {
setLoading(false);
}
};

// Función para editar un doctor existente
const handleEdit = async (e) => {
e.preventDefault();
if (!validateAll()) {
showToast?.("Corrige los errores antes de guardar", "warning");
return;
}
setLoading(true);
try {
const token = (localStorage.getItem('token') || '').trim();
const headers = token ? { Authorization: `Bearer ${token}` } : {};
const res = await axios.put(`${BaseUrl}doctores/actualizar/${initialData.id}`, form, { headers });
showToast?.("Doctor actualizado correctamente", "success");
if (onSave) onSave(res.data);
if (onClose) onClose();
} catch (err) {
const msg = err?.response?.data?.message || "Error actualizando doctor";
showToast?.(msg, "error");
} finally {
setLoading(false);
}
};



return (
<form  onSubmit={isEdit ? handleEdit : handleRegister}>
    <div className="forc-section-title">
    </div>
    <div className="forc-grid">
<div className="fc-field">
        <label><span className="unique">*</span>Cédula</label>
        <div style={{ display: "flex", gap: 8 }}>
            <SingleSelect
            options={PREFIJOS}
            value={PREFIJOS.find(p => p.value === prefijoCedula)}
            onChange={handlePrefijoChange}
            placeholder="Prefijo"
            isClearable={false}
            />    
            <input
            name="cedula"
            value={numeroCedula}
            onChange={handleNumeroCedulaChange}
            placeholder="12345678"
            required
            style={{ flex: 1 }}
            maxLength={10}
            pattern="\d*"
            />
        </div>
        {errors.cedula && <span style={{ color: "red" }}>{errors.cedula}</span>}
    </div>
    <div className="fc-field">
        <label><span className="unique">*</span>Nombre</label>
        <input
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        placeholder="Ej: Pedro"
        required
        />
        {errors.nombre && <span style={{ color: "red" }}>{errors.nombre}</span>}
    </div>
    <div className="fc-field">
        <label><span className="unique">*</span>Apellido</label>
        <input
        name="apellido"
        value={form.apellido}
        onChange={handleChange}
        placeholder="Ej: Colmenarez"
        required
        />
        {errors.apellido && <span style={{ color: "red" }}>{errors.apellido}</span>}
    </div>
    <div className="fc-field">
        <label><span className="unique">*</span>Contacto</label>
        <input
        name="contacto"
        value={form.contacto}
        onChange={handleChange}
        placeholder="Ej: 0412-1234567"
        required
        />
        {errors.contacto && <span style={{ color: "red" }}>{errors.contacto}</span>}
    </div>
    <div className="fc-field">
        <label><span className="unique">*</span>Cargo</label>
        <SingleSelect
            options={cargos.map(c => ({ value: c.id, label: c.nombre }))}
            value={cargos.find(c => c.id === form.cargos_id) ? { value: form.cargos_id, label: cargos.find(c => c.id === form.cargos_id)?.nombre } : null}
            onChange={opt => setForm(f => ({ ...f, cargos_id: opt ? opt.value : null }))}
            placeholder="Seleccione…"
            isClearable={false}
        />
    </div>
    <div className="fc-field">
        <label><span className="unique">*</span>Profesión</label>
        <SingleSelect
            options={profesiones.map(p => ({ value: p.id, label: p.carrera }))}
            value={profesiones.find(p => p.id === form.profesion_id) ? { value: form.profesion_id, label: profesiones.find(p => p.id === form.profesion_id)?.carrera } : null}
            onChange={opt => setForm(f => ({ ...f, profesion_id: opt ? opt.value : null}))}
            placeholder="Seleccione…"
            isClearable={false}
        />
    </div>
    </div>

    <div className="forc-actions" style={{marginTop:30, marginBottom:20}}>
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

export default ForDoctor;