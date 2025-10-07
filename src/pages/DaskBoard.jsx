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
          
      </section>
      
      {/* Acciones rápidas */}
        <section className="quick-actions">
          <h3 className="section-title">Acciones rápidas</h3>
          <div className="qa-grid">
            <button className="qa-card" onClick={() => navigate('/admin/pacientes/nuevo')}>
              <img src={icon.user3} alt="" className="qa-icon" />
              <span>Registrar paciente</span>
            </button>
            <button className="qa-card" onClick={() => navigate('/admin/consulta/nueva')}>
              <img src={icon.consultabien} alt="" className="qa-icon" />
              <span>Nueva consulta</span>
            </button>
            <button className="qa-card" onClick={() => navigate('/admin/reposos/nuevo')}>
              <img src={icon.candado2} alt="" className="qa-icon" />
              <span>Registrar reposo</span>
            </button>
            <button className="qa-card" onClick={() => navigate('/admin/medicamentos/cargar')}>
              <img src={icon.maletindoctor2} alt="" className="qa-icon" />
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

          <div className="panel">
            <h3 className="panel-title">Alertas</h3>
            <InfoCard>
              {/* Aquí puedes mapear alertas reales */}
            </InfoCard>
          </div>
        </section>
      </main>
    
    </div>
    
  );
}

export default DashboardPage;
