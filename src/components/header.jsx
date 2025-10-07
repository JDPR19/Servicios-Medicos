import { useNavigate, useLocation } from 'react-router-dom';
import icon from '../components/icon';
import '../index.css';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (location.pathname === '/Login') {
      navigate('/');
    } else {
      navigate('/Login');
    }
  };

  return (
    <header className="landingHeader">
      <div className="container headerInner">
        <div className="brand">
          <img src={icon.pulso2} alt="Cuidarte Yutong" className="brandLogo" />
          <span className="brandName">Cuidarte Yutong</span>
        </div>

        <nav className="nav">
          <a href="#caracteristicas" className="navLink">Características</a>
          <a href="#servicios" className="navLink">Servicios</a>
          <a href="#contacto" className="navLink">Contacto</a>
        </nav>

        <div className="headerActions">
          <button className="btn-estandar btn-login" onClick={handleClick} title={location.pathname === '/Login' ? 'Volver al Inicio' : 'Ir Al Login'}>
            {location.pathname === '/Login' ? 'Volver' : 'Iniciar Sesión'} 
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
