import { createContext, useContext, useState, useCallback } from 'react';
import '../styles/alert.css';

const AlertContext = createContext();

export function AlertProvider({ children }) {
    const [alerts, setAlerts] = useState([]);

    const showAlert = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setAlerts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setAlerts(prev => prev.filter(alert => alert.id !== id));
        }, duration);
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <div className="alert-container">
                {alerts.map(alert => (
                    <div key={alert.id} className={`alert alert-${alert.type}`}>
                        {alert.message}
                    </div>
                ))}
            </div>
        </AlertContext.Provider>
    );
}

export const useAlertContext = () => useContext(AlertContext);
