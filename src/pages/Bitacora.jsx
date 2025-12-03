import React, { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import { BaseUrl } from '../utils/Constans';
import Spinner from "../components/spinner";
// import icon from "../components/icon";
import Table from "../components/Tablas";
import InfoModal from "../components/InfoModal";
import { useToast } from "../components/userToasd";
import { usePermiso } from "../utils/usePermiso";

function Bitacora() {
    const TienePermiso = usePermiso();
    const [loading, setLoading] = useState(false);
    const [showBitacora, setShowBitacora] = useState(null);
    const [bitacora, setBitacora] = useState([]);
    const [filters, setFilters] = useState({ estado: "todos", q: "" });
    const ShowToast = useToast();

    const getAuthorization = () => {
        const token = (localStorage.getItem('token') || '').trim();
        return token ? { Authorization: `Bearer ${token} ` } : {};
    }

    const filtered = useMemo(() => {
        const q = filters.q.trim().toLowerCase();
        return bitacora.filter(b => {
            const matchQ = !q ||
                (b.fecha && b.fecha.toLowerCase().includes(q)) ||
                (b.accion && b.accion.toLowerCase().includes(q)) ||
                (b.tabla && b.tabla.toLowerCase().includes(q)) ||
                (b.usuario && b.usuario.toLowerCase().includes(q)) ||
                (b.descripcion && b.descripcion.toLowerCase().includes(q));
            return matchQ;
        });
    }, [bitacora, filters]);

    const handleVerDetalle = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}bitacora/${id}`, { headers: getAuthorization() });
            setShowBitacora(response.data);
        } catch (error) {
            ShowToast?.('Error al obtener detalles', 'error');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { accessor: "fecha", header: "Fecha", key: "fecha" },
        { accessor: "accion", header: "Acción", key: "accion" },
        { accessor: "tabla", header: "Tabla", key: "tabla" },
        { accessor: "usuario", header: "Usuario", key: "usuario" },
        { accessor: "descripcion", header: "Descripción", key: "descripcion" },
        {
            header: "Acciones",
            render: (row) => (

                <div className="row-actions" style={{ display: 'flex', gap: 8 }}>
                    {TienePermiso('bitacora', 'ver') && (
                        <button className="btn btn-xs btn-outline btn-view" title="Ver Detalles" onClick={() => handleVerDetalle(row.id)}>Ver</button>
                    )}
                </div>

            )
        },
    ];

    const fecthBitacora = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}bitacora`, { headers: getAuthorization() });
            const data = response.data;
            if (!Array.isArray(data)) {
                console.warn('Respuesta inesperada /bitacora', data);
                setBitacora([]);
                ShowToast?.('Respuesta inesperada del servidor', 'error', 4000);
            } else {
                setBitacora(data);
            }
        } catch (error) {
            const msg = error?.response?.data?.message || 'Error al obtener todos los datos'
            ShowToast?.(msg, 'error');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fecthBitacora();
    }, []);

    // Función para limpiar datos sensibles o irrelevantes
    const cleanData = (data) => {
        if (!data) return null;
        const sensitiveKeys = ['token', 'ip', 'user_agent', 'permisos', 'roles', 'password', 'iat', 'exp'];

        // Si es un objeto, filtrar sus claves
        if (typeof data === 'object' && data !== null) {
            const cleaned = { ...data };
            sensitiveKeys.forEach(key => delete cleaned[key]);

            // Si tiene 'nuevos' y 'antiguos' (estructura de actualización), limpiar recursivamente
            if (cleaned.nuevos) cleaned.nuevos = cleanData(cleaned.nuevos);
            if (cleaned.antiguos) cleaned.antiguos = cleanData(cleaned.antiguos);

            return cleaned;
        }
        return data;
    };

    return (
        <div className="pac-page">
            {loading && (
                <div className="spinner-overlay">
                    <Spinner size={50} label='Cargando Bitácora...' />
                </div>
            )}

            <InfoModal
                isOpen={!!showBitacora}
                onClose={() => setShowBitacora(null)}
                title="Información de Movimientos"
            >
                {showBitacora && (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        <li><b>Fecha: </b>{showBitacora.fecha}</li>
                        <li><b>Acción: </b>{showBitacora.accion}</li>
                        <li><b>Tabla: </b>{showBitacora.tabla}</li>
                        <li>
                            <b>Usuario: </b>
                            {typeof showBitacora.usuario === 'object'
                                ? (showBitacora.usuario?.nombre || showBitacora.usuario?.id || showBitacora.usuario_id || 'N/A')
                                : (showBitacora.usuario || 'N/A')}
                        </li>
                        <li><b>Descripción: </b>{showBitacora.descripcion}</li>
                        <li>
                            <b>Datos:</b>
                            {(() => {
                                const data = cleanData(showBitacora.datos);
                                if (!data) return ' N/A';

                                // Caso 1: Comparación Antiguos vs Nuevos
                                if (data.nuevos || data.antiguos) {
                                    const allKeys = new Set([
                                        ...Object.keys(data.antiguos || {}),
                                        ...Object.keys(data.nuevos || {})
                                    ]);

                                    return (
                                        <div style={{ marginTop: '10px', overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid #ddd' }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                                                        <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Campo</th>
                                                        <th style={{ padding: '8px', borderBottom: '2px solid #ddd', color: '#d32f2f' }}>Antes</th>
                                                        <th style={{ padding: '8px', borderBottom: '2px solid #ddd', color: '#388e3c' }}>Después</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Array.from(allKeys).map(key => {
                                                        const valOld = data.antiguos?.[key];
                                                        const valNew = data.nuevos?.[key];
                                                        const isDiff = JSON.stringify(valOld) !== JSON.stringify(valNew);

                                                        return (
                                                            <tr key={key} style={{ backgroundColor: isDiff ? '#fff' : '#fafafa' }}>
                                                                <td style={{ padding: '6px 8px', borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#555' }}>{key}</td>
                                                                <td style={{ padding: '6px 8px', borderBottom: '1px solid #eee', color: '#555', backgroundColor: isDiff ? '#ffebee' : 'transparent' }}>
                                                                    {typeof valOld === 'object' ? JSON.stringify(valOld) : String(valOld ?? '-')}
                                                                </td>
                                                                <td style={{ padding: '6px 8px', borderBottom: '1px solid #eee', color: '#555', backgroundColor: isDiff ? '#e8f5e9' : 'transparent' }}>
                                                                    {typeof valNew === 'object' ? JSON.stringify(valNew) : String(valNew ?? '-')}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                }

                                return (
                                    <div style={{ marginTop: '8px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
                                        {Object.entries(data).map(([key, value]) => (
                                            <div key={key} style={{ marginBottom: '4px', fontSize: '12px' }}>
                                                <span style={{ fontWeight: 'bold', color: '#444' }}>{key}: </span>
                                                <span style={{ color: '#666' }}>
                                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </li>
                    </ul>
                )}
            </InfoModal>

            {/* <section className="quick-actions2">
                <div className="pac-toolbar">
                    <div className="field">
                        <img src={icon.lupa2} alt="Buscador...." className="field-icon" />
                        <input
                            type="text"
                            placeholder="Buscar por fecha, descripción, acción, tabla o usuario"
                            value={filters.q}
                            onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
                        />
                    </div>
                </div>
            </section> */}

            <div className="table-wrap">
                <Table
                    columns={columns}
                    data={filtered}
                    rowsPerPage={12}
                />
            </div>
        </div>
    );
}

export default Bitacora;