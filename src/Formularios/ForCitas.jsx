import React, { useState, useEffect } from "react";
import axios from "axios";
import { BaseUrl } from "../utils/Constans";
import { useToast } from "../components/userToasd";
import Spinner from "../components/spinner";
import SingleSelect from "../components/SingleSelect";
import { jwtDecode } from "jwt-decode";
import "../index.css";

function ForCitas({ onSuccess, onCancel, citaToEdit = null, preSelectedAtencion = null }) {
    const showToast = useToast();
    const [loading, setLoading] = useState(false);
    const [pacientes, setPatients] = useState([]);
    const [doctores, setDoctores] = useState([]);

    const [formData, setFormData] = useState({
        fecha_cita: "",
        hora_cita: "",
        motivo: "",
        estatus: "programada",
        pacientes_id: null,
        doctor_id: null,
        atenciones_id: null
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const [resPac, resDoc] = await Promise.all([
                    axios.get(`${BaseUrl}historias_medicas/pacientes-lista`, { headers }),
                    axios.get(`${BaseUrl}doctores`, { headers })
                ]);

                if (Array.isArray(resPac.data)) {
                    setPatients(resPac.data.map(p => ({
                        value: p.id,
                        label: `${p.cedula} - ${p.nombre} ${p.apellido}`
                    })));
                }
                if (Array.isArray(resDoc.data)) {
                    setDoctores(resDoc.data.map(d => ({
                        value: d.id,
                        label: `${d.nombre} ${d.apellido} - ${d.especialidad || 'General'}`
                    })));
                }
            } catch (error) {
                console.error("Error cargando datos", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (citaToEdit) {
            setFormData({
                fecha_cita: citaToEdit.fecha_cita ? citaToEdit.fecha_cita.split('T')[0] : "",
                hora_cita: citaToEdit.hora_cita || "",
                motivo: citaToEdit.motivo || "",
                estatus: citaToEdit.estatus || "programada",
                pacientes_id: citaToEdit.pacientes_id,
                doctor_id: citaToEdit.doctor_id,
                atenciones_id: citaToEdit.atenciones_id
            });
        } else if (preSelectedAtencion) {
            setFormData(prev => ({
                ...prev,
                atenciones_id: preSelectedAtencion.id,
                pacientes_id: preSelectedAtencion.pacientes_id,
                motivo: preSelectedAtencion.motivo
            }));
        }
    }, [citaToEdit, preSelectedAtencion]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const decoded = jwtDecode(token);
            const usuarios_id = decoded.id;

            const dataToSend = { ...formData, usuarios_id };

            if (citaToEdit) {
                await axios.put(`${BaseUrl}citas/actualizar/${citaToEdit.id}`, dataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showToast("Cita actualizada", "success");
            } else {
                await axios.post(`${BaseUrl}citas/registrar`, dataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showToast("Cita agendada", "success");
            }
            onSuccess?.();
        } catch (error) {
            console.error(error);
            showToast("Error al guardar cita", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="forc-grid cols-2">
                <div className="fc-field" style={{ gridColumn: "1 / -1" }}>
                    <label>Paciente</label>
                    <SingleSelect
                        options={pacientes}
                        onChange={(opt) => setFormData(p => ({ ...p, pacientes_id: opt?.value }))}
                        value={pacientes.find(p => p.value === formData.pacientes_id)}
                        placeholder="Seleccione paciente..."
                        isDisabled={!!preSelectedAtencion?.pacientes_id} // Si viene de atención con paciente, bloquear
                    />
                </div>

                <div className="fc-field" style={{ gridColumn: "1 / -1" }}>
                    <label>Doctor</label>
                    <SingleSelect
                        options={doctores}
                        onChange={(opt) => setFormData(p => ({ ...p, doctor_id: opt?.value }))}
                        value={doctores.find(d => d.value === formData.doctor_id)}
                        placeholder="Seleccione doctor..."
                    />
                </div>

                <div className="fc-field">
                    <label>Fecha</label>
                    <input type="date" name="fecha_cita" value={formData.fecha_cita} onChange={handleChange} required />
                </div>
                <div className="fc-field">
                    <label>Hora</label>
                    <input type="time" name="hora_cita" value={formData.hora_cita} onChange={handleChange} required />
                </div>

                <div className="fc-field" style={{ gridColumn: "1 / -1" }}>
                    <label>Motivo</label>
                    <textarea name="motivo" value={formData.motivo} onChange={handleChange} rows="3" />
                </div>

                {citaToEdit && (
                <div className="fc-field">
                    <label>Estatus</label>
                    <SingleSelect
                        options={[
                            { value: 'programada', label: 'Programada' },
                            { value: 'confirmada', label: 'Confirmada' },
                            { value: 'cancelada', label: 'Cancelada' },
                            { value: 'realizada', label: 'Realizada' },
                            { value: 'no_asistio', label: 'No Asistió' }
                        ]}
                        value={[
                            { value: 'programada', label: 'Programada' },
                            { value: 'confirmada', label: 'Confirmada' },
                            { value: 'cancelada', label: 'Cancelada' },
                            { value: 'realizada', label: 'Realizada' },
                            { value: 'no_asistio', label: 'No Asistió' }
                        ].find(opt => opt.value === formData.estatus)}
                        onChange={(opt) => setFormData(prev => ({ ...prev, estatus: opt ? opt.value : 'programada' }))}
                        placeholder="Seleccione estatus"
                    />
                </div>
                )}
            </div>
            <div className="forc-actions" style={{ marginTop: 20 }}>
                <button type="button" className="btn btn-outline" onClick={onCancel}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <Spinner size={20} /> : (citaToEdit ? "Actualizar" : "Agendar")}
                </button>
            </div>
        </form>
    );
}

export default ForCitas;
