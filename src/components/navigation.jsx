import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/navigate.module.css';
import icon from '../components/icon';
import axios from "axios";
import { BaseUrl } from "../utils/Constans";
import { useToast } from "../components/userToasd";
import NotificacionesPanel from './NotificacionesPanel';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const showToast = useToast();

  // Estados para notificaciones
  const [panelOpen, setPanelOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [activeTab, setActiveTab] = useState("todos");

  const getAuthHeaders = () => {
    const token = (localStorage.getItem('token') || '').trim();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchNotificaciones = async () => {
    try {
      const response = await axios.get(`${BaseUrl}notificaciones`, { headers: getAuthHeaders() });
      setNotificaciones(response.data);
    } catch (error) {
      console.error("Error cargando notificaciones", error);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
    // Opcional: Polling cada 60 segundos para nuevas notificaciones
    const interval = setInterval(fetchNotificaciones, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarcarLeida = async (notificacion) => {
    if (notificacion.leida) return;
    try {
      await axios.put(`${BaseUrl}notificaciones/marcar-leida/${notificacion.id}`, {}, { headers: getAuthHeaders() });
      // Actualizar estado local
      setNotificaciones(prev => prev.map(n =>
        n.id === notificacion.id ? { ...n, leida: true } : n
      ));
    } catch (error) {
      console.error("Error marcando como leída", error);
    }
  };

  const noLeidasCount = notificaciones.filter(n => !n.leida).length;

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(`${BaseUrl}auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      showToast?.("Sesión cerrada exitosamente", "success");
    } catch (error) {
      console.error('Error al Salir de la Sesión', error);
      showToast?.("Error cerrando sesión", "error");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/Login");
    }
  };

  const routeToTitle = {
    '/admin': 'Servicios Médicos',
    '/admin/Consultas': 'Consultas',
    '/admin/ForConsultas': 'Nueva Consulta',
    '/admin/ForPacientes': 'Nuevo Paciente',
    '/admin/Pacientes': 'Pacientes',
    '/admin/Seguimiento': 'Paciente Juan Perez',
    '/admin/Historias': 'Historias',
    '/admin/ForHistorias': 'Nueva Historia',
    '/admin/Reposos': 'Reposos',
    '/admin/ForReposos': 'Nuevo Reposo',
    '/admin/SeccionOne': 'Administrador',
    '/admin/SeccionTwo': 'Stock de Inventario',
    '/admin/SeccionThree': 'Catalogo de Enfermedades',
    '/admin/Bitacora': 'Bitacora del Sistema',
    '/admin/Enfermedades': 'Patologías',
    '/admin/Citas': 'Citas',
    '/admin/Atenciones': 'Atenciones',
    '/admin/Profesiones': 'Profesiones',
    '/admin/ForProfesiones': 'Nueva Profesión',
  };

  const Pantalla = routeToTitle[location.pathname] || 'Cuidarte Yutong';

  const handleInicio = () => {
    navigate('/admin');
  };

  return (
    <section className={styles.navigate}>
      <div className={styles.bienvenida} title='Logo Cuidarte Yutong' onClick={handleInicio}>
        <img src={icon.pulso2} alt="Cuidarte Yutong" className={styles.imgNavigate} />
        <h1 className={styles.brand}>Cuidarte Yutong</h1>
      </div>

      <div className={styles['navigate-options']}>
        <button
          className={styles.btnicon}
          title='Notificaciones'
          onClick={() => setPanelOpen(!panelOpen)}
          style={{ position: 'relative' }}
        >
          <img src={icon.campana} alt="Campana" className={styles.icon} />
          {noLeidasCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -5,
              right: -5,
              background: 'red',
              color: 'white',
              borderRadius: '50%',
              width: 18,
              height: 18,
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {noLeidasCount}
            </span>
          )}
        </button>

        {/* <button className={styles.btnicon} title='Settings user'>
          <img src={icon.user} alt="User" className={styles.icon} />
        </button> */}

        <button className={styles.btnicon} title='Cerrar Sesión' onClick={handleLogout}>
          <img src={icon.bus2} alt="Camionsito" className={styles.icon} />
        </button>
      </div>

      <section className={styles.apartado}>
        <h1 title='Nombre de Apartado' className={styles.apartadoTitle}>
          {Pantalla}
        </h1>
      </section>

      {/* Panel de Notificaciones */}
      <NotificacionesPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        notificaciones={notificaciones}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onMarcarLeida={handleMarcarLeida}
      />

    </section>
  );
}

export default Header;