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
import ForRoles from "../Formularios/ForRoles";
import { useToast } from "../components/userToasd";
import { PANTALLAS } from "../utils/PermisosUser";

function Roles() {
const [loading, setLoading] = useState(false);
const [roles, setRoles] = useState([]);
const [filters, setFilters] = useState({ q: "" });

const [confirmModal, setConfirmModal] = useState(false);
const [selectedRole, setSelectedRole] = useState(null);

const [editRole, setEditRole] = useState(null);
const [modalOpen, setModalOpen] = useState(false);
const [roleToShow, setRoleToShow] = useState(null);

const showToast = useToast();

// Helpers
const getAuthHeaders = () => {
const token = (localStorage.getItem("token") || "").trim();
return token ? { authorization: `Bearer ${token}` } : {};
};

const openConfirmDelete = (id) => {
setSelectedRole(id);
setConfirmModal(true);
};
const closeConfirmDelete = () => {
setSelectedRole(null);
setConfirmModal(false);
};
const handleNuevo = () => {
setEditRole(null);
setModalOpen(true);
};
const handleEdit = (row) => {
setEditRole(row);
setModalOpen(true);
};
const handleSaved = () => {
fetchRoles();
setModalOpen(false);
setEditRole(null);
};

const stats = useMemo(() => ({ total: roles.length }), [roles]);

const filtered = useMemo(() => {
const q = filters.q.trim().toLowerCase();
return roles.filter((r) => {
    const nombre = `${r.nombre || ""}`.toLowerCase();
    return !q || nombre.includes(q);
});
}, [roles, filters]);

  // Utils para permisos JSON
const contarPermisos = (permisos) => {
if (!permisos || typeof permisos !== "object") return 0;
let count = 0;
Object.entries(permisos).forEach(([k, v]) => {
    if (k === "acceso_total") {
    if (v === true) count += 1; // cuenta como 1 flag
    return;
    }
    if (v && typeof v === "object") {
    Object.values(v).forEach((flag) => {
        if (flag === true) count += 1;
    });
    }
});
return count;
};

// const prettyPermisos = (permisos) => {
//     if (!permisos || typeof permisos !== "object") return [];
//     const out = [];
//     const labelByKey = Object.fromEntries(PANTALLAS.map(p => [p.key, p.label]));
//     if (permisos.acceso_total) out.push("Acceso total");
//     Object.entries(permisos)
//         .filter(([k]) => k !== "acceso_total")
//         .forEach(([mod, acts]) => {
//         if (!acts || typeof acts !== "object") return;
//         const activos = Object.entries(acts)
//             .filter(([, val]) => val === true)
//             .map(([acc]) => acc);
//         if (activos.length > 0) {
//             out.push(`${labelByKey[mod] || mod}: ${activos.join(", ")}`);
//         }
//         });
//     return out;
// };

const pantallasConAcceso = (permisos) => {
    if (!permisos || typeof permisos !== "object") return [];
    if (permisos.acceso_total) return PANTALLAS.map(p => p.label);
    return PANTALLAS
    .filter(p => Object.values(permisos[p.key] || {}).some(v => v === true))
    .map(p => p.label);
};

const columns = [
{
    header: "N°",
    key: "orden",
    render: (_row, idx) => idx + 1,
},
{ accessor: "nombre", header: "Nombre", key: "nombre" },
{
    header: "Permisos",
    key: "permisos",
    render: (row) => {
    const total = contarPermisos(row.permisos);
    const at = row.permisos?.acceso_total ? " • Acceso total" : "";
    return (
        <span style={{ fontWeight: 600, color: "#0B3A6A" }}>
        {total} flags{at}
        </span>
    );
    },
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
    ),
},
];

// Peticiones
const fetchRoles = async () => {
setLoading(true);
try {
    const res = await axios.get(`${BaseUrl}roles`, {
    headers: getAuthHeaders(),
    });
    const data = Array.isArray(res.data) ? res.data : [];
    setRoles(data);
} catch (error) {
    console.error("Error obteniendo roles:", error?.response?.data || error.message);
    showToast?.("Error obteniendo roles", "error", 3000);
    setRoles([]);
} finally {
    setLoading(false);
}
};

useEffect(() => {
fetchRoles();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

const handleView = async (row) => {
setLoading(true);
try {
    const response = await axios.get(`${BaseUrl}roles/ver/${row.id}`, {
    headers: getAuthHeaders(),
    });
    setRoleToShow(response.data);
} catch (error) {
    console.error("Error al mostrar rol:", error?.response?.data || error.message);
    showToast?.("Error al mostrar este rol", "error", 3000);
} finally {
    setLoading(false);
}
};

const handleDelete = async (id) => {
setLoading(true);
try {
    await axios.delete(`${BaseUrl}roles/eliminar/${id}`, {
    headers: getAuthHeaders(),
    });
    showToast?.("Rol eliminado con éxito", "success", 3000);
    await fetchRoles();
} catch (error) {
    console.error("Error eliminando rol:", error?.response?.data || error.message);
    showToast?.("Error al eliminar el rol", "error", 3000);
} finally {
    setLoading(false);
}
};

return (
<div className="pac-page">
    {loading && (
    <div className="spinner-overlay">
        <Spinner size={50} label="Cargando Roles..." />
    </div>
    )}

    <InfoModal
    isOpen={!!roleToShow}
    onClose={() => setRoleToShow(null)}
    title="Información del Rol"
    >
    {roleToShow && (
        <ul style={{ listStyle: "none", padding: 0 }}>
        <li>
            <b>Nombre:</b> {roleToShow.nombre}
        </li>
        <li>
            <b>Pantallas con acceso permitido para este rol:</b>
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {pantallasConAcceso(roleToShow.permisos).length === 0 ? (
                <span style={{ color: "#888" }}>Sin acceso</span>
            ) : (
                pantallasConAcceso(roleToShow.permisos).map((pantalla, i) => (
                <span
                    key={pantalla + i}
                    style={{
                    background: "#0033a0c8",
                    color: "#fff",
                    borderRadius: "12px",
                    padding: "4px 12px",
                    fontSize: "0.98rem",
                    fontWeight: 500,
                    letterSpacing: 1,
                    boxShadow: "0 1px 4px rgba(0,51,160,0.08)"
                    }}
                >
                    {pantalla}
                </span>
                ))
            )}
            </div>
        </li>
        </ul>
    )}
    </InfoModal>

    <ConfirmModal
    isOpen={confirmModal}
    onClose={closeConfirmDelete}
    onConfirm={() => {
        handleDelete(selectedRole);
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
    title={editRole ? "Editar Rol" : "Registrar Rol"}
    >
    <ForRoles
        initialData={editRole}
        onSave={handleSaved}
        onClose={() => setModalOpen(false)}
    />
    </FormModal>

    <section className="card-container">
    <Card color="#0033A0" title="Total de Roles">
        <img src={icon.candado} alt="Icono roles" className="icon-card" />
        <span className="number">{stats.total}</span>
        <h3>Total • Roles</h3>
    </Card>
    </section>

    <section className="quick-actions2">
    <div className="pac-toolbar">
        <div className="filters">
        <div className="field">
            <img src={icon.lupa2} alt="Buscar" className="field-icon" />
            <input
            type="text"
            placeholder="Buscar por nombre de rol..."
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            />
        </div>
        </div>

        <div className="actions">
        <button className="btn btn-primary" onClick={handleNuevo}>
            <img
            src={icon.user5}
            alt="Nuevo Registro"
            className="btn-icon"
            style={{ marginRight: 5 }}
            />
            Nuevo Rol
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

export default Roles;