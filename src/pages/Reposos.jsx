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
import ForReposos from "../Formularios/ForReposos";
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import { generateReposoPDF } from '../utils/pdfGenerator';
import SingleSelect from "../components/SingleSelect";
import { usePermiso } from '../utils/usePermiso';

function Reposos() {
  const tienePermiso = usePermiso();
  const showToast = useToast();
  const [pdfUrl, setPdfUrl] = useState(null);


  const [reposos, setReposos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);


  const [reposoToShow, setReposoToShow] = useState(null); // For InfoModal
  const [confirmModal, setConfirmModal] = useState(false); // For Delete
  const [selectedReposoId, setSelectedReposoId] = useState(null); // ID for delete

  const [modalOpen, setModalOpen] = useState(false); // For FormModal
  const [editReposo, setEditReposo] = useState(null); // Data for editing


  const [isSelectingPatient, setIsSelectingPatient] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [filters, setFilters] = useState({ q: "", estado: "todos", periodo: "todos" });

  // Helpers
  const getAuthHeaders = () => {
    const token = (localStorage.getItem('token') || '').trim();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const periodoOptions = [
    { value: "todos", label: "Todo el tiempo" },
    { value: "hoy", label: "Hoy" },
    { value: "semana", label: "Esta Semana" }
  ];

  // --- Fetch Data ---
  const fetchReposos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BaseUrl}reposos`, { headers: getAuthHeaders() });
      const data = response.data;
      if (Array.isArray(data)) {
        setReposos(data);
      } else {
        setReposos([]);
      }
    } catch (error) {
      console.error('Error obteniendo reposos:', error);
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

  const updateStatuses = async () => {
    try {
      await axios.get(`${BaseUrl}reposos/actualizar-estados`, { headers: getAuthHeaders() });
    } catch (error) {
      console.error('Error actualizando estados:', error);
    }
  };

  useEffect(() => {
    updateStatuses().then(() => {
      fetchReposos();
      fetchPatients();
    });
  }, []);

  // --- Actions ---

  // View Details
  const handleView = (row) => {
    setReposoToShow(row);
  };

  // Delete
  const openConfirmDelete = (id) => {
    setSelectedReposoId(id);
    setConfirmModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${BaseUrl}reposos/eliminar/${selectedReposoId}`, { headers: getAuthHeaders() });
      showToast?.('Reposo eliminado con éxito', 'success');
      fetchReposos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      showToast?.('Error al eliminar', 'error');
    } finally {
      setLoading(false);
      setConfirmModal(false);
      setSelectedReposoId(null);
    }
  };

  // New / Edit
  const handleNuevo = () => {
    setEditReposo(null);
    setSelectedPatient(null);
    setIsSelectingPatient(true);
    setModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditReposo(row);
    setSelectedPatient({ value: row.pacientes_id, label: `${row.cedula_paciente} - ${row.apellido_paciente}` });
    setIsSelectingPatient(false);
    setModalOpen(true);
  };

  const handleSaved = () => {
    fetchReposos();
    setModalOpen(false);
    setEditReposo(null);
    setSelectedPatient(null);
  };

  // Export List (Tabla completa)
  const handlePreviewPDF = () => {
    const docBlob = exportToPDF({
      data: filtered,
      columns: exportColumns,
      fileName: "reposos.pdf",
      title: "Listado de Reposos",
      preview: true
    });
    if (docBlob) {
      const url = URL.createObjectURL(docBlob);
      setPdfUrl(url);
    }
  };

  // Print Single Reposo (Ficha Individual)
  const handlePrintReposo = (row) => {
    try {
      const docBlob = generateReposoPDF(row);
      if (docBlob) {
        const url = URL.createObjectURL(docBlob);
        setPdfUrl(url);
      }
    } catch (error) {
      console.error("Error generando PDF:", error);
      showToast?.("Error al generar el PDF", "error");
    }
  };

  const handleExportExcel = () => {
    exportToExcel({
      data: filtered,
      columns: exportColumns,
      fileName: "reposos.xlsx",
      count: true,
      totalLabel: "TOTAL DE REGISTROS"
    });
  };

  // --- Stats & Filters ---
  const stats = useMemo(() => {
    const total = reposos.length;
    const activos = reposos.filter(r => r.estado === 'activo').length;
    const finalizados = reposos.filter(r => r.estado === 'finalizado').length;

    // Calculate "Del Mes"
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonth = reposos.filter(r => (r.fecha_inicio || '').startsWith(ym)).length;

    return { total, activos, finalizados, thisMonth };
  }, [reposos]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const estadoFilter = filters.estado;
    const periodoFilter = filters.periodo;

    return reposos.filter(r => {
      const searchStr = `${r.codigo} ${r.cedula_paciente} ${r.apellido_paciente} ${r.cedula_doctor} ${r.apellido_doctor}`.toLowerCase();
      const matchesSearch = !q || searchStr.includes(q);
      const matchesEstado = estadoFilter === 'todos' || r.estado === estadoFilter;

      // Filtro por periodo
      let matchesPeriodo = true;
      if (periodoFilter !== 'todos') {
        const date = new Date(r.fecha_inicio);
        const today = new Date();
        date.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (periodoFilter === 'hoy') {
          matchesPeriodo = date.getTime() === today.getTime();
        } else if (periodoFilter === 'semana') {
          const startOfWeek = new Date(today);
          const dayOfWeek = today.getDay() || 7; // 1 (Mon) - 7 (Sun)
          startOfWeek.setDate(today.getDate() - dayOfWeek + 1);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);

          matchesPeriodo = date >= startOfWeek && date <= endOfWeek;
        }
      }

      return matchesSearch && matchesEstado && matchesPeriodo;
    });
  }, [reposos, filters]);



  // --- Columns ---
  const estadoBadge = (estado) => {
    switch (estado) {
      case "activo": return <span className="badge badge--success">Activo</span>;
      case "finalizado": return <span className="badge badge--info">Finalizado</span>;
      case "anulado": return <span className="badge badge--muted">Anulado</span>;
      default: return <span className="badge">{estado}</span>;
    }
  };

  const columns = [
    { header: "N°", key: "orden", render: (_row, idx) => idx + 1 },
    { accessor: "codigo", header: "Código", key: "codigo" },
    {
      header: "Paciente",
      key: "paciente",
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'bold' }}>{row.apellido_paciente} {row.nombre_paciente}</span>
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
        </div>
      )
    },
    {
      header: "Periodo",
      key: "periodo",
      render: (row) => {
        const f1 = row.fecha_inicio ? row.fecha_inicio.split('T')[0] : '';
        const f2 = row.fecha_fin ? row.fecha_fin.split('T')[0] : '';
        return <span style={{ fontSize: '0.9em' }}>{f1} al {f2}</span>
      }
    },
    { accessor: "dias_reposo", header: "Días", key: "dias" },
    { header: "Estado", key: "estado", render: (row) => estadoBadge(row.estado) },
    {
      header: "Acciones",
      render: (row) => (
        <div className="row-actions" style={{ display: 'flex', gap: 8 }}>
          {tienePermiso('reposos', 'ver') && (
            <button className="btn btn-xs btn-outline btn-view" onClick={() => handleView(row)} title="Ver">Ver</button>
          )}
          {tienePermiso('reposos', 'editar') && (
            <button className="btn btn-xs btn-outline btn-edit" onClick={() => handleEdit(row)} title="Editar">Editar</button>
          )}
          {tienePermiso('reposos', 'exportar') && (
            <button className="btn btn-xs btn-outline btn-print" onClick={() => handlePrintReposo(row)} title="Imprimir Ficha">Imprimir</button>
          )}
          {tienePermiso('reposos', 'eliminar') && (
            <button className="btn btn-xs btn-outline btn-danger" onClick={() => openConfirmDelete(row.id)} title="Eliminar">Eliminar</button>
          )}
        </div >
      )
    },
  ];

  const exportColumns = [
    { header: "N°", key: "orden", render: (_row, idx) => idx + 1 },
    { header: "Código", key: "codigo" },
    { header: "Cédula", key: "cedula_paciente" },
    { header: "Paciente", key: "apellido_paciente" },
    { header: "Doctor", key: "apellido_doctor" },
    { header: "Inicio", key: "fecha_inicio" },
    { header: "Fin", key: "fecha_fin" },
    { header: "Días", key: "dias_reposo" },
    { header: "Estado", key: "estado" }
  ];

  return (
    <div className="pac-page">
      {loading && (
        <div className="spinner-overlay">
          <Spinner size={50} label="Cargando Reposos..." />
        </div>
      )}

      {/* Info Modal */}
      <InfoModal
        isOpen={!!reposoToShow}
        onClose={() => setReposoToShow(null)}
        title="Detalle de Reposo"
      >
        {reposoToShow && (
          <div className="info-modal-content">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <p><b>Código:</b> {reposoToShow.codigo}</p>
              <p><b>Estado:</b> {estadoBadge(reposoToShow.estado)}</p>
              <p><b>Paciente:</b> {reposoToShow.nombre_paciente} {reposoToShow.apellido_paciente}</p>
              <p><b>Cédula:</b> {reposoToShow.cedula_paciente}</p>
              <p><b>Doctor:</b> {reposoToShow.nombre_doctor} {reposoToShow.apellido_doctor}</p>
              <p><b>Días:</b> {reposoToShow.dias_reposo}</p>
              <p><b>Desde:</b> {reposoToShow.fecha_inicio?.split('T')[0]}</p>
              <p><b>Hasta:</b> {reposoToShow.fecha_fin?.split('T')[0]}</p>
            </div>
            <hr />
            <p><b>Diagnóstico:</b> {reposoToShow.diagnostico}</p>
            <p><b>Observación:</b> {reposoToShow.observacion}</p>
          </div>
        )}
      </InfoModal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={handleDelete}
        title="¿Eliminar Reposo?"
        message="¿Estás seguro de eliminar este reposo? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Form Modal (New/Edit) */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editReposo ? "Editar Reposo" : "Nuevo Reposo"}
      >
        {isSelectingPatient && !editReposo ? (
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
          <ForReposos
            pacienteId={selectedPatient?.value}
            reposoToEdit={editReposo}
            onSuccess={handleSaved}
            onCancel={() => setModalOpen(false)}
          />
        )}
      </FormModal>

      {/* PDF Preview Modal */}
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
            download="reposos.pdf"
            className="btn btn-primary"
            style={{ textDecoration: "none" }}
          >
            Descargar PDF
          </a>
        </div>
      </FormModal>

      {/* Cards Section */}
      <section className="card-container">
        <Card color="#0033A0" title="Total Reposos">
          <img src={icon.folder || icon.user3} alt="" className="icon-card" />
          <span className="number">{stats.total}</span>
          <h3>Total • Registrados</h3>
        </Card>
        <Card color="#0B3A6A" title="Activos">
          <img src={icon.escudobien || icon.user3} alt="" className="icon-card" />
          <span className="number">{stats.activos}</span>
          <h3>Reposos • Activos</h3>
        </Card>
        <Card color="#FCD116" title="Finalizados">
          <img src={icon.user5} alt="" className="icon-card" />
          <span className="number">{stats.finalizados}</span>
          <h3>Reposos • Finalizados</h3>
        </Card>
        <Card color="#CE1126" title="Del Mes">
          <img src={icon.calendar || icon.mascarilla} alt="" className="icon-card" />
          <span className="number">{stats.thisMonth}</span>
          <h3>Registros • Este Mes</h3>
        </Card>
      </section>

      {/* Toolbar Section */}
      <section className="quick-actions2">
        <div className="pac-toolbar">
          <div className="filters">
            {/* <div className="field">
              <img src={icon.lupa2} alt="" className="field-icon" />
              <input
                type="text"
                placeholder="Buscar por código, cédula, paciente..."
                value={filters.q}
                onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
              />
            </div> */}
            <div className="field">
              <select
                value={filters.estado}
                onChange={(e) => setFilters(f => ({ ...f, estado: e.target.value }))}
                style={{ paddingLeft: 10 }}
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="finalizado">Finalizado</option>
                <option value="anulado">Anulado</option>
              </select>
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
            {tienePermiso('reposos', 'exportar') && (
              <button className="btn btn-secondary " onClick={handlePreviewPDF}>
                <img src={icon.pdf1} className="btn-icon" alt="PDF" style={{ marginRight: 5 }} /> PDF
              </button>
            )}
            {tienePermiso('reposos', 'exportar') && (
              <button className="btn btn-secondary" onClick={handleExportExcel}>
                <img src={icon.excel} className="btn-icon" alt="EXCEL" style={{ marginRight: 5 }} /> Excel
              </button>
            )}
            {tienePermiso('reposos', 'crear') && (
              <button className="btn btn-primary" onClick={handleNuevo}>
                <img src={icon.plus || icon.user5} className="btn-icon" alt="" style={{ marginRight: 5 }} /> Nuevo Reposo
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

export default Reposos;
