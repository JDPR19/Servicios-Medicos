import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import TabsFiltro from "../components/TabsFiltro";
import { usePermiso } from "../utils/usePermiso";
import "../index.css";
import Doctores from "../pages/Doctores";
import Cargos from '../pages/Cargos';
import Roles from '../pages/Roles';
import Usuarios from '../pages/Usuarios';


function SeccionOne() {
  const tienePermiso = usePermiso();
  const [searchParams] = useSearchParams();

  const tabs = useMemo(() => {
    const t = [
      tienePermiso("doctores", "ver") && { key: "doctores", label: "Doctores" },
      tienePermiso("usuarios", "ver") && { key: "usuarios", label: "Usuarios" },
      tienePermiso("cargos", "ver") && { key: "cargos", label: "Cargos" },
      tienePermiso("roles", "ver") && { key: "roles", label: "Seguridad y Roles" },
      
    ].filter(Boolean);
    // Si no hay tabs válidas, evita el error y muestra uno neutro
    return t.length ? t : [{ key: "no-access", label: "Sin acceso" }];
  }, [tienePermiso]);

  const getInitialTab = () => {
    const paramTab = searchParams.get("tab");
    const saved = paramTab || localStorage.getItem("SeccionOne");
    const keys = new Set(tabs.map((t) => t.key));
    // Si el guardado no es válido, usa el primero disponible
    return keys.has(saved) ? saved : tabs[0].key;
  };

  const [activeTab, setActiveTab] = useState(() => getInitialTab());

  useEffect(() => {
    const paramTab = searchParams.get("tab");
    const keys = new Set(tabs.map((t) => t.key));
    if (paramTab && keys.has(paramTab) && paramTab !== activeTab) {
      setActiveTab(paramTab);
      localStorage.setItem("SeccionOne", paramTab);
    }
  }, [searchParams, tabs, activeTab]);

  const handleTabClick = (tab) => {
    // TabsFiltro puede enviar objeto {key,...} o string
    const key = typeof tab === "string" ? tab : tab?.key;
    if (!key) return;
    setActiveTab(key);
    localStorage.setItem("SeccionOne", key);
  };

  let tablaRenderizada = null;
  if (activeTab === "doctores" && tabs.some(t => t.key === "doctores")) {
    tablaRenderizada = <Doctores />;
  }else if(activeTab === "cargos" && tabs.some(t => t.key === "cargos")) {
    tablaRenderizada = <Cargos/>;
  }else if (activeTab === "roles" && tabs.some(t => t.key === "roles")) {
    tablaRenderizada = <Roles/>;
  }else if (activeTab === "usuarios" && tabs.some(t => t.key === "usuarios")) {
    tablaRenderizada = <Usuarios/>;
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

export default SeccionOne;