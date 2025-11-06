import React, {useState} from 'react';
import axios from 'axios';
import "../index.css";
import { BaseUrl } from '../utils/Constans';
import { validateField, validationRules } from '../utils/validation'; 
import Spinner from '../components/spinner';
import { useToast } from '../components/userToasd';

function ForCargo ({initialData = {}, onSave, onClose}) {

const showToast = useToast();
const isEdit = !!initialData?.id;
const [loading, setLoading] = useState(false);
const initialForm = {
nombre: "",
...initialData,
};
const [form, setForm] = useState(initialForm);
const [errors, setErrors] = useState({});

///////////////////////////////Helpers o ayudantes para validaciones entre otros ///////////////////////
const validate = (field, value) => {
    if(validationRules[field]) {
        const {regex, errorMessage} = validationRules[field];
        const result = validateField(value, {text: v => regex.test(v)}, errorMessage);
        return result.valid ? "" : result.message;
}
return ""; 
}



const handleChange = (e) => {
    const {name, value, type, checked} = e.target;
    setForm((prev) => ({
        ...prev, [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({
        ...prev, [name]: validate(name, type === "checkbox" ? checked : value ),
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

const handleClear = () => {
    setForm(initialForm);
    setErrors({});
}

/////////////////////////////// Fin Helpers o ayudantes para validaciones entre otros ///////////////////////

//////////////////////////////////////////////////Peticiones o Solicitudes/////////////////////////////////////////////////// 

const handleSave = async (e) => {
    e.preventDefault();
    if(!validateAll()) {
        showToast?.('Corrige los errores antes de guardar', 'warning');
        return;
    }
    setLoading(true);
    try {
        const token = (localStorage.getItem('token') || '').trim();
        const headers = token ? {authorization: `Bearer ${token}`} : {};
        const res = await axios.post(`${BaseUrl}cargos/registrar`, form, {headers});
        showToast?.('Cargos registrado con exito', 'success');
        if (onSave) onSave(res.data);
        if (onClose) onClose();
    } catch (error) {
        const msg = error?.response?.data?.message || "error registrando cargo";
        showToast?.(msg, 'error');
    }finally {
        setLoading(false);
    }
};

const handleEdit = async (e) => {
    e.preventDefault();
    if(!validateAll()) {
        showToast?.("Corrige los errores antes de guardar", 'warning');
        return;
    }
    setLoading(true);
    try {
        const token = (localStorage.getItem('token') || '').trim();
        const headers = token ? {Authorization: `Bearer ${token}`} : {};
        const res = await axios.put(`${BaseUrl}cargos/actualizar/${initialData.id}`, form, {headers});
        showToast?.('Cargo actualizado correctamente', 'success');
        if (onSave) onSave(res.data);
        if (onClose) onClose();
    } catch (error) {
        const msg = error?.response?.data?.message || "Error Actualizando cargo";
        showToast?.(msg, "error");
    }finally{
        setLoading(false);
    }
};
//////////////////////////////////////////////////Fin Peticiones o Solicitudes/////////////////////////////////////////////////// 
return (
        <form onSubmit={isEdit ? handleEdit : handleSave }>
            <div className=''>
                <div className='fc-field'>
                    <label> <span className='unique'>*</span>Nombre</label>
                    <input 
                        type="text" 
                        name='nombre'
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder='Ej: Analista III'
                        required    
                    />
                    {errors.nombre && <span style={{color: 'red'}}>{errors.nombre}</span> }
                </div>
            </div>

            <div className='forc-actions' style={{marginTop:30, marginBottom:20}}>
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

export default ForCargo;