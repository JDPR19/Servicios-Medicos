import { useEffect, useMemo, useState } from "react";
import "../styles/consultas.css";
import Tablas from "../components/Tablas";
import Card from "../components/Card";
import InfoCard from "../components/InfoCard";
import icon from "../components/icon";
import { useNavigate } from "react-router-dom";

const ESTADOS = ["pendiente", "en_proceso", "finalizada", "cancelada"];

function toISODate(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function Consultas() {
  const navigate = useNavigate();

  // Mock (cámbialo por fetch a tu backend)
  const [data, setData] = useState([
    { id: 101, paciente: "Juan Pérez", doctor: "Dra. López", fecha: "2025-10-06", estado: "pendiente", finalidad: "Medicina General" },
    { id: 102, paciente: "María Gómez", doctor: "Dr. Salas", fecha: "2025-10-07", estado: "finalizada", finalidad: "Odontología" },
    { id: 103, paciente: "Pedro Ruiz", doctor: "Dra. López", fecha: "2025-10-07", estado: "en_proceso", finalidad: "Enfermería" },
    { id: 104, paciente: "Luisa M.", doctor: "Dr. A. Pérez", fecha: "2025-10-05", estado: "cancelada", finalidad: "Trauma" },
  ]);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("todos");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // Paginación
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Carga desde API (deja listo para conectar)
  useEffect(() => {
    // setLoading(true);
    // fetch(`${import.meta.env.VITE_API_URL}/consulta`)
    //   .then(r => r.json())
    //   .then(json => setData(json))
    //   .finally(() => setLoading(false));
  }, []);

  const hoyISO = toISODate();

  const filtered = useMemo(() => {
    let arr = [...data];
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      arr = arr.filter(
        (r) =>
          String(r.id).includes(s) ||
          r.paciente.toLowerCase().includes(s) ||
          r.doctor.toLowerCase().includes(s) ||
          (r.finalidad || "").toLowerCase().includes(s)
      );
    }
    if (estado !== "todos") {
      arr = arr.filter((r) => r.estado === estado);
    }
    if (desde) arr = arr.filter((r) => r.fecha >= desde);
    if (hasta) arr = arr.filter((r) => r.fecha <= hasta);
    return arr.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  }, [data, q, estado, desde, hasta]);

  useEffect(() => setPage(1), [q, estado, desde, hasta]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Métricas
  const stats = useMemo(() => {
    const total = filtered.length;
    const pendientes = filtered.filter((r) => r.estado === "pendiente").length;
    const finalizadas = filtered.filter((r) => r.estado === "finalizada").length;
    const hoy = filtered.filter((r) => r.fecha === hoyISO).length;
    return { total, pendientes, finalizadas, hoy };
  }, [filtered, hoyISO]);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const exportCSV = () => {
    const headers = ["ID", "Paciente", "Doctor", "Fecha", "Estado", "Finalidad"];
    const rows = filtered.map((r) => [r.id, r.paciente, r.doctor, r.fecha, r.estado, r.finalidad ?? ""]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `consultas_${toISODate()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const estadoClass = (e) => {
    switch (e) {
      case "pendiente": return "badge badge--warn";
      case "en_proceso": return "badge badge--info";
      case "finalizada": return "badge badge--success";
      case "cancelada": return "badge badge--muted";
      default: return "badge";
    }
  };

  // Definición de columnas para tu componente Tablas
  // Si Tablas usa otra API (headers/data o children), dime y lo adapto.
  const columns = [
    { key: "id", label: "ID" },
    { key: "paciente", label: "Paciente" },
    { key: "doctor", label: "Doctor" },
    { key: "fecha", label: "Fecha" },
    { key: "estado", label: "Estado", render: (v) => <span className={estadoClass(v)}>{v.replace("_", " ")}</span> },
    { key: "finalidad", label: "Finalidad" },
    {
      key: "acciones", label: "Acciones", render: (_, row) => (
        <div className="row-actions">
          <button className="btn btn-xs" onClick={() => navigate(`/admin/consulta/${row.id}`)}>Ver</button>
          <button className="btn btn-xs btn-warn" onClick={() => navigate(`/admin/consulta/${row.id}/editar`)}>Editar</button>
          <button className="btn btn-xs btn-outline">Imprimir</button>
        </div>
      )
    },
  ];

  return (
    <div className="consultas-page">
      {/* Métricas principales con tu Card */}
      <section className="card-container">
        <Card color="#0033A0">
          <img src={icon.consulta2} alt="icon-card" className="icon-card" />
          <span className="number">{stats.total}</span>
          <h3>Total Consultas</h3>
        </Card>
        <Card color="#CE1126">
          <img src={icon.consultapaciente} alt="icon-card" className="icon-card" />
          <span className="number">{stats.pendientes}</span>
          <h3>Pendientes</h3>
        </Card>
        <Card color="#FCD116">
          <img src={icon.consultabien} alt="icon-card" className="icon-card" />
          <span className="number">{stats.hoy}</span>
          <h3>Para Hoy</h3>
        </Card>
        <Card color="#0B3A6A">
          <img src={icon.folder} alt="icon-card" className="icon-card" />
          <span className="number">{stats.finalizadas}</span>
          <h3>Finalizadas</h3>
        </Card>
      </section>

      {/* Filtros y acciones en InfoCard */}
      <section className="filters-wrap">
        <InfoCard>
          <div className="consultas-toolbar">
            <div className="filters">
              <div className="field">
                <img src={icon.buscar || icon.calendario} alt="" className="field-icon" />
                <input
                  type="text"
                  placeholder="Buscar por paciente, doctor, finalidad o ID…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <div className="field">
                <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                  <option value="todos">Todos los estados</option>
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>{e.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Desde</label>
                <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
              </div>
              <div className="field">
                <label>Hasta</label>
                <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
              </div>
            </div>

            <div className="actions">
              <button className="btn btn-secondary" onClick={refresh} disabled={loading}>
                <img src={icon.candado} className="btn-icon" alt="" /> {loading ? "Actualizando…" : "Refrescar"}
              </button>
              <button className="btn btn-outline" onClick={exportCSV}>
                <img src={icon.impresora} className="btn-icon" alt="" /> Exportar CSV
              </button>
              <button className="btn btn-primary" onClick={() => navigate("/admin/consulta/nueva")}>
                <img src={icon.consulta} className="btn-icon" alt="" /> Nueva consulta
              </button>
            </div>
          </div>
        </InfoCard>
      </section>

      {/* Tabla de consultas con tu componente Tablas */}
      <div className="table-wrap">
        <Tablas
          columns={columns}
          data={pageData}
          loading={loading}
          emptyText="Sin resultados"
          page={page}
          pageSize={pageSize}
          total={filtered.length}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

export default Consultas;