
import '../index.css';
import Card from '../components/Card';
import icon from '../components/icon';
import { useNavigate } from 'react-router-dom';
import { useAlert } from "../components/userAlert";
// import { useToast } from "../components/userToasd";
import Spinner from '../components/spinner';
import React, { useState } from 'react';
import Pogress from '../components/Pogress';

function DashboardPage() {
  const navigate = useNavigate();
  const showAlert = useAlert();
  // const showToast = useToast();
  // const [loading, setLoading] = useState(false);
  const [pgVisible, setPgVisible] = useState(false);
  const progressDuration = 5000;
  const handleCard = () => {
    showAlert("Consulta guardada correctamente", "success", 3000);
    showAlert("hola valentin", "warning", 5000);
    showAlert("hola valentin", "warning", 5000);
    showAlert("hola valentin", "info", 5000);
    showAlert("hola valentin", "error", 5000);
  };

  const handleClick = () => {
    setPgVisible(true);
    setTimeout(() => setPgVisible(false), progressDuration);
  };

  
  
  return (
    <div className='dashboard-layout'>
      <main className="dashboard-main">

{/* {loading && (
  <div className="spinner-overlay">
    <Spinner size={100} ></Spinner>
  </div>
)} */}

{pgVisible && (
          <div className="spinner-overlay">
            <Pogress
              color="var(--azul)"
              label="YUTONG  LLEVANDO SOLICITUD..."
              progressDuration={progressDuration}
              busIcon={icon.bus2}
            />
          </div>
        )}
      <section className='card-container'>
          
          <Card onClick={handleCard} color='#0033A0'  title='Total de Pacientes Registrados'>
            <img src={icon.consulta3} alt="icon-card" className='icon-card'/>
            <span className='number'>1</span>
            <h3>Pacientes Totales</h3>
          </Card>

          <Card color='#CE1126'  onClick={handleClick} title='Total de Historias Medicas Realizadas'>
            <img src={icon.folder} alt="icon-card" className='icon-card'/>
            <span className='number'>1</span>
            
            <h3>Historias Médicas</h3>
          </Card>

          <Card color='#FCD116'   title='Total de Consultas Realizadas'>
            <img src={icon.estetoscopio} alt="icon-card" className='icon-card'/>
            <span className='number'>1</span>
            <h3>Consultas Totales</h3>
          </Card>

          <Card color='#0B3A6A'  title='Total de Productor registrados en el Inventario'>
            <img src={icon.maletindoctor3} alt="icon-card" className='icon-card'/>
            <span className='number'>1</span>
            <h3>En Inventario</h3>
          </Card>
          
      </section>
      
      {/* Acciones rápidas */}
        <section className="quick-actions">
          <h3 className="section-title">Acciones rápidas</h3>
          <div className="qa-grid">
            <button className="qa-card" onClick={() => navigate('/admin/pacientes/nuevo')} title='Registrar Nuevo Paciente'>
              <img src={icon.user4} alt="pacientes" className="icon" />
              <span>Registrar Paciente</span>
            </button>
            <button className="qa-card" onClick={() => navigate('/admin/medicamentos/cargar')} title='Crear Historial Médico'>
              <img src={icon.cv3} alt="medicamentos" className="icon" />
              <span>Nueva Historia Médica</span>
            </button>
            <button className="qa-card" onClick={() => navigate('/admin/ForConsultas')} title='Diagnosticar un Paciente'>
              <img src={icon.estetoscopio2} alt="consultas" className="icon" />
              <span>Nueva Consulta</span>
            </button>
            <button className="qa-card" onClick={() => navigate('/admin/reposos/nuevo')} title='Dar Reposos'>
              <img src={icon.muela} alt="reposos" className="icon" />
              <span>Registrar Reposo</span>
            </button>
            <button className="qa-card" onClick={() => navigate('/admin/medicamentos/cargar')} title='Cargar un Medicamento al inventario'>
              <img src={icon.maletindoctor4} alt="medicamentos" className="icon" />
              <span>Cargar Medicamento</span>
            </button>
            <button className="qa-card" onClick={() => navigate('/admin/medicamentos/cargar')} title='Cargar una Nueva Patología'>
              <img src={icon.mascarilla3} alt="medicamentos" className="icon" />
              <span>Registrar Nueva Patología</span>
            </button>
          </div>
        </section>

        {/* Paneles informativos */}
        <section className="panels-grid">
          <div className="panel">
            <h3 className="panel-title">Actividad reciente</h3>
            <ul className="activity-list">
              <li>Se creó historia médica para Juan P.</li>
              <li>Consulta registrada por Dr. A. Pérez.</li>
              <li>Alta de medicamento: Ibuprofeno 400mg.</li>
              <li>Reposo emitido a M. Rodríguez.</li>
            </ul>
          </div>

          <div className="panel">
            <h3 className="panel-title">Próximas citas</h3>
            <ul className="list">
              <li>Hoy 10:30 — Odontología</li>
              <li>Hoy 14:00 — Medicina General</li>
              <li>Mañana 09:00 — Enfermería</li>
            </ul>
          </div>

          <div className="panel panel-chart">
            <h3 className="panel-title">Consultas por semana</h3>
            <div className="chart-placeholder">Gráfico aquí</div>
          </div>
          
        </section>
      </main>
    
    </div>
    
  );
}

export default DashboardPage;
