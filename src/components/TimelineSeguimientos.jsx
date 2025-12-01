import React, { useState } from "react";
import PropTypes from "prop-types";
import "./TimelineSeguimientos.css";

function TimelineSeguimientos({ seguimientos, onRegistrarSeguimiento, onVerConsulta }) {
    const [expandedId, setExpandedId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 5;

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getEstadoColor = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'mejorando':
                return '#10b981'; // Verde
            case 'estable':
                return '#3b82f6'; // Azul
            case 'crítico':
            case 'critico':
                return '#ef4444'; // Rojo
            case 'en observación':
            case 'en observacion':
                return '#f59e0b'; // Naranja
            default:
                return '#6b7280'; // Gris
        }
    };

    const formatFecha = (fecha) => {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!seguimientos || seguimientos.length === 0) {
        return (
            <div className="timeline-empty">
                <p>No hay seguimientos registrados para este paciente.</p>
                <button
                    className="btn btn-primary"
                    onClick={() => onRegistrarSeguimiento(null)}
                >
                    Registrar Primer Seguimiento
                </button>
            </div>
        );
    }

    // Lógica de paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = seguimientos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(seguimientos.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="timeline-container">
            <div className="timeline-header">
                <h3>Línea de Tiempo de Consultas</h3>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onRegistrarSeguimiento(null)}
                >
                    + Nuevo Seguimiento
                </button>
            </div>

            <div className="timeline">
                {currentItems.map((seg, index) => {
                    // Calcular el número real del item considerando la paginación
                    const realIndex = indexOfFirstItem + index;
                    const itemNumber = seguimientos.length - realIndex;

                    return (
                        <div key={seg.id} className="timeline-item">
                            <div className="timeline-marker" style={{ backgroundColor: getEstadoColor(seg.estado_clinico) }}>
                                <span className="timeline-number">{itemNumber}</span>
                            </div>

                            <div className={`timeline-content ${expandedId === seg.id ? 'expanded' : ''}`}>
                                <div className="timeline-card" onClick={() => toggleExpand(seg.id)}>
                                    <div className="timeline-card-header">
                                        <div>
                                            <h4>{seg.codigo ? `Consulta: ${seg.codigo}` : 'Consulta General'}</h4>
                                            <p className="timeline-date">{formatFecha(seg.fecha_atencion || seg.fecha_registro)}</p>
                                        </div>
                                        <div className="timeline-badge" style={{ backgroundColor: getEstadoColor(seg.estado_clinico) }}>
                                            {seg.estado_clinico || 'Sin estado'}
                                        </div>
                                    </div>

                                    {expandedId === seg.id && (
                                        <div className="timeline-card-body">
                                            <div className="timeline-section">
                                                <strong>Diagnóstico de Consulta:</strong>
                                                <p>{seg.diagnostico_consulta || 'No especificado'}</p>
                                            </div>

                                            {seg.observaciones && (
                                                <div className="timeline-section">
                                                    <strong>Observaciones:</strong>
                                                    <p>{seg.observaciones}</p>
                                                </div>
                                            )}

                                            {seg.recomendaciones && (
                                                <div className="timeline-section">
                                                    <strong>Recomendaciones:</strong>
                                                    <p>{seg.recomendaciones}</p>
                                                </div>
                                            )}

                                            {seg.medico_nombre && (
                                                <div className="timeline-section">
                                                    <strong>Médico:</strong>
                                                    <p>Dr. {seg.medico_nombre} {seg.medico_apellido}</p>
                                                </div>
                                            )}

                                            <div className="timeline-actions" style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                                                <button
                                                    className="btn btn-outline btn-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRegistrarSeguimiento(seg);
                                                    }}
                                                >
                                                    Editar Seguimiento
                                                </button>

                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (onVerConsulta) {
                                                            onVerConsulta(seg.consulta_id);
                                                        }
                                                    }}
                                                >
                                                    Ver Consulta
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Controles de Paginación */}
            {totalPages > 1 && (
                <div className="pagination-controls" style={{ display: "flex", justifyContent: "center", gap: "5px", marginTop: "20px" }}>
                    <button
                        className="btn btn-outline btn-sm"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            className={`btn btn-sm ${currentPage === i + 1 ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => paginate(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        className="btn btn-outline btn-sm"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
}

TimelineSeguimientos.propTypes = {
    seguimientos: PropTypes.array.isRequired,
    onRegistrarSeguimiento: PropTypes.func.isRequired,
    onVerConsulta: PropTypes.func
};

export default TimelineSeguimientos;
