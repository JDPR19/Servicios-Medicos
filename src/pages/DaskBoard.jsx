import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { usePermiso } from '../utils/usePermiso';
import '../styles/dashboard.css';
import icon from '../components/icon';
import { useAlert } from "../components/userAlert";
import Spinner from '../components/spinner';
import { BaseUrl } from "../utils/Constans";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

function DashboardPage() {
  const tienePermiso = usePermiso();
  const navigate = useNavigate();
  const showAlert = useAlert();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    estadisticas: {
      totalPacientes: 0,
      totalHistorias: 0,
      totalConsultas: 0,
      totalMedicamentos: 0,
      consultasHoy: 0,
      consultasMes: 0
    },
    consultasPorSemana: [],
    actividadReciente: [],
    proximasCitas: [],
    enfermedadesComunes: [],
    medicamentosBajoStock: [],
    departamentosTop: []
  });

  const getAuthHeaders = () => {
    const token = (localStorage.getItem('token') || '').trim();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${BaseUrl}dashboard/stats`, { headers: getAuthHeaders() });
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        showAlert("Error al cargar datos del dashboard", "error", 4000);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Configuración de gráficos
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const lineChartData = {
    labels: stats.consultasPorSemana.map(item => item.dia.trim()),
    datasets: [
      {
        label: 'Consultas',
        data: stats.consultasPorSemana.map(item => item.total),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
    ],
  };

  const doughnutData = {
    labels: stats.departamentosTop.map(d => d.departamento),
    datasets: [
      {
        data: stats.departamentosTop.map(d => d.total_pacientes),
        backgroundColor: [
          '#3b82f6',
          '#8b5cf6',
          '#ec4899',
          '#f59e0b',
          '#10b981',
        ],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11
          }
        }
      }
    },
    cutout: '65%',
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner size={60} label="Cargando Dashboard..." />
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {/* Columna Principal */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <h1 className="dashboard-title">Panel de Control</h1>
          <p className="dashboard-subtitle">Bienvenido al Sistema de Gestión Integral de Servicios Médicos</p>
        </header>

        {/* Tarjetas de Estadísticas */}
        <section className="stats-grid">
          {tienePermiso('home', 'ver') && tienePermiso('home', 'navegar') && (
            <div className="stat-card" onClick={() => navigate('/admin/pacientes')} style={{ cursor: 'pointer' }}>
              <div className="stat-header">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                  <img src={icon.user4} alt="Pacientes" />
                </div>
                <span className="stat-label">Total Pacientes</span>
              </div>
              <div className="stat-value">{stats.estadisticas.totalPacientes}</div>
              <div className="stat-trend">Activos en sistema</div>
            </div>
          )}

          {tienePermiso('home', 'ver') && tienePermiso('home', 'navegar') && (
            <div className="stat-card" onClick={() => navigate('/admin/Historias')} style={{ cursor: 'pointer' }}>
              <div className="stat-header">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                  <img src={icon.carpetaplus2} alt="Historias" />
                </div>
                <span className="stat-label">Historias Médicas</span>
              </div>
              <div className="stat-value">{stats.estadisticas.totalHistorias}</div>
              <div className="stat-trend">Expedientes digitales</div>
            </div>
          )}

          {tienePermiso('home', 'ver') && tienePermiso('home', 'navegar') && (
            <div className="stat-card" onClick={() => navigate('/admin/Consultas')} style={{ cursor: 'pointer' }}>
              <div className="stat-header">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                  <img src={icon.estetoscopio2} alt="Consultas" />
                </div>
                <span className="stat-label">Consultas Totales</span>
              </div>
              <div className="stat-value">{stats.estadisticas.totalConsultas}</div>
              <div className="stat-trend trend-up">+{stats.estadisticas.consultasHoy} hoy</div>
            </div>
          )}

          {tienePermiso('home', 'ver') && tienePermiso('home', 'navegar') && (
            <div className="stat-card" onClick={() => navigate('/admin/Medicamentos')} style={{ cursor: 'pointer' }}>
              <div className="stat-header">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <img src={icon.maletindoctor4} alt="Medicamentos" />
                </div>
                <span className="stat-label">Inventario</span>
              </div>
              <div className="stat-value">{stats.estadisticas.totalMedicamentos}</div>
              <div className="stat-trend">Productos registrados</div>
            </div>
          )}
        </section>

        {/* Gráficos */}
        <section className="charts-grid">
          {tienePermiso('home', 'ver') && tienePermiso('home', 'graficas') && (
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Consultas por Semana</h3>
              </div>
              <div className="chart-container">
                <Line options={lineChartOptions} data={lineChartData} />
              </div>
            </div>
          )}

          {tienePermiso('home', 'ver') && tienePermiso('home', 'graficas') && (
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Pacientes por Departamento</h3>
              </div>
              <div className="chart-container">
                <Doughnut options={doughnutOptions} data={doughnutData} />
              </div>
            </div>
          )}
        </section>

        {/* Actividad Reciente */}
        {tienePermiso('home', 'ver') && tienePermiso('home', 'actividad') && (
          <div className="sidebar-section">
            <h3 className="sidebar-title">Actividad Reciente</h3>
            <div className="info-list">
              {stats.actividadReciente.length > 0 ? (
                stats.actividadReciente.map((act, index) => (
                  <div key={index} className="info-item">
                    <div className="info-dot"></div>
                    <div className="info-content">
                      <span className="info-text">{act.descripcion}</span>
                      <span className="info-subtext">
                        {new Date(act.fecha).toLocaleDateString()} {new Date(act.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {act.usuario}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="info-item">
                  <span className="info-text">No hay actividad reciente registrada.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Columna Lateral */}
      <div className="dashboard-sidebar">
        {/* Acciones Rápidas */}
        {tienePermiso('home', 'ver') && tienePermiso('home', 'navegar') && (
          <div className="sidebar-section">
            <h3 className="sidebar-title">Acciones Rápidas</h3>
            <div className="quick-actions-grid">
              <button className="action-btn" onClick={() => navigate('/admin/pacientes')}>
                <img src={icon.user4} alt="Paciente" />
                <span>Registrar Paciente</span>
              </button>
              <button className="action-btn" onClick={() => navigate('/admin/Historias')}>
                <img src={icon.cv3} alt="Historia" />
                <span>Nueva Historia</span>
              </button>
              <button className="action-btn" onClick={() => navigate('/admin/Consultas')}>
                <img src={icon.estetoscopio2} alt="Consulta" />
                <span>Nueva Consulta</span>
              </button>
              <button className="action-btn" onClick={() => navigate('/admin/Reposos')}>
                <img src={icon.muela} alt="Reposo" />
                <span>Registrar Reposo</span>
              </button>
              <button className="action-btn" onClick={() => navigate('/admin/Medicamentos')}>
                <img src={icon.maletindoctor4} alt="Medicamento" />
                <span>Cargar Medicamento</span>
              </button>
              <button className="action-btn" onClick={() => navigate('/admin/citas')}>
                <img src={icon.calendario2} alt="Cita" />
                <span>Agendar Cita</span>
              </button>
            </div>
          </div>
        )}
        {/* Próximas Citas */}
        <div className="sidebar-section">
          <h3 className="sidebar-title">Próximas Citas</h3>
          <div className="info-list">
            {stats.proximasCitas.length > 0 ? (
              stats.proximasCitas.map((cita, index) => (
                <div key={index} className="appointment-card">
                  <div className="appt-date-box">
                    <span className="appt-time">{cita.hora_cita}</span>
                    <span className="appt-date">{new Date(cita.fecha_cita).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                  </div>
                  <div className="appt-details">
                    <h4>{cita.paciente}</h4>
                    <p>{cita.motivo || 'Consulta General'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="info-item">
                <span className="info-text">No hay citas programadas.</span>
              </div>
            )}
          </div>
        </div>

        {/* Alerta de Stock */}
        <div className="sidebar-section">
          <h3 className="sidebar-title" style={{ color: '#ef4444' }}>Alerta de Stock</h3>
          <div className="info-list">
            {stats.medicamentosBajoStock.length > 0 ? (
              stats.medicamentosBajoStock.map((med, index) => (
                <div key={index} className="info-item">
                  <div className="info-dot" style={{ background: '#ef4444' }}></div>
                  <div className="info-content">
                    <span className="info-text" style={{ fontWeight: 600 }}>{med.nombre} {med.presentacion}</span>
                    <span className="info-subtext" style={{ color: '#ef4444' }}>
                      Solo {med.cantidad_disponible} unidades
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="info-item">
                <span className="info-text">El inventario está saludable.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
