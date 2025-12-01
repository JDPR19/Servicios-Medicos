import React, { useEffect, useState } from "react";
import "../index.css";
import axios from "axios";
import { BaseUrl } from "../utils/Constans";
import Spinner from "../components/spinner";
import { useToast } from "../components/userToasd";
import SingleSelect from "../components/SingleSelect";
import { validateField, getValidationRule } from "../utils/validation";
import FormModalOne from "../components/FormModalOne";
import ForPacientes from "./ForPaciente";
import icon from "../components/icon";
import { useNavigate } from "react-router-dom";


function ForConsultas({ initialData = {}, onSave, onClose }) {
  const showToast = useToast();
  const isEdit = !!initialData?.id;
  const navigate = useNavigate();

  const initialForm = {
    diagnostico: "",
    tratamientos: "",
    observaciones: "",
    estatus: "Realizada",
    pacientes_id: null,
    enfermedades_id: null,
    medicamentos_ids: [],
    ...initialData,
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [pacientes, setPacientes] = useState([]);
  const [enfermedades, setEnfermedades] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPacienteModal, setShowPacienteModal] = useState(false);

  // Cargar catálogos
  useEffect(() => {
    const fetchCatalogos = async () => {
      setLoading(true);
      try {
        const token = (localStorage.getItem('token') || '').trim();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [pacRes, enfRes, medRes] = await Promise.all([
          axios.get(`${BaseUrl}consultas/pacientes`, { headers }),
          axios.get(`${BaseUrl}consultas/enfermedades`, { headers }),
          axios.get(`${BaseUrl}consultas/medicamentos`, { headers }),
        ]);
        setPacientes(pacRes.data);
        setEnfermedades(enfRes.data);
        setMedicamentos(medRes.data);
      } catch (error) {
        showToast?.("Error cargando catálogos", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogos();
  }, []);

  useEffect(() => {
    setForm({ ...initialForm, ...initialData });
  }, []);

  const handleSeguimientos = () => {
    navigate('/admin/Seguimiento/' + form.pacientes_id)
  }

  const validate = (field, value) => {
    if (!value && ["diagnostico", "pacientes_id", "enfermedades_id"].includes(field)) {
      return "Este campo es obligatorio";
    }
    const rule = getValidationRule(field);
    if (rule && rule.regex) {
      const result = validateField(value, { text: v => rule.regex.test(v) }, rule.errorMessage);
      return result.valid ? "" : result.message;
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: validate(name, value),
    }));
  };

  const handleSelectChange = (name, opt) => {
    setForm((prev) => ({
      ...prev,
      [name]: opt ? opt.value : null,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: validate(name, opt ? opt.value : null),
    }));
  };

  const handleMedicamentosChange = (idx, field, value) => {
    setForm((prev) => {
      const meds = [...(prev.medicamentos_ids || [])];
      meds[idx][field] = value;
      return { ...prev, medicamentos_ids: meds };
    });
  };

  const handleAddMedicamento = () => {
    setForm((prev) => ({
      ...prev,
      medicamentos_ids: [...(prev.medicamentos_ids || []), { medicamento_id: null, cantidad_utilizada: 1 }],
    }));
  };

  const handleRemoveMedicamento = (idx) => {
    setForm((prev) => {
      const meds = [...(prev.medicamentos_ids || [])];
      meds.splice(idx, 1);
      return { ...prev, medicamentos_ids: meds };
    });
  };


  const validateAll = () => {
    const newErrors = {};
    ["diagnostico", "pacientes_id", "enfermedades_id"].forEach((field) => {
      const err = validate(field, form[field]);
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

      if (isEdit) {
        await axios.put(`${BaseUrl}consultas/actualizar/${initialData.id}`, form, { headers });
        showToast?.("Consulta actualizada correctamente", "success");
      } else {
        await axios.post(`${BaseUrl}consultas/registrar`, form, { headers });
        showToast?.("Consulta registrada correctamente", "success");
      }

      if (onSave) onSave();
      if (onClose) onClose();
      handleSeguimientos();


    } catch (err) {
      console.error("Error submit:", err);
      const msg = err?.response?.data?.message || "Error procesando la solicitud";
      showToast?.(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm(initialForm);
    setErrors({});
  };

  const handlePacienteSaved = (nuevoPaciente) => {
    setShowPacienteModal(false);
    // Refresca la lista de pacientes y selecciona el nuevo
    setPacientes(prev => [nuevoPaciente, ...prev]);
    setForm(f => ({ ...f, pacientes_id: nuevoPaciente.id }));
    showToast?.("Paciente registrado y seleccionado", "success");
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="forc-section-title"></div>
        <div className="forc-grid">
          <div className="fc-field">
            <label>
              <span className="unique">*</span>Paciente
              <div style={{ float: "right" }} >
                <button
                  type="button"
                  className="btn btn-xs btn-slider"
                  style={{ marginLeft: 8, verticalAlign: "middle" }}
                  title="Registrar nuevo paciente"
                  onClick={() => setShowPacienteModal(true)}
                >
                  <img src={icon.user4} alt="Nuevo paciente" style={{ width: 18, verticalAlign: "middle" }} />
                  <span style={{ marginLeft: 4 }}>Afiliar</span>
                </button>
              </div>
            </label>
            <SingleSelect
              options={pacientes.map(p => ({
                value: p.id,
                label: `${p.cedula} - ${p.nombre} ${p.apellido}`
              }))}
              value={pacientes.find(p => p.id === form.pacientes_id) ? {
                value: form.pacientes_id,
                label: pacientes.find(p => p.id === form.pacientes_id)?.nombre
                  ? `${pacientes.find(p => p.id === form.pacientes_id).cedula} - ${pacientes.find(p => p.id === form.pacientes_id).nombre} ${pacientes.find(p => p.id === form.pacientes_id).apellido}`
                  : ""
              } : null}
              onChange={opt => handleSelectChange("pacientes_id", opt)}
              placeholder="Seleccione…"
              isClearable={false}
            />
            {errors.pacientes_id && <span style={{ color: "red" }}>{errors.pacientes_id}</span>}
          </div>
          <div className="fc-field">
            <label><span className="unique">*</span>Enfermedad</label>
            <SingleSelect
              options={enfermedades.map(e => ({ value: e.id, label: e.nombre }))}
              value={enfermedades.find(e => e.id === form.enfermedades_id) ? {
                value: form.enfermedades_id,
                label: enfermedades.find(e => e.id === form.enfermedades_id)?.nombre
              } : null}
              onChange={opt => handleSelectChange("enfermedades_id", opt)}
              placeholder="Seleccione…"
              isClearable={false}
            />
            {errors.enfermedades_id && <span style={{ color: "red" }}>{errors.enfermedades_id}</span>}
          </div>
          <div className="fc-field">
            <label><span className="unique">*</span>Diagnóstico</label>
            <textarea
              name="diagnostico"
              value={form.diagnostico}
              onChange={handleChange}
              placeholder="Diagnóstico"
              required
              rows={2}
            />
            {errors.diagnostico && <span style={{ color: "red" }}>{errors.diagnostico}</span>}
          </div>
          <div className="fc-field">
            <label>Tratamientos</label>
            <textarea
              name="tratamientos"
              value={form.tratamientos}
              onChange={handleChange}
              placeholder="Tratamientos"
              rows={2}
            />
          </div>
          <div className="fc-field">
            <label>Observaciones</label>
            <textarea
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              placeholder="Observaciones"
              rows={2}
            />
          </div>
          <div className="fc-field" >
            <label>Medicamentos</label>
            <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "flex-end", position: "relative", top: -30 }}>
              <button type="button" className="btn btn-xs btn-secondary" onClick={handleAddMedicamento} style={{}} >Agregar Medicamento</button>
            </div>
            <div style={{
              maxHeight: 100, overflow: "auto", paddingRight: "5"
            }}>

              {(form.medicamentos_ids || []).map((med, idx) => (
                <div key={idx} style={{ display: "flex", width: "100%", gap: 20, marginBottom: 8 }}>
                  <SingleSelect
                    options={medicamentos.map(m => ({
                      value: m.id,
                      label: `${m.nombre} - ${m.presentacion}`
                    }))}

                    value={medicamentos.find(m => m.id === med.medicamento_id) ? {
                      value: med.medicamento_id,
                      label: (() => {
                        const m = medicamentos.find(m => m.id === med.medicamento_id);
                        return m ? `${m.nombre} - ${m.presentacion}` : "";
                      })()
                    } : null}

                    onChange={opt => handleMedicamentosChange(idx, "medicamento_id", opt ? opt.value : null)}
                    placeholder="Medicamento"
                    isClearable={false}
                    style={{ width: "-100%" }}
                  />
                  <input
                    type="number"
                    min={1}
                    name="cantidad_utilizada"
                    value={med.cantidad_utilizada}
                    onChange={e => handleMedicamentosChange(idx, "cantidad_utilizada", e.target.value)}
                    placeholder="Cantidad"
                    style={{ width: "50%" }}
                  />

                  <button type="button" className="btn btn-xs btn-danger" onClick={() => handleRemoveMedicamento(idx)} style={{ marginLeft: 5, width: "15%", justifyContent: "center" }} >Quitar</button>
                </div>
              ))
              }
            </div>

          </div>
          <div className="fc-field">
            <label>Estatus</label>
            <SingleSelect
              options={[
                { value: "Realizada", label: "Realizada" },
                { value: "Pendiente", label: "Pendiente" }
              ]}
              value={{ value: form.estatus, label: form.estatus }}
              onChange={opt => setForm(f => ({ ...f, estatus: opt.value }))}
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
      </form >


      <FormModalOne
        isOpen={showPacienteModal}
        onClose={() => setShowPacienteModal(false)}
        title="Registrar Paciente Afiliado"
      >
        <ForPacientes
          onSave={handlePacienteSaved}
          onClose={() => setShowPacienteModal(false)}
        />
      </FormModalOne>
    </>
  );
}

export default ForConsultas;