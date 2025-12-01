import React, { useState, useEffect } from "react";
import axios from "axios";
import { BaseUrl } from "../utils/Constans";
import { useToast } from "../components/userToasd";
import Spinner from "../components/spinner";
import MultiSelect from "../components/MultiSelect";
import { jwtDecode } from "jwt-decode";
import "../index.css";

function ForHistorias({ pacienteId, onSuccess, onCancel, historiaToEdit = null }) {
  const showToast = useToast();
  const [loading, setLoading] = useState(false);
  const [enfermedadesOptions, setEnfermedadesOptions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    fecha_consulta: new Date().toISOString().split('T')[0],
    fecha_alta: "",
    motivo_consulta: "",
    historia: "",
    examen_fisico: "",
    diagnostico: "",
    observacion: "",
    enfermedades_ids: [] // Array de objetos { label, value } para el select
  });

  // Cargar catálogo de enfermedades y datos de la historia si se está editando
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1. Cargar catálogo de enfermedades
        const enfResponse = await axios.get(`${BaseUrl}historias_medicas/enfermedades`, { headers });
        const options = (enfResponse.data || []).map(e => ({
          value: e.id,
          label: e.nombre
        }));
        setEnfermedadesOptions(options);

        // 2. Si estamos editando, cargar datos completos de la historia
        if (historiaToEdit) {
          let historiaCompleta = historiaToEdit;

          // Si no tiene detalle (enfermedades), hacemos fetch para obtenerlo
          if (!historiaToEdit.detalle) {
            try {
              const fullHistResponse = await axios.get(`${BaseUrl}historias_medicas/ver/${historiaToEdit.id}`, { headers });
              historiaCompleta = fullHistResponse.data;
            } catch (err) {
              console.error("Error al cargar detalle de historia:", err);
              // Si falla, seguimos con lo que tenemos, aunque falten enfermedades
            }
          }

          setFormData({
            fecha_consulta: historiaCompleta.fecha_consulta ? historiaCompleta.fecha_consulta.split('T')[0] : "",
            fecha_alta: historiaCompleta.fecha_alta ? historiaCompleta.fecha_alta.split('T')[0] : "",
            motivo_consulta: historiaCompleta.motivo_consulta || "",
            historia: historiaCompleta.historia || "",
            examen_fisico: historiaCompleta.examen_fisico || "",
            diagnostico: historiaCompleta.diagnostico || "",
            observacion: historiaCompleta.observacion || "",
            enfermedades_ids: []
          });

          // Mapear enfermedades si existen en el detalle
          if (historiaCompleta.detalle && Array.isArray(historiaCompleta.detalle)) {
            const selectedEnfs = historiaCompleta.detalle.map(d => ({
              value: d.enfermedad_id,
              label: d.enfermedad_nombre
            }));
            setFormData(prev => ({ ...prev, enfermedades_ids: selectedEnfs }));
          }
        }

      } catch (error) {
        console.error("Error al cargar datos:", error);
        showToast?.("Error al cargar catálogos", "error");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [historiaToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Obtener ID de usuario del token
      let usuarios_id = null;
      if (token) {
        const decoded = jwtDecode(token);
        usuarios_id = decoded.id;
      }

      // Preparar enfermedades en el formato que espera el backend: [{ enfermedad_id: 1 }, ...]
      const enfermedadesParaEnviar = formData.enfermedades_ids.map(item => ({
        enfermedad_id: item.value
      }));

      const dataToSend = {
        ...formData,
        pacientes_id: parseInt(pacienteId),
        usuarios_id: usuarios_id,
        enfermedades_ids: enfermedadesParaEnviar,
        // Asegurar fechas nulas si están vacías
        fecha_alta: formData.fecha_alta || null
      };

      if (historiaToEdit) {
        await axios.put(`${BaseUrl}historias_medicas/actualizar/${historiaToEdit.id}`, dataToSend, { headers });
        showToast?.("Historia médica actualizada correctamente", "success");
      } else {
        await axios.post(`${BaseUrl}historias_medicas/registrar`, dataToSend, { headers });
        showToast?.("Historia médica registrada correctamente", "success");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error al guardar historia:", error);
      showToast?.(error.response?.data?.message || "Error al guardar la historia médica", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
        <Spinner size={40} label="Cargando datos..." />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="forc-section-title"></div>

      <div className="forc-grid cols-2">
        {/* Fecha Consulta */}
        <div className="fc-field">
          <label><span className="unique">*</span>Fecha Consulta</label>
          <input
            type="date"
            name="fecha_consulta"
            value={formData.fecha_consulta}
            onChange={handleChange}
            required
          />
        </div>

        {/* Fecha Alta */}
        <div className="fc-field">
          <label>Fecha Alta</label>
          <input
            type="date"
            name="fecha_alta"
            value={formData.fecha_alta}
            onChange={handleChange}
          />
        </div>

        {/* Motivo Consulta - Full Width */}
        <div className="fc-field" style={{ gridColumn: "1 / -1" }}>
          <label><span className="unique">*</span>Motivo de Consulta</label>
          <input
            type="text"
            name="motivo_consulta"
            value={formData.motivo_consulta}
            onChange={handleChange}
            placeholder="Ej: Dolor de cabeza persistente"
            required
          />
        </div>

        {/* Historia - Full Width */}
        <div className="fc-field" style={{ gridColumn: "1 / -1" }}>
          <label>Historia Clínica</label>
          <textarea
            name="historia"
            value={formData.historia}
            onChange={handleChange}
            rows="3"
            placeholder="Detalle de la historia clínica..."
          />
        </div>

        {/* Examen Físico - Full Width */}
        <div className="fc-field" style={{ gridColumn: "1 / -1" }}>
          <label>Examen Físico</label>
          <textarea
            name="examen_fisico"
            value={formData.examen_fisico}
            onChange={handleChange}
            rows="3"
            placeholder="Hallazgos del examen físico..."
          />
        </div>

        {/* Diagnóstico - Full Width */}
        <div className="fc-field" style={{ gridColumn: "1 / -1" }}>
          <label>Diagnóstico</label>
          <textarea
            name="diagnostico"
            value={formData.diagnostico}
            onChange={handleChange}
            rows="2"
            placeholder="Diagnóstico presuntivo o definitivo..."
          />
        </div>

        {/* Observación - Full Width */}
        <div className="fc-field" style={{ gridColumn: "1 / -1" }}>
          <label>Observaciones</label>
          <textarea
            name="observacion"
            value={formData.observacion}
            onChange={handleChange}
            rows="2"
            placeholder="Observaciones adicionales..."
          />
        </div>

        {/* Enfermedades Relacionadas - Full Width */}
        <div className="fc-field" style={{ gridColumn: "1 / -1" }}>
          <label>Enfermedades Relacionadas</label>
          <MultiSelect
            options={enfermedadesOptions}
            value={formData.enfermedades_ids}
            onChange={(selected) => setFormData(prev => ({ ...prev, enfermedades_ids: selected || [] }))}
            placeholder="Seleccione enfermedades..."
          />
        </div>
      </div>

      {/* Botones */}
      <div className="forc-actions" style={{ marginTop: 30, marginBottom: 20 }}>
        <button
          type="button"
          className="btn btn-outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </button>
        <div className="forc-actions-right">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? <Spinner size={20} /> : historiaToEdit ? "Actualizar" : "Registrar"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default ForHistorias;
