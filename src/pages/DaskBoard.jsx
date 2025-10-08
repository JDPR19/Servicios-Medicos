import '../styles/daskboard.css';
import '../index.css';
import Card from '../components/Card';
import InfoCard from '../components/InfoCard';
import icon from '../components/icon';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const navigate = useNavigate();
  
  const handleCard = () => {
    alert('pulse una carta');
  };
  
  return (
    <div className='dashboard-layout'>

      <main className="dashboard-main">

      <section className='card-container'>
          
          <Card onClick={handleCard} color='#0033A0'>
            <img src={icon.consulta3} alt="icon-card" className='icon-card'/>
            <span className='number'>1</span>
            <h3>Pacientes Totales</h3>
          </Card>

          <Card color='#CE1126'>
            <img src={icon.folder} alt="icon-card" className='icon-card'/>
            <span className='number'>1</span>
            
            <h3>Historias Medicas</h3>
          </Card>

          <Card color='#FCD116'>
            <img src={icon.estetoscopio} alt="icon-card" className='icon-card'/>
            <span className='number'>1</span>
            <h3>Consultas Totales</h3>
          </Card>

          <Card color='#0B3A6A'>
            <img src={icon.maletindoctor3} alt="icon-card" className='icon-card'/>
            <span className='number'>1</span>
            <h3>En Inventario</h3>
          </Card>
          
      </section>
      
      {/* Acciones rápidas */}
        <section className="quick-actions">
          <h3 className="section-title">Acciones rápidas</h3>
          <div className="qa-grid">
            <button className="qa-card" onClick={() => navigate('/admin/pacientes/nuevo')}>
              <img src={icon.user2} alt="" className="icon" />
              <span>Registrar paciente</span>
            </button>
            <button className="qa-card" onClick={() => navigate('/admin/consulta/nueva')}>
              <img src={icon.carpetaplus} alt="" className="icon" />
              <span>Nueva consulta</span>
            </button>
            <button className="qa-card" onClick={() => navigate('/admin/reposos/nuevo')}>
              <img src={icon.muela} alt="" className="icon" />
              <span>Registrar reposo</span>
            </button>
            <button className="qa-card" onClick={() => navigate('/admin/medicamentos/cargar')}>
              <img src={icon.maletindoctor2} alt="" className="icon" />
              <span>Cargar medicamento</span>
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
