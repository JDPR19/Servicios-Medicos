import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
// import sisic from '../../public/assets/logo-sisic5.png';
import cintillo from '../../src/images/cintillo.png'

function getRowValues(data, columns) {
    return data.map((row, idx) =>
        columns.map(col => {
            let value = col.render ? col.render(row, idx) : row[col.key];
            if (['created_at', 'updated_at', 'fecha_notificacion'].includes(col.key)) {
                value = formatFecha(value);
            }
            return value;
        })
    );
}

function formatFecha(fecha) {
    if (!fecha) return '—';
    const d = new Date(fecha);
    if (isNaN(d)) return fecha;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
}

export function exportToPDF({
    data,
    columns,
    fileName = 'reporte.pdf',
    title = '',
    preview = false
}) {
    const rows = getRowValues(data, columns);
    const useLandscape = (columns?.length || 0) > 6;
    const doc = new jsPDF({ format: 'legal', orientation: 'landscape' });

    // Más margen superior para despegar tabla del header
    const margin = { top: 36, left: 10, right: 10, bottom: 12 };
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - (margin.left + margin.right);

    // Configura alturas/posiciones del header y tabla
    const CINTILLO_Y = 6;
    const CINTILLO_HEIGHT = 15;     // más flaco
    const TITLE_Y = 30;
    const TABLE_START_Y = 40;       // más espacio antes de la tabla

    // Cabecera: cintillo + título
    const drawHeader = () => {
        try {
            const w = pageWidth - (margin.left + margin.right);
            doc.addImage(cintillo, 'PNG', margin.left, CINTILLO_Y, w, CINTILLO_HEIGHT);
        } catch (e) { e }
        doc.setTextColor(40, 40, 40);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        if (title) {
            doc.text(String(title).toUpperCase(), pageWidth / 2, TITLE_Y, { align: 'center' });
        }
    };

    // Pie de página: logo sicic más pequeño + texto centrado
    const drawFooter = () => {
        const now = new Date();
        const dateTime = now.toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' });
        const text = `Sicic-Insai — ${dateTime}`;
        const footFont = 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(footFont);

        const textWidth = doc.getTextWidth(text);
        const imgW = 7;
        // const imgH = 7;
        const gap = 2;
        const totalW = imgW + gap + textWidth;

        const x = (pageWidth - totalW) / 2;
        const y = pageHeight - 6;

        try {
            // doc.addImage(sisic, 'PNG', x, y - imgH + 2.5, imgW, imgH);
        } catch (e) { e }

        doc.text(text, x + imgW + gap, y);
    };

    // Dibuja cabecera inicial
    drawHeader();

    const tableColumn = columns.map(col => col.header);
    const tableRows = rows.map(row => row.map(v => v == null ? '' : String(v)));

    const baseFont = 10;
    const fontSize = Math.max(6, baseFont - Math.floor((columns.length - 4) / 2));

    const minColW = 10;
    const maxColW = useLandscape ? 60 : 40;
    const rawLens = columns.map((col, i) => {
        const headerLen = String(col.header || '').length;
        const maxCellLen = tableRows.reduce((m, r) => Math.max(m, (r[i] || '').length), 0);
        return Math.max(headerLen, maxCellLen);
    });
    const keyWeight = (k) => {
        if (k === 'email') return 1.6;
        if (k === 'descripcion' || k === 'ubicacion') return 1.3;
        if (k === 'codigo' || k === 'cedula' || k === 'rif') return 1.15;
        return 1;
    };
    const weightedLens = columns.map((col, i) => rawLens[i] * keyWeight(col.key));
    const totalLen = weightedLens.reduce((a, b) => a + (b || 1), 0) || 1;

    let widths = weightedLens.map(len => {
        const proportional = (len / totalLen) * usableWidth;
        return Math.min(maxColW, Math.max(minColW, proportional));
    });

    const sumW = widths.reduce((a, b) => a + b, 0);
    if (sumW > usableWidth) {
        const factor = usableWidth / sumW;
        widths = widths.map(w => Math.max(minColW, Math.min(maxColW, w * factor)));
    }

    const tableWidth = widths.reduce((a, b) => a + b, 0);
    const canCenter = tableWidth <= usableWidth;
    const centerLeft = canCenter ? Math.max(10, (pageWidth - tableWidth) / 2) : margin.left;
    const centerRight = canCenter ? centerLeft : margin.right;

    const columnStyles = {};
    columns.forEach((col, idx) => {
        columnStyles[idx] = {
            cellWidth: widths[idx],
            overflow: 'linebreak',
            halign: col.key === 'codigo' ? 'center' : 'left'
        };
    });

    const measure = (text, fs) => {
        const units = doc.getStringUnitWidth(text || '');
        return (units * fs) / doc.internal.scaleFactor;
    };

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: TABLE_START_Y,
        theme: 'grid',
        tableWidth: canCenter ? tableWidth : 'auto',
        margin: { ...margin, left: centerLeft, right: centerRight },
        styles: {
            font: 'helvetica',
            fontSize,
            cellPadding: 2,
            overflow: 'linebreak',
            cellWidth: 'wrap',
            halign: 'left',
            valign: 'middle',
            lineWidth: 0.1,
            lineColor: [200, 200, 200], // Bordes gris claro
            textColor: [40, 40, 40],    // Texto gris oscuro
            fillColor: [255, 255, 255], // Fondo blanco por defecto
        },
        headStyles: {
            fontStyle: 'bold',
            fontSize: Math.min(12, fontSize + 1),
            fillColor: [0, 101, 160],
            textColor: 255,
            halign: 'center',
            lineWidth: 0.15,
            lineColor: [200, 200, 200]
        },
        bodyStyles: {
            lineWidth: 0.1,
            lineColor: [200, 200, 200],
            fillColor: [255, 255, 255], // Fondo blanco
            textColor: [40, 40, 40]
        },
        alternateRowStyles: { fillColor: [230, 240, 250] },
        columnStyles,
        didParseCell: (data) => {
            const { cell, column, section } = data;
            if (section !== 'body' && section !== 'head') return;
            const idx = column.index;
            const content = Array.isArray(cell.text) ? cell.text.join(' ') : String(cell.text || '');
            let fs = fontSize;
            const maxW = Math.max(6, widths[idx] - 2 * 2);
            let w = measure(content, fs);
            while (w > maxW && fs > 6) {
                fs -= 0.5;
                w = measure(content, fs);
            }
            cell.styles.fontSize = fs;
        },
        didDrawPage: () => {
            drawHeader();
            drawFooter();
        }
    });

    if (preview) return doc.output('blob');
    doc.save(fileName);
}

