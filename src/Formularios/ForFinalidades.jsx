import React, {useState} from 'react';
import axios from 'axios';
import { BaseUrl } from '../utils/Constans';
import { validateField, validationRules } from '../utils/validation';
import '../index.css';
import Spinner from '../components/spinner';
import { useToast } from '../components/userToasd';

function ForFinalidades ({initialData = {}, onSave, onClose}) {
    
    const ShowToast = useToast();
    const isEdit = !!initialData?.id;
    const [loading, setLoading] = useState(false);
    const initialForm = {
        nombre:'',
        ...initialData,
    };
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});

////////////////////////////////////////Helpers o Ayudantes ////////////////////////////////////////////////////////////////
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
        ...prev, [name]: validate(name, type === "checkbox" ? checked : value),
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
} 

const handleClear = () => {
    setForm(initialForm);
    setErrors({});
}

const getAuthorization = () => {
    const token = (localStorage.getItem('token') || '').trim();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

///////////////////////////////Peticiones o solicitudes///////////////////////////////////////////////////////////// 
    const handleSave = async (e) => {
        e.preventDefault();
        if(!validateAll()) {
            ShowToast?.('Corrige los Errores antes de guardar', 'warning');
            return;
        }
        setLoading(true);
        try{
            const response = await axios.post(`${BaseUrl}finalidades/registrar`, form, { headers: getAuthorization() });
            ShowToast?.('Finalidad registrada con exito', 'success');
            if(onSave) onSave(response.data);
            if(onClose) onClose();
        }catch(error){
            const msg = error?.response?.data?.message || 'Error registrando Finalidad';
            console.error('Error registrando Finalidad', msg);
            ShowToast?.(msg, 'error');
        }finally{
            setLoading(false);
        }
    }

    const handleEdit = async (e) => {
        e.preventDefault();
        if(!validateAll()) {
            ShowToast?.('Corrige los errores antes de guardar', 'warning');
            return;
        }   
        setLoading(true);
        try{
            const response = await axios.put(`${BaseUrl}finalidades/actualizar/${initialData.id}`, form, {headers: getAuthorization() });
            ShowToast?.('Finalidad actualizada con exito', 'success');
            if(onSave) onSave(response.data);
            if(onClose) onClose();
        }catch(error){
            console.error('Error actualizando esta finalidad', error?.response?.data || error.message);
            ShowToast?.('Error al actualizar esta finalidad', 'error');
        }finally{
            setLoading(false);
        }
    }

    return(
        <form onSubmit={isEdit ? handleEdit : handleSave}>
            <div className=''>
                <div className='fc-field'>
                    <label><span className='unique'>*</span>Nombre</label>
                    <input 
                        type="text" 
                        name='nombre'
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder='Ej: Soporte...'
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


export default ForFinalidades;