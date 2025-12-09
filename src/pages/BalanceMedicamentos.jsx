import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { BaseUrl } from '../utils/Constans';
import { useToast } from '../components/userToasd';
import Spinner from '../components/spinner';
import Tablas from '../components/Tablas';
import Card from '../components/Card';
import icon from '../components/icon';
import { exportToPDF } from '../utils/exportUtils';
import FormModal from "../components/FormModal";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import '../index.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function BalanceMedicamentos() {
    const showToast = useToast();
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);

    const getAuthHeaders = () => {
        const token = (localStorage.getItem("token") || "").trim();
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchMovimientos = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BaseUrl}medicamentos/movimientos/historial`, { headers: getAuthHeaders() });
            setMovimientos(res.data);
        } catch (err) {
            console.error("Error obteniendo movimientos:", err);
            showToast?.("Error al obtener el historial de movimientos", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovimientos();
    }, []);

    // Estadísticas para las Cards
    const stats = useMemo(() => {
        let entradas = 0;
        let salidas = 0;
        movimientos.forEach(m => {
            if (m.tipo_movimiento === 'entrada') entradas += m.cantidad;
            if (m.tipo_movimiento === 'salida') salidas += m.cantidad;
        });
        return { entradas, salidas, neto: entradas - salidas };
    }, [movimientos]);

    // Configuración Grafica
    const chartData = useMemo(() => {
        const agrupado = {};
        // Ordenamos primero por fecha ascendente para la gráfica
        const movs = [...movimientos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        movs.forEach(m => {
            // Usamos fecha local para agrupar
            const fecha = new Date(m.fecha).toLocaleDateString();
            if (!agrupado[fecha]) agrupado[fecha] = { entradas: 0, salidas: 0 };
            if (m.tipo_movimiento === 'entrada') agrupado[fecha].entradas += m.cantidad;
            else agrupado[fecha].salidas += m.cantidad;
        });

        const labels = Object.keys(agrupado);
        // Limitar a los últimos 15 días si hay muchos para legibilidad
        const labelsSlice = labels.slice(-15);

        return {
            labels: labelsSlice,
            datasets: [
                {
                    label: 'Entradas',
                    data: labelsSlice.map(l => agrupado[l].entradas),
                    backgroundColor: '#0B6A3A',
                    barPercentage: 0.6,
                    categoryPercentage: 0.8,
                    borderRadius: 4,
                },
                {
                    label: 'Salidas',
                    data: labelsSlice.map(l => agrupado[l].salidas),
                    backgroundColor: '#CE1126',
                    barPercentage: 0.6,
                    categoryPercentage: 0.8,
                    borderRadius: 4,
                },
            ],
        };
    }, [movimientos]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: false, text: 'Movimientos de Stock' },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f0f0f0'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };

    const columns = [
        { header: "N°", render: (_r, idx) => idx + 1 },
        { header: "Fecha", render: (row) => new Date(row.fecha).toLocaleString() },
        { header: "Medicamento", accessor: "medicamento", key: "medicamento" },
        {
            header: "Tipo",
            render: (row) => (
                <span className={`badge ${row.tipo_movimiento === 'entrada' ? 'badge--success' : 'badge--drop'}`}>
                    {row.tipo_movimiento.toUpperCase()}
                </span>
            )
        },
        { header: "Cantidad", accessor: "cantidad", key: "cantidad" },
        {
            header: "Usuario",
            // key: "usuario",
            render: (row) => row.usuario ? row.usuario : <span style={{ color: '#999', fontStyle: 'italic' }}>Sistema/Automático</span>
        },
        { header: "Motivo", accessor: "motivo", key: "motivo" },
    ];

    const handleExportPDF = () => {
        // Preparar columnas y datos para el PDF
        // Como 'exportToPDF' usa 'render' si existe, necesitamos que 'render' devuelva TEXTO para el PDF,
        // o pasar columnas simplificadas.
        const pdfColumns = [
            { header: "Fecha", key: "fecha", render: (row) => new Date(row.fecha).toLocaleString() },
            { header: "Medicamento", key: "medicamento" },
            { header: "Tipo", key: "tipo_movimiento", render: (row) => row.tipo_movimiento ? row.tipo_movimiento.toUpperCase() : '' },
            { header: "Cantidad", key: "cantidad" },
            { header: "Usuario", key: "usuario", render: (row) => row.usuario ? row.usuario : 'Sistema/Automático' },
            { header: "Motivo", key: "motivo" }
        ];

        const docBlob = exportToPDF({
            data: movimientos,
            columns: pdfColumns,
            fileName: "balance_medicamentos.pdf",
            title: "Balance de Movimientos de Medicamentos",
            preview: true
        });
        if (docBlob) {
            const url = URL.createObjectURL(docBlob);
            setPdfUrl(url);
        }
    };

    return (
        <div className="pac-page">
            {loading && <div className="spinner-overlay"><Spinner size={50} label="Cargando Balance..." /></div>}

            <FormModal
                isOpen={!!pdfUrl}
                onClose={() => {
                    setPdfUrl(null);
                    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
                }}
                title="Vista previa PDF"
            >
                {pdfUrl && (
                    <iframe
                        src={pdfUrl}
                        title="Vista previa PDF"
                        style={{ width: "100%", height: "70vh", border: "none" }}
                    />
                )}
                <div style={{ marginTop: 16, textAlign: "right" }}>
                    <a href={pdfUrl} download="balance_medicamentos.pdf" className="btn btn-primary">Descargar PDF</a>
                </div>
            </FormModal>

            <section className="card-container" style={{ marginBottom: 20 }}>
                <Card color="#0033A0" title="Total Entradas">
                    <img src={icon.medicamentos || ""} alt="" className="icon-card" />
                    <span className="number">{stats.entradas}</span>
                    <h3>Total Entradas (Unidades)</h3>
                </Card>
                <Card color="#CE1126" title="Total Salidas">
                    <img src={icon.escudobien || ""} alt="" className="icon-card" />
                    <span className="number">{stats.salidas}</span>
                    <h3>Total Salidas (Unidades)</h3>
                </Card>
                <Card color={stats.neto >= 0 ? "#0B6A3A" : "#CE1126"} title="Balance Neto">
                    <img src={icon.agotar || ""} alt="" className="icon-card" />
                    <span className="number">{stats.neto}</span>
                    <h3>Balance (Entradas - Salidas)</h3>
                </Card>
            </section>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginBottom: 15, color: '#444' }}>Tendencia de Movimientos (Últimos 15 días)</h3>
                <div style={{ height: '350px' }}>
                    <Bar data={chartData} options={options} />
                </div>
            </div>

            <div className="pac-toolbar" style={{ marginBottom: 10, justifyContent: 'space-between', display: 'flex' }}>
                <h3 style={{ margin: 0, alignSelf: 'center' }}>Detalle de Movimientos</h3>
                <button className="btn btn-secondary" onClick={handleExportPDF}>
                    <img src={icon.pdf1 || ""} className="btn-icon" alt="" style={{ marginRight: 5 }} />
                    Exportar Reporte
                </button>
            </div>

            <div className="table-wrap">
                <Tablas
                    columns={columns}
                    data={movimientos}
                    rowsPerPage={8}
                />
            </div>
        </div>
    );
}

export default BalanceMedicamentos;
