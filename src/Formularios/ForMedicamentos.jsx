import React, { useEffect, useState } from "react";
import "../index.css";
import axios from "axios";
import { BaseUrl } from "../utils/Constans";
import Spinner from "../components/spinner";
import { useToast } from "../components/userToasd";
import SingleSelect from "../components/SingleSelect";
import { validateField, validationRules } from "../utils/validation";

// NOTA: Ajustar endpoint de categorías si difiere.
const CATEGORIA_ENDPOINT = "medicamentos/categorias";

function ForMedicamentos({ initialData = {}, onSave, onClose }) {
  const showToast = useToast();
  const isEdit = !!initialData?.id;
  const initialForm = {
    nombre: "",
    presentacion: "",
    miligramos: "",
    cantidad_disponible: 0,
    estatus: "disponible",
    estado: true,
    categoria_m_id: null,
    ...initialData,
  };

  const [form, setForm] = useState(initialForm);
  const [categorias, setCategorias] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = (localStorage.getItem("token") || "").trim();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const PRESENTACION_OPTIONS = [
    { value: "Tabletas", label: "Tabletas" },
    { value: "Jarabe", label: "Jarabe" },
    { value: "Ampollas", label: "Ampollas" },
    { value: "Cápsulas", label: "Cápsulas" },
    { value: "Crema", label: "Crema" },
    { value: "Solución", label: "Solución" },
    { value: "Inyectable", label: "Inyectable" },
    { value: "Polvo", label: "Polvo" },
    { value: "Otro", label: "Otro" }
  ];

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axios.get(`${BaseUrl}${CATEGORIA_ENDPOINT}`, { headers: getAuthHeaders() });
        setCategorias(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error cargando categorías:", err?.response?.data || err.message);
        showToast?.("Error cargando categorías", "error");
      }
    };
    fetchCategorias();
  }, []);

  const deriveEstatus = (cant) => {
    if (cant <= 0) return "agotado";
    if (cant < 10) return "por acabar";
    return "disponible";
  };

  const validate = (field, value) => {
    if (validationRules?.[field]) {
      const { regex, errorMessage } = validationRules[field];
      const result = validateField(value, { text: v => regex.test(v) }, errorMessage);
      return result.valid ? "" : result.message;
    }
    if (field === "nombre" && !value.trim()) return "El nombre es requerido";
    return "";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;
    if (name === "cantidad_disponible") {
      const num = parseInt(val, 10);
      val = isNaN(num) ? 0 : num;
      // Actualizar estatus dinámico
      setForm(prev => ({ ...prev, [name]: val, estatus: deriveEstatus(val) }));
    } else {
      setForm(prev => ({ ...prev, [name]: val }));
    }
    setErrors(prev => ({ ...prev, [name]: validate(name, val.toString()) }));
  };

  const validateAll = () => {
    const newErr = {};
    ["nombre"].forEach(f => {
      const err = validate(f, form[f] || "");
      if (err) newErr[f] = err;
    });
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleClear = () => {
    setForm(initialForm);
    setErrors({});
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      showToast?.("Corrige los errores antes de guardar", "warning");
      return;
    }
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const payload = {
        ...form,
        cantidad_disponible: Number(form.cantidad_disponible) || 0,
        estatus: deriveEstatus(Number(form.cantidad_disponible)),
      };
      const res = await axios.post(`${BaseUrl}medicamentos/registrar`, payload, { headers });
      showToast?.("Medicamento registrado correctamente", "success");
      onSave?.(res.data);
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error registrando medicamento";
      console.error("Error registrando medicamento:", msg);
      showToast?.(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      showToast?.("Corrige los errores antes de guardar", "warning");
      return;
    }
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const payload = {
        ...form,
        cantidad_disponible: Number(form.cantidad_disponible) || 0,
        estatus: deriveEstatus(Number(form.cantidad_disponible)),
      };
      const res = await axios.put(`${BaseUrl}medicamentos/actualizar/${initialData.id}`, payload, { headers });
      showToast?.("Medicamento actualizado correctamente", "success");
      onSave?.(res.data);
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error actualizando medicamento";
      console.error("Error actualizando medicamento:", msg);
      showToast?.(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={isEdit ? handleEdit : handleRegister}>
      <div className="forc-grid">
        <div className="fc-field">
          <label><span className="unique">*</span>Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Ibuprofeno"
              required
            />
          {errors.nombre && <span style={{ color: "red" }}>{errors.nombre}</span>}
        </div>

        <div className="fc-field">
          <label>Presentación</label>
          <SingleSelect
            options={PRESENTACION_OPTIONS}
            value={
              PRESENTACION_OPTIONS.find(opt => opt.value === form.presentacion) ||
              (form.presentacion ? { value: form.presentacion, label: form.presentacion } : null)
            }
            onChange={opt => setForm(f => ({ ...f, presentacion: opt ? opt.value : "" }))}
            placeholder="Seleccione…"
            isClearable
          />
        </div>

        <div className="fc-field">
          <label>Miligramos</label>
          <input
            name="miligramos"
            value={form.miligramos}
            onChange={handleChange}
            placeholder="Ej: 400mg"
          />
        </div>

        <div className="fc-field">
          <label>Cantidad Disponible</label>
          <input
            name="cantidad_disponible"
            type="number"
            min={0}
            value={form.cantidad_disponible}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <div className="fc-field">
          <label>Categoría</label>
          <SingleSelect
            options={categorias.map(c => ({ value: c.id, label: c.nombre }))}
            value={
              categorias.find(c => c.id === form.categoria_m_id)
                ? { value: form.categoria_m_id, label: categorias.find(c => c.id === form.categoria_m_id)?.nombre }
                : null
            }
            onChange={opt => setForm(f => ({ ...f, categoria_m_id: opt ? opt.value : null }))}
            placeholder="Seleccione…"
            isClearable
          />
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

export default ForMedicamentos;