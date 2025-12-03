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
import ForCitas from "../Formularios/ForCitas";
import ForConsultas from "../Formularios/ForConsultas";
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import ConfirmModal from '../components/ConfirmModal';
import SingleSelect from "../components/SingleSelect";
import { usePermiso } from "../utils/usePermiso";

function Citas() {
    const TienePermiso = usePermiso();
    const showToast = useToast();
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedIdToDelete, setSelectedIdToDelete] = useState(null);
    const [filters, setFilters] = useState({ estatus: "todos", periodo: "todos" });

    // Estado para atender cita (crear consulta)
    const [consultaModalOpen, setConsultaModalOpen] = useState(false);
    const [citaToAttend, setCitaToAttend] = useState(null);

    const fetchCitas = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BaseUrl}citas`, { headers: { Authorization: `Bearer ${token}` } });
            setCitas(response.data);
        } catch (error) {
            console.error(error);
            showToast("Error cargando citas", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCitas();
    }, []);

    const handleNew = () => {
        setEditData(null);
        setModalOpen(true);
    };

    const handleEdit = (row) => {
        setEditData(row);
        setModalOpen(true);
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${BaseUrl}citas/eliminar/${selectedIdToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
            showToast("Cita eliminada", "success");
            fetchCitas();
        } catch (error) {
            console.error(error);
            showToast("Error eliminando cita", "error");
        } finally {
            setLoading(false);
            setConfirmModalOpen(false);
        }
    };

    const openConfirmDelete = (id) => {
        setSelectedIdToDelete(id);
        setConfirmModalOpen(true);
    };

    const handleAtender = (row) => {
        setCitaToAttend(row);
        setConsultaModalOpen(true);
    };

    const handlePrint = () => {
        const docBlob = exportToPDF({
            data: filteredCitas,
            columns: [
                { header: "Fecha", key: "fecha_cita" },
                { header: "Hora", key: "hora_cita" },
                { header: "Paciente", key: "paciente_nombre" },
                { header: "Doctor", key: "doctor_nombre" },
                { header: "Motivo", key: "motivo" },
                { header: "Estatus", key: "estatus" }
            ],
            fileName: "agenda_citas.pdf",
            title: "Agenda de Citas",
            preview: true
        });
        if (docBlob) {
            setPdfUrl(URL.createObjectURL(docBlob));
        }
    };

    const handleExportExcel = () => {
        exportToExcel({
            data: filteredCitas,
            columns: exportColumns,
            fileName: "agenda_citas.xlsx",
            count: true,
            totalLabel: "TOTAL DE CITAS"
        });
    };


    const estatusOptions = [
        { value: "todos", label: "Estatus" },
        { value: "programada", label: "Programada" },
        { value: "confirmada", label: "Confirmada" },
        { value: "realizada", label: "Realizada" },
        { value: "cancelada", label: "Cancelada" }
    ];

    const periodoOptions = [
        { value: "todos", label: "Todo el tiempo" },
        { value: "hoy", label: "Hoy" },
        { value: "semana", label: "Esta Semana" }
    ];

    const filteredCitas = useMemo(() => {
        return citas.filter(c => {
            const matchesEstatus = filters.estatus === "todos" || c.estatus.toLowerCase() === filters.estatus.toLowerCase();

            let matchesPeriodo = true;
            if (filters.periodo !== 'todos') {
                const date = new Date(c.fecha_cita);
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
    }, [citas, filters]);

    const columns = [
        { header: "Fecha", key: "fecha", render: (row) => row.fecha_cita.split('T')[0] },
        { header: "Hora", key: "hora", render: (row) => row.hora_cita },
        { header: "Paciente", key: "paciente", render: (row) => `${row.paciente_nombre || ''} ${row.paciente_apellido || ''}` },
        { header: "Doctor", key: "doctor", render: (row) => `${row.doctor_nombre || ''} ${row.doctor_apellido || ''}` },
        { header: "Motivo", accessor: "motivo" },
        {
            header: "Estatus",
            accessor: "estatus",
            render: (row) => {
                let badgeClass = "badge";
                const status = (row.estatus || "").toLowerCase();
                if (status === "realizada") badgeClass += " badge--success";
                else if (status === "programada") badgeClass += " badge--info";
                else if (status === "confirmada") badgeClass += " badge--warn";
                else if (status === "cancelada") badgeClass += " badge--drop";
                return <span className={badgeClass}>{row.estatus}</span>;
            }
        },
        {
            header: "Acciones",
            render: (row) => (
                <div className="row-actions">
                    {TienePermiso('citas', 'editar') && (
                        <button className="btn btn-xs btn-outline" onClick={() => handleEdit(row)}>Editar</button>
                    )}
                    {TienePermiso('citas', 'eliminar') && (
                        <button className="btn btn-xs btn-outline btn-danger" onClick={() => openConfirmDelete(row.id)}>Eliminar</button>
                    )}
                    {TienePermiso('citas', 'atender') && row.estatus === 'programada' && (
                        <button className="btn btn-xs btn-primary" onClick={() => handleAtender(row)}>Atender</button>
                    )}
                </div>
            )
        }
    ];

    const exportColumns = [
        { header: "N°", key: "orden", render: (_row, idx) => idx + 1 },
        { header: "Fecha", key: "fecha_cita", render: (row) => row.fecha_cita.split('T')[0] },
        { header: "Hora", key: "hora_cita" },
        { header: "Paciente", key: "paciente", render: (row) => `${row.paciente_nombre || ''} ${row.paciente_apellido || ''}` },
        { header: "Doctor", key: "doctor", render: (row) => `${row.doctor_nombre || ''} ${row.doctor_apellido || ''}` },
        { header: "Motivo", key: "motivo" },
        { header: "Estatus", key: "estatus" }
    ];

    return (
        <div className="pac-page">
            {loading && <div className="spinner-overlay"><Spinner /></div>}

            <section className="card-container">
                <Card color="#0033A0" title="Total Citas">
                    <img src={icon.calendario} className="icon-card" />
                    <span className="number">{citas.length}</span>
                    <h3>Agendadas</h3>
                </Card>
                <Card color="#0B3A6A" title="Hoy">
                    <img src={icon.cv2} className="icon-card" />
                    <span className="number">{citas.filter(c => c.fecha_cita.startsWith(new Date().toISOString().split('T')[0])).length}</span>
                    <h3>Citas para Hoy</h3>
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
                        {TienePermiso('citas', 'exportar') && (
                            <button className="btn btn-secondary" onClick={handlePrint}>
                                <img src={icon.pdf1} className='btn-icon' style={{ marginRight: 5 }} />
                                PDF</button>
                        )}
                        {TienePermiso('citas', 'exportar') && (
                            <button className="btn btn-secondary" onClick={handleExportExcel}>
                                <img src={icon.excel} className='btn-icon' style={{ marginRight: 5 }} />
                                Excel</button>
                        )}
                        {TienePermiso('citas', 'crear') && (
                            <button className="btn btn-primary" onClick={handleNew}>
                                <img src={icon.user5} className='btn-icon' style={{ marginRight: 5 }} />
                                Nueva Cita
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <div className="table-wrap">
                <Tablas columns={columns} data={filteredCitas} />
            </div>

            <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editData ? "Editar Cita" : "Nueva Cita"}>
                <ForCitas
                    citaToEdit={editData}
                    onSuccess={() => { setModalOpen(false); fetchCitas(); }}
                    onCancel={() => setModalOpen(false)}
                />
            </FormModal>

            <FormModal isOpen={consultaModalOpen} onClose={() => setConsultaModalOpen(false)} title="Nueva Consulta (Desde Cita)">
                <ForConsultas
                    initialData={{
                        pacientes_id: citaToAttend?.pacientes_id,
                        citas_id: citaToAttend?.id,
                        observaciones: `Atención de cita programada para: ${citaToAttend?.fecha_cita ? citaToAttend.fecha_cita.split('T')[0] : ''} ${citaToAttend?.hora_cita || ''}`
                    }}
                    onSave={() => { setConsultaModalOpen(false); fetchCitas(); }}
                    onClose={() => setConsultaModalOpen(false)}
                />
            </FormModal>

            <FormModal isOpen={!!pdfUrl} onClose={() => setPdfUrl(null)} title="Vista Previa PDF">
                {pdfUrl && <iframe src={pdfUrl} style={{ width: "100%", height: "70vh", border: "none" }} />}
            </FormModal>

            <ConfirmModal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleDelete}
                title="Eliminar Cita"
                message="¿Estás seguro de eliminar esta cita? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </div>
    );
}

export default Citas;
