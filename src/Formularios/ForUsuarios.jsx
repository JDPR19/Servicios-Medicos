import React, { useEffect, useMemo, useState } from "react";
import "../index.css";
import axios from "axios";
import { BaseUrl } from "../utils/Constans";
import Spinner from "../components/spinner";
import { useToast } from "../components/userToasd";
import SingleSelect from "../components/SingleSelect";
import { validateField, getValidationRule } from "../utils/validation";

function ForUsuarios({ initialData = {}, onSave, onClose }) {
  const showToast = useToast();
  const isEdit = !!initialData?.id;

  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState(() => ({
    username: initialData?.username || "",
    correo: initialData?.correo || "",
    confirmPassword: "",
    password: "",
    roles_id: initialData?.roles_id || initialData?.rol_id || null,
    doctor_id: initialData?.doctor_id || null,
    estatus: initialData?.estatus || "activo",
    estado: typeof initialData?.estado === "boolean" ? initialData.estado : true
  }));

  useEffect(() => {
    setForm({
      username: initialData?.username || "",
      correo: initialData?.correo || "",
      password: initialData?.password || "",
      confirmPassword: initialData?.password || "",
      roles_id: initialData?.roles_id || initialData?.rol_id || "",
      doctor_id: initialData?.doctor_id || "",
      estatus: initialData?.estatus || "activo",
      estado: typeof initialData?.estado === "boolean" ? initialData.estado : true
    });
  }, [initialData?.id]);

  const headers = useMemo(() => {
    const token = (localStorage.getItem("token") || "").trim();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Cargar catálogos
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [rRes, dRes] = await Promise.all([
          axios.get(`${BaseUrl}usuarios/catalogos/roles`, { headers }),
          axios.get(`${BaseUrl}usuarios/catalogos/doctores`, { headers }),
        ]);
        setRoles(rRes.data || []);
        setDoctores(dRes.data || []);
      } catch (error) {
        console.error("Error cargando catálogos de usuarios", error);
        showToast?.("Error cargando catálogos", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [headers, showToast]);

// Validación de campos
const validate = (field, value) => {
  if (field === "confirmPassword") {
    return value !== form.password ? "Las contraseñas no coinciden" : "";
  }
  const rule = getValidationRule(field);
  if (rule && rule.regex) {
    const result = validateField(value, { text: v => rule.regex.test(v) }, rule.errorMessage);
    return result.valid ? "" : result.message;
  }
  return "";
};

const handleChange = (e) => {
const { name, value, type, checked } = e.target;
setForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
}));
setErrors((prev) => ({
    ...prev,
    [name]: validate(name, type === "checkbox" ? checked : value),
}));
};


const validateAll = () => {
    const newErrors = {};
    Object.keys(form).forEach((field) => {
    if (field === "estado") return;
    const err = validate(field, form[field]);
    if (err) newErrors[field] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

  const handleClear = () => {
    setForm({
      username: "",
      correo: "",
      password: "",
      confirmPassword: "",
      roles_id: "",
      doctor_id: "",
      estatus: "activo",
      estado: true
    });
      setErrors({});
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      showToast?.("Corrige los errores antes de guardar", "warning");
      return;
      }
    setLoading(true);
    try {
      const res = await axios.post(`${BaseUrl}usuarios/registrar`, form, { headers });
      showToast?.("Usuario registrado con éxito", "success");
      onSave?.(res.data);
      onClose?.();
    } catch (error) {
      const msg = error?.response?.data?.message || "Error registrando usuario";
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
      console.log("Editando usuario:", initialData.id, form);
      const res = await axios.put(`${BaseUrl}usuarios/actualizar/${initialData.id}`, form, { headers });
      showToast?.("Usuario actualizado correctamente", "success");
      onSave?.(res.data);
      onClose?.();
    } catch (error) {
      const msg = error?.response?.data?.message || "Error actualizando usuario";
      showToast?.(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={isEdit ? handleEdit : handleSave}>
      <div className="forc-grid cols-2">
        <div className="fc-field">
          <label><span className="unique">*</span>Usuario</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Ej: admin"
            required
          />
          {errors.username && <span style={{ color: "red" }}>{errors.username}</span>}
        </div>

        <div className="fc-field">
          <label><span className="unique">*</span>Correo</label>
          <input
            type="email"
            name="correo"
            value={form.correo}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            required
          />
          {errors.correo && <span style={{ color: "red" }}>{errors.correo}</span>}
        </div>

        
          <div className="fc-field">
            <label><span className="unique">*</span>Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required={!isEdit}
            />
          {errors.password && <span style={{color: 'red'}}>{errors.password}</span> }
          </div>

          <div className="fc-field">
            <label>Confirmar contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repite la nueva contraseña"
              required={!!form.password}
            />
            {errors.confirmPassword && <span style={{color: 'red'}}>{errors.confirmPassword}</span>}
          </div>
        

       
          {/* <div className="fc-field">
            <label>Nueva contraseña (opcional)</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Dejar en blanco para conservar"
            />
            {errors.password && <span style={{color: 'red'}}>{errors.password}</span>}
          </div> */}
        

        <div className="fc-field">
          <label><span className="unique">*</span>Rol</label>
          <SingleSelect
            options={roles.map(r => ({ value: r.id, label: r.nombre }))}
            value={roles.find(r => r.id === form.roles_id) ? { value: form.roles_id, label: roles.find(r => r.id === form.roles_id)?.nombre } : null}
            onChange={(opt) => setForm((p) => ({ ...p, roles_id: opt ? opt.value : null }))}
            placeholder="Seleccione…"
            isClearable={false}
          />
        </div>

        <div className="fc-field">
          <label><span className="unique">*</span> Doctor</label>
          <SingleSelect
            options={doctores.map(d => ({ value: d.id, label: `${d.nombre} ${d.apellido} (${d.cedula})` }))}
            value={
              doctores.find(d => d.id === form.doctor_id)
                ? {
                    value: form.doctor_id,
                    label: `${doctores.find(d => d.id === form.doctor_id)?.nombre} ${doctores.find(d => d.id === form.doctor_id)?.apellido} (${doctores.find(d => d.id === form.doctor_id)?.cedula})`
                  }
                : null
            }
            onChange={(opt) => setForm((p) => ({ ...p, doctor_id: opt ? opt.value : null }))}
            placeholder="Seleccione…"
            isClearable
          />
        </div>

        {/* <div className="fc-field">
          <label><span className='unique'>*</span>Estatus</label>
          <SingleSelect
            options={[
              { value: "activo", label: "Activo" },
              { value: "inactivo", label: "Inactivo" }
            ]}
            value={{ value: form.estatus, label: (form.estatus || "activo")[0].toUpperCase() + (form.estatus || "activo").slice(1) }}
            onChange={(opt) => setForm((p) => ({ ...p, estatus: opt ? opt.value : "activo" }))}
            isClearable={false}
          />
        </div> */}

        {/* <div className="fc-field" style={{ display: "flex", alignItems: "flex-end" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={!!form.estado}
              onChange={(e) => setForm((p) => ({ ...p, estado: e.target.checked }))}
            />
            Activo en el sistema
          </label>
        </div> */}
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

export default ForUsuarios;