import React from 'react';
import styles from '../styles/tabsFiltro.module.css';

function TabsNotificaciones({ tabs, activeTab, onTabClick }) {
    return (
        <div className={styles.tabsNoti}>
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    className={`${styles.tabButtonNoti} ${activeTab === tab.key ? styles.active : ''}`}
                    onClick={() => onTabClick(tab.key)}
                    type="button"
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

export default TabsNotificaciones;