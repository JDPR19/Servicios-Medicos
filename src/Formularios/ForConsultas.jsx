import "../styles/for-consultas.css";
import InfoCard from "../components/InfoCard";
import icon from "../components/icon";

function ForConsultas() {
  return (
    <div className="forc-page">
      <h2 className="forc-title">
        <img src={icon.consulta} alt="" className="forc-title-icon" />
        Nueva consulta
      </h2>

      {/* Datos del paciente */}
      <InfoCard>
        <div className="forc-section-title">
          <img src={icon.user2 || icon.user} alt="" />
          <span>Datos del paciente</span>
        </div>
        <div className="forc-grid">
          <div className="fc-field">
            <label>Paciente (nombre o cédula)</label>
            <input placeholder="Ej: Juan Pérez / V-12345678" />
          </div>
          <div className="fc-field">
            <label>ID Paciente (opcional)</label>
            <input placeholder="ID en el sistema" />
          </div>
        </div>
      </InfoCard>

      {/* Profesional y agenda */}
      <InfoCard>
        <div className="forc-section-title">
          <img src={icon.doctor} alt="" />
          <span>Profesional y agenda</span>
        </div>
        <div className="forc-grid">
          <div className="fc-field">
            <label>Doctor(a)</label>
            <input placeholder="Ej: Dra. López" />
          </div>
          <div className="fc-field">
            <label>ID Doctor (opcional)</label>
            <input placeholder="ID en el sistema" />
          </div>
          <div className="fc-field">
            <label>Fecha</label>
            <div className="fc-input-icon">
              <img src={icon.calendario} alt="" />
              <input type="date" />
            </div>
          </div>
          <div className="fc-field">
            <label>Finalidad</label>
            <select defaultValue="">
              <option value="" disabled>Seleccione…</option>
              <option value="1">Medicina General</option>
              <option value="2">Odontología</option>
              <option value="3">Enfermería</option>
              <option value="4">Traumatología</option>
            </select>
          </div>
          <div className="fc-field">
            <label>Estado</label>
            <select defaultValue="pendiente">
              <option value="pendiente">pendiente</option>
              <option value="en_proceso">en proceso</option>
              <option value="finalizada">finalizada</option>
              <option value="cancelada">cancelada</option>
            </select>
          </div>
        </div>
      </InfoCard>

      {/* Motivo y diagnóstico */}
      <InfoCard>
        <div className="forc-section-title">
          <img src={icon.consultabien} alt="" />
          <span>Motivo y diagnóstico</span>
        </div>
        <div className="forc-grid cols-1">
          <div className="fc-field">
            <label>Motivo de consulta</label>
            <textarea rows={3} placeholder="Describa el motivo de la consulta" />
          </div>
          <div className="fc-field">
            <label>Diagnóstico (opcional)</label>
            <textarea rows={3} placeholder="Diagnóstico preliminar o definitivo" />
          </div>
        </div>
      </InfoCard>

      {/* Signos vitales */}
      <InfoCard>
        <div className="forc-section-title">
          <img src={icon.monitorcardiaco} alt="" />
          <span>Signos vitales (opcional)</span>
        </div>
        <div className="forc-grid">
          <div className="fc-field">
            <label>Peso (kg)</label>
            <input inputMode="decimal" placeholder="Ej: 70.5" />
          </div>
          <div className="fc-field">
            <label>Altura (cm)</label>
            <input inputMode="numeric" placeholder="Ej: 172" />
          </div>
          <div className="fc-field">
            <label>Temperatura (°C)</label>
            <input inputMode="decimal" placeholder="Ej: 36.8" />
          </div>
          <div className="fc-field">
            <label>Presión arterial</label>
            <input placeholder="Ej: 120/80" />
          </div>
        </div>
      </InfoCard>

      {/* Acciones (sin lógica aún) */}
      <div className="forc-actions">
        <button className="btn btn-outline" type="button">Cancelar</button>
        <div className="forc-actions-right">
          <button className="btn btn-secondary" type="button" title="Guardar y crear otra">Guardar y nueva</button>
          <button className="btn btn-primary" type="submit">Guardar</button>
        </div>
      </div>
    </div>
  );
}

export default ForConsultas;