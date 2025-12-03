export const usePermiso = () => {
    let permisos = {};
    try {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('user');
            if (user) {
                permisos = JSON.parse(user)?.permisos || {};
            }
        }
    } catch (error) {
        console.error("Error parsing user permissions:", error);
        permisos = {};
    }

    return (pantalla, accion) => {
        if (!permisos[pantalla]) return false;
        return !!permisos[pantalla][accion];
    };
};