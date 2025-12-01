
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import '../index.css';
import Card from "../components/Card";
import Tablas from "../components/Tablas";
import icon from "../components/icon";
// import { useNavigate } from "react-router-dom";
import { useToast } from "../components/userToasd";
import Spinner from "../components/spinner";
import { BaseUrl } from "../utils/Constans";
import InfoModal from "../components/InfoModal";
import ConfirmModal from "../components/ConfirmModal";
import FormModal from "../components/FormModal";
import ForDoctor from "../Formularios/ForDoctor";
import { exportToPDF, exportToExcel } from '../utils/exportUtils';
import SingleSelect from "../components/SingleSelect";

function Doctores() {
  // const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState(null);
  const showToast = useToast();
  const [doctorToShow, setDoctorToShow] = useState(null);
  const [doctores, setDoctores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ estado: "todos", q: "" });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState(null);

  //////---------------------helpers para token y autorization en fetcher y handles -----------------------------/////// 
  const getAuthHeaders = () => {
    const token = (localStorage.getItem('token') || '').trim();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const openConfirmDelete = (id) => {
    setSelectedDoctor(id);
    setConfirmModal(true);
  };

  const closeConfirmDelete = () => {
    setSelectedDoctor(null);
    setConfirmModal(false);
  };

  // boton nuevo
  const handleNuevo = () => {
    setEditDoctor();
    setModalOpen(true);
  };

  // Abrir para editar
  const handleEdit = (row) => {
    setEditDoctor(row);
    setModalOpen(true);
  };

  // Al guardar, refresca la tabla y cierra el modal modalformulario
  const handleSaved = () => {
    fetchDoctores();
    setModalOpen(false);
    setEditDoctor(null);
  };



  const handlePreviewPDF = () => {
    const docBlob = exportToPDF({
      data: filtered,
      columns: exportColumns,
      fileName: "doctores.pdf",
      title: "Listado de Doctores",
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
      fileName: "doctores.xlsx",
      count: true,
      totalLabel: "TOTAL DE REGISTROS"
    });
  };

  const estadoOptions = [
    { value: "todos", label: "Estado" },
    { value: "activo", label: "Activo" },
    { value: "inactivo", label: "Inactivo" }
  ];
  //////////////////////////////////////////----Llamada de los datos al montar el componente ----/////////////////////////////////////////////////////////////////////////////// 
  const fetchDoctores = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BaseUrl}doctores`, { headers: getAuthHeaders() });
      const data = response.data;
      if (!Array.isArray(data)) {
        console.warn('Respuesta inesperada /doctores:', data);
        setDoctores([]);
        showToast?.('Respuesta inesperada del servidor', 'error', 4000);
        return;
      }
      setDoctores(data);
    } catch (error) {
      console.error('Error obteniendo doctores:', error?.response?.data || error.message);
      showToast?.('Error obteniendo los datos', 'error', 3000);
      setDoctores([]);
    } finally {
      setLoading(false);
    }
  };
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

  //////////-------------------- Manejador de vista por id ----------------------------------///////////////
  const handleView = async (row) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BaseUrl}doctores/ver/${row.id}`, { headers: getAuthHeaders() });
      setDoctorToShow(res.data);
    } catch (error) {
      console.error('error Al mostrar datos por id de doctor', error);
      showToast?.('No se pudo obtener la información del doctor', 'error');
    } finally {
      setLoading(false);
    }
  };
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 

  //////////-------------------- Manejador de Eliminado por id ----------------------------------////////////
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${BaseUrl}doctores/eliminar/${id}`, { headers: getAuthHeaders() });
      showToast?.('Doctor eliminado con éxito', 'success', 3000);
      await fetchDoctores();
    } catch (error) {
      console.error('Error al eliminar:', error?.response?.data || error.message);
      showToast?.('Error al eliminar', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
  useEffect(() => {
    fetchDoctores();
  }, []);

  const stats = useMemo(() => {
    const total = doctores.length;
    const activos = doctores.filter(d => d.estado === true || d.estado === 'activo').length;
    const inactivos = total - activos;
    const thisMonth = (() => {
      const now = new Date();
      const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return doctores.filter(d => (d.fecha_atencion || d.created_at || '').startsWith(ym)).length;
    })();
    return { total, activos, inactivos, thisMonth };
  }, [doctores]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const est = filters.estado;
    return doctores.filter(d => {
      const matchQ = !q || `${d.cedula} ${d.nombre} ${d.apellido}`.toLowerCase().includes(q);
      const isActivo = d.estado === true || d.estado === 'activo';
      const matchEstado = est === 'todos' ? true : (est === 'activo' ? isActivo : !isActivo);
      return matchQ && matchEstado;
    });
  }, [doctores, filters]);



  const columns = [
    {
      header: "N°",
      key: "orden",
      render: (_row, idx) => idx + 1
    },
    { accessor: "cedula", header: "Cédula", key: "cedula" },
    { accessor: "apellido", header: "Apellido", key: "apellido" },
    { accessor: "nombre", header: "Nombre", key: "nombre" },
    // { accessor: "profesion_carrera", header: "Profesión", key: "profesion_carrera" },
    // { accessor: "cargo_nombre", header: "Cargo", key: "cargo_nombre" },
    { accessor: "contacto", header: "Contacto", key: "contacto" },
    {
      header: "Estado",
      key: "estado",
      render: (row) =>
        row.estado === true || row.estado === "activo"
          ? <span className="btn btn-xs badge--success">Activo</span>
          : <span className="btn btn-xs badge--muted">Inactivo</span>
    },
    {
      header: "Acciones",
      render: (row) => (
        <div className="row-actions" style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-xs btn-outline btn-view" onClick={() => handleView(row)} title="Ver">Ver</button>
          <button className="btn btn-xs btn-outline btn-edit" onClick={() => handleEdit(row)} title="Editar">Editar</button>
          <button className="btn btn-xs btn-outline btn-print">Imprimir</button>
          <button className="btn btn-xs btn-outline btn-danger" onClick={() => openConfirmDelete(row.id)} title="Eliminar">Eliminar</button>
        </div>
      )
    },
  ];

  const exportColumns = [
    {
      header: "N°",
      key: "orden",
      render: (_row, idx) => idx + 1
    },
    { header: "Cédula", key: "cedula" },
    { header: "Apellido", key: "apellido" },
    { header: "Nombre", key: "nombre" },
    { header: "Profesión", key: "profesion_carrera" },
    { header: "Cargo", key: "cargo_nombre" },
    { header: "Contacto", key: "contacto" },
    {
      header: "Estado",
      key: "estado",
      render: row =>
        row.estado === true || row.estado === "activo"
          ? "Activo"
          : "Inactivo"
    }
  ];

  return (
    <div className="pac-page">
      {loading && (
        <div className="spinner-overlay">
          <Spinner size={50} label="Cargando Doctores...." />
        </div>
      )}

      <InfoModal
        isOpen={!!doctorToShow}
        onClose={() => setDoctorToShow(null)}
        title="Información del Doctor"
      >
        {doctorToShow && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><b>Cédula:</b> {doctorToShow.cedula}</li>
            <li><b>Nombre:</b> {doctorToShow.nombre} {doctorToShow.apellido}</li>
            <li><b>Profesión:</b> {doctorToShow.profesion_carrera}</li>
            <li><b>Cargo:</b> {doctorToShow.cargo_nombre}</li>
            <li><b>Contacto:</b> {doctorToShow.contacto}</li>
            <li><b>Estado:</b> {doctorToShow.estado === true || doctorToShow.estado === "activo" ? "Activo" : "Inactivo"}</li>
          </ul>
        )}
      </InfoModal>

      <ConfirmModal
        isOpen={confirmModal}
        onClose={closeConfirmDelete}
        onConfirm={() => {
          handleDelete(selectedDoctor);
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
        title={editDoctor ? "Editar Doctor" : "Registrar Doctor"}
      >
        <ForDoctor
          initialData={editDoctor}
          onSave={handleSaved}
          onClose={() => setModalOpen(false)}
        />
      </FormModal>


      <FormModal
        isOpen={!!pdfUrl}
        onClose={() => {
          setPdfUrl(null);
          // Limpia el objeto URL para liberar memoria
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
            download="doctores.pdf"
            className="btn btn-primary"
            style={{ textDecoration: "none" }}
          >
            Descargar PDF
          </a>
        </div>
      </FormModal>

      <section className="card-container">
        <Card color="#0033A0" title="Total de Doctores">
          <img src={icon.user3} alt="" className="icon-card" />
          <span className="number">{stats.total}</span>
          <h3>Total • Doctores</h3>
        </Card>
        <Card color="#0B3A6A" title="Activos">
          <img src={icon.escudobien} alt="" className="icon-card" />
          <span className="number">{stats.activos}</span>
          <h3>Doctores Activos</h3>
        </Card>
        <Card color="#CE1126" title="Inactivos">
          <img src={icon.mascarilla} alt="" className="icon-card" />
          <span className="number">{stats.inactivos}</span>
          <h3>Doctores Inactivos</h3>
        </Card>
      </section>

      <section className="quick-actions2">
        <div className="pac-toolbar">
          <div className="filters">
            <div className="field">
              <img src={icon.lupa2} alt="" className="field-icon" />
              <input
                type="text"
                placeholder="Buscar por cédula, nombre o apellido…"
                value={filters.q}
                onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
              />
            </div>
            <div>
              <SingleSelect
                options={estadoOptions}
                value={estadoOptions.find(opt => opt.value === filters.estado)}
                onChange={opt =>
                  setFilters(f => ({ ...f, estado: opt ? opt.value : "todos" }))
                }
                isClearable={false}
                placeholder="Estado"
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
              <img src={icon.user5} className="btn-icon" alt="" style={{ marginRight: 5 }} /> Nuevo Doctor
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

export default Doctores;
