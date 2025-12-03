import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../index.css";
import Spinner from "../components/spinner";
import { BaseUrl } from "../utils/Constans";
import { useToast } from "../components/userToasd";
import { PANTALLAS, ACCIONES } from "../utils/PermisosUser";

function buildEmptyPermisos() {
    const permisos = { acceso_total: false };
    PANTALLAS.forEach((p) => {
        permisos[p.key] = {};
        if (p.acciones && Array.isArray(p.acciones)) {
            p.acciones.forEach((accionKey) => {
                permisos[p.key][accionKey] = false;
            });
        } else {
            ACCIONES.forEach((a) => (permisos[p.key][a.key] = false));
        }
    });
    return permisos;
}

function normalizePermisos(input) {
    const base = buildEmptyPermisos();
    if (!input || typeof input !== "object") return base;

    base.acceso_total = input.acceso_total === true;

    PANTALLAS.forEach((p) => {
        const current = input[p.key] || {};
        if (p.acciones && Array.isArray(p.acciones)) {
            p.acciones.forEach((accionKey) => {
                base[p.key][accionKey] = current[accionKey] === true;
            });
        }
    });

    return base;
}

function ForRoles({ initialData = {}, onSave, onClose }) {
    const showToast = useToast();
    const isEdit = !!initialData?.id;

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState(() => ({
        nombre: initialData?.nombre || "",
        descripcion: initialData?.descripcion || "",
        permisos: normalizePermisos(initialData?.permisos),
    }));

    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            nombre: initialData?.nombre || "",
            descripcion: initialData?.descripcion || "",
            permisos: normalizePermisos(initialData?.permisos),
        }));
    }, [initialData?.id]);

    const headers = useMemo(() => {
        const token = (localStorage.getItem("token") || "").trim();
        return token ? { authorization: `Bearer ${token}` } : {};
    }, []);

    const validate = () => {
        if (!form.nombre.trim()) {
            showToast?.("El nombre es requerido", "warning");
            return false;
        }
        return true;
    };

    const handleClear = () => {
        setForm({
            nombre: "",
            descripcion: "",
            permisos: buildEmptyPermisos(),
        });
    };

    // Toggles
    const toggleAccesoTotal = (checked) => {
        setForm((prev) => {
            const next = {
                ...prev,
                permisos: { ...prev.permisos, acceso_total: checked },
            };
            if (checked) {
                PANTALLAS.forEach((p) => {
                    if (p.acciones && Array.isArray(p.acciones)) {
                        p.acciones.forEach((accionKey) => {
                            next.permisos[p.key][accionKey] = true;
                        });
                    }
                });
            }
            return next;
        });
    };

    const allOnForModule = (moduleKey) => {
        const moduleConfig = PANTALLAS.find(p => p.key === moduleKey);
        if (!moduleConfig || !moduleConfig.acciones) return false;

        return moduleConfig.acciones.every((accionKey) => form.permisos[moduleKey]?.[accionKey] === true);
    };

    const toggleModuleAll = (moduleKey, checked) => {
        setForm((prev) => {
            const next = {
                ...prev,
                permisos: {
                    ...prev.permisos,
                    [moduleKey]: { ...prev.permisos[moduleKey] },
                },
            };

            const moduleConfig = PANTALLAS.find(p => p.key === moduleKey);
            if (moduleConfig && moduleConfig.acciones) {
                moduleConfig.acciones.forEach((accionKey) => {
                    next.permisos[moduleKey][accionKey] = checked;
                });
            }

            return next;
        });
    };

    const toggleAction = (moduleKey, actionKey, checked) => {
        setForm((prev) => ({
            ...prev,
            permisos: {
                ...prev.permisos,
                [moduleKey]: {
                    ...prev.permisos[moduleKey],
                    [actionKey]: checked,
                },
            },
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await axios.post(`${BaseUrl}roles/registrar`, form, { headers });
            showToast?.("Rol registrado con éxito", "success");
            onSave?.(res.data);
            onClose?.();
        } catch (error) {
            if (error?.response?.status === 404) {
                try {
                    const res2 = await axios.post(`${BaseUrl}roles/resgistrar`, form, { headers });
                    showToast?.("Rol registrado con éxito", "success");
                    onSave?.(res2.data);
                    onClose?.();
                    return;
                } catch (e2) {
                    const msg2 = e2?.response?.data?.message || "Error registrando rol";
                    showToast?.(msg2, "error");
                }
            } else {
                const msg = error?.response?.data?.message || "Error registrando rol";
                showToast?.(msg, "error");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await axios.put(`${BaseUrl}roles/actualizar/${initialData.id}`, form, { headers });
            showToast?.("Rol actualizado correctamente", "success");
            onSave?.(res.data);
            onClose?.();
        } catch (error) {
            const msg = error?.response?.data?.message || "Error actualizando rol";
            showToast?.(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={isEdit ? handleEdit : handleSave}>
            <div className="forc-grid cols-2">
                <div className="fc-field">
                    <label>
                        <span className="unique">*</span>Nombre
                    </label>
                    <input
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                        placeholder="Ej: Administrador"
                        required
                    />
                </div>

                <div className="fc-field">
                    <label>Descripción</label>
                    <input
                        type="text"
                        name="descripcion"
                        value={form.descripcion || ""}
                        onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                        placeholder="Opcional"
                    />
                </div>

                <div className="fc-field col-span-full" style={{ marginTop: 6 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input
                            type="checkbox"
                            checked={form.permisos.acceso_total === true}
                            onChange={(e) => toggleAccesoTotal(e.target.checked)}
                        />
                        Acceso total a todos los módulos
                    </label>
                </div>

                <div className="fc-field col-span-full">
                    <label>Permisos por módulo</label>

                    <div
                        style={{
                            border: "1px solid #e6f0fa",
                            borderRadius: 10,
                            padding: 10,
                            background: "#f8fafc",
                            maxHeight: "45vh",
                            overflowY: "auto",
                        }}
                    >
                        {PANTALLAS.map((mod) => (
                            <div
                                key={mod.key}
                                style={{
                                    background: "#fff",
                                    border: "1px solid #e6f0fa",
                                    borderRadius: 8,
                                    padding: "10px 12px",
                                    marginBottom: 10,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 10,
                                        marginBottom: 8,
                                    }}
                                >
                                    <strong style={{ color: "#0033A0", letterSpacing: 1 }}>
                                        {mod.label}
                                    </strong>
                                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                                        <input
                                            type="checkbox"
                                            checked={allOnForModule(mod.key)}
                                            onChange={(e) => toggleModuleAll(mod.key, e.target.checked)}
                                        />
                                        Todos
                                    </label>
                                </div>

                                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                                    {ACCIONES.filter(a => mod.acciones.includes(a.key)).map((a) => (
                                        <label key={`${mod.key}-${a.key}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                            <input
                                                type="checkbox"
                                                checked={form.permisos[mod.key][a.key] === true}
                                                onChange={(e) => toggleAction(mod.key, a.key, e.target.checked)}
                                            />
                                            {a.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="forc-actions" style={{ marginTop: 24, marginBottom: 12 }}>
                <button className="btn btn-outline" type="button" onClick={onClose}>
                    Cancelar
                </button>
                <div className="forc-actions-right">
                    <button className="btn btn-secondary" type="button" onClick={handleClear} disabled={loading}>
                        Limpiar
                    </button>
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? <Spinner size={10} inline label="Procesando..." /> : "Guardar"}
                    </button>
                </div>
            </div>
        </form>
    );
}

export default ForRoles;