export function exportToExcel({
    data,
    columns,
    fileName = 'reporte.xlsx',
    totalKey = null,
    totalLabel = 'TOTAL',
    count = false
}) {
    const rows = getRowValues(data, columns);
    const worksheetData = [
        columns.map(col => col.header.toUpperCase()),
        ...rows.map(row => row.map(v => v == null ? '' : String(v))) // CORREGIDO
    ];

    // Conteo de registros al final (opcional)
    if (count) {
        const totalRow = Array(columns.length).fill('');
        totalRow[0] = totalLabel || 'TOTAL REGISTROS';
        totalRow[1] = data.length;
        worksheetData.push(totalRow);
    }

    // Totalizar una columna específica (opcional)
    if (totalKey) {
        const totalIndex = columns.findIndex(col => col.key === totalKey);
        const totalValue = data.reduce((sum, row) => sum + (parseFloat(row[totalKey]) || 0), 0);
        const totalRow = Array(columns.length).fill('');
        totalRow[totalIndex > 0 ? totalIndex - 1 : 0] = totalLabel;
        totalRow[totalIndex] = totalValue;
        worksheetData.push(totalRow);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Autoancho por columna según contenido (limitado)
    worksheet['!cols'] = columns.map((col, cIdx) => {
        const headerLen = String(col.header || '').length;
        const maxCellLen = worksheetData.reduce((max, r) => Math.max(max, (r[cIdx] || '').length), 0);
        const wch = Math.min(60, Math.max(15, Math.max(headerLen, maxCellLen) + 2)); // <-- más ancho máximo
        return { wch };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), fileName);
};