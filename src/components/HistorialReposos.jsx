import React from "react";
import "../index.css";

function HistorialReposos({ reposos, onVerDetalle, onClose }) {
    if (!reposos || reposos.length === 0) {
        return (
            <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                <p>No hay reposos registrados para este paciente.</p>
                <button className="btn btn-outline" onClick={onClose} style={{ marginTop: "20px" }}>
                    Cerrar
                </button>
            </div>
        );
    }

    const getEstadoBadge = (estado) => {
        const estilos = {
            activo: { bg: '#dcfce7', color: '#166534' },
            finalizado: { bg: '#e0e7ff', color: '#1e40af' },
            anulado: { bg: '#fee2e2', color: '#991b1b' }
        };
        const estilo = estilos[estado] || { bg: '#f3f4f6', color: '#374151' };

        return (
            <span style={{
                padding: "4px 10px",
                borderRadius: "4px",
                fontSize: "12px",
                backgroundColor: estilo.bg,
                color: estilo.color,
                fontWeight: "600",
                textTransform: "uppercase"
            }}>
                {estado}
            </span>
        );
    };

    const calcularTiempoRestante = (fechaFin, horaFin) => {
        const fin = new Date(fechaFin);
        if (horaFin) {
            const [h, m] = horaFin.split(':');
            fin.setHours(parseInt(h), parseInt(m), 0);
        } else {
            fin.setHours(23, 59, 59);
        }

        const ahora = new Date();
        const diff = fin - ahora;

        if (diff <= 0) return "Vencido";

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hr = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (d > 0) return `${d}d ${hr}h`;
        return `${hr}h`;
    };

    return (
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <div style={{ marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#1f2937" }}>
                    Historial de Reposos ({reposos.length})
                </h4>
                <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
                    Mostrando todos los reposos médicos registrados
                </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {reposos.map((reposo, index) => (
                    <div
                        key={reposo.id}
                        style={{
                            backgroundColor: index === 0 ? "#fefce8" : "white",
                            border: index === 0 ? "2px solid #fbbf24" : "1px solid #e5e7eb",
                            borderRadius: "8px",
                            padding: "16px",
                            transition: "all 0.2s ease",
                            cursor: "pointer"
                        }}
                        onClick={() => onVerDetalle?.(reposo)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.transform = "translateY(0)";
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                {index === 0 && (
                                    <span style={{
                                        fontSize: "11px",
                                        backgroundColor: "#fbbf24",
                                        color: "#78350f",
                                        padding: "3px 8px",
                                        borderRadius: "4px",
                                        fontWeight: "700"
                                    }}>
                                        MÁS RECIENTE
                                    </span>
                                )}
                                {getEstadoBadge(reposo.estado)}
                            </div>

                            {reposo.estado === 'activo' && (
                                <span style={{
                                    fontSize: "12px",
                                    color: "#dc2626",
                                    fontWeight: "600",
                                    backgroundColor: "#fee2e2",
                                    padding: "4px 10px",
                                    borderRadius: "4px"
                                }}>
                                    ⏱️ {calcularTiempoRestante(reposo.fecha_fin, reposo.hora_fin)}
                                </span>
                            )}
                        </div>

                        {/* Código */}
                        {reposo.codigo && (
                            <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#6b7280" }}>
                                <strong>Código:</strong> {reposo.codigo}
                            </p>
                        )}

                        {/* Fechas */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                            <div>
                                <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>Desde</p>
                                <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                                    {new Date(reposo.fecha_inicio).toLocaleDateString('es-ES', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>Hasta</p>
                                <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                                    {new Date(reposo.fecha_fin).toLocaleDateString('es-ES', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                    })}
                                    {reposo.hora_fin && (
                                        <span style={{ marginLeft: "6px", color: "#059669", fontSize: "13px" }}>
                                            {reposo.hora_fin}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Duración */}
                        <p style={{ margin: "8px 0", fontSize: "13px", color: "#6b7280" }}>
                            <strong>Duración:</strong> {reposo.dias_reposo || 'N/A'} día{reposo.dias_reposo !== 1 ? 's' : ''}
                        </p>

                        {/* Diagnóstico */}
                        {reposo.diagnostico && (
                            <div style={{
                                marginTop: "10px",
                                padding: "8px 12px",
                                backgroundColor: "#f9fafb",
                                borderLeft: "3px solid #3b82f6",
                                borderRadius: "4px"
                            }}>
                                <p style={{ margin: 0, fontSize: "13px", color: "#374151", fontStyle: "italic" }}>
                                    {reposo.diagnostico}
                                </p>
                            </div>
                        )}

                        {/* Indicador de clic */}
                        <div style={{ marginTop: "12px", textAlign: "right" }}>
                            <span style={{ fontSize: "12px", color: "#3b82f6", fontWeight: "500" }}>
                                Click para ver detalles →
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Botón cerrar */}
            <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button className="btn btn-outline" onClick={onClose}>
                    Cerrar
                </button>
            </div>
        </div>
    );
}

export default HistorialReposos;
