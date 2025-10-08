import { useLocation } from 'react-router-dom';
import '../styles/navigate.css';
import icon from '../components/icon';

function Header() {
    const location = useLocation();

    const routeToTitle = {
        '/admin' : 'Servicios Médicos',
        '/admin/Consultas' : 'Consultas',
    };

    const Pantalla = routeToTitle[location.pathname || 'Cuidarte Yutong'];
    
    return (
        <section className='navigate'>  
          <div className='bienvenida' title='Logo Cuidarte Yutong' >
            <img src={icon.pulso2} alt="Cuidarte Yutong"  />
            <h1>Cuidarte Yutong</h1>
          </div>

          <div className='navigate-options'>
            <button className='btn-icon'>
              <img src={icon.campana} alt="Campana" className='icon' title='Notificaciones' />
            </button>
            <button className='btn-icon'>
              <img src={icon.user} alt="User" className='icon' title='Settings user' />
            </button>
            <button className='btn-icon'>
              <img src={icon.camionsito} alt="Camionsito" className='icon' title='Salida' />
            </button>
          </div>

          <section className='apartado'>
              <h1 title='Nombre de Apartado'>
                {Pantalla}
              </h1>
          </section>
        </section> 
    );
}

export default Header;