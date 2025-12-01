import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { BaseUrl } from "../utils/Constans";
import { useToast } from "../components/userToasd";
import Spinner from "../components/spinner";
import SingleSelect from "../components/SingleSelect";
import "../index.css";

function ForSeguimientos({ pacienteId, seguimientoToEdit, onSuccess, onCancel }) {
    const showToast = useToast();
    const [loading, setLoading] = useState(false);
    const [consultas, setConsultas] = useState([]);
    const [loadingConsultas, setLoadingConsultas] = useState(true);

    const [formData, setFormData] = useState({
        consulta_id: "",
        observaciones: "",
        recomendaciones: "",
        estado_clinico: "Estable"
    });

    // Opciones para estado clínico
    const estadosOptions = [
        { value: "Mejorando", label: "Mejorando" },
        { value: "Estable", label: "Estable" },
        { value: "En Observación", label: "En Observación" },
        { value: "Crítico", label: "Crítico" }
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
                if (consultasData.length === 1 && !seguimientoToEdit) {
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
    }, [pacienteId, seguimientoToEdit, showToast]);

    // Si hay un seguimiento a editar, cargar sus datos
    useEffect(() => {
        if (seguimientoToEdit) {
            setFormData({
                consulta_id: seguimientoToEdit.consulta_id || "",
                observaciones: seguimientoToEdit.observaciones || "",
                recomendaciones: seguimientoToEdit.recomendaciones || "",
                estado_clinico: seguimientoToEdit.estado_clinico || "Estable"
            });
        }
    }, [seguimientoToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
            const usuario_id = usuario.id;

            const dataToSend = {
                ...formData,
                usuario_id
            };

            if (seguimientoToEdit) {
                await axios.put(`${BaseUrl}seguimientos/actualizar/${seguimientoToEdit.id}`, dataToSend, { headers });
                showToast?.("Seguimiento actualizado correctamente", "success");
            } else {
                await axios.post(`${BaseUrl}seguimientos/registrar`, dataToSend, { headers });
                showToast?.("Seguimiento registrado correctamente", "success");
            }

            onSuccess?.();
        } catch (error) {
            console.error("Error al guardar seguimiento:", error);
            showToast?.(error.response?.data?.message || "Error al guardar el seguimiento", "error");
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

    // Preparar opciones de consultas para SingleSelect (IGUAL QUE ForSignosVitales)
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
            <div className="forc-grid cols-1">

                {/* Consulta */}
                <div className="fc-field">
                    <label>
                        <span className="unique">*</span> Consulta Asociada
                    </label>
                    <SingleSelect
                        options={consultasOptions}
                        value={consultasOptions.find(opt => opt.value === formData.consulta_id) || null}
                        onChange={(opt) => setFormData(prev => ({ ...prev, consulta_id: opt ? opt.value : "" }))}
                        placeholder="Seleccione una consulta"
                        isClearable={false}
                        isDisabled={!!seguimientoToEdit}
                    />
                    {consultas.length === 0 && (
                        <small style={{ color: "#999", display: "block", marginTop: "5px" }}>
                            No hay consultas registradas para este paciente
                        </small>
                    )}
                    {seguimientoToEdit && (
                        <small style={{ color: "#999", display: "block", marginTop: "5px" }}>
                            No se puede cambiar la consulta asociada al editar
                        </small>
                    )}
                </div>

                {/* Estado Clínico */}
                <div className="fc-field">
                    <label>
                        <span className="unique">*</span> Estado Clínico
                    </label>
                    <SingleSelect
                        options={estadosOptions}
                        value={estadosOptions.find(opt => opt.value === formData.estado_clinico) || null}
                        onChange={(opt) => setFormData(prev => ({ ...prev, estado_clinico: opt ? opt.value : "Estable" }))}
                        placeholder="Seleccione el estado clínico"
                        isClearable={false}
                    />
                </div>

                {/* Observaciones */}
                <div className="fc-field">
                    <label>Observaciones</label>
                    <textarea
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Describa las observaciones del seguimiento..."
                        className="fc-input"
                    />
                </div>

                {/* Recomendaciones */}
                <div className="fc-field">
                    <label>Recomendaciones</label>
                    <textarea
                        name="recomendaciones"
                        value={formData.recomendaciones}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Indique las recomendaciones para el paciente..."
                        className="fc-input"
                    />
                </div>

            </div>

            {/* Botones */}
            <div className="forc-actions">
                <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={loading}>
                    Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Guardando..." : (seguimientoToEdit ? "Actualizar" : "Registrar")}
                </button>
            </div>
        </form>
    );
}

ForSeguimientos.propTypes = {
    pacienteId: PropTypes.string.isRequired,
    seguimientoToEdit: PropTypes.object,
    onSuccess: PropTypes.func,
    onCancel: PropTypes.func
};

export default ForSeguimientos;
