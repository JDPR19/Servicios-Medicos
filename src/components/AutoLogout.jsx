import { useEffect, useRef, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAlert } from './userAlert';
import { useNavigate } from 'react-router-dom';
import { BaseUrl } from '../utils/Constans';
import { io as ioClient } from 'socket.io-client';

const API_URL =  BaseUrl;
const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutos

const AutoLogout = () => {
const navigate = useNavigate();
const inactivityTimer = useRef(null);
const tokenTimer = useRef(null);
const socketRef = useRef(null);
const showAlert = useAlert();

const [token, setToken] = useState(() => localStorage.getItem('token'));

const logout = async (msg = 'Tu sesión ha expirado. Serás redirigido al login.') => {
    const currentToken = localStorage.getItem('token');

    let backendLogoutOk = false;
    if (currentToken) {
    try {
        const res = await fetch(`${API_URL}auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentToken}` },
        });
        backendLogoutOk = res.ok;
    } catch (e) {
        console.error('Error cerrando sesión en backend:', e);
    }
    }

    // Limpieza local
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permisos');

    if (!backendLogoutOk) {
    showAlert('No se pudo cerrar sesión en el servidor. Tu sesión se cerró localmente.', 'error');
    }

    if (msg) {
        showAlert(msg, 'warning');
    }

    // Cerrar socket
    if (socketRef.current) {
    socketRef.current.disconnect();
    socketRef.current = null;
    }

    navigate('/Login');
};

// Escuchar cambios del token (otras pestañas/ventanas)
useEffect(() => {
    const onStorage = (e) => {
    if (e.key === 'token') setToken(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
}, []);

// Timers + socket en función del token
useEffect(() => {
    // Limpieza previa
    if (tokenTimer.current) clearTimeout(tokenTimer.current);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);

    // Si no hay token: desconectar socket y salir
    if (!token) {
    if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
    }
    return;
    }

    // Inactividad
    const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
        logout('Sesión cerrada por inactividad. Serás redirigido al login.');
    }, INACTIVITY_LIMIT);
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, resetInactivityTimer, { passive: true }));
    resetInactivityTimer();

    // Expiración JWT
    try {
    const decoded = jwtDecode(token);
    const expMs = (decoded?.exp || 0) * 1000;
    const timeout = expMs - Date.now();
    if (timeout > 0) {
        tokenTimer.current = setTimeout(() => logout(), timeout);
    } else {
        logout();
    }
    } catch (error) {
        console.error(error);
    console.warn('Token inválido, cerrando sesión.');
    logout();
    }

    // Socket.IO: unir al room user:<id> y escuchar expiración forzada
    try {
    if (socketRef.current) socketRef.current.disconnect();
    const socket = ioClient(API_URL, { transports: ['websocket'], autoConnect: true });
    socketRef.current = socket;

    const doJoin = () => {
        const u = JSON.parse(localStorage.getItem('user'));
        if (u?.id) socket.emit('join', u.id);
    };

    socket.on('connect', doJoin); // re-join en reconexiones
    doJoin();

    socket.on('session:expired', () => {
        logout('Sesión cerrada desde el servidor.');
    });
    } catch (e) {
    console.error('Socket init error:', e);
    }

    // Cleanup al cambiar token o desmontar
    return () => {
    if (tokenTimer.current) clearTimeout(tokenTimer.current);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    events.forEach((ev) => window.removeEventListener(ev, resetInactivityTimer));
    if (socketRef.current) {
        socketRef.current.off('session:expired');
        socketRef.current.off('connect');
        // No desconectar aquí para mantener conexión mientras el token siga activo.
    }
    };
}, [token]); // navigate no es necesario en deps porque es estable

return null;
};

export default AutoLogout;