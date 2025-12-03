import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import '../index.css';
import Card from "../components/Card";
import Tablas from "../components/Tablas";
import icon from "../components/icon";
import { useToast } from "../components/userToasd";
import Spinner from "../components/spinner";
import { BaseUrl } from "../utils/Constans";
import FormModal from "../components/FormModal";
import ForAtenciones from "../Formularios/ForAtenciones";
import ConfirmModal from '../components/ConfirmModal'
import ForCitas from "../Formularios/ForCitas";
import SingleSelect from "../components/SingleSelect";
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { usePermiso } from '../utils/usePermiso';

function Atenciones() {
    const showToast = useToast();
    const TienePermiso = usePermiso();
    const [atenciones, setAtenciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedIdToDelete, setSelectedIdToDelete] = useState(null);
    const [filters, setFilters] = useState({ estatus: "todos", periodo: "todos" });
    const [pdfUrl, setPdfUrl] = useState(null);

    // Para agendar cita desde atención
    const [citaModalOpen, setCitaModalOpen] = useState(false);
    const [atencionToAgenda, setAtencionToAgenda] = useState(null);

    const fetchAtenciones = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BaseUrl}atenciones`, { headers: { Authorization: `Bearer ${token}` } });
            setAtenciones(response.data);
        } catch (error) {
            console.error(error);
            showToast("Error cargando atenciones", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAtenciones();
    }, []);

    const handleNew = () => {
        setEditData(null);
        setModalOpen(true);
    };

    const handleEdit = (row) => {
        setEditData(row);
        setModalOpen(true);
    };

    const handleAgendar = (row) => {
        setAtencionToAgenda(row);
        setCitaModalOpen(true);
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${BaseUrl}atenciones/eliminar/${selectedIdToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
            showToast("Atención eliminada", "success");
            fetchAtenciones();
        } catch (error) {
            console.error(error);
            showToast("Error eliminando atención", "error");
        } finally {
            setLoading(false);
            setConfirmModalOpen(false);
        }
    };

    const openConfirmDelete = (id) => {
        setSelectedIdToDelete(id);
        setConfirmModalOpen(true);
    };

    const handlePreviewPDF = () => {
        const docBlob = exportToPDF({
            data: filteredAtenciones,
            columns: exportColumns,
            fileName: "atenciones.pdf",
            title: "Listado de Atenciones",
            preview: true
        });
        if (docBlob) {
            const url = URL.createObjectURL(docBlob);
            setPdfUrl(url);
        }
    };

    const handleExportExcel = () => {
        exportToExcel({
            data: filteredAtenciones,
            columns: exportColumns,
            fileName: "atenciones.xlsx",
            count: true,
            totalLabel: "TOTAL DE ATENCIONES"
        });
    };

    const estatusOptions = [
        { value: "todos", label: "Estatus" },
        { value: "pendiente", label: "Pendiente" },
        { value: "atendida", label: "Atendida" },
        { value: "cancelada", label: "Cancelada" }
    ];

    const periodoOptions = [
        { value: "todos", label: "Todo el tiempo" },
        { value: "hoy", label: "Hoy" },
        { value: "semana", label: "Esta Semana" }
    ];

    const filteredAtenciones = useMemo(() => {
        return atenciones.filter(a => {
            const matchesEstatus = filters.estatus === "todos" || a.estatus.toLowerCase() === filters.estatus.toLowerCase();

            let matchesPeriodo = true;
            if (filters.periodo !== 'todos') {
                const date = new Date(a.fecha_registro);
                const today = new Date();
                date.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);

                if (filters.periodo === 'hoy') {
                    matchesPeriodo = date.getTime() === today.getTime();
                } else if (filters.periodo === 'semana') {
                    const startOfWeek = new Date(today);
                    const dayOfWeek = today.getDay() || 7; // 1 (Mon) - 7 (Sun)
                    startOfWeek.setDate(today.getDate() - dayOfWeek + 1);

                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);

                    matchesPeriodo = date >= startOfWeek && date <= endOfWeek;
                }
            }

            return matchesEstatus && matchesPeriodo;
        });
    }, [atenciones, filters]);

    const columns = [
        { header: "Fecha", key: "fecha", render: (row) => row.fecha_registro.split('T')[0] },
        { header: "Solicitante", key: "solicitante", render: (row) => row.nombre_solicitante || row.paciente_nombre + ' ' + row.paciente_apellido },
        { header: "Motivo", accessor: "motivo" },
        { header: "Prioridad", accessor: "prioridad", render: (row) => <span className={`badge badge--${row.prioridad === 'alta' ? 'drop' : row.prioridad === 'media' ? 'warn' : 'success'}`}>{row.prioridad}</span> },
        {
            header: "Estatus",
            accessor: "estatus",
            render: (row) => {
                let badgeClass = "badge";
                const status = (row.estatus || "").toLowerCase();
                if (status === "atendida") badgeClass += " badge--success";
                else if (status === "pendiente") badgeClass += " badge--warn";
                else if (status === "cancelada") badgeClass += " badge--drop";
                return <span className={badgeClass}>{row.estatus}</span>;
            }
        },
        {
            header: "Acciones",
            render: (row) => (
                <div className="row-actions">
                    {TienePermiso("atenciones", "editar") && (
                        <button className="btn btn-xs btn-outline" onClick={() => handleEdit(row)}>Editar</button>
                    )}
                    {TienePermiso('atenciones', 'eliminar') && (
                        <button className="btn btn-xs btn-outline btn-danger" onClick={() => openConfirmDelete(row.id)}>Eliminar</button>
                    )}
                    {TienePermiso('atenciones', 'agendar') && row.estatus === 'pendiente' && (
                        <button
                            className="btn btn-xs btn-primary"
                            onClick={() => handleAgendar(row)}
                        >
                            Agendar Cita
                        </button>
                    )}
                </div>
            )
        }
    ];

    const exportColumns = [
        { header: "N°", key: "orden", render: (_row, idx) => idx + 1 },
        { header: "Fecha", key: "fecha_registro", render: (row) => row.fecha_registro.split('T')[0] },
        { header: "Solicitante", key: "solicitante", render: (row) => row.nombre_solicitante || row.paciente_nombre + ' ' + row.paciente_apellido },
        { header: "Motivo", key: "motivo" },
        { header: "Prioridad", key: "prioridad" },
        { header: "Estatus", key: "estatus" }
    ];

    return (
        <div className="pac-page">
            {loading && <div className="spinner-overlay"><Spinner /></div>}

            <section className="card-container">
                <Card color="#0033A0" title="Total Atenciones">
                    <img src={icon.user3} className="icon-card" />
                    <span className="number">{atenciones.length}</span>
                    <h3>Registradas</h3>
                </Card>
                <Card color="#CE1126" title="Pendientes">
                    <img src={icon.user5} className="icon-card" />
                    <span className="number">{atenciones.filter(a => a.estatus === 'pendiente').length}</span>
                    <h3>Por Agendar</h3>
                </Card>
            </section>

            <section className="quick-actions2">
                <div className="pac-toolbar">
                    <div className="filters">
                        <div style={{ width: 200 }}>
                            <SingleSelect
                                options={estatusOptions}
                                value={estatusOptions.find(opt => opt.value === filters.estatus)}
                                onChange={opt => setFilters({ ...filters, estatus: opt ? opt.value : "todos" })}
                                isClearable={false}
                                placeholder="Filtrar por Estatus"
                            />
                        </div>
                        <div style={{ width: 200, marginLeft: 10 }}>
                            <SingleSelect
                                options={periodoOptions}
                                value={periodoOptions.find(opt => opt.value === filters.periodo)}
                                onChange={opt => setFilters({ ...filters, periodo: opt ? opt.value : "todos" })}
                                isClearable={false}
                                placeholder="Filtrar por Periodo"
                            />
                        </div>
                    </div>
                    <div className="actions">
                        {TienePermiso('atenciones', 'exportar') && (
                            <button className="btn btn-secondary" onClick={handlePreviewPDF}>
                                <img src={icon.pdf1} className='btn-icon' style={{ marginRight: 5 }} />
                                PDF
                            </button>
                        )}
                        {TienePermiso('atenciones', 'exportar') && (
                            <button className="btn btn-secondary" onClick={handleExportExcel}>
                                <img src={icon.excel} className='btn-icon' style={{ marginRight: 5 }} />
                                Excel
                            </button>
                        )}
                        {TienePermiso('atenciones', 'crear') && (
                            <button className="btn btn-primary" onClick={handleNew} >
                                <img src={icon.user5} className='btn-icon' style={{ marginRight: 5 }} />
                                Nueva Atención
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <div className="table-wrap">
                <Tablas columns={columns} data={filteredAtenciones} />
            </div>

            <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editData ? "Editar Atención" : "Nueva Atención"}>
                <ForAtenciones
                    atencionToEdit={editData}
                    onSuccess={() => { setModalOpen(false); fetchAtenciones(); }}
                    onCancel={() => setModalOpen(false)}
                />
            </FormModal>

            <FormModal isOpen={citaModalOpen} onClose={() => setCitaModalOpen(false)} title="Agendar Cita">
                <ForCitas
                    preSelectedAtencion={atencionToAgenda}
                    onSuccess={() => { setCitaModalOpen(false); fetchAtenciones(); }}
                    onCancel={() => setCitaModalOpen(false)}
                />
            </FormModal>

            <FormModal
                isOpen={!!pdfUrl}
                onClose={() => {
                    setPdfUrl(null);
                    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
                }}
                title="Vista previa PDF"
            >
                {pdfUrl && (
                    <iframe
                        src={pdfUrl}
                        title="Vista previa PDF"
                        style={{ width: "100%", height: "70vh", border: "none" }}
                    />
                )}

                <div style={{ marginTop: 16, textAlign: "right" }}>
                    <a
                        href={pdfUrl}
                        download="atenciones.pdf"
                        className="btn btn-primary"
                        style={{ textDecoration: "none" }}
                    >
                        Descargar PDF
                    </a>
                </div>
            </FormModal>

            <ConfirmModal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title="Eliminar Atención"
                message="¿Estás seguro de eliminar esta atención? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </div>
    );
}

export default Atenciones;
