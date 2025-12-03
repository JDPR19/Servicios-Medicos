import React, { useState, useEffect } from "react";
import axios from "axios";
import { BaseUrl } from "../utils/Constans";
import { useToast } from "../components/userToasd";
import Spinner from "../components/spinner";
import SingleSelect from "../components/SingleSelect";
import { jwtDecode } from "jwt-decode";
import "../index.css";

function ForAtenciones({ onSuccess, onCancel, atencionToEdit = null }) {
    const showToast = useToast();
    const [loading, setLoading] = useState(false);
    const [pacientes, setPatients] = useState([]);

    const [formData, setFormData] = useState({
        nombre_solicitante: "",
        cedula_solicitante: "",
        telefono_solicitante: "",
        motivo: "",
        prioridad: "media",
        estatus: "pendiente",
        pacientes_id: null
    });

    useEffect(() => {
        // Cargar pacientes para autocompletar si es necesario
        const fetchPatients = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${BaseUrl}historias_medicas/pacientes-lista`, { headers: { Authorization: `Bearer ${token}` } });
                if (Array.isArray(response.data)) {
                    setPatients(response.data.map(p => ({
                        value: p.id,
                        label: `${p.cedula} - ${p.nombre} ${p.apellido}`,
                        original: p
                    })));
                }
            } catch (error) {
                console.error("Error cargando pacientes", error);
            }
        };
        fetchPatients();
    }, []);

    useEffect(() => {
        if (atencionToEdit) {
            setFormData({
                nombre_solicitante: atencionToEdit.nombre_solicitante || "",
                cedula_solicitante: atencionToEdit.cedula_solicitante || "",
                telefono_solicitante: atencionToEdit.telefono_solicitante || "",
                motivo: atencionToEdit.motivo || "",
                prioridad: atencionToEdit.prioridad || "media",
                estatus: atencionToEdit.estatus || "pendiente",
                pacientes_id: atencionToEdit.pacientes_id || null
            });
        }
    }, [atencionToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePacienteSelect = (option) => {
        if (option) {
            setFormData(prev => ({
                ...prev,
                pacientes_id: option.value,
                nombre_solicitante: `${option.original.nombre} ${option.original.apellido}`,
                cedula_solicitante: option.original.cedula,
                telefono_solicitante: option.original.contacto || ""
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                pacientes_id: null,
                nombre_solicitante: "",
                cedula_solicitante: "",
                telefono_solicitante: ""
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const decoded = jwtDecode(token);
            const usuarios_id = decoded.id;

            const dataToSend = { ...formData, usuarios_id };

            if (atencionToEdit) {
                await axios.put(`${BaseUrl}atenciones/actualizar/${atencionToEdit.id}`, dataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showToast("Atención actualizada", "success");
            } else {
                await axios.post(`${BaseUrl}atenciones/registrar`, dataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showToast("Atención registrada", "success");
            }
            onSuccess?.();
        } catch (error) {
            console.error(error);
            showToast("Error al guardar atención", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="forc-grid cols-2">
                <div className="fc-field" style={{ gridColumn: "1 / -1" }}>
                    <label>Buscar Paciente (Opcional)</label>
                    <SingleSelect
                        options={pacientes}
                        onChange={handlePacienteSelect}
                        placeholder="Buscar paciente registrado..."
                        value={pacientes.find(p => p.value === formData.pacientes_id)}
                        isClearable
                    />
                </div>

                <div className="fc-field">
                    <label>Nombre Solicitante</label>
                    <input name="nombre_solicitante" value={formData.nombre_solicitante} onChange={handleChange} required />
                </div>
                <div className="fc-field">
                    <label>Cédula</label>
                    <input name="cedula_solicitante" value={formData.cedula_solicitante} onChange={handleChange} />
                </div>
                <div className="fc-field">
                    <label>Teléfono</label>
                    <input name="telefono_solicitante" value={formData.telefono_solicitante} onChange={handleChange} />
                </div>
                <div className="fc-field">
                    <label>Prioridad</label>
                    <SingleSelect
                        options={[
                            { value: 'baja', label: 'Baja' },
                            { value: 'media', label: 'Media' },
                            { value: 'alta', label: 'Alta' }
                        ]}
                        value={[
                            { value: 'baja', label: 'Baja' },
                            { value: 'media', label: 'Media' },
                            { value: 'alta', label: 'Alta' }
                        ].find(opt => opt.value === formData.prioridad)}
                        onChange={(opt) => setFormData(prev => ({ ...prev, prioridad: opt ? opt.value : 'media' }))}
                        placeholder="Seleccione prioridad"
                    />
                </div>
                <div className="fc-field" style={{ gridColumn: "1 / -1" }}>
                    <label>Estatus</label>
                    <SingleSelect
                        options={[
                            { value: 'pendiente', label: 'Pendiente' },
                            { value: 'agendada', label: 'Agendada' },
                            { value: 'atendida', label: 'Atendida' },
                            { value: 'cancelada', label: 'Cancelada' }
                        ]}
                        value={[
                            { value: 'pendiente', label: 'Pendiente' },
                            { value: 'agendada', label: 'Agendada' },
                            { value: 'atendida', label: 'Atendida' },
                            { value: 'cancelada', label: 'Cancelada' }
                        ].find(opt => opt.value === formData.estatus)}
                        onChange={(opt) => setFormData(prev => ({ ...prev, estatus: opt ? opt.value : 'pendiente' }))}
                        placeholder="Seleccione estatus"
                    />
                </div>
                <div className="fc-field" style={{ gridColumn: "1 / -1" }}>
                    <label>Motivo</label>
                    <textarea name="motivo" value={formData.motivo} onChange={handleChange} rows="3" required />
                </div>
            </div>
            <div className="forc-actions" style={{ marginTop: 20 }}>
                <button type="button" className="btn btn-outline" onClick={onCancel}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <Spinner size={20} /> : (atencionToEdit ? "Actualizar" : "Registrar")}
                </button>
            </div>
        </form>
    );
}

export default ForAtenciones;
