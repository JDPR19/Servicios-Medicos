import React from 'react';
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

  const handleLogout = async () => {
    try {
      // Llama al backend para cerrar sesión
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(`${BaseUrl}auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Error al Salir de la Sesión', error);
      showToast?.("Error cerrando sesión", "error");
    } finally {
      // Limpia localStorage y redirige siempre
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
    '/admin/Bitacora': 'Bitacora del Sistema',
    '/admin/Enfermedades': 'Patologías',
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
        <button className={styles.btnicon} title='Notificaciones'>
          <img src={icon.campana} alt="Campana" className={styles.icon} />
        </button>

        <button className={styles.btnicon} title='Settings user'>
          <img src={icon.user} alt="User" className={styles.icon} />
        </button>

        <button className={styles.btnicon} title='Cerrar Sesión' onClick={handleLogout}>
          <img src={icon.bus2} alt="Camionsito" className={styles.icon} />
        </button>
      </div>

      <section className={styles.apartado}>
        <h1 title='Nombre de Apartado' className={styles.apartadoTitle}>
          {Pantalla}
        </h1>
      </section>

    </section>
  );
}

export default Header;