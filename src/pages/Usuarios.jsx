import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../index.css";
import Card from "../components/Card";
import Tablas from "../components/Tablas";
import icon from "../components/icon";
import Spinner from "../components/spinner";
import { BaseUrl } from "../utils/Constans";
import ConfirmModal from "../components/ConfirmModal";
import InfoModal from "../components/InfoModal";
import FormModal from "../components/FormModal";
import ForUsuarios from "../Formularios/ForUsuarios";
import { useToast } from "../components/userToasd";
import SingleSelect from "../components/SingleSelect";

function Usuarios() {
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [filters, setFilters] = useState({ q: "", estatus: "todos" });

  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [editUser, setEditUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userToShow, setUserToShow] = useState(null);

  const showToast = useToast();

  const getAuthHeaders = () => {
    const token = (localStorage.getItem("token") || "").trim();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleNuevo = () => {
    setEditUser(null);
    setModalOpen(true);
  };
  const handleEdit = (row) => {
    setEditUser(row);
    setModalOpen(true);
  };
  const handleSaved = () => {
    fetchUsuarios();
    setModalOpen(false);
    setEditUser(null);
  };

  const openConfirmDelete = (id) => {
    setSelectedUser(id);
    setConfirmModal(true);
  };
  const closeConfirmDelete = () => {
    setSelectedUser(null);
    setConfirmModal(false);
  };

  const stats = useMemo(() => ({ total: usuarios.length }), [usuarios]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const est = filters.estatus;
    return usuarios.filter((u) => {
      const matchQ =
        !q ||
        `${u.username} ${u.correo} ${u.rol_nombre || ""} ${u.doctor_nombre || ""} ${u.doctor_apellido || ""}`
          .toLowerCase()
          .includes(q);
      const matchEstatus =
        est === "todos" ? true : (u.estatus || "activo").toLowerCase() === est;
      return matchQ && matchEstatus;
    });
  }, [usuarios, filters]);

  const estatusOptions = [
    { value: "todos", label: "Estatus" },
    { value: "activo", label: "Activo" },
    { value: "inactivo", label: "Inactivo" }
  ];

  const columns = [
    {
      header: "N°",
      key: "orden",
      render: (_row, idx) => idx + 1
    },
    { accessor: "username", header: "Usuario", key: "username" },
    { accessor: "correo", header: "Correo", key: "correo" },
    {
      header: "Rol",
      key: "rol_nombre",
      render: (row) => row.rol_nombre || "—"
    },
    {
      header: "Doctor",
      key: "doctor_nombre",
      render: (row) =>
        row.doctor_id
          ? `${row.doctor_nombre || ""} ${row.doctor_apellido || ""} (${row.doctor_cedula || ""})`
          : "—"
    },
    // {
    //   header: "Estatus",
    //   key: "estatus",
    //   render: (row) =>
    //     (row.estatus || "activo").toLowerCase() === "activo" ? (
    //       <span className="btn btn-xs badge--success">Activo</span>
    //     ) : (
    //       <span className="btn btn-xs badge--muted">Inactivo</span>
    //     )
    // },
    {
      header: "Estado",
      key: "estado",
      render: (row) =>
        row.estado ? (
          <span className="btn btn-xs badge--success">Habilitado</span>
        ) : (
          <span className="btn btn-xs badge--muted">Deshabilitado</span>
        )
    },
    {
      header: "Acciones",
      render: (row) => (
        <div className="row-actions" style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-xs btn-outline btn-view"
            title="Ver Detalles"
            onClick={() => handleView(row)}
          >
            Ver
          </button>
          <button
            className="btn btn-xs btn-outline btn-edit"
            title="Editar"
            onClick={() => handleEdit(row)}
          >
            Editar
          </button>
          <button
            className="btn btn-xs btn-outline btn-danger"
            title="Eliminar"
            onClick={() => openConfirmDelete(row.id)}
          >
            Eliminar
          </button>
        </div>
      )
    }
  ];

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BaseUrl}usuarios`, { headers: getAuthHeaders() });
      const data = Array.isArray(res.data) ? res.data : [];
      setUsuarios(data);
    } catch (error) {
      console.error("Error obteniendo usuarios:", error?.response?.data || error.message);
      showToast?.("Error obteniendo usuarios", "error", 3000);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleView = async (row) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BaseUrl}usuarios/ver/${row.id}`, {
        headers: getAuthHeaders()
      });
      setUserToShow(response.data);
    } catch (error) {
      console.error("Error al mostrar usuario:", error?.response?.data || error.message);
      showToast?.("Error al mostrar este usuario", "error", 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${BaseUrl}usuarios/eliminar/${id}`, {
        headers: getAuthHeaders()
      });
      showToast?.("Usuario eliminado con éxito", "success", 3000);
      await fetchUsuarios();
    } catch (error) {
      console.error("Error eliminando usuario:", error?.response?.data || error.message);
      showToast?.("Error al eliminar el usuario", "error", 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pac-page">
      {loading && (
        <div className="spinner-overlay">
          <Spinner size={50} label="Cargando Usuarios..." />
        </div>
      )}

      <InfoModal
        isOpen={!!userToShow}
        onClose={() => setUserToShow(null)}
        title="Información del Usuario"
      >
        {userToShow && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li><b>Usuario:</b> {userToShow.username}</li>
            <li><b>Correo:</b> {userToShow.correo}</li>
            <li><b>Rol:</b> {userToShow.roles_nombre || "—"}</li>
            <li>
              <b>Doctor:</b>{" "}
              {userToShow.doctor_id
                ? `${userToShow.doctor_nombre || ""} ${userToShow.doctor_apellido || ""} (${userToShow.doctor_cedula || ""})`
                : "—"}
            </li>
            {/* <li><b>Estatus:</b> {(userToShow.estatus || "activo")}</li> */}
            <li><b>Estado:</b> {userToShow.estado ? "Habilitado" : "Deshabilitado"}</li>
          </ul>
        )}
      </InfoModal>

      <ConfirmModal
        isOpen={confirmModal}
        onClose={closeConfirmDelete}
        onConfirm={() => {
          handleDelete(selectedUser);
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
        title={editUser ? "Editar Usuario" : "Registrar Usuario"}
      >
        <ForUsuarios
          initialData={editUser}
          onSave={handleSaved}
          onClose={() => setModalOpen(false)}
        />
      </FormModal>

      <section className="card-container">
        <Card color="#0033A0" title="Total de Usuarios">
          <img src={icon.user3} alt="" className="icon-card" />
          <span className="number">{stats.total}</span>
          <h3>Total • Usuarios</h3>
        </Card>
      </section>

      <section className="quick-actions2">
        <div className="pac-toolbar">
          <div className="filters">
            <div className="field">
              <img src={icon.calendario} alt="" className="field-icon" />
              <input
                type="text"
                placeholder="Buscar por usuario, correo, rol o doctor…"
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              />
            </div>
            <div>
              <SingleSelect
                options={estatusOptions}
                value={estatusOptions.find(opt => opt.value === filters.estatus)}
                onChange={opt => setFilters(f => ({ ...f, estatus: opt ? opt.value : "todos" }))}
                isClearable={false}
                placeholder="Estatus"
              />
            </div>
          </div>

          <div className="actions">
            <button className="btn btn-primary" onClick={handleNuevo}>
              <img src={icon.user5} className="btn-icon" alt="" style={{ marginRight: 5 }} />
              Nuevo Usuario
            </button>
          </div>
        </div>
      </section>

      <div className="table-wrap">
        <Tablas columns={columns} data={filtered} rowsPerPage={8} />
      </div>
    </div>
  );
}

export default Usuarios;