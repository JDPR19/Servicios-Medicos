import React, { useState, useEffect } from "react";
import axios from "axios";
import { BaseUrl } from "../utils/Constans";
import { useToast } from "../components/userToasd";
import Spinner from "../components/spinner";
import SingleSelect from "../components/SingleSelect";
import { jwtDecode } from "jwt-decode";
import "../index.css";

function ForReposos({ pacienteId, onSuccess, onCancel, reposoToEdit = null, readOnly = false }) {
    const showToast = useToast();
    const [loading, setLoading] = useState(false);
    const [consultas, setConsultas] = useState([]);
    const [loadingConsultas, setLoadingConsultas] = useState(true);
    const [diasCalculados, setDiasCalculados] = useState(0);

    const [formData, setFormData] = useState({
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: "",
        hora_fin: "",
        diagnostico: "",
        observacion: "",
        consulta_id: "",
        estado: "activo"
    });

    // Cargar consultas del paciente
    useEffect(() => {
        const fetchConsultas = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const response = await axios.get(`${BaseUrl}consultas/paciente/${pacienteId}`, { headers });
                const consultasData = response.data || [];
                setConsultas(consultasData);

                // Si solo hay una consulta y estamos creando, pre-seleccionarla
                if (consultasData.length === 1 && !reposoToEdit) {
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
    }, [pacienteId, reposoToEdit]);

    // Cargar datos si se está editando
    useEffect(() => {
        if (reposoToEdit) {
            setFormData({
                fecha_inicio: reposoToEdit.fecha_inicio ? reposoToEdit.fecha_inicio.split('T')[0] : "",
                fecha_fin: reposoToEdit.fecha_fin ? reposoToEdit.fecha_fin.split('T')[0] : "",
                hora_fin: reposoToEdit.hora_fin || "",
                diagnostico: reposoToEdit.diagnostico || "",
                observacion: reposoToEdit.observacion || "",
                consulta_id: reposoToEdit.consulta_id || "",
                estado: reposoToEdit.estado || "activo"
            });
        }
    }, [reposoToEdit]);

    // Calcular días de reposo cuando cambian las fechas
    useEffect(() => {
        if (formData.fecha_inicio && formData.fecha_fin) {
            const inicio = new Date(formData.fecha_inicio);
            const fin = new Date(formData.fecha_fin);

            if (fin >= inicio) {
                const diffTime = Math.abs(fin - inicio);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir el día de inicio
                setDiasCalculados(diffDays);
            } else {
                setDiasCalculados(0);
            }
        } else {
            setDiasCalculados(0);
        }
    }, [formData.fecha_inicio, formData.fecha_fin]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (readOnly) return;

        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Validaciones
            if (!formData.consulta_id) {
                showToast?.("Debe seleccionar una consulta asociada", "error");
                setLoading(false);
                return;
            }

            if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
                showToast?.("La fecha fin no puede ser menor a la fecha de inicio", "error");
                setLoading(false);
                return;
            }

            // Obtener ID de usuario del token
            let usuarios_id = null;
            if (token) {
                const decoded = jwtDecode(token);
                usuarios_id = decoded.id;
            }

            const dataToSend = {
                ...formData,
                pacientes_id: parseInt(pacienteId),
                usuarios_id: usuarios_id,
                consulta_id: parseInt(formData.consulta_id)
            };

            if (reposoToEdit) {
                await axios.put(`${BaseUrl}reposos/actualizar/${reposoToEdit.id}`, dataToSend, { headers });
                showToast?.("Reposo actualizado correctamente", "success");
            } else {
                await axios.post(`${BaseUrl}reposos/registrar`, dataToSend, { headers });
                showToast?.("Reposo registrado correctamente", "success");
            }

            onSuccess?.();
        } catch (error) {
            console.error("Error al guardar reposo:", error);
            showToast?.(error.response?.data?.message || "Error al guardar el reposo", "error");
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

    const consultasOptions = consultas.map(consulta => {
        const fecha = new Date(consulta.fecha_atencion).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        return {
            value: consulta.id,
            label: `${consulta.codigo} - ${fecha}`
        };
    });

    return (
        <form onSubmit={handleSubmit}>
            <div className="forc-section-title"></div>

            <div className="forc-grid cols-2">
                {/* Consulta */}
                <div className="fc-field" style={{ gridColumn: "1 / -1" }}>
                    <label><span className="unique">*</span>Consulta Asociada</label>
                    <SingleSelect
                        options={consultasOptions}
                        value={consultasOptions.find(opt => opt.value === formData.consulta_id) || null}
                        onChange={(opt) => setFormData(prev => ({ ...prev, consulta_id: opt ? opt.value : "" }))}
                        placeholder="Seleccione la consulta médica..."
                        isDisabled={!!reposoToEdit || readOnly}
                    />
                    {consultas.length === 0 && (
                        <small style={{ color: "red", marginTop: 5 }}>
                            Es necesario registrar una consulta médica antes de crear un reposo.
                        </small>
                    )}
                </div>

                {/* Fechas */}
                <div className="fc-field">
                    <label><span className="unique">*</span>Fecha Inicio</label>
                    <input
                        type="date"
                        name="fecha_inicio"
                        value={formData.fecha_inicio}
                        onChange={handleChange}
                        required
                        disabled={readOnly}
                    />
                </div>

                <div className="fc-field">
                    <label><span className="unique">*</span>Fecha Fin</label>
                    <input
                        type="date"
                        name="fecha_fin"
                        value={formData.fecha_fin}
                        onChange={handleChange}
                        required
                        disabled={readOnly}
                        min={formData.fecha_inicio}
                    />
                </div>

                <div className="fc-field">
                    <label>Hora Fin (Opcional)</label>
                    <input
                        type="time"
                        name="hora_fin"
                        value={formData.hora_fin}
                        onChange={handleChange}
                        disabled={readOnly}
                    />
                </div>

                {/* Indicador de días - Ahora ocupa el espacio a la derecha de la hora */}
                <div className="fc-field" style={{ display: "flex", alignItems: "flex-end" }}>
                    {diasCalculados > 0 ? (
                        <div style={{
                            width: "100%",
                            backgroundColor: "#e0f2fe",
                            padding: "10px",
                            borderRadius: "8px",
                            color: "#0369a1",
                            fontWeight: "bold",
                            textAlign: "center",
                            height: "42px", // Altura similar al input para alinear
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            Duración: {diasCalculados} día{diasCalculados !== 1 ? 's' : ''}
                        </div>
                    ) : (
                        <div style={{ padding: "10px", color: "#9ca3af", fontStyle: "italic", textAlign: "center", width: "100%" }}>
                            Seleccione fechas para calcular días
                        </div>
                    )}
                </div>

                {/* Diagnóstico */}
                <div className="fc-field" style={{ gridColumn: "1 / -1" }}>
                    <label>Diagnóstico</label>
                    <textarea
                        name="diagnostico"
                        value={formData.diagnostico}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Diagnóstico que justifica el reposo..."
                        disabled={readOnly}
                    />
                </div>

                {/* Observación */}
                <div className="fc-field" style={{ gridColumn: "1 / -1" }}>
                    <label>Observaciones</label>
                    <textarea
                        name="observacion"
                        value={formData.observacion}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Indicaciones adicionales..."
                        disabled={readOnly}
                    />
                </div>

                {/* Estado (Solo visible si se edita) */}
                {reposoToEdit && !readOnly && (
                    <div className="fc-field">
                        <label>Estado</label>
                        <select
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="activo">Activo</option>
                            <option value="finalizado">Finalizado</option>
                            <option value="anulado">Anulado</option>
                        </select>
                    </div>
                )}
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
                            {loading ? <Spinner size={20} /> : reposoToEdit ? "Actualizar" : "Registrar Reposo"}
                        </button>
                    </div>
                )}
            </div>
        </form>
    );
}

export default ForReposos;
