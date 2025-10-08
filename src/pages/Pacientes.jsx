import { useMemo } from "react";
import "../styles/pacientes.css";
import Card from "../components/Card";
import InfoCard from "../components/InfoCard";
import Tablas from "../components/Tablas";
import icon from "../components/icon";

const MOCK = [
  { id: 1, cedula: "V-12345678", nombre: "Juan", apellido: "Pérez", sexo: "M", edad: 32, telefono: "0412-1234567", estado: "activo", fechaIngreso: "2025-09-15" },
  { id: 2, cedula: "V-87654321", nombre: "María", apellido: "Gómez", sexo: "F", edad: 28, telefono: "0414-7654321", estado: "activo", fechaIngreso: "2025-10-01" },
  { id: 3, cedula: "E-22334455", nombre: "Pedro", apellido: "Ruiz", sexo: "M", edad: 45, telefono: "0424-1112233", estado: "inactivo", fechaIngreso: "2025-08-21" },
];

function Pacientes() {
  const stats = useMemo(() => {
    const total = MOCK.length;
    const activos = MOCK.filter(p => p.estado === "activo").length;
    const inactivos = MOCK.filter(p => p.estado === "inactivo").length;
    const nuevosMes = MOCK.filter(p => (p.fechaIngreso || "").startsWith("2025-10")).length;
    return { total, activos, inactivos, nuevosMes };
  }, []);

  const estadoBadge = (estado) =>
    estado === "activo" ? "badge badge--success" : "badge badge--muted";

  const columns = [
    { key: "id", label: "ID" },
    { key: "cedula", label: "Cédula" },
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "sexo", label: "Sexo" },
    { key: "edad", label: "Edad" },
    { key: "telefono", label: "Teléfono" },
    { key: "estado", label: "Estado", render: (v) => <span className={estadoBadge(v)}>{v}</span> },
    { key: "fechaIngreso", label: "Ingreso" },
    {
      key: "acciones",
      label: "Acciones",
      render: () => (
        <div className="row-actions">
          <button className="btn btn-xs">Ver</button>
          <button className="btn btn-xs btn-warn">Editar</button>
          <button className="btn btn-xs btn-outline">Imprimir</button>
        </div>
      ),
    },
  ];

  return (
    <div className="pac-page">
      {/* Métricas */}
      <section className="card-container">
        <Card color="#0033A0">
          <img src={icon.user3} alt="" className="icon-card" />
          <span className="number">{stats.total}</span>
          <h3>Total Pacientes</h3>
        </Card>
        <Card color="#0B3A6A">
          <img src={icon.user2} alt="" className="icon-card" />
          <span className="number">{stats.activos}</span>
          <h3>Activos</h3>
        </Card>
        <Card color="#CE1126">
          <img src={icon.caratriste} alt="" className="icon-card" />
          <span className="number">{stats.inactivos}</span>
          <h3>Inactivos</h3>
        </Card>
        <Card color="#FCD116">
          <img src={icon.user} alt="" className="icon-card" />
          <span className="number">{stats.nuevosMes}</span>
          <h3>Nuevos (mes)</h3>
        </Card>
      </section>

      {/* Barra de acciones (vista) */}
      <InfoCard>
        <div className="pac-toolbar">
          <div className="filters">
            <div className="field">
              <img src={icon.buscar || icon.calendario} alt="" className="field-icon" />
              <input type="text" placeholder="Buscar por cédula, nombre o apellido…" />
            </div>
            <div className="field">
              <select defaultValue="todos">
                <option value="todos">Todos</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
            <div className="field">
              <select defaultValue="todos">
                <option value="todos">Estado</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <div className="field">
              <label>Desde</label>
              <input type="date" />
            </div>
            <div className="field">
              <label>Hasta</label>
              <input type="date" />
            </div>
          </div>

          <div className="actions">
            <button className="btn btn-secondary">
              <img src={icon.candado} className="btn-icon" alt="" /> Refrescar
            </button>
            <button className="btn btn-outline">
              <img src={icon.impresora} className="btn-icon" alt="" /> Exportar CSV
            </button>
            <button className="btn btn-primary">
              <img src={icon['user plus']} className="btn-icon" alt="" /> Nuevo paciente
            </button>
          </div>
        </div>
      </InfoCard>

      {/* Tabla */}
      <div className="table-wrap">
        <Tablas
          columns={columns}
          data={MOCK}
          loading={false}
          emptyText="Sin pacientes"
          page={1}
          pageSize={10}
          total={MOCK.length}
          onPageChange={() => {}}
        />
      </div>
    </div>
  );
}

export default Pacientes;