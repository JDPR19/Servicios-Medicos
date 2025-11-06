import { useMemo } from "react";
import '../index.css'
import Card from "../components/Card";
import Tablas from "../components/Tablas";
import icon from "../components/icon";
import { useNavigate } from "react-router-dom";
import TabsFiltro from "../components/TabsFiltro";

const MOCK = [
  {
    id: 1,
    codigo: "CON-001",
    cedula: "V-12345678",
    paciente: "Juan Pérez",
    enfermedad: "Hipertensión",
    diagnostico: "Presión arterial elevada",
    tratamientos: "Reposo, dieta baja en sal",
    observaciones: "Control en 1 semana",
    fecha_atencion: "2025-09-15",
    estado: true,
  },
  {
    id: 2,
    codigo: "CON-002",
    cedula: "V-87654321",
    paciente: "María Gómez",
    enfermedad: "Diabetes",
    diagnostico: "Glucosa alta",
    tratamientos: "Metformina, dieta",
    observaciones: "Revisión mensual",
    fecha_atencion: "2025-10-01",
    estado: true,
  },
  {
    id: 3,
    codigo: "CON-003",
    cedula: "E-22334455",
    paciente: "Pedro Ruiz",
    enfermedad: "Gripe",
    diagnostico: "Cuadro viral leve",
    tratamientos: "Paracetamol, líquidos",
    observaciones: "Reposo domiciliario",
    fecha_atencion: "2025-08-21",
    estado: false,
  },
];

function Consultas() {
    const navigate = useNavigate();
    const stats = useMemo(() => {
    const total = MOCK.length;
    const activos = MOCK.filter(p => p.estado === "activo").length;
    const inactivos = MOCK.filter(p => p.estado === "inactivo").length;
    const nuevosMes = MOCK.filter(p => (p.fechaIngreso || "").startsWith("2025-10")).length;
    return { total, activos, inactivos, nuevosMes };
  }, []);
;

  // const estadoBadge = (estado) =>
  //   estado === "activo" ? "badge badge--success" : "badge badge--muted";

  const columns = [
  // { accessor: "id", header: "ID", width: 60 },
  { accessor: "codigo", header: "Código" },
  // { accessor: "fecha_atencion", header: "Fecha Atención" },
  { accessor: "paciente", header: "Paciente" }, 
  { accessor: "enfermedad", header: "Enfermedad" },
  { accessor: "diagnostico", header: "Diagnóstico" },
  { accessor: "tratamientos", header: "Tratamientos" },
  { accessor: "observaciones", header: "Observaciones" },
  
    { header: "Acciones", render: () => (
        <div className="row-actions">
          <button className="btn btn-xs" title="Ver">Ver</button>
          <button className="btn btn-xs btn-warn" title="Editar">Editar</button>
          <button className="btn btn-xs btn-outline" title="Imprimir">Imprimir</button>
          <button className="btn btn-xs btn-outline btn-danger" title="Eliminar">Eliminar</button>
        </div>
      )
    },
  ];

  return (
    <div className="pac-page">
      <section className="card-container">
        <Card color="#0033A0" title="Total de Pacientes Registrados">
          <img src={icon.user3} alt="" className="icon-card" />
          <span className="number">{stats.total}</span>
          <h3>Total • Pacientes</h3>
        </Card>
        <Card color="#0B3A6A" title="Total de Pacientes Saludables">
          <img src={icon.escudobien} alt="" className="icon-card" />
          <span className="number">{stats.activos}</span>
          <h3>Total • Saludables</h3>
        </Card>
        <Card color="#CE1126" title="Total de Pacientes de Reposo">
          <img src={icon.mascarilla} alt="" className="icon-card" />
          <span className="number">{stats.inactivos}</span>
          <h3>Total • Reposo</h3>
        </Card>
        <Card color="#FCD116" title="Total de Pacientes Atendidos en el Día">
          <img src={icon.user5} alt="" className="icon-card" />
          <span className="number">{stats.nuevosMes}</span>
          <h3>Atendidos (Día)</h3>
        </Card>
      </section>

      <section className="quick-actions2">
        <div className="pac-toolbar">
          <div className="filters">
            <div className="field">
              <img src={icon.lupa2} alt="" className="field-icon" />
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
            {/* <button className="btn btn-secondary">
              <img src={icon.candado} className="btn-icon" alt="" /> Refrescar
            </button> */}
            <button className="btn btn-outline">
              <img src={icon.impresora} className="btn-icon" alt="" /> Exportar
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/admin/ForConsultas')}>
              <img src={icon.user5}  className="btn-icon" alt="" /> Nuevo paciente
            </button>
          </div>
        </div>
      </section>

      <div className="table-wrap">
        <Tablas columns={columns} data={MOCK} rowsPerPage={5} />
      </div>
    </div>
  );
}

export default Consultas;