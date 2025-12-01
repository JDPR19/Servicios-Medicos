import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "../utils/Constans";
import { useToast } from "../components/userToasd";
import Spinner from "../components/spinner";
import FormModal from "../components/FormModal";
import icon from "../components/Icon";
import ForSignosVitales from "../Formularios/ForSignosVitales";
import ForHistorias from "../Formularios/ForHistorias";
import ForReposos from "../Formularios/ForReposos";
import ForSeguimientos from "../Formularios/ForSeguimientos";
import HistorialReposos from "../components/HistorialReposos";
import TimelineSeguimientos from "../components/TimelineSeguimientos";
import DetalleConsulta from "../components/DetalleConsulta";
import "../index.css";
import "./SeguimientoPaciente.css";

function SeguimientoPaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  const [paciente, setPaciente] = useState(null);
  const [historia, setHistoria] = useState(null);
  const [signos, setSignos] = useState([]);
  const [reposos, setReposos] = useState([]);
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSignosModal, setShowSignosModal] = useState(false);
  const [showSignosDetailModal, setShowSignosDetailModal] = useState(false);
  const [showHistoriaModal, setShowHistoriaModal] = useState(false);
  const [showRepososModal, setShowRepososModal] = useState(false);
  const [showHistorialRepososModal, setShowHistorialRepososModal] = useState(false);
  const [showSeguimientoModal, setShowSeguimientoModal] = useState(false);
  const [reposoSeleccionado, setReposoSeleccionado] = useState(null);
  const [seguimientoSeleccionado, setSeguimientoSeleccionado] = useState(null);
  const [showConsultaModal, setShowConsultaModal] = useState(false);
  const [consultaIdSeleccionada, setConsultaIdSeleccionada] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const pacienteRes = await axios.get(`${BaseUrl}pacientes/${id}`, { headers });
      setPaciente(pacienteRes.data);

      try {
        const historiaRes = await axios.get(`${BaseUrl}historias_medicas/paciente/${id}`, { headers });
        setHistoria(historiaRes.data || null);
      } catch (e) {
        console.log("No hay historia médica", e);
        setHistoria(null);
      }

      await fetchSignosVitales();
      await fetchReposos();
      await fetchSeguimientos();

      setLoading(false);
    } catch (error) {
      console.error("Error al cargar datos", error);
      showToast?.("Error al cargar los datos del paciente", "error");
      setLoading(false);
    }
  };

  const fetchSignosVitales = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const signosRes = await axios.get(`${BaseUrl}signos_vitales/paciente/${id}`, { headers });
      setSignos(signosRes.data || []);
    } catch (e) {
      console.log("Error al cargar signos vitales", e);
    }
  };

  const fetchReposos = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const repososRes = await axios.get(`${BaseUrl}reposos/paciente/${id}`, { headers });
      setReposos(repososRes.data || []);
    } catch (e) {
      console.log("Error al cargar reposos", e);
    }
  };

  const fetchSeguimientos = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const seguimientosRes = await axios.get(`${BaseUrl}seguimientos/paciente/${id}`, { headers });
      setSeguimientos(seguimientosRes.data || []);
    } catch (e) {
      console.log("Error al cargar seguimientos", e);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSignosSuccess = () => {
    setShowSignosModal(false);
    fetchSignosVitales();
    showToast?.("Operación exitosa", "success");
  };

  const handleHistoriaSuccess = () => {
    setShowHistoriaModal(false);
    fetchData();
    showToast?.("Historia guardada correctamente", "success");
  };

  const handleReposoSuccess = () => {
    setShowRepososModal(false);
    setReposoSeleccionado(null);
    fetchReposos();
    showToast?.("Reposo registrado correctamente", "success");
  };

  const handleSeguimientoSuccess = () => {
    setShowSeguimientoModal(false);
    setSeguimientoSeleccionado(null);
    fetchSeguimientos();
    showToast?.("Seguimiento registrado correctamente", "success");
  };

  const handleVerDetalleReposo = (reposo) => {
    setReposoSeleccionado(reposo);
    setShowHistorialRepososModal(false);
    setShowRepososModal(true);
  };

  const handleRegistrarSeguimiento = (seguimiento) => {
    setSeguimientoSeleccionado(seguimiento);
    setShowSeguimientoModal(true);
  };

  const handleVerConsulta = (consultaId) => {
    setConsultaIdSeleccionada(consultaId);
    setShowConsultaModal(true);
  };

  if (loading) {
    return (
      <div className="spinner-overlay">
        <Spinner size={50} label="Cargando expediente..." />
      </div>
    );
  }

  if (!paciente) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>Paciente no encontrado</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }

  return (
    <div className="pac-page" style={{ padding: "20px", backgroundColor: "#f4f6f9", minHeight: "100vh" }}>

      <div className="patient-header">
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div className="patient-avatar">
            {paciente.nombre ? paciente.nombre.charAt(0) : "P"}
          </div>
          <div>
            <h1 style={{ margin: 0, color: "#1a1a1a", fontSize: "24px" }}>
              {paciente.nombre} {paciente.apellido}
            </h1>
            <p style={{ margin: "5px 0 0", color: "#666", fontSize: "14px" }}>
              C.I: {paciente.cedula} | Edad: {paciente.edad || "N/A"} años | Sexo: {paciente.sexo}
            </p>
            <div style={{ marginTop: "8px" }}>
              <span className={`status-badge ${paciente.estatus === 'Activo' ? 'status-active' : 'status-inactive'}`}
                style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", backgroundColor: paciente.estatus === 'Activo' ? '#dcfce7' : '#fee2e2', color: paciente.estatus === 'Activo' ? '#166534' : '#991b1b' }}>
                {paciente.estatus || "Activo"}
              </span>
            </div>
          </div>
        </div>
        <button className="btn btn-outline" onClick={() => navigate("/admin/Pacientes")}>
          ← Volver
        </button>
      </div>

      <div className="modules-grid">

        <div className="card-module card-style">
          <div className="card-header-style">
            <img src={icon.maletindoctor4} alt="Historia" style={{ width: 24 }} />
            <h3 style={{ margin: 0 }}>Historia Médica</h3>
          </div>
          <div style={{ flex: 1, padding: "15px", color: "#555", fontSize: "14px" }}>
            {historia ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <p style={{ margin: 0 }}><strong>Código:</strong> {historia.codigo}</p>
                <p style={{ margin: 0 }}><strong>Motivo:</strong> {historia.motivo_consulta || "Sin registro"}</p>
                <p style={{ margin: 0 }}><strong>Diagnóstico:</strong> {historia.diagnostico || "Sin registro"}</p>
                {historia.observacion && (
                  <p style={{ margin: 0 }}><strong>Observación:</strong> {historia.observacion}</p>
                )}
                <small style={{ display: "block", marginTop: "10px", color: "#999" }}>
                  Fecha Consulta: {new Date(historia.fecha_consulta).toLocaleDateString()}
                </small>
              </div>
            ) : (
              <p>No se ha registrado historia médica para este paciente.</p>
            )}
          </div>
          <div className="card-footer-style">
            <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => setShowHistoriaModal(true)}>
              {historia ? "Ver Detalle / Editar" : "Crear Historia"}
            </button>
          </div>
        </div>

        <div className="card-module card-style">
          <div className="card-header-style">
            <img src={icon.pulso2} alt="Signos" style={{ width: 24 }} />
            <h3 style={{ margin: 0 }}>Signos Vitales</h3>
          </div>
          <div style={{ flex: 1, padding: "15px", color: "#555", fontSize: "14px" }}>
            {signos.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <span style={{ display: "block", fontSize: "12px", color: "#888" }}>Presión</span>
                  <strong style={{ fontSize: "16px" }}>{signos[0].presion_arterial || "--"}</strong>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "12px", color: "#888" }}>Temp</span>
                  <strong style={{ fontSize: "16px" }}>{signos[0].temperatura || "--"} °C</strong>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "12px", color: "#888" }}>Frec. Card</span>
                  <strong style={{ fontSize: "16px" }}>{signos[0].frecuencia_cardiaca || "--"} bpm</strong>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "12px", color: "#888" }}>Sat. O2</span>
                  <strong style={{ fontSize: "16px" }}>{signos[0].saturacion_oxigeno || "--"} %</strong>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "12px", color: "#888" }}>Peso</span>
                  <strong style={{ fontSize: "16px" }}>{signos[0].peso || "--"} kg</strong>
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "12px", color: "#888" }}>Talla</span>
                  <strong style={{ fontSize: "16px" }}>{signos[0].talla || "--"} m</strong>
                </div>
                <div style={{ gridColumn: "1 / -1", marginTop: "5px" }}>
                  <small style={{ color: "#999" }}>
                    Último registro: {new Date(signos[0].fecha_registro).toLocaleDateString()}
                  </small>
                </div>
              </div>
            ) : (
              <p>No hay registros recientes de signos vitales.</p>
            )}
          </div>
          <div className="card-footer-style">
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn btn-outline btn-sm"
                style={{ flex: 1 }}
                onClick={() => setShowSignosDetailModal(true)}
                disabled={signos.length === 0}
              >
                Ver Detalle
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={() => setShowSignosModal(true)}
              >
                Registrar
              </button>
            </div>
          </div>
        </div>

        <div className="card-module card-style">
          <div className="card-header-style">
            <img src={icon.maletindoctor4} alt="Reposos" style={{ width: 24 }} />
            <h3 style={{ margin: 0 }}>Reposos Médicos</h3>
          </div>
          <div style={{ flex: 1, padding: "15px", color: "#555", fontSize: "14px" }}>
            {reposos.length > 0 ? (
              <>
                <div style={{ marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <span className={`status-badge ${reposos[0].estado === 'activo' ? 'status-active' : 'status-inactive'}`}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      backgroundColor: reposos[0].estado === 'activo' ? '#dcfce7' : reposos[0].estado === 'finalizado' ? '#e0e7ff' : '#fee2e2',
                      color: reposos[0].estado === 'activo' ? '#166534' : reposos[0].estado === 'finalizado' ? '#1e40af' : '#991b1b',
                      fontWeight: "bold",
                      textTransform: "uppercase"
                    }}>
                    {reposos[0].estado}
                  </span>

                  {reposos[0].estado === 'activo' && (
                    <span style={{
                      fontSize: "13px",
                      color: "#dc2626",
                      fontWeight: "bold",
                      backgroundColor: "#fee2e2",
                      padding: "6px 12px",
                      borderRadius: "6px"
                    }}>
                      {(() => {
                        const fin = new Date(reposos[0].fecha_fin);
                        if (reposos[0].hora_fin) {
                          const [h, m] = reposos[0].hora_fin.split(':');
                          fin.setHours(parseInt(h), parseInt(m), 0);
                        } else {
                          fin.setHours(23, 59, 59);
                        }
                        const ahora = new Date();
                        const diff = fin - ahora;

                        if (diff <= 0) return "⏰ Vencido";

                        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                        const hr = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                        if (d > 0) return `⏱️ Quedan: ${d}d ${hr}h`;
                        if (hr > 0) return `⏱️ Quedan: ${hr}h ${min}m`;
                        return `⏱️ Quedan: ${min}m`;
                      })()}
                    </span>
                  )}
                </div>

                {reposos[0].codigo && (
                  <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6b7280" }}>
                    <strong>Código:</strong> {reposos[0].codigo}
                  </p>
                )}

                <p style={{ margin: "5px 0" }}>
                  <strong>Desde:</strong> {new Date(reposos[0].fecha_inicio).toLocaleDateString('es-ES', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>Hasta:</strong> {new Date(reposos[0].fecha_fin).toLocaleDateString('es-ES', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                  {reposos[0].hora_fin && (
                    <span style={{ marginLeft: "8px", color: "#059669", fontWeight: "600" }}>
                      a las {reposos[0].hora_fin}
                    </span>
                  )}
                </p>

                <p style={{ margin: "5px 0" }}>
                  <strong>Duración:</strong> {reposos[0].dias_reposo || 'N/A'} día{reposos[0].dias_reposo !== 1 ? 's' : ''}
                </p>

                {reposos[0].diagnostico && (
                  <div style={{
                    marginTop: "12px",
                    padding: "10px",
                    backgroundColor: "#f9fafb",
                    borderLeft: "3px solid #3b82f6",
                    borderRadius: "4px"
                  }}>
                    <p style={{ margin: 0, fontSize: "13px", fontStyle: "italic", color: "#374151" }}>
                      <strong>Diagnóstico:</strong> {reposos[0].diagnostico}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p>No hay reposos registrados para este paciente.</p>
            )}
          </div>
          <div className="card-footer-style">
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn btn-outline btn-sm"
                style={{ flex: 1 }}
                onClick={() => setShowHistorialRepososModal(true)}
                disabled={reposos.length === 0}
              >
                Ver Historial
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={() => {
                  setReposoSeleccionado(null);
                  setShowRepososModal(true);
                }}
              >
                Registrar
              </button>
            </div>
          </div>
        </div>

      </div>

      <div className="history-section">
        <TimelineSeguimientos
          seguimientos={seguimientos}
          onRegistrarSeguimiento={handleRegistrarSeguimiento}
          onVerConsulta={handleVerConsulta}
        />
      </div>

      <FormModal
        key={showSignosModal ? Date.now() : 'closed_signos'}
        isOpen={showSignosModal}
        onClose={() => setShowSignosModal(false)}
        title="Registrar Signos Vitales"
        width="700px"
      >
        <ForSignosVitales
          pacienteId={id}
          onSuccess={handleSignosSuccess}
          onCancel={() => setShowSignosModal(false)}
        />
      </FormModal>

      <FormModal
        key={showSignosDetailModal ? `detail_${Date.now()}` : 'closed_signos_detail'}
        isOpen={showSignosDetailModal}
        onClose={() => setShowSignosDetailModal(false)}
        title="Detalle de Signos Vitales"
        width="700px"
      >
        <ForSignosVitales
          pacienteId={id}
          signoToEdit={signos.length > 0 ? signos[0] : null}
          readOnly={true}
          onCancel={() => setShowSignosDetailModal(false)}
        />
      </FormModal>

      <FormModal
        key={showHistoriaModal ? Date.now() : 'closed_historia'}
        isOpen={showHistoriaModal}
        onClose={() => setShowHistoriaModal(false)}
        title={historia ? "Editar Historia Médica" : "Nueva Historia Médica"}
        width="800px"
      >
        <ForHistorias
          pacienteId={id}
          historiaToEdit={historia}
          onSuccess={handleHistoriaSuccess}
          onCancel={() => setShowHistoriaModal(false)}
        />
      </FormModal>

      <FormModal
        key={showRepososModal ? Date.now() : 'closed_reposos'}
        isOpen={showRepososModal}
        onClose={() => {
          setShowRepososModal(false);
          setReposoSeleccionado(null);
        }}
        title={reposoSeleccionado ? "Detalle del Reposo" : "Registrar Reposo Médico"}
        width="700px"
      >
        <ForReposos
          pacienteId={id}
          reposoToEdit={reposoSeleccionado}
          readOnly={!!reposoSeleccionado}
          onSuccess={handleReposoSuccess}
          onCancel={() => {
            setShowRepososModal(false);
            setReposoSeleccionado(null);
          }}
        />
      </FormModal>

      <FormModal
        key={showHistorialRepososModal ? 'historial_reposos' : 'closed_historial'}
        isOpen={showHistorialRepososModal}
        onClose={() => setShowHistorialRepososModal(false)}
        title="Historial de Reposos Médicos"
        width="900px"
      >
        <HistorialReposos
          reposos={reposos}
          onVerDetalle={handleVerDetalleReposo}
          onClose={() => setShowHistorialRepososModal(false)}
        />
      </FormModal>

      <FormModal
        key={showSeguimientoModal ? Date.now() : 'closed_seguimiento'}
        isOpen={showSeguimientoModal}
        onClose={() => {
          setShowSeguimientoModal(false);
          setSeguimientoSeleccionado(null);
        }}
        title={seguimientoSeleccionado ? "Editar Seguimiento" : "Registrar Seguimiento"}
        width="700px"
      >
        <ForSeguimientos
          pacienteId={id}
          seguimientoToEdit={seguimientoSeleccionado}
          onSuccess={handleSeguimientoSuccess}
          onCancel={() => {
            setShowSeguimientoModal(false);
            setSeguimientoSeleccionado(null);
          }}
        />
      </FormModal>

      <FormModal
        key={showConsultaModal ? `consulta_${Date.now()}` : 'closed_consulta'}
        isOpen={showConsultaModal}
        onClose={() => setShowConsultaModal(false)}
        title="Detalle de Consulta"
        width="800px"
      >
        {consultaIdSeleccionada && (
          <DetalleConsulta
            consultaId={consultaIdSeleccionada}
            onClose={() => setShowConsultaModal(false)}
          />
        )}
      </FormModal>

    </div>
  );
}

export default SeguimientoPaciente;