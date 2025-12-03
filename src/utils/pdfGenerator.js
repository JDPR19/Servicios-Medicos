import jsPDF from 'jspdf';
import cintillo from '../images/cintillo.png';



export function generateReposoPDF(reposo) {
    const doc = new jsPDF({ format: 'letter', unit: 'mm' });

    // --- Configuración ---
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    // --- Header (Cintillo) ---
    try {
        const imgWidth = contentWidth;
        const imgHeight = 25;
        doc.addImage(cintillo, 'PNG', margin, y, imgWidth, imgHeight);
        y += imgHeight + 15;
    } catch (e) {
        console.error("Error cargando cintillo", e);
        y += 30;
    }

    // --- Título ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('CONSTANCIA DE REPOSO MÉDICO', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Código: ${reposo.codigo || 'S/N'}`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    // --- Línea separadora ---
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // --- Cuerpo del Documento ---
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(0);

    const fechaEmision = new Date().toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' });
    const fInicio = new Date(reposo.fecha_inicio).toLocaleDateString('es-VE');
    const fFin = new Date(reposo.fecha_fin).toLocaleDateString('es-VE');

    const lineHeight = 7;

    // Párrafo 1: Introducción
    const introText = `Quien suscribe, Dr(a). ${reposo.nombre_doctor} ${reposo.apellido_doctor}, en su carácter de Médico adscrito al Servicio de Salud y Seguridad Laboral, por medio de la presente HACE CONSTAR que ha practicado la debida evaluación médica al ciudadano(a):`;
    const splitIntro = doc.splitTextToSize(introText, contentWidth);
    doc.text(splitIntro, margin, y);
    y += (splitIntro.length * lineHeight) + 5;

    // Datos del Paciente
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text(`${reposo.nombre_paciente} ${reposo.apellido_paciente}`.toUpperCase(), pageWidth / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(12);
    doc.text(`C.I: ${reposo.cedula_paciente}`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Diagnóstico
    doc.setFont('times', 'normal');
    const diagIntro = `Quien acude a consulta presentando sintomatología clínica compatible con el siguiente diagnóstico:`;
    doc.text(diagIntro, margin, y);
    y += 10;

    doc.setFont('times', 'bold');
    const splitDiag = doc.splitTextToSize((reposo.diagnostico || 'No especificado').toUpperCase(), contentWidth - 20);
    doc.text(splitDiag, margin + 10, y);
    y += (splitDiag.length * lineHeight) + 5;

    // Observaciones
    if (reposo.observacion) {
        doc.setFont('times', 'normal');
        doc.text('Observaciones Clínicas:', margin, y);
        y += 7;
        doc.setFont('times', 'italic');
        const splitObs = doc.splitTextToSize(reposo.observacion, contentWidth - 10);
        doc.text(splitObs, margin + 5, y);
        y += (splitObs.length * lineHeight) + 5;
    }

    // Indicación del Reposo
    doc.setFont('times', 'normal');
    const reposoText = `En virtud de lo anterior, y para garantizar el restablecimiento de su salud, se indica cumplir REPOSO MÉDICO por un lapso de ${reposo.dias_reposo} días continuos, los cuales deberán ser cumplidos desde el ${fInicio} hasta el ${fFin} (ambas fechas inclusive).`;
    const splitReposo = doc.splitTextToSize(reposoText, contentWidth);
    doc.text(splitReposo, margin, y);
    y += (splitReposo.length * lineHeight) + 15;

    // Cierre Legal
    const cierreText = `Constancia que se expide a solicitud de la parte interesada para los fines legales y administrativos a que haya lugar, en la ciudad de San Felipe, a los ${fechaEmision}.`;
    const splitCierre = doc.splitTextToSize(cierreText, contentWidth);
    doc.text(splitCierre, margin, y);

    // --- Firmas ---
    y = pageHeight - 35;

    doc.setDrawColor(0);
    doc.line(pageWidth / 2 - 40, y, pageWidth / 2 + 40, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Dr(a). ${reposo.nombre_doctor} ${reposo.apellido_doctor}`, pageWidth / 2, y + 5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Servicio Médico', pageWidth / 2, y + 10, { align: 'center' });

    // --- Footer ---
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Generado por Sistema Integral de Servicios Médicos Yutong - Version 1.0.0', margin, pageHeight - 10);
    doc.text(`Página 1 de 1`, pageWidth - margin, pageHeight - 10, { align: 'right' });

    return doc.output('blob');
}


export function generateHistoriaClinicaPDF(historia) {
    const doc = new jsPDF({ format: 'letter', unit: 'mm' });

    // --- Configuración ---
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    // --- Header (Cintillo) ---
    try {
        const imgWidth = contentWidth;
        const imgHeight = 20;
        doc.addImage(cintillo, 'PNG', margin, y, imgWidth, imgHeight);
        y += imgHeight + 15;
    } catch (e) {
        y += 25;
    }

    // --- Título Principal ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('HISTORIA CLÍNICA', pageWidth / 2, y, { align: 'center' });
    y += 8;

    // Código de Historia
    doc.setFontSize(11);
    doc.setTextColor(80);
    const codigoHistoria = historia.codigo || 'S/N';
    doc.text(`N° DE HISTORIA: ${codigoHistoria}`, pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Línea decorativa
    doc.setDrawColor(80);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // === SECCIÓN I: DATOS DEL PACIENTE ===
    doc.setFillColor(80);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('I. DATOS DEL PACIENTE', margin + 2, y + 5);
    y += 15;

    doc.setTextColor(0);
    doc.setFont('times', 'normal');
    doc.setFontSize(9);

    // Fila 1: Nombre completo y Cédula
    doc.setFont('times', 'bold');
    doc.text('Nombre Completo:', margin + 2, y);
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.text(`${historia.nombre_paciente || ''} ${historia.apellido_paciente || ''}`.toUpperCase(), margin + 30, y);

    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.text('C.I:', margin + 80, y);
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.text(historia.cedula_paciente || 'N/A', margin + 88, y);
    y += 6;

    // Fila 2: Edad, Sexo, Fecha de Nacimiento
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.text('Edad:', margin + 2, y);
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.text(`${historia.edad_paciente || 'N/A'} años`, margin + 12, y);

    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.text('Sexo:', margin + 40, y);
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.text(historia.sexo_paciente || 'N/A', margin + 50, y);

    if (historia.fecha) {
        doc.setFont('times', 'bold');
        doc.setFontSize(9);
        doc.text('F. Nacimiento:', margin + 80, y);
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        try {
            let fechaFormateada = 'N/A';
            const fechaStr = historia.fecha.toString().trim();

            // se parsea formato DD/MM/YY HH:MM
            const match = fechaStr.match(/^(\d{2})\/(\d{2})\/(\d{2})/);
            if (match) {
                const dia = match[1];
                const mes = match[2];
                let anio = match[3];

                // Convertir año de 2 dígitos a 4 dígitos
                // Si es >= 50, asumimos 1900s, si no, 2000s
                anio = parseInt(anio) >= 50 ? `19${anio}` : `20${anio}`;

                fechaFormateada = `${dia}/${mes}/${anio}`;
            }

            doc.text(fechaFormateada, margin + 105, y);
        } catch (e) {
            console.error('Error parsing fecha:', e);
            doc.text('N/A', margin + 105, y);
        }
    }
    y += 6;

    // Fila 3: Contacto y Correo
    if (historia.contacto_paciente) {
        doc.setFont('times', 'bold');
        doc.setFontSize(9);
        doc.text('Teléfono:', margin + 2, y);
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text(historia.contacto_paciente, margin + 16, y);
    }

    if (historia.correo_paciente) {
        doc.setFont('times', 'bold');
        doc.setFontSize(9);
        doc.text('Correo:', margin + 80, y);
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text(historia.correo_paciente, margin + 92, y);
    }
    y += 6;

    // Fila 4: Dirección completa
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.text('Dirección:', margin + 2, y);
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    const direccion = `${historia.estado_nombre_paciente || ''}, ${historia.municipio_nombre_paciente || ''}, ${historia.parroquia_nombre_paciente || ''}, ${historia.sector_nombre_paciente || ''}`.replace(/^,\s*|,\s*$/g, '');
    const splitDir = doc.splitTextToSize(direccion || 'No especificada', contentWidth - 25);
    doc.text(splitDir, margin + 18, y);
    y += (splitDir.length * 4) + 4;

    // Fila 5: Datos laborales
    if (historia.departamento_nombre_paciente) {
        doc.setFont('times', 'bold');
        doc.setFontSize(9);
        doc.text('Departamento:', margin + 2, y);
        doc.setFont('times', 'normal');
        doc.text(historia.departamento_nombre_paciente || 'N/A', margin + 25, y);

        y += 5;
    }

    if (historia.profesion_nombre_paciente || historia.cargo_nombre_paciente) {
        doc.setFont('times', 'bold');
        doc.text('Profesión:', margin + 2, y);
        doc.setFont('times', 'normal');
        doc.text(historia.profesion_nombre_paciente, margin + 20, y);


        doc.setFont('times', 'bold');
        doc.text('Cargo:', margin + 70, y);
        doc.setFont('times', 'normal');
        doc.text(historia.cargo_nombre_paciente || 'N/A', margin + 80, y);

        y += 5;
    }

    y += 3;

    // === SECCIÓN II: DATOS DE LA CONSULTA ===
    if (y > pageHeight - 80) { doc.addPage(); y = margin + 10; }

    doc.setFillColor(80);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('II. DATOS DE LA CONSULTA', margin + 2, y + 5);
    y += 15;

    doc.setTextColor(0);
    doc.setFont('times', 'bold');
    doc.setFontSize(9);

    // Fecha de consulta
    doc.text('Fecha Consulta:', margin + 2, y);
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    const fechaConsulta = historia.fecha_consulta ? new Date(historia.fecha_consulta).toLocaleDateString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }) : 'N/A';
    doc.text(fechaConsulta, margin + 28, y);

    // Fecha de alta
    if (historia.fecha_alta) {
        doc.setFont('times', 'bold');
        doc.setFontSize(9);
        doc.text('Fecha Alta:', margin + 80, y);
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        const fechaAlta = new Date(historia.fecha_alta).toLocaleDateString('es-VE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        doc.text(fechaAlta, margin + 100, y);
    }
    y += 6;

    // Médico tratante
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.text('Médico Tratante:', margin + 2, y);
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.text(`Dr(a). ${historia.nombre_doctor || ''} ${historia.apellido_doctor || ''}`, margin + 30, y);
    y += 6;

    // Cargo y profesión del doctor
    if (historia.cargo_nombre_doctor || historia.profesion_nombre_doctor) {
        doc.setFont('times', 'italic');
        doc.setFontSize(8);
        doc.text(`${historia.cargo_nombre_doctor || ''} - ${historia.profesion_nombre_doctor || ''}`, margin + 30, y);
        y += 5;
    }

    y += 3;

    // === SECCIÓN III: ANAMNESIS ===
    if (y > pageHeight - 70) { doc.addPage(); y = margin + 10; }

    doc.setFillColor(80);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('III. ANAMNESIS', margin + 2, y + 5);
    y += 15;

    doc.setTextColor(0);

    // Motivo de consulta
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.text('Motivo de Consulta:', margin + 2, y);
    y += 5;
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    const splitMotivo = doc.splitTextToSize(historia.motivo_consulta || 'No especificado', contentWidth - 4);
    doc.text(splitMotivo, margin + 2, y);
    y += (splitMotivo.length * 5) + 5;

    // Historia / Enfermedad actual
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.text('Enfermedad Actual / Historia:', margin + 2, y);
    y += 5;
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    const splitHistoria = doc.splitTextToSize(historia.historia || 'No especificado', contentWidth - 4);
    doc.text(splitHistoria, margin + 2, y);
    y += (splitHistoria.length * 5) + 6;

    // === SECCIÓN IV: EXAMEN FÍSICO ===
    if (y > pageHeight - 60) { doc.addPage(); y = margin + 10; }

    doc.setFillColor(80);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('IV. EXAMEN FÍSICO', margin + 2, y + 5);
    y += 15;

    doc.setTextColor(0);
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    const splitExamen = doc.splitTextToSize(historia.examen_fisico || 'Sin hallazgos registrados', contentWidth - 4);
    doc.text(splitExamen, margin + 2, y);
    y += (splitExamen.length * 5) + 6;

    // === SECCIÓN V: DIAGNÓSTICO ===
    if (y > pageHeight - 60) { doc.addPage(); y = margin + 10; }

    doc.setFillColor(80);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('V. DIAGNÓSTICO', margin + 2, y + 5);
    y += 15;

    doc.setTextColor(0);
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    const splitDiag = doc.splitTextToSize((historia.diagnostico || 'No especificado').toUpperCase(), contentWidth - 4);
    doc.text(splitDiag, margin + 2, y);
    y += (splitDiag.length * 6) + 5;

    // Enfermedades relacionadas
    if (historia.detalle && historia.detalle.length > 0) {
        doc.setFont('times', 'bold');
        doc.setFontSize(9);
        doc.text('Patologías Relacionadas:', margin + 2, y);
        y += 5;
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        historia.detalle.forEach(d => {
            if (y > pageHeight - 25) { doc.addPage(); y = margin + 10; }
            doc.text(`• ${d.enfermedad_nombre}`, margin + 5, y);
            doc.setFont('times', 'italic');
            doc.setFontSize(8);
            doc.text(`(${d.categoria_nombre || 'General'})`, margin + 7 + doc.getTextWidth(`• ${d.enfermedad_nombre} `), y);
            doc.setFont('times', 'normal');
            doc.setFontSize(9);
            y += 4;
        });
        y += 4;
    }

    // === SECCIÓN VI: OBSERVACIONES / PLAN ===
    if (historia.observacion) {
        if (y > pageHeight - 50) { doc.addPage(); y = margin + 10; }

        doc.setFillColor(80);
        doc.rect(margin, y, contentWidth, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text('VI. OBSERVACIONES / PLAN DE TRATAMIENTO', margin + 2, y + 5);
        y += 15;

        doc.setTextColor(0);
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        const splitObs = doc.splitTextToSize(historia.observacion, contentWidth - 4);
        doc.text(splitObs, margin + 2, y);
        y += (splitObs.length * 5) + 8;
    }

    // === Firma del Médico ===
    if (y > pageHeight - 45) { doc.addPage(); y = margin + 10; }

    y = Math.max(y, pageHeight - 45);

    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.line(pageWidth / 2 - 35, y, pageWidth / 2 + 35, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Dr(a). ${historia.nombre_doctor || ''} ${historia.apellido_doctor || ''}`, pageWidth / 2, y + 5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Médico Tratante', pageWidth / 2, y + 9, { align: 'center' });
    if (historia.cargo_nombre_doctor) {
        doc.setFontSize(7);
        doc.text(historia.cargo_nombre_doctor, pageWidth / 2, y + 12, { align: 'center' });
    }

    // === Footer en todas las páginas ===
    const totalPages = doc.internal.getNumberOfPages();
    const fechaGeneracion = new Date().toLocaleDateString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(120);
        doc.text(`Sistema Integral de Servicios Médicos Yutong • Generado: ${fechaGeneracion}`, margin, pageHeight - 7);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
    }

    return doc.output('blob');
}


// ==================== FICHA INDIVIDUAL DE CONSULTA ====================
export function generateConsultaPDF(consulta) {
    const doc = new jsPDF({ format: 'letter', unit: 'mm' });

    // --- Configuración ---
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    // --- Header (Cintillo) ---
    try {
        const imgWidth = contentWidth;
        const imgHeight = 20;
        doc.addImage(cintillo, 'PNG', margin, y, imgWidth, imgHeight);
        y += imgHeight + 15;
    } catch (e) {
        y += 25;
    }

    // --- Título Principal ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 160); // Azul corporativo
    doc.text('FICHA DE CONSULTA MÉDICA', pageWidth / 2, y, { align: 'center' });
    y += 6;

    // Código de Consulta
    doc.setFontSize(10);
    doc.setTextColor(100);
    const codigoConsulta = consulta.codigo || 'S/N';
    doc.text(`Código: ${codigoConsulta}`, pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Línea decorativa
    doc.setDrawColor(0, 51, 160);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // === SECCIÓN: INFORMACIÓN GENERAL (2 columnas) ===
    const col1X = margin + 2;
    const col2X = pageWidth / 2 + 5;
    const labelWidth = 35;

    // Columna 1: Datos del Paciente
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, contentWidth / 2 - 2, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 51, 160);
    doc.text('DATOS DEL PACIENTE', col1X, y + 4);
    y += 10;

    // Nombre
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(80);
    doc.text('Paciente:', col1X, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0);
    const nombreCompleto = `${consulta.paciente_nombre || ''} ${consulta.paciente_apellido || ''}`.toUpperCase();
    doc.text(nombreCompleto, col1X + labelWidth, y);
    y += 5;

    // Cédula
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(80);
    doc.text('Cédula:', col1X, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.text(consulta.paciente_cedula || 'N/A', col1X + labelWidth, y);

    // Resetear Y para columna 2
    y -= 15; // Volver al inicio de la sección

    // Columna 2: Datos de la Consulta
    doc.setFillColor(240, 240, 240);
    doc.rect(pageWidth / 2 + 3, y, contentWidth / 2 - 2, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 51, 160);
    doc.text('DATOS DE LA CONSULTA', col2X, y + 4);
    y += 10;

    // Fecha
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(80);
    doc.text('Fecha:', col2X, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(0);
    const fechaAtencion = consulta.fecha_atencion_formatted ||
        (consulta.fecha_atencion ? new Date(consulta.fecha_atencion).toLocaleString('es-VE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'N/A');
    doc.text(fechaAtencion, col2X + labelWidth, y);
    y += 5;

    // Estatus
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(80);
    doc.text('Estatus:', col2X, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    // Color según estatus
    const estatus = (consulta.estatus || '').toLowerCase();
    if (estatus === 'realizada') doc.setTextColor(0, 128, 0);
    else if (estatus === 'pendiente') doc.setTextColor(255, 140, 0);
    else if (estatus === 'cancelada') doc.setTextColor(200, 0, 0);
    else doc.setTextColor(0);

    doc.text((consulta.estatus || 'N/A').toUpperCase(), col2X + labelWidth, y);
    doc.setTextColor(0);

    y += 12;

    // === SECCIÓN: DIAGNÓSTICO ===
    doc.setFillColor(0, 51, 160);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('DIAGNÓSTICO', margin + 2, y + 5);
    y += 12;

    // Enfermedad diagnosticada (destacada)
    if (consulta.enfermedad_nombre) {
        doc.setFillColor(255, 250, 205); // Amarillo suave
        doc.rect(margin, y - 2, contentWidth, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(139, 0, 0); // Rojo oscuro
        doc.text(consulta.enfermedad_nombre.toUpperCase(), margin + 2, y + 3);
        y += 10;
    }

    // Diagnóstico detallado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(80);
    doc.text('Descripción del Diagnóstico:', margin + 2, y);
    y += 5;

    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0);
    const splitDiag = doc.splitTextToSize(consulta.diagnostico || 'No especificado', contentWidth - 4);
    doc.text(splitDiag, margin + 2, y);
    y += (splitDiag.length * 5) + 8;

    // === SECCIÓN: TRATAMIENTO ===
    if (y > pageHeight - 80) { doc.addPage(); y = margin + 10; }

    doc.setFillColor(0, 51, 160);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('PLAN DE TRATAMIENTO', margin + 2, y + 5);
    y += 12;

    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0);
    const splitTratamiento = doc.splitTextToSize(consulta.tratamientos || 'No especificado', contentWidth - 4);
    doc.text(splitTratamiento, margin + 2, y);
    y += (splitTratamiento.length * 5) + 8;

    // === SECCIÓN: MEDICAMENTOS PRESCRITOS (Tabla) ===
    if (consulta.medicamentos && consulta.medicamentos.length > 0) {
        if (y > pageHeight - 70) { doc.addPage(); y = margin + 10; }

        doc.setFillColor(0, 51, 160);
        doc.rect(margin, y, contentWidth, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text('MEDICAMENTOS PRESCRITOS', margin + 2, y + 5);
        y += 12;

        // Encabezado de tabla
        doc.setFillColor(220, 220, 220);
        doc.rect(margin, y, contentWidth, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(0);
        doc.text('#', margin + 2, y + 4);
        doc.text('Medicamento', margin + 8, y + 4);
        doc.text('Presentación', margin + 80, y + 4);
        doc.text('Dosis', margin + 130, y + 4);
        doc.text('Cant.', margin + 165, y + 4);
        y += 8;

        // Filas de medicamentos
        consulta.medicamentos.forEach((med, idx) => {
            if (y > pageHeight - 20) { doc.addPage(); y = margin + 10; }

            // Fondo alternado
            if (idx % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(margin, y - 2, contentWidth, 6, 'F');
            }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(80);
            doc.text(`${idx + 1}`, margin + 2, y + 2);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(0);
            doc.text(med.medicamento_nombre || 'N/A', margin + 8, y + 2);
            doc.text(med.medicamento_presentacion || '-', margin + 80, y + 2);
            doc.text(med.medicamentos_miligramos || '-', margin + 130, y + 2);
            doc.text(String(med.cantidad_utilizada || '-'), margin + 165, y + 2);

            y += 6;
        });
        y += 6;
    }

    // === SECCIÓN: OBSERVACIONES ===
    if (consulta.observaciones) {
        if (y > pageHeight - 50) { doc.addPage(); y = margin + 10; }

        doc.setFillColor(0, 51, 160);
        doc.rect(margin, y, contentWidth, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text('OBSERVACIONES MÉDICAS', margin + 2, y + 5);
        y += 12;

        doc.setFont('times', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(60);
        const splitObs = doc.splitTextToSize(consulta.observaciones, contentWidth - 4);
        doc.text(splitObs, margin + 2, y);
        y += (splitObs.length * 5) + 8;
    }

    // === NOTA IMPORTANTE ===
    if (y > pageHeight - 30) { doc.addPage(); y = margin + 10; }

    doc.setDrawColor(200, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, contentWidth, 15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(200, 0, 0);
    doc.text('IMPORTANTE:', margin + 2, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(0);
    const nota = 'Este documento es una constancia de consulta médica. Siga estrictamente las indicaciones del tratamiento prescrito. En caso de reacciones adversas o dudas, consulte inmediatamente con su médico tratante.';
    const splitNota = doc.splitTextToSize(nota, contentWidth - 4);
    doc.text(splitNota, margin + 2, y + 8);

    // === Footer en todas las páginas ===
    const totalPages = doc.internal.getNumberOfPages();
    const fechaGeneracion = new Date().toLocaleDateString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        // Línea superior del footer
        doc.setDrawColor(200);
        doc.setLineWidth(0.3);
        doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(120);
        doc.text(`Sistema Integral de Servicios Médicos Yutong • Generado: ${fechaGeneracion}`, margin, pageHeight - 8);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });

        // Código de consulta en footer
        doc.setFontSize(6);
        doc.text(`Consulta: ${codigoConsulta}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
    }

    return doc.output('blob');
}

export function generateDoctorPDF(doctor) {
    const doc = new jsPDF({ format: 'letter', unit: 'mm' });

    // --- Configuración ---
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    // --- Header (Cintillo) ---
    try {
        const imgWidth = contentWidth;
        const imgHeight = 25;
        doc.addImage(cintillo, 'PNG', margin, y, imgWidth, imgHeight);
        y += imgHeight + 12;
    } catch (e) {
        console.error("Error cargando cintillo", e);
        y += 30;
    }

    // --- Línea decorativa superior ---
    doc.setDrawColor(0, 51, 160);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 2;
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;

    // --- Título Principal ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(0, 51, 160);
    doc.text('FICHA PROFESIONAL', pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text('Personal Médico y Técnico', pageWidth / 2, y, { align: 'center' });
    y += 18;

    // --- SECCIÓN: DATOS PERSONALES ---
    // Título de sección con fondo
    doc.setFillColor(0, 51, 160);
    doc.rect(margin, y, contentWidth, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('DATOS PERSONALES', margin + 3, y + 5.5);
    y += 12;

    // Contenedor de datos personales con borde
    const datosBoxHeight = 40;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, y, contentWidth, datosBoxHeight, 2, 2, 'FD');

    // Grid de datos personales
    const leftCol = margin + 8;
    const rightCol = pageWidth / 2 + 8;
    const labelWidth = 28;
    let dataY = y + 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    // Columna izquierda
    doc.text('Cédula:', leftCol, dataY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(doctor.cedula || 'N/A', leftCol + labelWidth, dataY);

    dataY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Nombre Completo:', leftCol, dataY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const nombreCompleto = `${doctor.nombre || ''} ${doctor.apellido || ''}`.trim();
    doc.text(nombreCompleto || 'N/A', leftCol + labelWidth, dataY);

    dataY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Teléfono:', leftCol, dataY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(doctor.contacto || 'N/A', leftCol + labelWidth, dataY);

    // Columna derecha
    dataY = y + 10;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Cargo:', rightCol, dataY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(doctor.cargo_nombre || 'N/A', rightCol + labelWidth, dataY);

    dataY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Profesión:', rightCol, dataY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(doctor.profesion_carrera || 'N/A', rightCol + labelWidth, dataY);

    dataY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Nivel Académico:', rightCol, dataY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(doctor.profesion_nivel || 'N/A', rightCol + labelWidth, dataY);

    y += datosBoxHeight + 15;

    // --- SECCIÓN: ESTADO LABORAL ---
    doc.setFillColor(0, 51, 160);
    doc.rect(margin, y, contentWidth, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('ESTADO LABORAL', margin + 3, y + 5.5);
    y += 12;

    const estadoBoxHeight = 18;
    const estadoActivo = doctor.estado === true || doctor.estado === 'true';

    // Contenedor del estado
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, y, contentWidth, estadoBoxHeight, 2, 2, 'FD');

    // Badge de estado centrado
    const badgeWidth = 80;
    const badgeHeight = 10;
    const badgeX = (pageWidth - badgeWidth) / 2;
    const badgeY = y + 4;

    if (estadoActivo) {
        doc.setFillColor(34, 197, 94);
        doc.setDrawColor(34, 197, 94);
    } else {
        doc.setFillColor(239, 68, 68);
        doc.setDrawColor(239, 68, 68);
    }

    doc.setLineWidth(0.8);
    doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(estadoActivo ? 'ACTIVO' : 'INACTIVO', pageWidth / 2, badgeY + 7, { align: 'center' });

    y += estadoBoxHeight + 15;

    // --- SECCIÓN: INFORMACIÓN DEL REGISTRO ---
    if (doctor.created_at || doctor.updated_at) {
        doc.setFillColor(0, 51, 160);
        doc.rect(margin, y, contentWidth, 8, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text('INFORMACIÓN DEL REGISTRO', margin + 3, y + 5.5);
        y += 12;

        const registroBoxHeight = 22;
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(margin, y, contentWidth, registroBoxHeight, 2, 2, 'FD');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);

        let registroY = y + 8;

        if (doctor.created_at) {
            const fechaCreacion = new Date(doctor.created_at).toLocaleDateString('es-VE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(60, 60, 60);
            doc.text('Fecha de Registro:', leftCol, registroY);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(fechaCreacion, leftCol + 38, registroY);
        }

        if (doctor.updated_at) {
            const fechaActualizacion = new Date(doctor.updated_at).toLocaleDateString('es-VE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            registroY += 7;
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(60, 60, 60);
            doc.text('Última Actualización:', leftCol, registroY);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(fechaActualizacion, leftCol + 38, registroY);
        }


        y += registroBoxHeight + 10;
    }

    // --- Footer Profesional ---
    const footerY = pageHeight - 25;

    // Línea decorativa del footer
    doc.setDrawColor(0, 51, 160);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    doc.setLineWidth(1);
    doc.line(margin, footerY + 2, pageWidth - margin, footerY + 2);

    const fechaGeneracion = new Date().toLocaleDateString('es-VE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text('Sistema Integral de Servicios Médicos Yutong', margin, footerY + 8);
    doc.text(`Generado: ${fechaGeneracion}`, pageWidth - margin, footerY + 8, { align: 'right' });

    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text('Documento Confidencial - Uso Interno', pageWidth / 2, footerY + 12, { align: 'center' });

    // Código de referencia
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(0, 51, 160);
    doc.text(`Ref: DOC-${doctor.cedula || 'N/A'}`, pageWidth / 2, footerY + 17, { align: 'center' });

    return doc.output('blob');
}

