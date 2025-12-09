import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TabsFiltro from '../components/TabsFiltro';
import { usePermiso } from '../utils/usePermiso';
import '../index.css';
import Enfermedades from './Enfermedades';
import Categoria_e from './Categoria_e';

function SeccionThree() {
    const tienePermiso = usePermiso();
    const [searchParams] = useSearchParams();

    const tabs = useMemo(() => {
        const t = [
            tienePermiso("enfermedades", "ver") && { key: "enfermedades", label: "Enfermedades" },
            tienePermiso("categoria_e", "ver") && { key: "categoria_e", label: "Categoria Patologias" },
        ].filter(Boolean);
        return t.length ? t : [{ key: "no-access", label: "Sin acceso" }]
    }, [tienePermiso]);

    const getInitialTab = () => {
        const paramTab = searchParams.get("tab");
        const saved = paramTab || localStorage.getItem("SeccionThree");
        const keys = new Set(tabs.map((t) => t.key));
        return keys.has(saved) ? saved : tabs[0].key;
    }

    const [activeTab, setActiveTab] = useState(() => getInitialTab());

    useEffect(() => {
        const paramTab = searchParams.get("tab");
        const keys = new Set(tabs.map((t) => t.key));
        if (paramTab && keys.has(paramTab) && paramTab !== activeTab) {
            setActiveTab(paramTab);
            localStorage.setItem("SeccionThree", paramTab);
        }
    }, [searchParams, tabs, activeTab]);

    const handleTabClick = (tab) => {
        const key = typeof tab === "string" ? tab : tab?.key;
        if (!key) return;
        setActiveTab(key);
        localStorage.setItem("SeccionThree", key);
    }

    let tablaRenderizada = null;
    if (activeTab === "enfermedades" && tabs.some(t => t.key === "enfermedades")) {
        tablaRenderizada = <Enfermedades />;
    } else if (activeTab === "categoria_e" && tabs.some(t => t.key === "categoria_e")) {
        tablaRenderizada = <Categoria_e />;
    }

    if (activeTab === "no-access") {
        tablaRenderizada = (
            <div style={{ padding: 16 }}>
                <p>No tienes permisos para ver esta sección.</p>
            </div>
        );
    }



    return (
        <div>
            <TabsFiltro tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
            {tablaRenderizada}
        </div>
    );
}

export default SeccionThree;