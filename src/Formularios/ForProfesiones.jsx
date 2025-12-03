import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BaseUrl } from '../utils/Constans';
import { useToast } from '../components/userToasd';
import Spinner from '../components/spinner';
import '../index.css';

function ForProfesiones({ profesionToEdit = null, onSuccess, onCancel }) {
    const showToast = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        nivel: ''
    });

    useEffect(() => {
        if (profesionToEdit) {
            setFormData({
                nombre: profesionToEdit.carrera || '',
                nivel: profesionToEdit.nivel || ''
            });
        }
    }, [profesionToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            if (profesionToEdit) {
                await axios.put(
                    `${BaseUrl}profesion/actualizar/${profesionToEdit.id}`,
                    formData,
                    { headers }
                );
                showToast?.('Profesión actualizada correctamente', 'success', 3000);
            } else {
                await axios.post(
                    `${BaseUrl}profesion/registrar`,
                    formData,
                    { headers }
                );
                showToast?.('Profesión registrada correctamente', 'success', 3000);
            }

            onSuccess?.();
        } catch (error) {
            console.error('Error al guardar profesión:', error);
            showToast?.('Error al guardar la profesión', 'error', 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className='forc-grid cols-2'>
                <div className='fc-field'>
                    <label>Nombre de la Profesión</label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Médico, Ingeniero, etc."
                        required
                    />
                </div>

                <div className='fc-field'>
                    <label>Nivel</label>
                    <input
                        type="text"
                        name="nivel"
                        value={formData.nivel}
                        onChange={handleChange}
                        placeholder="Ej: Universitario, Técnico, etc."
                    />
                </div>
            </div>

            <div className='forc-actions' style={{ marginTop: 20 }}>
                <button type="button" className='btn btn-outline' onClick={onCancel}>
                    Cancelar
                </button>
                <button type="submit" className='btn btn-primary' disabled={loading}>
                    {loading ? <Spinner size={20} /> : (profesionToEdit ? 'Actualizar' : 'Registrar')}
                </button>
            </div>
        </form>
    );
}

export default ForProfesiones;
