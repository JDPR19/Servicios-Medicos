import { useNavigate } from "react-router-dom";
import icon from "../components/icon";
import img from "../components/imagen";
import Header from "../components/header";

function Landing() {
  const navigate = useNavigate();

  const handleImgError = (e) => (e.currentTarget.style.display = "none");

  const irPagina = () => {
        navigate('/login');
  };
  return (
    <div className="landing">
        <Header/>

        <section className="hero" id="inicio">
          <div className="container heroInner">
            <div className="heroContent">
              <h1 className="heroTitle">
                Gestión Integral de Servicios Médicos - Planta Yutong
              </h1>
              <p className="heroSubtitle">
                Agenda consultas, lleva historiales clínicos, registra incapacidades y
                haz seguimiento a tratamientos en un solo lugar.
              </p>
              <div className="heroCtas">
                <buttom onClick={irPagina} className="btn-estandar">Entrar al sistema</buttom>
                <a href="#caracteristicas" className="btn-outline">Conocer más</a>
              </div>
              <ul className="heroHighlights">
                <li><img src={icon.consulta} alt="" className="iconSm" /> Consultas y seguimiento</li>
                <li><img src={icon.maletindoctor} alt="" className="iconSm" /> Enfermería y medicamentos</li>
                <li><img src={icon.impresora} alt="" className="iconSm" /> Reportes y bitácora</li>
              </ul>
            </div>

            <div className="heroMedia">
              {/* GIF opcional: coloca tu gif en public/asset/landing.gif */}
              <img
                src="/asset/landing.gif"
                alt="animación salud"
                className="heroGif"
                onError={handleImgError}
              />
              <img src={img.entrada} alt="Entrada Yutong 1" className="heroImg" />
            </div>
          </div>

          <div className="heroMarcas container">
            <img src={icon.doctor} alt="Profesionales" className="marcaIcon" />
            <img src={icon.hambulatorio} alt="Atención" className="marcaIcon" />
            <img src={icon.monitorcardiaco} alt="Monitoreo" className="marcaIcon" />
            <img src={icon.mascarilla2} alt="Prevención" className="marcaIcon" />
          </div>
        </section>

        <section className="features container" id="caracteristicas">
          <article className="featureCard">
            <img src={icon.consulta} alt="" className="featureIcon" />
            <h3>Consultas y Historias</h3>
            <p>Registra historias médicas, signos vitales y diagnósticos de manera rápida y ordenada.</p>
          </article>

          <article className="featureCard">
            <img src={icon.carpetaplus} alt="" className="featureIcon" />
            <h3>Gestión de Servicios</h3>
            <p>Control de medicación, reposos, finalidades y seguimiento de casos especiales.</p>
          </article>

          <article className="featureCard">
            <img src={icon.impresora} alt="" className="featureIcon" />
            <h3>Reportes y Bitácora</h3>
            <p>Auditoría completa de acciones y generación de reportes para decisiones informadas.</p>
          </article>
        </section>

        <section className="mediaSplit container" id="servicios">
          <div className="mediaImgWrap">
            <img src={img.odontologos} alt="Entrada Yutong 2" className="mediaImg" />
          </div>
          <div className="mediaText">
            <h2>Orientado a productividad y bienestar</h2>
            <p>
              ♥ Cuidarte Yutong optimiza la atención a trabajadores con flujos definidos, permisos por
              rol y seguridad de acceso. Tu operación más ágil y confiable.
            </p>
            <ul className="bullets">
              <li><span className="tag">Roles</span> Diferentes niveles de acceso.</li>
              <li><span className="tag">Seguimiento</span> Evolución clínica por paciente.</li>
              <li><span className="tag">Notificaciones</span> Recordatorios y alertas internas.</li>
            </ul>
            <button onClick={irPagina} className="btn-estandar">Comenzar ahora</button>
          </div>
        </section>

        <section className="stats">
          <div className="container statsInner">
            <div className="stat">
              <span className="statNum">+1K</span>
              <span className="statLabel">Consultas registradas</span>
            </div>
            <div className="stat">
              <span className="statNum">24/7</span>
              <span className="statLabel">Disponibilidad</span>
            </div>
            <div className="stat">
              <span className="statNum">100%</span>
              <span className="statLabel">Seguridad de acceso</span>
            </div>
          </div>
        </section>

        <section className="testimonials container">
          <article className="testimonial">
            <p>“Centralizamos todo en un solo sistema y la atención mejoró notablemente.”</p>
            <span className="by">— Coordinación Médica</span>
          </article>
          <article className="testimonial">
            <p>“Reportes claros y trazabilidad completa. Auditorías más simples.”</p>
            <span className="by">— Gestión de Talento</span>
          </article>
        </section>

        <section className="cta">
          <div className="container ctaInner">
            <h2>¿Listo para mejorar la gestión médica?</h2>
            <p>Ingresa al sistema y comienza a registrar de forma profesional.</p>
            <buttom onClick={irPagina} className="btn-estandar">Ir al Login</buttom>
          </div>
        </section>

        <footer className="landingFooter" id="contacto">
          <div className="container footerInner">
              {/* Columna izquierda: marca */}
              <div className="footerBrand">
                <p>© 2025 Planta de Autobuses Yutong Venezuela &#x1F1FB;&#x1F1EA;</p>
                <p>Rif: G-200172622</p>
              </div>

              {/* Columna central: dev-BadDev (íconos + email con ícono) */}
              <section className="dev-BadDev">
                <div className="dev-icons">
                  <a href="#" className="dev-icon" title="Icono 1">
                    <img src={icon.monitorcardiaco} alt="icono" />
                  </a>
                  <a href="#" className="dev-icon" title="Icono 2">
                    <img src={icon.estetoscopio} alt="icono" />
                  </a>
                  <a href="#" className="dev-icon" title="Icono 3">
                    <img src={icon.maletindoctor2} alt="icono" />
                  </a>
                </div>

                <a href="mailto:baddevprograming@gmail.com" className="dev-mail" title="Correo de contacto">
                  <img src={icon.link} alt="" className="dev-mailIcon" />
                  BadDevPrograming@Gmail.com
                </a>
              </section>

              {/* Columna derecha: navegación y correo general */}
              <div className="footerRight">
                <nav className="footerNav">
                  <a href="#inicio">Inicio</a>
                  <a href="#caracteristicas">Características</a>
                  <a href="#servicios">Servicios</a>
                </nav>
                <a href="mailto:oticyutong@gmail.com" className="footerMail">oticyutong@gmail.com</a>
              </div>
          </div>
        </footer>
    </div>
  );
}
export default Landing;