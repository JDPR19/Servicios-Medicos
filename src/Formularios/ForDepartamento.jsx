import React, { useEffect, useMemo, useState } from "react";
import "../index.css";
import axios from "axios";
import { BaseUrl } from "../utils/Constans";
import Spinner from "../components/spinner";
import { useToast } from "../components/userToasd";
import SingleSelect from "../components/SingleSelect";
import { validateField, validationRules } from "../utils/validation";


const SUGGESTIONS = [
{ id: "plan", label: "Planificación y organización de actividades" },
{ id: "gestion", label: "Gestión de recursos y presupuesto" },
{ id: "personal", label: "Gestión de personal y capacitación" },
{ id: "atencion", label: "Atención y soporte a usuarios internos" },
{ id: "coordinacion", label: "Coordinación interdepartamental" },
{ id: "monitoreo", label: "Monitoreo, control y evaluación de procesos" },
{ id: "mejora", label: "Mejora continua y estandarización de procesos" },
{ id: "cumplimiento", label: "Cumplimiento de políticas y normativas" },
];


function ForDepartamento({ initialData = {}, onSave, onClose }) {
    const showToast = useToast();
    const isEdit = !!initialData?.id;

    const initialForm = {
        nombre: "",
        descripcion: "",
        // finalidades_ids: [{ finalidad_id, objetivo }, ...]
        ...initialData,
    };

    const [form, setForm] = useState({
        nombre: initialForm.nombre || "",
        descripcion: initialForm.descripcion || "",
    });

    const [finalidadesRows, setFinalidadesRows] = useState([]);
    const [finalidadesOptions, setFinalidadesOptions] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Estados para autocompletado de descripción
    const [selectedSugs, setSelectedSugs] = useState(new Set());
    const [otroChecked, setOtroChecked] = useState(false);
    const [otroValue, setOtroValue] = useState("");
    const [customItems, setCustomItems] = useState([]);

    // Prefill finalidades para edición (acepta initialData.finalidades o initialData.detalle)
    useEffect(() => {
        const parsed =
        (initialData?.finalidades || initialData?.detalle || []).map((f) => ({
            finalidad_id: f.id,
            objetivo: f.objetivo_finalidad || "",
        })) || [];
        setFinalidadesRows(parsed);
    }, [initialData]);

    // Prefill selección de sugerencias si la descripción ya contiene algunos textos
    useEffect(() => {
        const desc = (initialData?.descripcion || "").toLowerCase();
        if (!desc) return;
        const pre = new Set();
        for (const s of SUGGESTIONS) {
        if (desc.includes(s.label.toLowerCase())) pre.add(s.id);
        }
        setSelectedSugs(pre);
    }, [initialData?.descripcion]);

    // Carga catálogo de finalidades
    useEffect(() => {
        const fetchFinalidades = async () => {
        setLoading(true);
        try {
            const token = (localStorage.getItem("token") || "").trim();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axios.get(`${BaseUrl}departamentos/finalidades`, { headers });
            setFinalidadesOptions(res.data || []);
        } catch (err) {
            console.error("Error al cargar finalidades:", err);
            showToast?.("Error cargando finalidades", "error");
        } finally {
            setLoading(false);
        }
        };
        fetchFinalidades();
    }, []);

    // Validación básica, compatible con tu helper
    const validate = (field, value) => {
        if (validationRules?.[field]) {
        const { regex, errorMessage } = validationRules[field];
        const result = validateField(value, { text: (v) => regex.test(v) }, errorMessage);
        return result.valid ? "" : result.message;
        }
        // Reglas mínimas
        if (field === "nombre" && !value?.trim()) return "El nombre es requerido";
        return "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    };

    // Helpers para manipular tokens en la descripción (líneas tipo "• texto")
    const ensureTokenInDescripcion = (label, present) => {
        const token = `• ${label}`;
        const lines = (form.descripcion || "")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

        const has = lines.includes(token);
        let out = lines;

        if (present && !has) {
        out = [...lines, token];
        } else if (!present && has) {
        out = lines.filter((l) => l !== token);
        }

        setForm((prev) => ({ ...prev, descripcion: out.join("\n") }));
    };

    const toggleSuggestion = (sug) => {
        const next = new Set(selectedSugs);
        if (next.has(sug.id)) {
        next.delete(sug.id);
        ensureTokenInDescripcion(sug.label, false);
        } else {
        next.add(sug.id);
        ensureTokenInDescripcion(sug.label, true);
        }
        setSelectedSugs(next);
    };

    const handleOtroCheck = (e) => {
        const checked = e.target.checked;
        setOtroChecked(checked);
        if (!checked) {
        // Al desmarcar "Otro", remover todos los custom del textarea
        customItems.forEach((c) => ensureTokenInDescripcion(c, false));
        setCustomItems([]);
        setOtroValue("");
        }
    };

    const handleAddCustom = () => {
        const val = (otroValue || "").trim();
        if (!val) return;
        if (customItems.includes(val)) {
        setOtroValue("");
        return;
        }
        setCustomItems((prev) => [...prev, val]);
        ensureTokenInDescripcion(val, true);
        setOtroValue("");
    };

    const handleRemoveCustom = (label) => {
        setCustomItems((prev) => prev.filter((c) => c !== label));
        ensureTokenInDescripcion(label, false);
    };

    // Gestión de filas de finalidades
    const addRow = () => {
        setFinalidadesRows((rows) => [...rows, { finalidad_id: null, objetivo: "" }]);
    };

    const removeRow = (idx) => {
        setFinalidadesRows((rows) => rows.filter((_, i) => i !== idx));
    };

    const handleRowChange = (idx, field, value) => {
        setFinalidadesRows((rows) =>
        rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
        );
    };

    // Sanea las filas: elimina vacías y valida pares incompletos
    const sanitizeFinalidades = useMemo(() => {
        return finalidadesRows
        .filter((r) =>
            (r.finalidad_id && r.objetivo?.trim()) ||
            (!r.finalidad_id && !r.objetivo?.trim()) === false
            ? true
            : r.finalidad_id || r.objetivo?.trim()
        )
        .filter((r) => r.finalidad_id && r.objetivo?.trim())
        .map((r) => ({ finalidad_id: r.finalidad_id, objetivo: r.objetivo.trim() }));
    }, [finalidadesRows]);

    const validateAll = () => {
        const newErrors = {};
        newErrors.nombre = validate("nombre", form.nombre);
        if (newErrors.nombre) {
        setErrors(newErrors);
        return false;
        }
        // Validación de filas parciales
        const partial = finalidadesRows.find(
        (r) => (r.finalidad_id && !r.objetivo?.trim()) || (!r.finalidad_id && r.objetivo?.trim())
        );
        if (partial) {
        showToast?.("Complete o elimine las finalidades incompletas", "warning");
        return false;
        }
        return true;
    };

    const handleClear = () => {
        setForm({ nombre: "", descripcion: "" });
        setFinalidadesRows([]);
        setErrors({});
        // Reset autocompletados
        setSelectedSugs(new Set());
        setOtroChecked(false);
        setOtroValue("");
        setCustomItems([]);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateAll()) return;

        setLoading(true);
        try {
        const token = (localStorage.getItem("token") || "").trim();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const payload = {
            nombre: form.nombre?.trim(),
            descripcion: form.descripcion?.trim() || "",
            finalidades_ids: sanitizeFinalidades, // opcional
        };

        const res = await axios.post(`${BaseUrl}departamentos/Registrar`, payload, { headers });
        showToast?.("Departamento registrado correctamente", "success");
        onSave?.(res.data);
        onClose?.();
        } catch (err) {
        console.error("Error registrando departamento:", err?.response?.data || err.message);
        const msg = err?.response?.data?.message || "Error registrando departamento";
        showToast?.(msg, "error");
        } finally {
        setLoading(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        if (!validateAll()) return;

        setLoading(true);
        try {
        const token = (localStorage.getItem("token") || "").trim();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const payload = {
            nombre: form.nombre?.trim(),
            descripcion: form.descripcion?.trim() || "",
            finalidades_ids: sanitizeFinalidades, // opcional
        };

        const res = await axios.put(`${BaseUrl}departamentos/actualizar/${initialData.id}`, payload, { headers });
        showToast?.("Departamento actualizado correctamente", "success");
        onSave?.(res.data);
        onClose?.();
        } catch (err) {
        console.error("Error actualizando departamento:", err?.response?.data || err.message);
        const msg = err?.response?.data?.message || "Error actualizando departamento";
        showToast?.(msg, "error");
        } finally {
        setLoading(false);
        }
    };

    return (
        <form onSubmit={isEdit ? handleEdit : handleRegister}>
        <div className="forc-grid">
            <div className="fc-field" style={{gridColumn: "1 / -1"}}>  
            <label><span className="unique">*</span>Nombre</label>
            <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Recursos Humanos"
                required
            />
            {errors.nombre && <span style={{ color: "red" }}>{errors.nombre}</span>}
            </div>

            <div className="fc-field" style={{ gridColumn: "1 / -1" }}>
            <label>Descripción</label>
            <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción del departamento (opcional)"
                rows={4}
            />
            </div>

            {/* Autocompletados de descripción */}
            <div className="fc-field" style={{ gridColumn: "1 / -1", marginTop: 8 }}>
            <label>Autocompletados de descripción (opcional)</label>
            <div className="desc-suggestions">
                {SUGGESTIONS.map((s) => (
                    <label
                    key={s.id}
                    className="desc-sug-item"
                    >
                    <span className="desc-sug-text">{s.label}</span>
                    <input
                        type="checkbox"
                        checked={selectedSugs.has(s.id)}
                        onChange={() => toggleSuggestion(s)}
                    />
                    </label>
                ))}
            </div>

            {/* Otro + input para personalizar */}
            <div
                style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 12,
                flexWrap: "wrap",
                }}
            >
                <label className="checkbox" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="checkbox" checked={otroChecked} onChange={handleOtroCheck} />
                <span>Otro</span>
                </label>

                {otroChecked && (
                <>
                    <input
                    type="text"
                    value={otroValue}
                    onChange={(e) => setOtroValue(e.target.value)}
                    placeholder="Escriba una descripción personalizada"
                    className="input-custom-desc"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustom();
                        }
                    }}
                    />
                    <button
                    type="button"
                    className="btn btn-secondary btn-xs"
                    onClick={handleAddCustom}
                    title="Agregar a la descripción"
                    >
                    Agregar
                    </button>
                </>
                )}
            </div>

            {/* Chips de personalizados */}
            {customItems.length > 0 && (
                <div className="custom-chips-wrap">
                {customItems.map((c) => (
                    <span
                    key={c}
                    className="btn btn-xs btn-outline chip-item"
                    title={c}
                    >
                    {c.length > 50 ? `${c.slice(0, 50)}…` : c}
                    <button
                        type="button"
                        className="btn btn-xs btn-danger"
                        onClick={() => handleRemoveCustom(c)}
                        title="Quitar"
                    >
                        x
                    </button>
                    </span>
                ))}
                </div>
            )}
            </div>

        {/* Finalidades (tabla puente) */}
            <div className="fc-field" style={{ gridColumn: "1 / -1", marginTop: 8 }}>
            <label>Finalidades (opcional)</label>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <small>Puedes agregar cero o más finalidades con su objetivo.</small>
                <button type="button" className="btn btn-secondary btn-xs" onClick={addRow}>
                + Agregar
                </button>
            </div>

            {finalidadesRows.length === 0 && (
                <div className="alert alert-muted" style={{ padding: 8 }}>
                No has agregado finalidades.
                </div>
            )}

            {finalidadesRows.map((row, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginBottom: 8 }}>
                <SingleSelect
                    options={finalidadesOptions.map((f) => ({ value: f.id, label: f.nombre }))}
                    value={
                    row.finalidad_id
                        ? {
                            value: row.finalidad_id,
                            label: finalidadesOptions.find((f) => f.id === row.finalidad_id)?.nombre || "Seleccionado",
                        }
                        : null
                    }
                    onChange={(opt) => handleRowChange(idx, "finalidad_id", opt ? opt.value : null)}
                    placeholder="Seleccione finalidad…"
                    isClearable
                />
                <input
                    value={row.objetivo}
                    onChange={(e) => handleRowChange(idx, "objetivo", e.target.value)}
                    placeholder="Objetivo"
                />
                <button
                    type="button"
                    className=" btn btn-danger btn-xs"
                    onClick={() => removeRow(idx)}
                    title="Eliminar fila"
                >
                    Eliminar
                </button>
                </div>
            ))}
            </div>
        </div>

        <div className="forc-actions" style={{ marginTop: 30, marginBottom: 20 }}>
            <button className="btn btn-outline" type="button" onClick={onClose} disabled={loading}>
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

export default ForDepartamento;