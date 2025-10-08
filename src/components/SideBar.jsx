import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/sidebar.css';
import icon from '../components/icon';
import img from '../components/imagen';

function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const links = [
        { to: '/admin', label: 'Home', icon: icon.corazon},
        { to: '/Pacientes', label: 'Pacientes', icon: icon.user3},
        { to: '/admin/Consultas', label: 'Consultas', icon: icon.consulta3 },
        { to: '/Historias', label: 'Historias', icon: icon.folder },
        { to: '/Reposos', label: 'Reposos', icon: icon.mascarilla },
        {to: '/Administrador', label: 'Administrador', icon: icon.admin},
    ];

    return (
        <div className={`sidebar-container ${isOpen ? 'open' : 'closed'}`}>
            {/* Botón hamburguesa */}
            <button className="toggle-btn" onClick={toggleSidebar}>
                {isOpen ? '✖' : '☰'}
            </button>

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <img src={img.logo2} alt="Logo Yutong Venezuela" className='imgLogo' title='Logo Yutong Venezuela' />
                </div>
                <div className='separacion'>
                    <hr />
                </div>
            <ul className="sidebar-links">
                {links.map((link, index) => (
                    <li key={index}>
                    <Link to={link.to}>
                        <img src={link.icon} alt={link.label} className="link-icon" />
                        {isOpen && <span>{link.label}</span>}
                    </Link>
                    </li>
                ))}
                </ul>
            </aside>
        </div>
    );
}

export default Sidebar;
