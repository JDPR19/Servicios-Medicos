import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/sidebar.css';
import icon from '../components/icon';
import img from '../components/imagen';
import { usePermiso } from '../utils/usePermiso';

function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const TienePermiso = usePermiso();
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const closeSidebar = () => setIsOpen(false);

    const links = [
        TienePermiso('home', 'ver') && {
            to: '/admin',
            label: 'Home',
            icon: icon.corazon
        },
        TienePermiso('atenciones', 'ver') && {
            to: '/admin/Atenciones',
            label: 'Atenciones',
            icon: icon.altavoz
        },
        TienePermiso('citas', 'ver') && {
            to: '/admin/Citas',
            label: 'Citas',
            icon: icon.calendario
        },
        TienePermiso('consulta', 'ver') && {
            to: '/admin/Consultas',
            label: 'Consultas',
            icon: icon.consulta3
        },
        TienePermiso('pacientes', 'ver') && {
            to: '/admin/Pacientes',
            label: 'Pacientes',
            icon: icon.user3
        },
        TienePermiso('historias', 'ver') && {
            to: '/admin/Historias',
            label: 'Historias',
            icon: icon.folder
        },
        TienePermiso('reposos', 'ver') && {
            to: '/admin/Reposos',
            label: 'Reposos',
            icon: icon.mascarilla
        },
        TienePermiso('enfermedades', 'ver') && ('categoria_e', 'ver') && {
            to: '/admin/SeccionThree',
            label: 'Enfermedades',
            icon: icon.estetoscopio
        },
        // TienePermiso('enfermedades', 'ver') && {
        //     to: '/admin/Enfermedades',
        //     label: 'Enfermedades',
        //     icon: icon.estetoscopio
        // },
        TienePermiso('medicamentos', 'ver') && ('categoria_m', 'ver') && {
            to: '/admin/SeccionTwo',
            label: 'Stock',
            icon: icon.maletindoctor3
        },
        TienePermiso('usuarios', 'ver') && ('roles', 'ver') && ('cargos', 'ver') && ('doctores', 'ver')
        && ('profesiones', 'ver') && {
            to: '/admin/SeccionOne',
            label: 'Administrador',
            icon: icon.admin
        },
        TienePermiso('bitacora', 'ver') && {
            to: '/admin/Bitacora',
            label: 'Bitacora',
            icon: icon.bitacora
        },
    ].filter(Boolean);

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
                                <Link to={link.to} onClick={closeSidebar}>
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
