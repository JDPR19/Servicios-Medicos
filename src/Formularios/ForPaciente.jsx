import React, { useEffect, useState } from "react";
import "../index.css";
import axios from "axios";
import { BaseUrl } from "../utils/Constans";
import { validateField, validationRules } from "../utils/validation";
import Spinner from "../components/spinner";
import { useToast } from "../components/userToasd";
import SingleSelect from "../components/SingleSelect";


const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return '';

  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad.toString();
};

const PREFIJOS = [
  { value: "V-", label: "V-" },
  { value: "E-", label: "E-" },
  { value: "J-", label: "J-" },
  { value: "G-", label: "G-" },
];

function ForPacientes({ initialData = {}, onSave, onClose }) {
  const showToast = useToast();
  const isEdit = !!initialData?.id;

  // Prefijo y número de cédula
  const getPrefijo = cedula =>
    PREFIJOS.find(p => cedula?.startsWith(p.value))?.value || "V-";
  const getNumero = cedula =>
    cedula ? cedula.replace(/^(V-|E-|J-|G-)/, "") : "";

  const initialForm = {
    cedula: "",
    nombre: "",
    apellido: "",
    sexo: "",
    fecha_nacimiento: "",
    edad: "",
    correo: "",
    contacto: "",
    ubicacion: "",
    estado_id: null,
    municipio_id: null,
    parroquia_id: null,
    sector_id: null,
    departamentos_id: null,
    cargos_id: null,
    profesion_id: null,
    estatus: "en planta",
    ...initialData,
  };

  const [form, setForm] = useState(initialForm);
  const [prefijoCedula, setPrefijoCedula] = useState(getPrefijo(initialForm.cedula));
  const [numeroCedula, setNumeroCedula] = useState(getNumero(initialForm.cedula));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Catálogos
  const [estados, setEstados] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [profesiones, setProfesiones] = useState([]);
  const [municipiosFiltrados, setMunicipiosFiltrados] = useState([]);
  const [parroquiasFiltradas, setParroquiasFiltradas] = useState([]);
  const [sectoresFiltrados, setSectoresFiltrados] = useState([]);

  // Cargar catálogos
  useEffect(() => {
    const fetchCatalogos = async () => {
      setLoading(true);
      try {
        const token = (localStorage.getItem('token') || '').trim();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [
          estadosRes, municipiosRes, parroquiasRes, sectoresRes,
          departamentosRes, cargosRes, profesionesRes
        ] = await Promise.all([
          axios.get(`${BaseUrl}pacientes/all_estados`, { headers }),
          axios.get(`${BaseUrl}pacientes/all_municipios`, { headers }),
          axios.get(`${BaseUrl}pacientes/all_parroquias`, { headers }),
          axios.get(`${BaseUrl}pacientes/all_sectores`, { headers }),
          axios.get(`${BaseUrl}pacientes/all_deparatamentos`, { headers }),
          axios.get(`${BaseUrl}pacientes/all_cargos`, { headers }),
          axios.get(`${BaseUrl}pacientes/all_profesion`, { headers }),
        ]);
        setEstados(estadosRes.data);
        setMunicipios(municipiosRes.data);
        setParroquias(parroquiasRes.data);
        setSectores(sectoresRes.data);
        setDepartamentos(departamentosRes.data);
        setCargos(cargosRes.data);
        setProfesiones(profesionesRes.data);
      } catch (error) {
        showToast?.("Error cargando catálogos", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogos();
  }, []);

  useEffect(() => {
    if (initialData?.id) {

      let fechaFormateada = initialData.fecha_nacimiento;
      if (fechaFormateada) {

        const fecha = new Date(fechaFormateada);
        if (!isNaN(fecha.getTime())) {
          fechaFormateada = fecha.toISOString().split('T')[0];
        }
      }

      const cedula = initialData?.cedula || "";
      setForm({
        ...initialForm,
        ...initialData,
        fecha_nacimiento: fechaFormateada
      });
      setPrefijoCedula(getPrefijo(cedula));
      setNumeroCedula(getNumero(cedula));
    }
  }, [initialData]);

  
  useEffect(() => {
    if (initialData?.id && municipios.length > 0 && parroquias.length > 0 && sectores.length > 0) {
      
      if (initialData.estado_id) {
        const munisFiltrados = municipios.filter(m => m.estado_id === initialData.estado_id);
        setMunicipiosFiltrados(munisFiltrados);
      }

      
      if (initialData.municipio_id) {
        const parrosFiltradas = parroquias.filter(p => p.municipio_id === initialData.municipio_id);
        setParroquiasFiltradas(parrosFiltradas);
      }

      
      if (initialData.parroquia_id) {
        const sectsFiltrados = sectores.filter(s => s.parroquia_id === initialData.parroquia_id);
        setSectoresFiltrados(sectsFiltrados);
      }
    }
  }, [initialData, municipios, parroquias, sectores]);

  // Validación de campos
  const validate = (field, value) => {
    if (validationRules[field]) {
      const { regex, errorMessage } = validationRules[field];
      const result = validateField(value, { text: v => regex.test(v) }, errorMessage);
      return result.valid ? "" : result.message;
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'fecha_nacimiento') {
      const edadCalculada = calcularEdad(value);
      setForm((prev) => ({
        ...prev,
        [name]: value,
        edad: edadCalculada
      }));
      setErrors((prev) => ({
        ...prev,
        [name]: validate(name, value),
        edad: validate('edad', edadCalculada)
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
      setErrors((prev) => ({
        ...prev,
        [name]: validate(name, value),
      }));
    }
  };

  const handleEstadoChange = (opt) => {
    const estadoId = opt ? opt.value : null;

    setForm(f => ({
      ...f,
      estado_id: estadoId,
      municipio_id: null,
      parroquia_id: null,
      sector_id: null
    }));

    const filtrados = estadoId
      ? municipios.filter(m => m.estado_id === estadoId)
      : [];

    setMunicipiosFiltrados(filtrados);
    setParroquiasFiltradas([]);
    setSectoresFiltrados([]);
  };

  const handleMunicipioChange = (opt) => {
    const municipioId = opt ? opt.value : null;
    setForm(f => ({
      ...f,
      municipio_id: municipioId,
      parroquia_id: null,
      sector_id: null
    }));

    // Filtrar parroquias del municipio seleccionado
    const filtradas = municipioId
      ? parroquias.filter(p => p.municipio_id === municipioId)
      : [];
    setParroquiasFiltradas(filtradas);
    setSectoresFiltrados([]);
  };

  const handleParroquiaChange = (opt) => {
    const parroquiaId = opt ? opt.value : null;
    setForm(f => ({
      ...f,
      parroquia_id: parroquiaId,
      sector_id: null
    }));

    // Filtrar sectores de la parroquia seleccionada
    const filtrados = parroquiaId
      ? sectores.filter(s => s.parroquia_id === parroquiaId)
      : [];
    setSectoresFiltrados(filtrados);
  };

  const handlePrefijoChange = opt => {
    const nuevoPrefijo = opt ? opt.value : "V-";
    setPrefijoCedula(nuevoPrefijo);
    setForm(f => ({ ...f, cedula: nuevoPrefijo + numeroCedula }));
  };
  const handleNumeroCedulaChange = e => {
    const numero = e.target.value.replace(/\D/g, "");
    setNumeroCedula(numero);
    setForm(f => ({ ...f, cedula: prefijoCedula + numero }));
  };

  // Validar todo antes de guardar
  const validateAll = () => {
    const newErrors = {};
    ["cedula", "nombre", "apellido", "sexo", "fecha_nacimiento", "edad", "contacto"].forEach((field) => {
      const err = validate(field, form[field]);
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClear = () => {
    setForm(initialForm);
    setErrors({});
    setPrefijoCedula(getPrefijo(initialForm.cedula));
    setNumeroCedula(getNumero(initialForm.cedula));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      showToast?.("Corrige los errores antes de guardar", "warning");
      return;
    }
    setLoading(true);
    try {
      const token = (localStorage.getItem('token') || '').trim();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      let res;
      if (isEdit) {
        res = await axios.put(`${BaseUrl}pacientes/actualizar/${initialData.id}`, form, { headers });
        showToast?.("Paciente actualizado correctamente", "success");
      } else {
        res = await axios.post(`${BaseUrl}pacientes/registrar`, form, { headers });
        showToast?.("Paciente registrado correctamente", "success");
      }
      if (onSave) onSave(res.data);
      if (onClose) onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || "Error registrando paciente";
      showToast?.(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="forc-section-title"></div>
      <div className="forc-grid cols-3">
        <div className="fc-field">
          <label><span className="unique">*</span>Cédula</label>
          <div style={{ display: "flex", gap: 8 }}>
            <SingleSelect
              options={PREFIJOS}
              value={PREFIJOS.find(p => p.value === prefijoCedula)}
              onChange={handlePrefijoChange}
              placeholder="Prefijo"
              isClearable={false}
            />
            <input
              name="cedula"
              value={numeroCedula}
              onChange={handleNumeroCedulaChange}
              placeholder="12345678"
              required
              style={{ flex: 1 }}
              maxLength={10}
              pattern="\d*"
            />
          </div>
          {errors.cedula && <span style={{ color: "red" }}>{errors.cedula}</span>}
        </div>
        <div className="fc-field">
          <label><span className="unique">*</span>Nombre</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Pedro"
            required
          />
          {errors.nombre && <span style={{ color: "red" }}>{errors.nombre}</span>}
        </div>
        <div className="fc-field">
          <label><span className="unique">*</span>Apellido</label>
          <input
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            placeholder="Ej: Colmenarez"
            required
          />
          {errors.apellido && <span style={{ color: "red" }}>{errors.apellido}</span>}
        </div>
        <div className="fc-field">
          <label><span className="unique">*</span>Sexo</label>
          <SingleSelect
            options={[
              { value: "Masculino", label: "Masculino" },
              { value: "Femenino", label: "Femenino" }
            ]}
            value={form.sexo ? { value: form.sexo, label: form.sexo } : null}
            onChange={opt => setForm(f => ({ ...f, sexo: opt ? opt.value : "" }))}
            placeholder="Seleccione…"
            isClearable={false}
          />
          {errors.sexo && <span style={{ color: "red" }}>{errors.sexo}</span>}
        </div>
        <div className="fc-field">
          <label><span className="unique">*</span>Fecha de Nacimiento</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={form.fecha_nacimiento}
            onChange={handleChange}
            required
          />
          {errors.fecha_nacimiento && <span style={{ color: "red" }}>{errors.fecha_nacimiento}</span>}
        </div>
        <div className="fc-field">
          <label><span className="unique">*</span>Edad</label>
          <input
            name="edad"
            value={form.edad}
            onChange={handleChange}
            placeholder="Ej: 30"
            readOnly
            required
            style={{ backgroundColor: '#f0f0f0' }}
          />
          {errors.edad && <span style={{ color: "red" }}>{errors.edad}</span>}
        </div>
        <div className="fc-field">
          <label>Correo</label>
          <input
            name="correo"
            value={form.correo}
            onChange={handleChange}
            placeholder="Ej: correo@ejemplo.com"
          />
          {errors.correo && <span style={{ color: "red" }}>{errors.correo}</span>}
        </div>
        <div className="fc-field">
          <label><span className="unique">*</span>Contacto</label>
          <input
            name="contacto"
            value={form.contacto}
            onChange={handleChange}
            placeholder="Ej: 0412-1234567"
            required
          />
          {errors.contacto && <span style={{ color: "red" }}>{errors.contacto}</span>}
        </div>
        <div className="fc-field">
          <label>Ubicación</label>
          <input
            name="ubicacion"
            value={form.ubicacion}
            onChange={handleChange}
            placeholder="Dirección o referencia"
          />
        </div>
        <div className="fc-field">
          <label>Estado</label>
          <SingleSelect
            options={estados.map(e => ({ value: e.id, label: e.nombre }))}
            value={estados.find(e => e.id === form.estado_id) ? { value: form.estado_id, label: estados.find(e => e.id === form.estado_id)?.nombre } : null}
            onChange={handleEstadoChange}
            placeholder="Seleccione…"
            isClearable={false}
          />
        </div>

        <div className="fc-field">
          <label>Municipio</label>
          <SingleSelect
            options={municipiosFiltrados.map(m => ({ value: m.id, label: m.nombre }))}
            value={municipiosFiltrados.find(m => m.id === form.municipio_id) ? { value: form.municipio_id, label: municipiosFiltrados.find(m => m.id === form.municipio_id)?.nombre } : null}
            onChange={handleMunicipioChange}
            placeholder="Seleccione…"
            isClearable={false}
            isDisabled={!form.estado_id}
          />
        </div>

        <div className="fc-field">
          <label>Parroquia</label>
          <SingleSelect
            options={parroquiasFiltradas.map(p => ({ value: p.id, label: p.nombre }))}
            value={parroquiasFiltradas.find(p => p.id === form.parroquia_id) ? { value: form.parroquia_id, label: parroquiasFiltradas.find(p => p.id === form.parroquia_id)?.nombre } : null}
            onChange={handleParroquiaChange}
            placeholder="Seleccione…"
            isClearable={false}
            isDisabled={!form.municipio_id}
          />
        </div>

        <div className="fc-field">
          <label>Sector</label>
          <SingleSelect
            options={sectoresFiltrados.map(s => ({ value: s.id, label: s.nombre }))}
            value={sectoresFiltrados.find(s => s.id === form.sector_id) ? { value: form.sector_id, label: sectoresFiltrados.find(s => s.id === form.sector_id)?.nombre } : null}
            onChange={opt => setForm(f => ({ ...f, sector_id: opt ? opt.value : null }))}
            placeholder="Seleccione…"
            isClearable={false}
            isDisabled={!form.parroquia_id}  // ← Deshabilitar si no hay parroquia
          />
        </div>
        <div className="fc-field">
          <label>Departamento</label>
          <SingleSelect
            options={departamentos.map(d => ({ value: d.id, label: d.nombre }))}
            value={departamentos.find(d => d.id === form.departamentos_id) ? { value: form.departamentos_id, label: departamentos.find(d => d.id === form.departamentos_id)?.nombre } : null}
            onChange={opt => setForm(f => ({ ...f, departamentos_id: opt ? opt.value : null }))}
            placeholder="Seleccione…"
            isClearable={false}
          />
        </div>
        <div className="fc-field">
          <label>Cargo</label>
          <SingleSelect
            options={cargos.map(c => ({ value: c.id, label: c.nombre }))}
            value={cargos.find(c => c.id === form.cargos_id) ? { value: form.cargos_id, label: cargos.find(c => c.id === form.cargos_id)?.nombre } : null}
            onChange={opt => setForm(f => ({ ...f, cargos_id: opt ? opt.value : null }))}
            placeholder="Seleccione…"
            isClearable={false}
          />
        </div>
        <div className="fc-field">
          <label>Profesión</label>
          <SingleSelect
            options={profesiones.map(p => ({ value: p.id, label: p.carrera }))}
            value={profesiones.find(p => p.id === form.profesion_id) ? { value: form.profesion_id, label: profesiones.find(p => p.id === form.profesion_id)?.carrera } : null}
            onChange={opt => setForm(f => ({ ...f, profesion_id: opt ? opt.value : null }))}
            placeholder="Seleccione…"
            isClearable={false}
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

export default ForPacientes;