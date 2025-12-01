import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/sidebar.css';
import icon from '../components/icon';
import img from '../components/imagen';

function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const closeSidebar = () => setIsOpen(false);

    const links = [
        { to: '/admin', label: 'Home', icon: icon.corazon },
        { to: '/admin/Pacientes', label: 'Pacientes', icon: icon.user3 },
        { to: '/admin/Consultas', label: 'Consultas', icon: icon.consulta3 },
        { to: '/admin/Historias', label: 'Historias', icon: icon.folder },
        { to: '/admin/Reposos', label: 'Reposos', icon: icon.mascarilla },
        { to: '/admin/Enfermedades', label: 'Enfermedades', icon: icon.estetoscopio },
        { to: '/admin/SeccionTwo', label: 'Stock', icon: icon.maletindoctor3 },
        { to: '/admin/SeccionOne', label: 'Administrador', icon: icon.admin },
        { to: '/admin/Bitacora', label: 'Bitacora', icon: icon.bitacora },
    ];

    return (
        <>
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
            {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
        </>
    );
}

export default Sidebar;
