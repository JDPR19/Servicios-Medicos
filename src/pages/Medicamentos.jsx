import React, { useEffect, useMemo, useState } from "react";
import "../index.css";
import axios from "axios";
import { BaseUrl } from "../utils/Constans";
import { useToast } from "../components/userToasd";
import Spinner from "../components/spinner";
import Card from "../components/Card";
import icon from "../components/icon";
import Tablas from "../components/Tablas";
import InfoModal from "../components/InfoModal";
import ConfirmModal from "../components/ConfirmModal";
import FormModal from "../components/FormModal";
import ForMedicamentos from "../Formularios/ForMedicamentos";
import SingleSelect from "../components/SingleSelect";
import { exportToPDF, exportToExcel } from "../utils/exportUtils";
import { usePermiso } from '../utils/usePermiso';

function Medicamentos() {
  const showToast = useToast();
  const tienePermiso = usePermiso();
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ q: "", estatus: "todos" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editMedicamento, setEditMedicamento] = useState(null);
  const [medicamentoToShow, setMedicamentoToShow] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const getAuthHeaders = () => {
    const token = (localStorage.getItem("token") || "").trim();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchMedicamentos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BaseUrl}medicamentos`, { headers: getAuthHeaders() });
      const data = res.data;
      if (!Array.isArray(data)) {
        console.warn("Respuesta inesperada /medicamentos:", data);
        setMedicamentos([]);
        showToast?.("Respuesta inesperada del servidor", "error");
        return;
      }
      setMedicamentos(data);
    } catch (err) {
      console.error("Error obteniendo medicamentos:", err?.response?.data || err.message);
      showToast?.("Error obteniendo los datos", "error");
      setMedicamentos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicamentos();
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
      await axios.delete(`${BaseUrl}medicamentos/eliminar/${id}`, { headers: getAuthHeaders() });
      showToast?.("Medicamento eliminado", "success");
      await fetchMedicamentos();
    } catch (err) {
      console.error("Error eliminando medicamento:", err?.response?.data || err.message);
      showToast?.("Error al eliminar", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNuevo = () => {
    setEditMedicamento(null);
    setModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditMedicamento(row);
    setModalOpen(true);
  };

  const handleSaved = () => {
    fetchMedicamentos();
    setModalOpen(false);
    setEditMedicamento(null);
  };

  const handleView = async (row) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BaseUrl}medicamentos/ver/${row.id}`, { headers: getAuthHeaders() });
      setMedicamentoToShow(res.data);
    } catch (err) {
      console.error("Error mostrando medicamento:", err);
      showToast?.("No se pudo obtener la información", "error");
    } finally {
      setLoading(false);
    }
  };

  const estatusOptions = [
    { value: "todos", label: "Estatus" },
    { value: "disponible", label: "Disponible" },
    { value: "por acabar", label: "Por acabar" },
    { value: "agotado", label: "Agotado" }
  ];

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const est = filters.estatus;
    return medicamentos.filter(m => {
      const matchQ = !q || `${m.nombre} ${m.presentacion} ${m.miligramos}`.toLowerCase().includes(q);
      const matchEstatus = est === "todos" ? true : m.estatus === est;
      return matchQ && matchEstatus;
    });
  }, [medicamentos, filters]);

  const stats = useMemo(() => {
    const total = medicamentos.length;
    const disponibles = medicamentos.filter(m => m.estatus === "disponible").length;
    const porAcabar = medicamentos.filter(m => m.estatus === "por acabar").length;
    const agotados = medicamentos.filter(m => m.estatus === "agotado").length;
    return { total, disponibles, porAcabar, agotados };
  }, [medicamentos]);

  const columns = [
    { header: "N°", key: "order", render: (_r, idx) => idx + 1 },
    { accessor: "nombre", header: "Nombre", key: "nombre" },
    { accessor: "presentacion", header: "Presentación", key: "presentacion" },
    { accessor: "miligramos", header: "Mg", key: "miligramos" },
    { accessor: "cantidad_disponible", header: "Cantidad", key: "cantidad_disponible" },
    {
      header: "Estatus",
      key: "estatus",
      render: (row) => {
        const mapClass = {
          disponible: "badge--success",
          "por acabar": "badge--warn",
          agotado: "badge--drop"
        }[row.estatus] || "badge--muted";
        return <span className={`btn btn-xs ${mapClass}`}>{row.estatus || "-"}</span>;
      }
    },
    {
      header: "Acciones",
      render: (row) => (
        <div className="row-actions" style={{ display: "flex", gap: 8 }}>
          {tienePermiso("medicamentos", "ver") && <button className="btn btn-xs btn-outline btn-view" onClick={() => handleView(row)} title="Ver">Ver</button>}
          {tienePermiso("medicamentos", "editar") && <button className="btn btn-xs btn-outline btn-edit" onClick={() => handleEdit(row)} title="Editar">Editar</button>}
          {tienePermiso("medicamentos", "eliminar") && <button className="btn btn-xs btn-outline btn-danger" onClick={() => openConfirmDelete(row.id)} title="Eliminar">Eliminar</button>}
        </div>
      )
    }
  ];

  const exportColumns = [
    { header: "N°", key: "order", render: (_r, idx) => idx + 1 },
    { header: "Nombre", key: "nombre" },
    { header: "Presentación", key: "presentacion" },
    { header: "Miligramos", key: "miligramos" },
    { header: "Cantidad", key: "cantidad_disponible" },
    { header: "Estatus", key: "estatus" }
  ];

  const handlePreviewPDF = () => {
    const docBlob = exportToPDF({
      data: filtered,
      columns: exportColumns,
      fileName: "medicamentos.pdf",
      title: "Listado de Medicamentos",
      preview: true
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
      fileName: "medicamentos.xlsx",
      count: true,
      totalLabel: "TOTAL DE REGISTROS"
    });
  };

  return (
    <div className="pac-page">
      {loading && (
        <div className="spinner-overlay">
          <Spinner size={50} label="Cargando Medicamentos..." />
        </div>
      )}

      <InfoModal
        isOpen={!!medicamentoToShow}
        onClose={() => setMedicamentoToShow(null)}
        title="Información del Medicamento"
      >
        {medicamentoToShow && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><b>Nombre:</b> {medicamentoToShow.nombre}</li>
            <li><b>Presentación:</b> {medicamentoToShow.presentacion || "-"}</li>
            <li><b>Miligramos:</b> {medicamentoToShow.miligramos || "-"}</li>
            <li><b>Cantidad disponible:</b> {medicamentoToShow.cantidad_disponible}</li>
            <li><b>Estatus:</b> {medicamentoToShow.estatus}</li>
            <li><b>Categoría:</b> {medicamentoToShow.categoria_nombre || "-"}</li>
            {/* <li><b>Actualización:</b> {medicamentoToShow.fecha_ultima_actualizacion?.slice(0, 19) || "-"}</li> */}
          </ul>
        )}
      </InfoModal>

      <ConfirmModal
        isOpen={confirmModal}
        onClose={closeConfirmDelete}
        onConfirm={() => {
          handleDelete(selectedId);
          closeConfirmDelete();
        }}
        title="¿Confirmar eliminación?"
        message="¿Estás seguro de eliminar este documento?"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editMedicamento ? "Editar Medicamento" : "Registrar Medicamento"}
      >
        <ForMedicamentos
          initialData={editMedicamento}
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
          <a href={pdfUrl} download="medicamentos.pdf" className="btn btn-primary">Descargar PDF</a>
        </div>
      </FormModal>

      <section className="card-container">
        <Card color="#0033A0" title="Total">
          <img src={icon.medicamentos} alt="" className="icon-card" />
          <span className="number">{stats.total}</span>
          <h3>Total • Medicamentos</h3>
        </Card>
        <Card color="#0B6A3A" title="Disponibles">
          <img src={icon.escudobien} alt="" className="icon-card" />
          <span className="number">{stats.disponibles}</span>
          <h3>Disponibles</h3>
        </Card>
        <Card color="#FF8C00" title="Por Acabar">
          <img src={icon.agotar} alt="" className="icon-card" />
          <span className="number">{stats.porAcabar}</span>
          <h3>Por Acabar</h3>
        </Card>
        <Card color="#CE1126" title="Agotados">
          <img src={icon.agotado} alt="" className="icon-card" />
          <span className="number">{stats.agotados}</span>
          <h3>Agotados</h3>
        </Card>
      </section>

      <section className="quick-actions2">
        <div className="pac-toolbar">
          <div className="filters">
            <div className="field">
              <img src={icon.lupa2} alt="" className="field-icon" />
              <input
                type="text"
                placeholder="Buscar por nombre o presentación…"
                value={filters.q}
                onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
              />
            </div>
            <div>
              <SingleSelect
                options={estatusOptions}
                value={estatusOptions.find(o => o.value === filters.estatus)}
                onChange={opt => setFilters(f => ({ ...f, estatus: opt ? opt.value : "todos" }))}
                isClearable={false}
                placeholder="Estatus"
              />
            </div>
          </div>
          <div className="actions">
            {tienePermiso("medicamentos", "exportar") && (
              <button className="btn btn-secondary" onClick={handlePreviewPDF}>
                <img src={icon.pdf1} className="btn-icon" alt="" style={{ marginRight: 5 }} /> PDF
              </button>
            )}
            {tienePermiso("medicamentos", "exportar") && (
              <button className="btn btn-secondary" onClick={handleExportExcel}>
                <img src={icon.excel} className="btn-icon" alt="" style={{ marginRight: 5 }} /> Excel
              </button>
            )}
            {tienePermiso("medicamentos", "crear") && (
              <button className="btn btn-primary" onClick={handleNuevo}>
                <img src={icon.user5} className="btn-icon" alt="" style={{ marginRight: 5 }} /> Nuevo Medicamento
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="table-wrap">
        <Tablas
          columns={columns}
          data={filtered}
          rowsPerPage={8}
        />
      </div>
    </div>
  );
}

export default Medicamentos;