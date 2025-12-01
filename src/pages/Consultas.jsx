import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import '../index.css';
import Card from "../components/Card";
import Tablas from "../components/Tablas";
import icon from "../components/icon";
import { useToast } from "../components/userToasd";
import Spinner from "../components/spinner";
import { BaseUrl } from "../utils/Constans";
import InfoModal from "../components/InfoModal";
import ConfirmModal from "../components/ConfirmModal";
import FormModal from "../components/FormModal";
import FormModalOne from "../components/FormModalOne";
import ForConsultas from "../Formularios/ForConsultas";
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import SingleSelect from "../components/SingleSelect";

function Consultas() {
  const [pdfUrl, setPdfUrl] = useState(null);
  const showToast = useToast();
  const [consultaToShow, setConsultaToShow] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ estatus: "todos", q: "" });
  const [selectedConsulta, setSelectedConsulta] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editConsulta, setEditConsulta] = useState(null);

  const getAuthHeaders = () => {
    const token = (localStorage.getItem('token') || '').trim();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const openConfirmDelete = (id) => {
    setSelectedConsulta(id);
    setConfirmModal(true);
  };

  const closeConfirmDelete = () => {
    setSelectedConsulta(null);
    setConfirmModal(false);
  };

  const handleNuevo = () => {
    setEditConsulta();
    setModalOpen(true);
  };

  const handleEdit = async (row) => {
    try {
      // Pedimos la consulta completa que SI tiene los medicamentos
      const response = await axios.get(`${BaseUrl}consultas/ver/${row.id}`, { headers: getAuthHeaders() });
      const consultaCompleta = response.data;

      // Preparamos los medicamentos para el formulario
      const medicamentosFormato = (consultaCompleta.medicamentos || []).map(med => ({
        medicamento_id: med.medicamento_id,
        cantidad_utilizada: med.cantidad_utilizada
      }));

      setEditConsulta({
        ...consultaCompleta,
        medicamentos_ids: medicamentosFormato
      });
      setModalOpen(true);
    } catch (error) {
      showToast?.('Error cargando los datos', 'error');
    }
  };


  const handleSaved = () => {
    fetchConsultas();
    setModalOpen(false);
    setEditConsulta(null);
  };

  const handleView = async (row) => {
    try {
      const response = await axios.get(`${BaseUrl}consultas/ver/${row.id}`, { headers: getAuthHeaders() });
      setConsultaToShow(response.data);
    } catch (error) {
      showToast?.('Error obten iendo los detalles de la consulta', 'error', 3000);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BaseUrl}consultas/delete/${id}`, { headers: getAuthHeaders() });
      showToast?.('Consulta eliminada correctamente', 'success', 3000);
      fetchConsultas();
    } catch (error) {
      showToast?.('Error eliminando la consulta', 'error', 3000);
    }
  };

  const handlePreviewPDF = () => {
    const docBlob = exportToPDF({
      data: filtered,
      columns: exportColumns,
      fileName: "consultas.pdf",
      title: "Listado de Consultas",
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
      fileName: "consultas.xlsx",
      count: true,
      totalLabel: "TOTAL DE REGISTROS"
    });
  };

  const estatusOptions = [
    { value: "todos", label: "Estatus" },
    { value: "Realizada", label: "Realizada" },
    { value: "Pendiente", label: "Pendiente" }
  ];

  const fetchConsultas = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BaseUrl}consultas`, { headers: getAuthHeaders() });
      const data = response.data;
      if (!Array.isArray(data)) {
        showToast?.('Respuesta inesperada del servidor', 'error', 4000);
        setConsultas([]);
        return;
      }
      setConsultas(data);
    } catch (error) {
      showToast?.('Error obteniendo los datos', 'error', 3000);
      setConsultas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultas();
  }, []);

  const stats = useMemo(() => {
    const total = consultas.length;
    const realizadas = consultas.filter(c => c.estatus === "Realizada").length;
    const pendientes = consultas.filter(c => c.estatus === "Pendiente").length;
    return { total, realizadas, pendientes };
  }, [consultas]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const est = filters.estatus;
    return consultas.filter(c => {
      const matchQ = !q || `${c.codigo || ""} ${c.diagnostico || ""} ${c.observaciones || ""}`.toLowerCase().includes(q);
      const matchEstatus = est === 'todos' ? true : c.estatus === est;
      return matchQ && matchEstatus;
    });
  }, [consultas, filters]);

  const columns = [
    {
      header: "N°",
      key: "orden",
      render: (_row, idx) => idx + 1
    },
    { accessor: "codigo", header: "Código", key: "codigo" },
    { accessor: "diagnostico", header: "Diagnóstico", key: "diagnostico" },
    { accessor: "estatus", header: "Estatus", key: "estatus" },
    {
      header: "Acciones",
      render: (row) => (
        <div className="row-actions" style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-xs btn-outline btn-view" onClick={() => handleView(row)} title="Ver">Ver</button>
          <button className="btn btn-xs btn-outline btn-edit" onClick={() => handleEdit(row)} title="Editar">Editar</button>
          <button className="btn btn-xs btn-outline btn-danger" onClick={() => openConfirmDelete(row.id)} title="Eliminar">Eliminar</button>
        </div>
      )
    },
  ];

  const exportColumns = [
    { header: "N°", key: "orden", render: (_row, idx) => idx + 1 },
    { header: "Código", key: "codigo" },
    { header: "Diagnóstico", key: "diagnostico" },
    { header: "Estatus", key: "estatus" }
  ];

  return (
    <div className="pac-page">
      {loading && (
        <div className="spinner-overlay">
          <Spinner size={50} label="Cargando Consultas..." />
        </div>
      )}

      <InfoModal
        isOpen={!!consultaToShow}
        onClose={() => setConsultaToShow(null)}
        title="Información de la Consulta"
      >
        {consultaToShow && (
          <div style={{ padding: "10px" }}>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li><b>Código:</b> {consultaToShow.codigo}</li>
              <li><b>Paciente:</b> {consultaToShow.paciente_cedula} - {consultaToShow.paciente_nombre} {consultaToShow.paciente_apellido}</li>
              <li><b>Enfermedad:</b> {consultaToShow.enfermedad_nombre}</li>
              <li><b>Diagnóstico:</b> {consultaToShow.diagnostico}</li>
              <li><b>Tratamientos:</b> {consultaToShow.tratamientos || 'N/A'}</li>
              <li><b>Observaciones:</b> {consultaToShow.observaciones || 'N/A'}</li>
              <li><b>Estatus:</b> {consultaToShow.estatus}</li>
              <li><b>Fecha Atención:</b> {consultaToShow.fecha_atencion_formatted}</li>
            </ul>
            {consultaToShow.medicamentos && consultaToShow.medicamentos.length > 0 && (
              <div style={{ marginTop: "15px" }}>
                <b>Medicamentos:</b>
                <ul>
                  {consultaToShow.medicamentos.map((med, idx) => (
                    <li key={idx}>
                      {med.medicamento_nombre} - {med.medicamento_presentacion} ({med.medicamentos_miligramos}) - Cantidad: {med.cantidad_utilizada}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </InfoModal>

      <ConfirmModal
        isOpen={confirmModal}
        onClose={closeConfirmDelete}
        onConfirm={() => {
          handleDelete(selectedConsulta);
          closeConfirmDelete();
        }}
        title="¿Confirmación de Eliminación?"
        message="¿Estás seguro de eliminar este registro?"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      <FormModalOne
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editConsulta ? "Editar Consulta" : "Registrar Consulta"}
      >
        <ForConsultas
          initialData={editConsulta}
          onSave={handleSaved}
          onClose={() => setModalOpen(false)}
        />
      </FormModalOne>

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
            download="consultas.pdf"
            className="btn btn-primary"
            style={{ textDecoration: "none" }}
          >
            Descargar PDF
          </a>
        </div>
      </FormModal>

      <section className="card-container">
        <Card color="#0033A0" title="Total de Consultas">
          <img src={icon.user3} alt="" className="icon-card" />
          <span className="number">{stats.total}</span>
          <h3>Total • Consultas</h3>
        </Card>
        <Card color="#0B3A6A" title="Realizadas">
          <img src={icon.escudobien} alt="" className="icon-card" />
          <span className="number">{stats.realizadas}</span>
          <h3>Consultas Realizadas</h3>
        </Card>
        <Card color="#CE1126" title="Pendientes">
          <img src={icon.mascarilla} alt="" className="icon-card" />
          <span className="number">{stats.pendientes}</span>
          <h3>Consultas Pendientes</h3>
        </Card>
      </section>

      <section className="quick-actions2">
        <div className="pac-toolbar">
          <div className="filters">
            <div className="field">
              <img src={icon.lupa2} alt="" className="field-icon" />
              <input
                type="text"
                placeholder="Buscar por código, diagnóstico u observaciones…"
                value={filters.q}
                onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
              />
            </div>
            <div>
              <SingleSelect
                options={estatusOptions}
                value={estatusOptions.find(opt => opt.value === filters.estatus)}
                onChange={opt =>
                  setFilters(f => ({ ...f, estatus: opt ? opt.value : "todos" }))
                }
                isClearable={false}
                placeholder="Estatus"
              />
            </div>
          </div>

          <div className="actions">
            <button className="btn btn-secondary " onClick={handlePreviewPDF}>
              <img src={icon.pdf1} className="btn-icon" alt="PDF" style={{ marginRight: 5 }} /> PDF
            </button>
            <button className="btn btn-secondary" onClick={handleExportExcel}>
              <img src={icon.excel} className="btn-icon" alt="EXCEL" style={{ marginRight: 5 }} /> Excel
            </button>
            <button className="btn btn-primary" onClick={handleNuevo}>
              <img src={icon.user5} className="btn-icon" alt="" style={{ marginRight: 5 }} /> Nueva Consulta
            </button>
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

export default Consultas;