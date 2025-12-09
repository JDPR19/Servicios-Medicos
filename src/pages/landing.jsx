import { useNavigate } from "react-router-dom";
import icon from "../components/icon";
import img from "../components/imagen";
import Header from "../components/header";
import '../index.css'

function Landing() {
  const navigate = useNavigate();

  const handleImgError = (e) => (e.currentTarget.style.display = "none");

  const irPagina = () => {
    navigate('/login');
  };
  return (
    <div className="landing">
      <Header />

      <section className="hero" id="inicio">
        <div className="container heroInner">
          <div className="heroContent">
            <h1 className="heroTitle" title='Apliación --> Sistema de Información para la Gestion Integral de Servicios Médicos --> Planta de Autobuses Yutong Venezuela'>
              Gestión Integral de Servicios Médicos - Planta Yutong
            </h1>
            <p className="heroSubtitle">
              Agenda consultas, lleva historiales clínicos, registra incapacidades y
              haz seguimiento a tratamientos en un solo lugar.
            </p>
            <div className="heroCtas">
              <button onClick={irPagina} className="btn-estandar" title='Ve a Iniciar Sesión'>Entrar al sistema</button>
              <a href="#caracteristicas" className="btn-outlinee" title='Sobre Nosotros'>Conocer más</a>
            </div>
            <ul className="heroHighlights">
              <li><img src={icon.consulta} alt="" className="iconSm" title='Consultas' /> Consultas y seguimiento</li>
              <li><img src={icon.maletindoctor} alt="" className="iconSm" title='Medicamentos' /> Enfermería y medicamentos</li>
              <li><img src={icon.impresora} alt="" className="iconSm" title='Reportes' /> Reportes y bitácora</li>
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
          <button onClick={irPagina} className="btn-estandar" title='Ve a Iniciar Sesión' >Comenzar ahora</button>
        </div>
      </section>

      <section className="stats">
        <div className="container statsInner">
          <div className="stat">
            <span className="statNum">Integridad</span>
            {/* <span className="statLabel"> • Y Auditoria de Movimientos</span> */}
          </div>
          <div className="stat">
            <span className="statNum">Atención y Disponibilidad</span>
            {/* <span className="statLabel"> • Atención Y Disponibilidad</span> */}
          </div>
          <div className="stat">
            <span className="statNum">100%</span>
            <span className="statLabel"> • Seguridad de acceso</span>
          </div>
        </div>
      </section>

      {/* <section className="testimonials container">
        <article className="testimonial">
          <p>“Centralizamos todo en un solo sistema y la atención mejoró notablemente.”</p>
          <span className="by">— Coordinación Médica</span>
        </article>
        <article className="testimonial">
          <p>“Reportes claros y trazabilidad completa. Auditorías más simples.”</p>
          <span className="by">— Gestión de Talento</span>
        </article>
      </section> */}

      <section className="cta">
        <div className="container ctaInner">
          <h2>¿Listo para mejorar la gestión médica?</h2>
          <p>Ingresa al sistema y comienza a registrar de forma profesional.</p>
          <button onClick={irPagina} className="btn-estandar" title='Ve a Iniciar Sesión'>Ir al Login</button>
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
              <a href="https://github.com/JDPR19" className="dev-icon" title="GitHub --> BadDev " rel="noopener noreferrer" target="_blank">
                <img src={icon.github} alt="icono" className="icon" />
              </a>
              {/* <a href="#" className="dev-icon" title="Telegram --> BadDev">
                    <img src={icon.telegram} alt="icono" className="icon"/>
                  </a>
                  <a href="#" className="dev-icon" title="Pagina --> BadDev">
                    <img src={icon.cv2} alt="icono" className="icon"/>
                  </a> */}
            </div>

            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=baddevprogramming@gmail.com" className="dev-mail" title="Contactame --> Soporte Técnico - Asesorias y Mentorias - Desarrollo de Aplicaciones Web y Mucho Mas --> BadDev --> Una Huella • Un Logo • Una Esencia • Con Total Compromiso y Pasión --> • Seguimos Avanzando en la Construcción de Nuevas Mecánicas que Solventen el por Venir de los Tiempos • Innovando Soluciones • BadDev" target='_blank' rel="noopener noreferrer">
              <img src={icon.link} alt="icon-Link" className="dev-mailIcon" />
              BadDevPrograming@Gmail.com
            </a>
          </section>

          {/* Columna derecha: navegación y correo general */}
          <div className="footerRight">
            <nav className="footerNav">
              <a href="#inicio" title='Ir al Inicio'>Inicio</a>
              <a href="#caracteristicas" title='Ir a Caracteristicas'>Características</a>
              <a href="#servicios" title='Ir a Servicios'>Servicios</a>
            </nav>
            <a hjref="https://mail.google.com/mail/?view=cm&fs=1&to=oticyutong@gmail.com" className="dev-mail" rel="noopener noreferrer" target="_blank" title='Contactanos Para Soporte Técnico y Mucho mas --> Oficina de Tecnologia de la Información y Comunicación --> OTIC --> Brindado el Apoyo Necesario y Sustentable Para Todas Tus Gestiones'>
              <img src={icon.link} alt="icon-Link" className="dev-mailIcon" />
              OTICYUTONG@GMAIL.COM
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default Landing;