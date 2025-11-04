import React from "react";
import styles from "../styles/notificacionespanel.module.css";
import TabsNotificaciones from "./TabsNotificaciones";

function NotificacionesPanel({
open,
onClose,
notificaciones = [],
activeTab,
setActiveTab,
onMarcarLeida
}) {
// Filtrado según tab
const filtradas =
    activeTab === "no-leidas"
    ? notificaciones.filter(n => !n.leida)
    : notificaciones;

return (
    <div className={`${styles.overlay} ${open ? styles.open : ""}`} onClick={onClose}>
    <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
        <span className={styles.title}>Notificaciones</span>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <TabsNotificaciones
        tabs={[
            { key: "todos", label: "Todos" },
            { key: "no-leidas", label: "No leídas" }
        ]}
        activeTab={activeTab}
        onTabClick={setActiveTab}
        />
        <div className={styles.lista}>
        {filtradas.length === 0 ? (
            <div className={styles.vacio}>No hay notificaciones</div>
        ) : (
            filtradas.map(n => (
            <div
                key={n.id}
                className={`${styles.item} ${!n.leida ? styles.noLeida : ""}`}
                onClick={() => onMarcarLeida && onMarcarLeida(n)}
            >
                <span className={styles.mensaje}>{n.mensaje}</span>
                <span className={styles.fecha}>
                {n.created_at
                    ? new Date(n.created_at).toLocaleString()
                    : ""}
                </span>
                {!n.leida && (
                <span className={styles.dot} title="No leída"></span>
                )}
            </div>
            ))
        )}
        </div>
    </div>
    </div>
);
}

export default NotificacionesPanel;