import React, { useState, useEffect } from "react";
import axios from "axios";
import { BaseUrl } from "../utils/Constans";
import { useToast } from "../components/userToasd";
import Spinner from "../components/spinner";
import SingleSelect from "../components/SingleSelect";
import "../index.css";

function ForSignosVitales({ pacienteId, onSuccess, onCancel, signoToEdit = null, readOnly = false }) {
    const showToast = useToast();
    const [loading, setLoading] = useState(false);
    const [consultas, setConsultas] = useState([]);
    const [loadingConsultas, setLoadingConsultas] = useState(true);

    const [formData, setFormData] = useState({
        tipo_sangre: "",
        presion_arterial: "",
        frecuencia_cardiaca: "",
        frecuencia_respiratoria: "",
        temperatura: "",
        saturacion_oxigeno: "",
        peso: "",
        talla: "",
        consulta_id: ""
    });

    // Opciones para tipo de sangre
    const tiposSangre = [
        { value: "A+", label: "A+" },
        { value: "A-", label: "A-" },
        { value: "B+", label: "B+" },
        { value: "B-", label: "B-" },
        { value: "AB+", label: "AB+" },
        { value: "AB-", label: "AB-" },
        { value: "O+", label: "O+" },
        { value: "O-", label: "O-" }
    ];

    // Cargar consultas del paciente
    useEffect(() => {
        const fetchConsultas = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const response = await axios.get(`${BaseUrl}consultas/paciente/${pacienteId}`, { headers });
                const consultasData = response.data || [];
                setConsultas(consultasData);

                // Si solo hay una consulta, pre-seleccionarla automáticamente
                if (consultasData.length === 1 && !signoToEdit) {
                    setFormData(prev => ({
                        ...prev,
                        consulta_id: consultasData[0].id
                    }));
                }
            } catch (error) {
                console.error("Error al cargar consultas:", error);
                showToast?.("Error al cargar las consultas del paciente", "error");
            } finally {
                setLoadingConsultas(false);
            }
        };

        if (pacienteId) {
            fetchConsultas();
        }
    }, [pacienteId, signoToEdit]);

    // Si hay un signo a editar, cargar sus datos
    useEffect(() => {
        if (signoToEdit) {
            setFormData({
                tipo_sangre: signoToEdit.tipo_sangre || "",
                presion_arterial: signoToEdit.presion_arterial || "",
                frecuencia_cardiaca: signoToEdit.frecuencia_cardiaca || "",
                frecuencia_respiratoria: signoToEdit.frecuencia_respiratoria || "",
                temperatura: signoToEdit.temperatura || "",
                saturacion_oxigeno: signoToEdit.saturacion_oxigeno || "",
                peso: signoToEdit.peso || "",
                talla: signoToEdit.talla || "",
                consulta_id: signoToEdit.consulta_id || ""
            });
        }
    }, [signoToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (readOnly) return; // No hacer nada si es solo lectura

        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Validación básica
            if (!formData.consulta_id) {
                showToast?.("Debe seleccionar una consulta", "error");
                setLoading(false);
                return;
            }

            // Preparar datos para enviar
            const dataToSend = {
                ...formData,
                frecuencia_cardiaca: formData.frecuencia_cardiaca ? parseInt(formData.frecuencia_cardiaca) : null,
                frecuencia_respiratoria: formData.frecuencia_respiratoria ? parseInt(formData.frecuencia_respiratoria) : null,
                temperatura: formData.temperatura ? parseFloat(formData.temperatura) : null,
                saturacion_oxigeno: formData.saturacion_oxigeno ? parseInt(formData.saturacion_oxigeno) : null,
                peso: formData.peso ? parseFloat(formData.peso) : null,
                talla: formData.talla ? parseFloat(formData.talla) : null,
                consulta_id: parseInt(formData.consulta_id)
            };

            if (signoToEdit) {
                // Actualizar
                await axios.put(`${BaseUrl}signos_vitales/actualizar/${signoToEdit.id}`, dataToSend, { headers });
                showToast?.("Signos vitales actualizados correctamente", "success");
            } else {
                // Crear
                await axios.post(`${BaseUrl}signos_vitales/registrar`, dataToSend, { headers });
                showToast?.("Signos vitales registrados correctamente", "success");
            }

            onSuccess?.();
        } catch (error) {
            console.error("Error al guardar signos vitales:", error);
            showToast?.(error.response?.data?.message || "Error al guardar los signos vitales", "error");
        } finally {
            setLoading(false);
        }
    };

    if (loadingConsultas) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                <Spinner size={40} label="Cargando consultas..." />
            </div>
        );
    }

    // Preparar opciones de consultas para SingleSelect
    const consultasOptions = consultas.map(consulta => {
        const nombrePaciente = consulta.paciente_nombre && consulta.paciente_apellido
            ? `${consulta.paciente_nombre} ${consulta.paciente_apellido}`
            : 'Paciente';

        const fecha = new Date(consulta.fecha_atencion).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        return {
            value: consulta.id,
            label: `${consulta.codigo} - ${nombrePaciente} - ${fecha}`
        };
    });

    return (
        <form onSubmit={handleSubmit}>
            <div className="forc-section-title"></div>
            <div className="forc-grid cols-2">

                {/* Consulta */}
                <div className="fc-field" style={{ gridColumn: "1 / -1" }}>
                    <label>
                        <span className="unique">*</span>Consulta
                    </label>
                    <SingleSelect
                        options={consultasOptions}
                        value={consultasOptions.find(opt => opt.value === formData.consulta_id) || null}
                        onChange={(opt) => setFormData(prev => ({ ...prev, consulta_id: opt ? opt.value : "" }))}
                        placeholder="Seleccione una consulta"
                        isClearable={false}
                        isDisabled={!!signoToEdit || readOnly}
                    />
                    {consultas.length === 0 && (
                        <small style={{ color: "#999", display: "block", marginTop: "5px" }}>
                            No hay consultas registradas para este paciente
                        </small>
                    )}
                </div>

                {/* Tipo de Sangre */}
                <div className="fc-field">
                    <label>Tipo de Sangre</label>
                    <SingleSelect
                        options={tiposSangre}
                        value={tiposSangre.find(opt => opt.value === formData.tipo_sangre) || null}
                        onChange={(opt) => setFormData(prev => ({ ...prev, tipo_sangre: opt ? opt.value : "" }))}
                        placeholder="Seleccione"
                        isClearable={true}
                        isDisabled={readOnly}
                    />
                </div>

                {/* Presión Arterial */}
                <div className="fc-field">
                    <label>Presión Arterial</label>
                    <input
                        type="text"
                        name="presion_arterial"
                        value={formData.presion_arterial}
                        onChange={handleChange}
                        placeholder="Ej: 120/80"
                        disabled={readOnly}
                    />
                    <small style={{ color: "#999", fontSize: "12px" }}>Formato: sistólica/diastólica</small>
                </div>

                {/* Frecuencia Cardíaca */}
                <div className="fc-field">
                    <label>Frecuencia Cardíaca (bpm)</label>
                    <input
                        type="number"
                        name="frecuencia_cardiaca"
                        value={formData.frecuencia_cardiaca}
                        onChange={handleChange}
                        placeholder="Ej: 72"
                        min="0"
                        disabled={readOnly}
                    />
                </div>

                {/* Frecuencia Respiratoria */}
                <div className="fc-field">
                    <label>Frecuencia Respiratoria (rpm)</label>
                    <input
                        type="number"
                        name="frecuencia_respiratoria"
                        value={formData.frecuencia_respiratoria}
                        onChange={handleChange}
                        placeholder="Ej: 16"
                        min="0"
                        disabled={readOnly}
                    />
                </div>

                {/* Temperatura */}
                <div className="fc-field">
                    <label>Temperatura (°C)</label>
                    <input
                        type="number"
                        step="0.1"
                        name="temperatura"
                        value={formData.temperatura}
                        onChange={handleChange}
                        placeholder="Ej: 36.5"
                        min="0"
                        disabled={readOnly}
                    />
                </div>

                {/* Saturación de Oxígeno */}
                <div className="fc-field">
                    <label>Saturación de Oxígeno (%)</label>
                    <input
                        type="number"
                        name="saturacion_oxigeno"
                        value={formData.saturacion_oxigeno}
                        onChange={handleChange}
                        placeholder="Ej: 98"
                        min="0"
                        max="100"
                        disabled={readOnly}
                    />
                </div>

                {/* Peso */}
                <div className="fc-field">
                    <label>Peso (kg)</label>
                    <input
                        type="number"
                        step="0.01"
                        name="peso"
                        value={formData.peso}
                        onChange={handleChange}
                        placeholder="Ej: 70.5"
                        min="0"
                        disabled={readOnly}
                    />
                </div>

                {/* Talla */}
                <div className="fc-field">
                    <label>Talla (m)</label>
                    <input
                        type="number"
                        step="0.01"
                        name="talla"
                        value={formData.talla}
                        onChange={handleChange}
                        placeholder="Ej: 1.75"
                        min="0"
                        disabled={readOnly}
                    />
                </div>
            </div>

            {/* Botones */}
            <div className="forc-actions" style={{ marginTop: 30, marginBottom: 20 }}>
                <button
                    type="button"
                    className="btn btn-outline"
                    onClick={onCancel}
                    disabled={loading}
                >
                    {readOnly ? "Cerrar" : "Cancelar"}
                </button>
                {!readOnly && (
                    <div className="forc-actions-right">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || consultas.length === 0}
                        >
                            {loading ? <Spinner size={20} /> : signoToEdit ? "Actualizar" : "Registrar"}
                        </button>
                    </div>
                )}
            </div>
        </form>
    );
}

export default ForSignosVitales;
