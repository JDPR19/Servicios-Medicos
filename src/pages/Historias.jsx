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
import ForHistorias from "../Formularios/ForHistorias";
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { generateHistoriaClinicaPDF } from "../utils/pdfGenerator";
import SingleSelect from "../components/SingleSelect";
import { usePermiso } from '../utils/usePermiso'

function Historias() {
  const showToast = useToast();
  const tienePermiso = usePermiso();
  const [pdfUrl, setPdfUrl] = useState(null);

  // Data states
  const [historias, setHistorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);

  // Modal & Selection states
  const [historiaToShow, setHistoriaToShow] = useState(null); // For InfoModal
  const [confirmModal, setConfirmModal] = useState(false); // For Delete
  const [selectedHistoriaId, setSelectedHistoriaId] = useState(null); // ID for delete

  const [modalOpen, setModalOpen] = useState(false); // For FormModal
  const [editHistoria, setEditHistoria] = useState(null); // Data for editing

  // New History Flow states
  const [isSelectingPatient, setIsSelectingPatient] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null); // { value, label }

  const [filters, setFilters] = useState({ q: "" });

  // Helpers
  const getAuthHeaders = () => {
    const token = (localStorage.getItem('token') || '').trim();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // --- Fetch Data ---
  const fetchHistorias = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BaseUrl}historias_medicas`, { headers: getAuthHeaders() });
      const data = response.data;
      if (Array.isArray(data)) {
        setHistorias(data);
      } else {
        console.warn('Respuesta inesperada /historias_medicas:', data);
        setHistorias([]);
      }
    } catch (error) {
      console.error('Error obteniendo historias:', error);
      showToast?.('Error obteniendo los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${BaseUrl}historias_medicas/pacientes-lista`, { headers: getAuthHeaders() });
      if (Array.isArray(response.data)) {
        const options = response.data.map(p => ({
          value: p.id,
          label: `${p.cedula} - ${p.nombre} ${p.apellido}`
        }));
        setPatients(options);
      }
    } catch (error) {
      console.error('Error obteniendo pacientes:', error);
    }
  };

  useEffect(() => {
    fetchHistorias();
    fetchPatients();
  }, []);

  // --- Actions ---

  // View Details
  const handleView = async (row) => {
    if (!row.id) {
      showToast?.('Error: ID de historia no disponible', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${BaseUrl}historias_medicas/ver/${row.id}`, { headers: getAuthHeaders() });
      setHistoriaToShow(res.data);
    } catch (error) {
      console.error('Error al ver historia:', error);
      showToast?.('No se pudo obtener el detalle', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const openConfirmDelete = (id) => {
    if (!id) {
      showToast?.('Error: ID de historia no disponible', 'error');
      return;
    }
    setSelectedHistoriaId(id);
    setConfirmModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${BaseUrl}historias_medicas/eliminar/${selectedHistoriaId}`, { headers: getAuthHeaders() });
      showToast?.('Historia eliminada con éxito', 'success');
      fetchHistorias();
    } catch (error) {
      console.error('Error al eliminar:', error);
      showToast?.('Error al eliminar', 'error');
    } finally {
      setLoading(false);
      setConfirmModal(false);
      setSelectedHistoriaId(null);
    }
  };

  // New / Edit
  const handleNuevo = () => {
    setEditHistoria(null);
    setSelectedPatient(null);
    setIsSelectingPatient(true);
    setModalOpen(true);
  };

  const handleEdit = async (row) => {
    if (!row.id) {
      showToast?.('Error: ID de historia no disponible', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${BaseUrl}historias_medicas/ver/${row.id}`, { headers: getAuthHeaders() });
      const fullData = res.data;

      setEditHistoria(fullData);

      if (fullData.pacientes_id) {
        const p = patients.find(opt => opt.value === fullData.pacientes_id);
        setSelectedPatient(p || { value: fullData.pacientes_id, label: fullData.cedula_paciente || 'Paciente' });
      }

      setIsSelectingPatient(false);
      setModalOpen(true);
    } catch (error) {
      console.error("Error fetching details for edit:", error);
      showToast?.("Error al cargar datos para editar", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaved = () => {
    fetchHistorias();
    setModalOpen(false);
    setEditHistoria(null);
    setSelectedPatient(null);
  };

  const handlePrintHistoria = async (row) => {
    if (!row.id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BaseUrl}historias_medicas/ver/${row.id}`, { headers: getAuthHeaders() });
      const fullData = res.data;

      const docBlob = generateHistoriaClinicaPDF(fullData);
      if (docBlob) {
        const url = URL.createObjectURL(docBlob);
        setPdfUrl(url);
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      showToast?.('Error al generar el PDF', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewPDF = () => {
    const docBlob = exportToPDF({
      data: filtered,
      columns: exportColumns,
      fileName: "historias_medicas.pdf",
      title: "Listado de Historias Médicas",
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
      fileName: "historias_medicas.xlsx",
      count: true,
      totalLabel: "TOTAL DE REGISTROS"
    });
  };

  const stats = useMemo(() => {
    const total = historias.length;

    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonth = historias.filter(h => (h.fecha_consulta || '').startsWith(ym)).length;

    const today = now.toISOString().split('T')[0];
    const todayCount = historias.filter(h => {
      if (!h.fecha_consulta) return false;
      const parts = h.fecha_consulta.split(' ')[0].split('/');
      if (parts.length === 3) {
        const d = parts[0];
        const m = parts[1];
        const y = '20' + parts[2];
        return `${y}-${m}-${d}` === today;
      }
      return false;
    }).length;

    return { total, thisMonth, todayCount };
  }, [historias]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return historias.filter(h => {
      const searchStr = `${h.codigo_historia} ${h.cedula_paciente} ${h.apellido_paciente} ${h.cedula_doctor} ${h.apellido_doctor}`.toLowerCase();
      return !q || searchStr.includes(q);
    });
  }, [historias, filters]);

  const columns = [
    { header: "N°", key: "orden", render: (_row, idx) => idx + 1 },
    { accessor: "codigo_historia", header: "Código", key: "codigo_historia" },
    { accessor: "fecha_consulta", header: "Fecha", key: "fecha_consulta" },
    {
      header: "Paciente",
      key: "paciente",
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'bold' }}>{row.apellido_paciente}</span>
          <span style={{ fontSize: '0.85em', color: '#666' }}>{row.cedula_paciente}</span>
        </div>
      )
    },
    {
      header: "Doctor",
      key: "doctor",
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'bold' }}>{row.apellido_doctor}</span>
          <span style={{ fontSize: '0.85em', color: '#666' }}>{row.cedula_doctor}</span>
        </div>
      )
    },
    {
      header: "Acciones",
      render: (row) => (
        <div className="row-actions" style={{ display: 'flex', gap: 8 }}>
          {tienePermiso('historias', 'ver') && (
            <button className="btn btn-xs btn-outline btn-view" onClick={() => handleView(row)} title="Ver">Ver</button>
          )}
          {tienePermiso('historias', 'editar') && (
            <button className="btn btn-xs btn-outline btn-edit" onClick={() => handleEdit(row)} title="Editar">Editar</button>
          )}
          {tienePermiso('historias', 'exportar') && (
            <button className="btn btn-xs btn-outline btn-print" onClick={() => handlePrintHistoria(row)} title="Imprimir Ficha">Imprimir</button>
          )}
          {tienePermiso('historias', 'eliminar') && (
            <button className="btn btn-xs btn-outline btn-danger" onClick={() => openConfirmDelete(row.id)} title="Eliminar">Eliminar</button>
          )}
        </div>
      )
    },
  ];

  const exportColumns = [
    { header: "N°", key: "orden", render: (_row, idx) => idx + 1 },
    { header: "Código", key: "codigo_historia" },
    { header: "Fecha", key: "fecha_consulta" },
    { header: "Cédula Paciente", key: "cedula_paciente" },
    { header: "Paciente", key: "apellido_paciente" },
    { header: "Doctor", key: "apellido_doctor" }
  ];

  return (
    <div className="pac-page">
      {loading && (
        <div className="spinner-overlay">
          <Spinner size={50} label="Cargando Historias..." />
        </div>
      )}

      {/* Info Modal */}
      <InfoModal
        isOpen={!!historiaToShow}
        onClose={() => setHistoriaToShow(null)}
        title="Detalle de Historia Médica"
      >
        {historiaToShow && (
          <div className="info-modal-content">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <p><b>Código:</b> {historiaToShow.codigo}</p>
              <p><b>Fecha:</b> {historiaToShow.fecha_consulta}</p>
              <p><b>Paciente:</b> {historiaToShow.nombre_paciente} {historiaToShow.apellido_paciente}</p>
              <p><b>Cédula:</b> {historiaToShow.cedula_paciente}</p>
              <p><b>Doctor:</b> {historiaToShow.nombre_doctor} {historiaToShow.apellido_doctor}</p>
              <p><b>Motivo:</b> {historiaToShow.motivo_consulta}</p>
            </div>
            <hr />
            <p><b>Historia:</b> {historiaToShow.historia}</p>
            <p><b>Examen Físico:</b> {historiaToShow.examen_fisico}</p>
            <p><b>Diagnóstico:</b> {historiaToShow.diagnostico}</p>
            <p><b>Observación:</b> {historiaToShow.observacion}</p>
            {historiaToShow.detalle && historiaToShow.detalle.length > 0 && (
              <div>
                <b>Enfermedades:</b>
                <ul>
                  {historiaToShow.detalle.map((d, i) => (
                    <li key={i}>{d.enfermedad_nombre} ({d.categoria_nombre})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </InfoModal>

      <ConfirmModal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={handleDelete}
        title="¿Eliminar Historia?"
        message="¿Estás seguro de eliminar esta historia médica? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />


      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editHistoria ? "Editar Historia Médica" : "Nueva Historia Médica"}
      >
        {isSelectingPatient && !editHistoria ? (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4>Seleccione un Paciente</h4>
            <SingleSelect
              options={patients}
              value={selectedPatient}
              onChange={setSelectedPatient}
              placeholder="Buscar paciente por cédula o nombre..."
              isClearable={true}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button
                className="btn btn-primary"
                disabled={!selectedPatient}
                onClick={() => setIsSelectingPatient(false)}
              >
                Continuar
              </button>
            </div>
          </div>
        ) : (
          <ForHistorias
            pacienteId={selectedPatient?.value}
            historiaToEdit={editHistoria}
            onSuccess={handleSaved}
            onCancel={() => setModalOpen(false)}
          />
        )}
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
            download="historias_medicas.pdf"
            className="btn btn-primary"
            style={{ textDecoration: "none" }}
          >
            Descargar PDF
          </a>
        </div>
      </FormModal>

      <section className="card-container">
        <Card color="#0033A0" title="Total Historias">
          <img src={icon.folder || icon.user3} alt="" className="icon-card" />
          <span className="number">{stats.total}</span>
          <h3>Total • Registradas</h3>
        </Card>
        <Card color="#0B3A6A" title="Del Mes">
          <img src={icon.calendario || icon.escudobien} alt="" className="icon-card" />
          <span className="number">{stats.thisMonth}</span>
          <h3>Registros • Este Mes</h3>
        </Card>
        <Card color="#CE1126" title="De Hoy">
          <img src={icon.consulta3 || icon.mascarilla} alt="" className="icon-card" />
          <span className="number">{stats.todayCount}</span>
          <h3>Registros • Hoy</h3>
        </Card>
      </section>

      {/* Toolbar Section */}
      <section className="quick-actions2">
        <div className="pac-toolbar">
          <div className="filters">
            <div className="field">
              <img src={icon.lupa2} alt="" className="field-icon" />
              <input
                type="text"
                placeholder="Buscar por código, cédula, paciente..."
                value={filters.q}
                onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
              />
            </div>
          </div>

          <div className="actions">
            {tienePermiso('historias', 'exportar') && (
              <button className="btn btn-secondary " onClick={handlePreviewPDF}>
                <img src={icon.pdf1} className="btn-icon" alt="PDF" style={{ marginRight: 5 }} /> PDF
              </button>
            )}
            {tienePermiso('historias', 'exportar') && (
              <button className="btn btn-secondary" onClick={handleExportExcel}>
                <img src={icon.excel} className="btn-icon" alt="EXCEL" style={{ marginRight: 5 }} /> Excel
              </button>
            )}
            {tienePermiso('historias', 'crear') && (
              <button className="btn btn-primary" onClick={handleNuevo}>
                <img src={icon.user5} className="btn-icon" alt="" style={{ marginRight: 5 }} /> Nueva Historia
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Table Section */}
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

export default Historias;