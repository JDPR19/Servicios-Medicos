import React, {useMemo, useState, useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';
import TabsFiltro from '../components/TabsFiltro';
import { usePermiso} from '../utils/usePermiso';
import '../index.css';
import Medicamentos from '../pages/Medicamentos';

function SeccionTwo() {
    const tienePermiso = usePermiso();
    const [searchParams] = useSearchParams();

    const tabs = useMemo(() => {
        const t = [
            tienePermiso("medicamentos", "ver") && { key: "medicamentos", label: "Medicamentos" },
        ].filter (Boolean);
        return t.length ? t : [{key: "no-access", label: "Sin acceso"}]
    }, [tienePermiso]);

    const getInitialTab = () => {
        const paramTab = searchParams.get("tab");
        const saved = paramTab || localStorage.getItem("SeccionTwo");
        const keys = new Set(tabs.map((t) => t.key));
        return keys.has(saved) ? saved : tabs[0].key;
    }

    const [activeTab, setActiveTab] = useState(() => getInitialTab());

    useEffect(() => {
        const paramTab = searchParams.get("tab");
        const keys = new Set(tabs.map((t) => t.key));
        if (paramTab && keys.has(paramTab) && paramTab !== activeTab) {
        setActiveTab(paramTab);
        localStorage.setItem("SeccionTwo", paramTab);
        }
    }, [searchParams, tabs, activeTab]);

    const handleTabClick = (tab) => {
        const key = typeof tab === "string" ? tab : tab?.key;
        if(!key) return;
        setActiveTab(key);
        localStorage.setItem("SeccionTwo", key);
    }

    let tablaRenderizada = null;
    if (activeTab === "medicamentos" && tabs.some(t => t.key === "medicamentos")) {
        tablaRenderizada = <Medicamentos />;
    }
    
    if (activeTab === "no-access") {
        tablaRenderizada = (
        <div style={{ padding: 16 }}>
            <p>No tienes permisos para ver esta sección.</p>
        </div>
        );
    }



    return(
        <div>
            <TabsFiltro tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
            {tablaRenderizada}
        </div>
    );
}

export default SeccionTwo;