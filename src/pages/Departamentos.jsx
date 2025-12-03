import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../index.css";
import Card from "../components/Card";
import Tablas from "../components/Tablas";
import icon from "../components/icon";
import { useToast } from "../components/userToasd";
import Spinner from "../components/spinner";
import { BaseUrl } from "../utils/Constans";
import InfoModal from "../components/InfoModal";
import ConfirmModal from "../components/ConfirmModal";
import FormModal from "../components/FormModal";
import ForDepartamento from "../Formularios/ForDepartamento";
import { exportToPDF, exportToExcel } from "../utils/exportUtils";
import { usePermiso } from '../utils/usePermiso';

function Departamentos() {
    const TienePermiso = usePermiso();
    const showToast = useToast();
    const [departamentos, setDepartamentos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ q: "" });

    const [modalOpen, setModalOpen] = useState(false);
    const [editRow, setEditRow] = useState(null);

    const [confirmModal, setConfirmModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [verRow, setVerRow] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);

    const getAuthHeaders = () => {
        const token = (localStorage.getItem("token") || "").trim();
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchDepartamentos = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BaseUrl}departamentos`, { headers: getAuthHeaders() });
            const data = Array.isArray(res.data) ? res.data : [];
            setDepartamentos(data);
        } catch (err) {
            console.error("Error obteniendo departamentos:", err?.response?.data || err.message);
            showToast?.("Error obteniendo los datos", "error", 3000);
            setDepartamentos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartamentos();
    }, []);

    const openConfirmDelete = (id) => {
        setSelectedId(id);
        setConfirmModal(true);
    };
    const closeConfirmDelete = () => {
        setSelectedId(null);
        setConfirmModal(false);
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}departamentos/eliminar/${id}`, { headers: getAuthHeaders() });
            showToast?.("Departamento eliminado con éxito", "success", 3000);
            await fetchDepartamentos();
        } catch (err) {
            console.error("Error al eliminar:", err?.response?.data || err.message);
            showToast?.("Error al eliminar", "error", 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleNuevo = () => {
        setEditRow(null);
        setModalOpen(true);
    };

    const handleEdit = (row) => {
        setEditRow(row);
        setModalOpen(true);
    };

    const handleSaved = () => {
        fetchDepartamentos();
        setModalOpen(false);
        setEditRow(null);
    };

    const handleView = async (row) => {
        setLoading(true);
        try {
            const res = await axios.get(`${BaseUrl}departamentos/ver/${row.id}`, { headers: getAuthHeaders() });
            setVerRow(res.data);
        } catch (err) {
            console.error("Error al ver departamento:", err);
            showToast?.("No se pudo obtener la información del departamento", "error");
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        const q = filters.q.trim().toLowerCase();
        return departamentos.filter((d) => {
            const nombresFinalidades = (d.finalidades || []).map((f) => f.nombre_finalidad).join(" ");
            const matchQ =
                !q ||
                `${d.nombre} ${d.descripcion || ""} ${nombresFinalidades}`.toLowerCase().includes(q);
            return matchQ;
        });
    }, [departamentos, filters]);

    const stats = useMemo(() => {
        const total = departamentos.length;
        const conFinalidades = departamentos.filter((d) => (d.finalidades || []).length > 0).length;
        const sinFinalidades = total - conFinalidades;
        return { total, conFinalidades, sinFinalidades };
    }, [departamentos]);

    const columns = [
        { header: "N°", key: "orden", render: (_row, idx) => idx + 1 },
        { accessor: "nombre", header: "Nombre", key: "nombre" },
        // { accessor: "descripcion", header: "Descripción", key: "descripcion" },
        {
            header: "Finalidades",
            key: "finalidades",
            render: (row) => {
                const arr = row.finalidades || [];
                if (arr.length === 0) return <span className="badge--muted btn btn-xs">N/D</span>;
                const labels = arr.map((f) => f.nombre_finalidad).filter(Boolean);
                const shown = labels.slice(0, 2).join(", ");
                const extra = labels.length > 2 ? ` +${labels.length - 2}` : "";
                return <span>{shown}{extra}</span>;
            },
        },
        {
            header: "Acciones",
            render: (row) => (
                <div className="row-actions" style={{ display: "flex", gap: 8 }}>
                    {TienePermiso('departamentos', "ver") && (
                        <button className="btn btn-xs btn-outline btn-view" onClick={() => handleView(row)} title="Ver">Ver</button>
                    )}
                    {TienePermiso('departamentos', "editar") && (
                        <button className="btn btn-xs btn-outline btn-edit" onClick={() => handleEdit(row)} title="Editar">Editar</button>
                    )}
                    {TienePermiso('departamentos', "eliminar") && (
                        <button className="btn btn-xs btn-outline btn-danger" onClick={() => openConfirmDelete(row.id)} title="Eliminar">Eliminar</button>
                    )}
                </div>
            ),
        },
    ];

    const exportColumns = [
        { header: "N°", key: "orden", render: (_row, idx) => idx + 1 },
        { header: "Nombre", key: "nombre" },
        { header: "Descripción", key: "descripcion" },
        {
            header: "Finalidades",
            key: "finalidades",
            render: (row) => {
                const arr = row.finalidades || [];
                if (arr.length === 0) return "";
                return arr.map((f) => `${f.nombre_finalidad} - ${f.objetivo_finalidad || ""}`).join("; ");
            },
        },
    ];

    const handlePreviewPDF = () => {
        const docBlob = exportToPDF({
            data: filtered,
            columns: exportColumns,
            fileName: "departamentos.pdf",
            title: "Listado de Departamentos",
            preview: true,
        });
        if (docBlob) {
            const url = URL.createObjectURL(docBlob);
            setPdfUrl(url);
        }
    };

    const handleExportExcel = () => {
        exportToExcel({
            data: filtered,
            columns: exportColumns,
            fileName: "departamentos.xlsx",
            count: true,
            totalLabel: "TOTAL DE REGISTROS",
        });
    };

    return (
        <div className="pac-page">
            {loading && (
                <div className="spinner-overlay">
                    <Spinner size={50} label="Cargando Departamentos..." />
                </div>
            )}

            <InfoModal
                isOpen={!!verRow}
                onClose={() => setVerRow(null)}
                title="Información del Departamento"
            >
                {verRow && (
                    <div>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                            <li><b>Nombre:</b> {verRow.nombre}</li>
                            <li><b>Descripción:</b> {verRow.descripcion || "N/D"}</li>
                        </ul>
                        <div style={{ marginTop: 8 }}>
                            <b>Finalidades:</b>
                            {(verRow.detalle || []).length === 0 ? (
                                <div className="alert alert-muted" style={{ padding: 8, marginTop: 6 }}>Sin finalidades</div>
                            ) : (
                                <ul style={{ paddingLeft: 18, marginTop: 6 }}>
                                    {(verRow.detalle || []).map((f) => (
                                        <li key={f.id}>
                                            {f.nombre_finalidad} — <i>{f.objetivo_finalidad}</i>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </InfoModal>

            <ConfirmModal
                isOpen={confirmModal}
                onClose={closeConfirmDelete}
                onConfirm={() => {
                    handleDelete(selectedId);
                    closeConfirmDelete();
                }}
                title="¿Confirmación de Eliminación?"
                message="¿Estás seguro de eliminar este registro?"
                confirmText="Eliminar"
                cancelText="Cancelar"
            />

            <FormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editRow ? "Editar Departamento" : "Registrar Departamento"}
            >
                <ForDepartamento
                    initialData={editRow}
                    onSave={handleSaved}
                    onClose={() => setModalOpen(false)}
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
                        download="departamentos.pdf"
                        className="btn btn-primary"
                        style={{ textDecoration: "none" }}
                    >
                        Descargar PDF
                    </a>
                </div>
            </FormModal>

            <section className="card-container">
                <Card color="#0033A0" title="Total de Departamentos">
                    <img src={icon.user3} alt="" className="icon-card" />
                    <span className="number">{stats.total}</span>
                    <h3>Total • Departamentos</h3>
                </Card>
                <Card color="#0B3A6A" title="Con finalidades">
                    <img src={icon.escudobien} alt="" className="icon-card" />
                    <span className="number">{stats.conFinalidades}</span>
                    <h3>Con Finalidades</h3>
                </Card>
                <Card color="#CE1126" title="Sin finalidades">
                    <img src={icon.mascarilla} alt="" className="icon-card" />
                    <span className="number">{stats.sinFinalidades}</span>
                    <h3>Sin Finalidades</h3>
                </Card>
            </section>

            <section className="quick-actions2">
                <div className="pac-toolbar">
                    <div className="filters">
                        <div className="field">
                            <img src={icon.lupa2} alt="Buscar..." className="field-icon" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, descripción o finalidad…"
                                value={filters.q}
                                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="actions">
                        {TienePermiso('departamentos', 'exportar') && (
                            <button className="btn btn-secondary" onClick={handlePreviewPDF}>
                                <img src={icon.pdf1} className="btn-icon" alt="PDF" style={{ marginRight: 5 }} /> PDF
                            </button>
                        )}
                        {TienePermiso('departamentos', 'exportar') && (
                            <button className="btn btn-secondary" onClick={handleExportExcel}>
                                <img src={icon.excel} className="btn-icon" alt="EXCEL" style={{ marginRight: 5 }} /> Excel
                            </button>
                        )}
                        {TienePermiso('departamentos', 'crear') && (
                            <button className="btn btn-primary" onClick={handleNuevo}>
                                <img src={icon.user5} className="btn-icon" alt="" style={{ marginRight: 5 }} /> Nuevo Departamento
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <div className="table-wrap">
                <Tablas columns={columns} data={filtered} rowsPerPage={8} />
            </div>
        </div>
    );
}

export default Departamentos;