import { useState, useEffect } from 'react';
import '../index.css';
import icon from '../components/icon';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../components/userToasd';
import Spinner from '../components/spinner';
import { BaseUrl } from '../utils/Constans';

function Login () {
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const showToast = useToast();

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const irHome = () => {
        navigate('/admin', { replace: true });
    };

    useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
        navigate("/admin", { replace: true });
    }
    }, [navigate]);

    const handleLogin = async () => {
        if (!form.username.trim()) {
            if (showToast) showToast('Ingrese usuario o correo', 'warning');
            return;
        }
        if (!form.password) {
            if (showToast) showToast('Ingrese la contraseña', 'warning');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${BaseUrl}auth/login`, {
                username: form.username.trim(),
                password: form.password
                
            });

            const { token, user, message } = res.data || {};
            if (token) {
                localStorage.setItem('token', token);
            }
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            }
            if (showToast) showToast(message || 'Inicio de sesión correcto', 'success');
            irHome();
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Error autenticando';
            if (showToast) showToast(msg, 'error', 6000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="loginContainer">
            <div className="cartForm">
                <h1 className="title">
                    <img src={icon.pulso2} alt="corazon" title='Servicios Medicos Yutong' className='icon'/>
                    Cuidarte Yutong
                </h1>

                <form className="formLogin" onSubmit={(e) => e.preventDefault()}>
                    <div className='infoLabels'>
                        <label htmlFor="userInput"  title='Campo de Usuario'>
                            <img src={icon.user} alt="usuario" className='icon'/>Usuario o Correo
                        </label>
                    </div>
                    <div className="infoGroup">
                        <input
                            type="text"
                            id="userInput"
                            name="username"
                            title='Usuario O Correo'
                            placeholder="Rellene el campo"
                            className="input"
                            value={form.username}
                            onChange={onChange}
                            disabled={loading}
                            autoComplete="username"
                        />
                    </div>

                    <div className='infoLabels'>
                        <label htmlFor="passInput" className='labels' title='Campo de Contraseña'>
                            <img src={icon.llave} alt="contraseña" className='icon'/>Contraseña
                        </label>
                    </div>
                    <div className="infoGroup">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="passInput"
                            name="password"
                            placeholder="********"
                            className="input"
                            title='Contraseña'
                            value={form.password}
                            onChange={onChange}
                            disabled={loading}
                            autoComplete="current-password"
                        />
                        <img
                            src={showPassword ? icon.ojitoculto : icon.ojito}
                            onClick={() => setShowPassword(!showPassword)}
                            alt="ojito"
                            className='icon'
                            style={{ cursor: 'pointer' }}
                        />
                    </div>

                    <button
                        type="button"
                        className="btn-estandar"
                        title="Entrar"
                        aria-label="Boton Login"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? <Spinner size={18} inline label="Iniciando..." /> : 'Iniciar Sesión'}
                    </button>

                    <button
                        type="button"
                        className="btn-link"
                        title="Recuperar Contraseña"
                        onClick={() => navigate('/recuperar')}
                        disabled={loading}
                    >
                        <img src={icon.link} alt="Link" className='icon'/>
                        ¿Has Olvidado Tu Contraseña?
                    </button>
                </form>

                <footer className="footerCart">
                    <p>© 2025 Planta de Autobuses Yutong Venezuela &#x1F1FB;&#x1F1EA;</p>
                </footer>
            </div>
        </div>
    );
}

export default Login;