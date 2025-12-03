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
import FormModalOne from "../components/FormModalOne";
import FormModal from "../components/FormModal";
import ForPacientes from "../Formularios/ForPaciente";
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { useNavigate } from "react-router-dom";
import SingleSelect from "../components/SingleSelect";
import { usePermiso } from '../utils/usePermiso';

function Pacientes() {
  const tienePermiso = usePermiso();
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState(null);
  const showToast = useToast();
  const [pacienteToShow, setPacienteToShow] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ estatus: "todos", q: "" });
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPaciente, setEditPaciente] = useState(null);

  const getAuthHeaders = () => {
    const token = (localStorage.getItem('token') || '').trim();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const openConfirmDelete = (id) => {
    setSelectedPaciente(id);
    setConfirmModal(true);
  };

  const closeConfirmDelete = () => {
    setSelectedPaciente(null);
    setConfirmModal(false);
  };

  const handleNuevo = () => {
    setEditPaciente();
    setModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditPaciente(row);
    setModalOpen(true);
  };

  const handleSaved = () => {
    fetchPacientes();
    setModalOpen(false);
    setEditPaciente(null);
  };

  const handleSeguimiento = (row) => {
    navigate(`/admin/Seguimiento/${row.id}`);
  };


  const handlePreviewPDF = () => {
    const docBlob = exportToPDF({
      data: filtered,
      columns: exportColumns,
      fileName: "pacientes.pdf",
      title: "Listado de Pacientes",
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
      fileName: "pacientes.xlsx",
      count: true,
      totalLabel: "TOTAL DE REGISTROS"
    });
  };

  const estatusOptions = [
    { value: "todos", label: "Estatus" },
    { value: "en planta", label: "En Planta" },
    { value: "reposo", label: "Reposo" }
  ];

  const fetchPacientes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BaseUrl}pacientes`, { headers: getAuthHeaders() });
      const data = response.data;
      if (!Array.isArray(data)) {
        showToast?.('Respuesta inesperada del servidor', 'error', 4000);
        setPacientes([]);
        return;
      }
      setPacientes(data);
    } catch (error) {
      showToast?.('Error obteniendo los datos', 'error', 3000);
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (row) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BaseUrl}pacientes/${row.id}`, { headers: getAuthHeaders() });
      setPacienteToShow(res.data);
    } catch (error) {
      showToast?.('No se pudo obtener la información del paciente', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${BaseUrl}pacientes/delete/${id}`, { headers: getAuthHeaders() });
      showToast?.('Paciente eliminado con éxito', 'success', 3000);
      await fetchPacientes();
    } catch (error) {
      showToast?.('Error al eliminar', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const updateStatuses = async () => {
      try {
        await axios.get(`${BaseUrl}reposos/actualizar-estados`, { headers: getAuthHeaders() });
      } catch (error) {
        console.error('Error actualizando estados:', error);
      }
    };

    updateStatuses().then(() => {
      fetchPacientes();
    });
  }, []);

  const stats = useMemo(() => {
    const total = pacientes.length;
    const enPlanta = pacientes.filter(p => p.estatus === "en planta").length;
    const reposo = pacientes.filter(p => p.estatus === "reposo").length;
    return { total, enPlanta, reposo };
  }, [pacientes]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const est = filters.estatus;
    return pacientes.filter(p => {
      const matchQ = !q || `${p.cedula} ${p.nombre} ${p.apellido} ${p.contacto}`.toLowerCase().includes(q);
      const matchEstatus = est === 'todos' ? true : p.estatus === est;
      return matchQ && matchEstatus;
    });
  }, [pacientes, filters]);

  const columns = [
    {
      header: "N°",
      key: "orden",
      render: (_row, idx) => idx + 1
    },
    { accessor: "cedula", header: "Cédula", key: "cedula" },
    { accessor: "apellido", header: "Apellido", key: "apellido" },
    { accessor: "nombre", header: "Nombre", key: "nombre" },
    { accessor: "contacto", header: "Contacto", key: "contacto" },
    {
      header: "Estatus",
      key: "estatus",
      render: (row) =>
        row.estatus === "en planta"
          ? <span className="btn btn-xs badge--success">En Planta</span>
          : row.estatus === "reposo"
            ? <span className="btn btn-xs badge--info">Reposo</span>
            : <span className="btn btn-xs badge--muted">{row.estatus}</span>
    },
    {
      header: "Acciones",
      render: (row) => (
        <div className="row-actions" style={{ display: 'flex', gap: 8 }}>
          {tienePermiso('pacientes', 'seguimiento') && row.has_consultas && (
            <button
              className="btn btn-xs btn-primary"
              onClick={() => handleSeguimiento(row)}
              title="Ver Seguimiento"
              style={{ backgroundColor: '#0033a0', color: 'white' }}
            >
              <img src={icon.pulso2} alt="" style={{ width: 14, marginRight: 4, filter: 'brightness(0) invert(1)' }} />
              Seguimiento
            </button>
          )}

          {tienePermiso('pacientes', 'ver') && <button className="btn btn-xs btn-outline btn-view" onClick={() => handleView(row)} title="Ver">Ver</button>}
          {tienePermiso('pacientes', 'editar') && <button className="btn btn-xs btn-outline btn-edit" onClick={() => handleEdit(row)} title="Editar">Editar</button>}
          {tienePermiso('pacientes', 'eliminar') && <button className="btn btn-xs btn-outline btn-danger" onClick={() => openConfirmDelete(row.id)} title="Eliminar">Eliminar</button>}
        </div>
      )
    },
  ];

  const exportColumns = [
    { header: "N°", key: "orden", render: (_row, idx) => idx + 1 },
    { header: "Cédula", key: "cedula" },
    { header: "Apellido", key: "apellido" },
    { header: "Nombre", key: "nombre" },
    { header: "Contacto", key: "contacto" },
    { header: "Estatus", key: "estatus" }
  ];

  return (
    <div className="pac-page">
      {loading && (
        <div className="spinner-overlay">
          <Spinner size={50} label="Cargando Pacientes..." />
        </div>
      )}

      <InfoModal
        isOpen={!!pacienteToShow}
        onClose={() => setPacienteToShow(null)}
        title="Información del Paciente"
      >
        {pacienteToShow && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><b>Cédula:</b> {pacienteToShow.cedula}</li>
            <li><b>Nombre:</b> {pacienteToShow.nombre} {pacienteToShow.apellido}</li>
            <li><b>Sexo:</b> {pacienteToShow.sexo}</li>
            <li><b>Fecha Nacimiento:</b> {pacienteToShow.fecha_nacimiento}</li>
            <li><b>Edad:</b> {pacienteToShow.edad}</li>
            <li><b>Correo:</b> {pacienteToShow.correo}</li>
            <li><b>Contacto:</b> {pacienteToShow.contacto}</li>
            <li><b>Ubicación:</b> {pacienteToShow.ubicacion}</li>
            <li><b>Estatus:</b> {pacienteToShow.estatus}</li>
          </ul>
        )}
      </InfoModal>

      <ConfirmModal
        isOpen={confirmModal}
        onClose={closeConfirmDelete}
        onConfirm={() => {
          handleDelete(selectedPaciente);
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
        title={editPaciente ? "Editar Paciente" : "Registrar Paciente"}
      >
        <ForPacientes
          initialData={editPaciente}
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
            download="pacientes.pdf"
            className="btn btn-primary"
            style={{ textDecoration: "none" }}
          >
            Descargar PDF
          </a>
        </div>
      </FormModal>

      <section className="card-container">
        <Card color="#0033A0" title="Total de Pacientes">
          <img src={icon.user3} alt="" className="icon-card" />
          <span className="number">{stats.total}</span>
          <h3>Total • Pacientes</h3>
        </Card>
        <Card color="#0B3A6A" title="En Planta">
          <img src={icon.escudobien} alt="" className="icon-card" />
          <span className="number">{stats.enPlanta}</span>
          <h3>Pacientes en Planta</h3>
        </Card>
        <Card color="#CE1126" title="Reposo">
          <img src={icon.mascarilla} alt="" className="icon-card" />
          <span className="number">{stats.reposo}</span>
          <h3>Pacientes en Reposo</h3>
        </Card>
      </section>

      <section className="quick-actions2">
        <div className="pac-toolbar">
          <div className="filters">
            <div className="field">
              <img src={icon.lupa2} alt="" className="field-icon" />
              <input
                type="text"
                placeholder="Buscar por cédula, nombre, apellido o contacto…"
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
            {tienePermiso('pacientes', 'exportar') && (
              <button className="btn btn-secondary " onClick={handlePreviewPDF}>
                <img src={icon.pdf1} className="btn-icon" alt="PDF" style={{ marginRight: 5 }} /> PDF
              </button>
            )}
            {tienePermiso('pacientes', 'exportar') && (
              <button className="btn btn-secondary" onClick={handleExportExcel}>
                <img src={icon.excel} className="btn-icon" alt="EXCEL" style={{ marginRight: 5 }} /> Excel
              </button>
            )}
            {tienePermiso('pacientes', 'crear') && (
              <button className="btn btn-primary" onClick={handleNuevo}>
                <img src={icon.user5} className="btn-icon" alt="" style={{ marginRight: 5 }} /> Nuevo Paciente
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

export default Pacientes;