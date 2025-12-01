import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { BaseUrl } from "../utils/Constans";
import Spinner from "../components/spinner";

function DetalleConsulta({ consultaId, onClose }) {
    const [consulta, setConsulta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchConsulta = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const response = await axios.get(`${BaseUrl}consultas/ver/${consultaId}`, { headers });
                setConsulta(response.data);
            } catch (err) {
                console.error("Error cargando consulta:", err);
                setError("No se pudo cargar la información de la consulta.");
            } finally {
                setLoading(false);
            }
        };

        if (consultaId) {
            fetchConsulta();
        }
    }, [consultaId]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                <Spinner size={40} label="Cargando detalles..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error" style={{ padding: "20px", textAlign: "center", color: "#991b1b" }}>
                {error}
            </div>
        );
    }

    if (!consulta) return null;

    return (
        <div style={{ padding: "10px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                    <label style={{ fontWeight: "bold", color: "#555", fontSize: "12px", display: "block" }}>CÓDIGO</label>
                    <p style={{ margin: "5px 0", fontSize: "16px" }}>{consulta.codigo}</p>
                </div>
                <div>
                    <label style={{ fontWeight: "bold", color: "#555", fontSize: "12px", display: "block" }}>FECHA DE ATENCIÓN</label>
                    <p style={{ margin: "5px 0", fontSize: "16px" }}>
                        {new Date(consulta.fecha_atencion).toLocaleDateString('es-ES', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </p>
                </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <label style={{ fontWeight: "bold", color: "#555", fontSize: "12px", display: "block" }}>ENFERMEDAD DETECTADA</label>
                <div style={{ backgroundColor: "#f9fafb", padding: "12px", borderRadius: "6px", marginTop: "5px", border: "1px solid #e5e7eb" }}>
                    {consulta.enfermedad_nombre || "No registrada"}
                </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <label style={{ fontWeight: "bold", color: "#555", fontSize: "12px", display: "block" }}>DIAGNÓSTICO</label>
                <div style={{ backgroundColor: "#f0f9ff", padding: "12px", borderRadius: "6px", marginTop: "5px", border: "1px solid #bae6fd", color: "#0369a1" }}>
                    {consulta.diagnostico || "No registrado"}
                </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <label style={{ fontWeight: "bold", color: "#555", fontSize: "12px", display: "block" }}>TRATAMIENTOS</label>
                <div style={{ backgroundColor: "#f9fafb", padding: "12px", borderRadius: "6px", marginTop: "5px", border: "1px solid #e5e7eb" }}>
                    {consulta.tratamientos || "No registrado"}
                </div>
            </div>

            {consulta.medicamentos && consulta.medicamentos.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                    <label style={{ fontWeight: "bold", color: "#555", fontSize: "12px", display: "block" }}>MEDICAMENTOS RECETADOS</label>
                    <div style={{ marginTop: "5px", border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                            <thead style={{ backgroundColor: "#f3f4f6" }}>
                                <tr>
                                    <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Nombre</th>
                                    <th style={{ padding: "8px", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>Presentación</th>
                                    <th style={{ padding: "8px", textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>Cantidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {consulta.medicamentos.map((med, index) => (
                                    <tr key={index} style={{ borderBottom: index < consulta.medicamentos.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                                        <td style={{ padding: "8px" }}>{med.medicamento_nombre}</td>
                                        <td style={{ padding: "8px" }}>{med.medicamento_presentacion} ({med.medicamentos_miligramos})</td>
                                        <td style={{ padding: "8px", textAlign: "center" }}>{med.cantidad_utilizada}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: "20px" }}>
                <label style={{ fontWeight: "bold", color: "#555", fontSize: "12px", display: "block" }}>OBSERVACIONES</label>
                <div style={{ backgroundColor: "#f9fafb", padding: "12px", borderRadius: "6px", marginTop: "5px", border: "1px solid #e5e7eb" }}>
                    {consulta.observaciones || "No registrado"}
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
                <button className="btn btn-secondary" onClick={onClose}>
                    Cerrar
                </button>
            </div>
        </div>
    );
}

DetalleConsulta.propTypes = {
    consultaId: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired
};

export default DetalleConsulta;
