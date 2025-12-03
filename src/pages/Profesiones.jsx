import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import '../index.css';
import Card from '../components/Card';
import Tablas from '../components/Tablas';
import icon from '../components/icon';
import Spinner from '../components/spinner';
import { BaseUrl } from '../utils/Constans';
import ConfirmModal from '../components/ConfirmModal';
import InfoModal from "../components/InfoModal";
import FormModal from "../components/FormModal";
import ForProfesiones from '../Formularios/ForProfesiones';
import { useToast } from '../components/userToasd';
import { usePermiso } from '../utils/usePermiso';

function Profesiones() {
    const [loading, setLoading] = useState(false);
    const tienePermiso = usePermiso();
    const [confirmModal, setConfirmModal] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [profesiones, setProfesiones] = useState([]);
    const [filters, setFilters] = useState({ q: "" });
    const [selectedProfesion, setSelectedProfesion] = useState(null);
    const [editProfesion, setEditProfesion] = useState(null);
    const [profesionToShow, setProfesionToShow] = useState(null);
    const showToast = useToast();

    ////////////////////////////Helpers ---> Ayudantes/////////////////////////////////////////////
    const getAuthHeaders = () => {
        const token = (localStorage.getItem('token') || '').trim();
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const openConfirmDelete = (id) => {
        setSelectedProfesion(id);
        setConfirmModal(true);
    }

    const closeConfirmDelete = () => {
        setSelectedProfesion(null);
        setConfirmModal(false);
    }

    const handleNuevo = () => {
        setEditProfesion(null);
        setModalOpen(true);
    }

    const handleEdit = (row) => {
        setEditProfesion(row);
        setModalOpen(true);
    }

    const handleSaved = () => {
        fetchProfesiones();
        setModalOpen(false);
        setEditProfesion(null);
    }

    const stats = useMemo(() => {
        const total = profesiones.length;
        return { total };
    }, [profesiones]);

    const filtered = useMemo(() => {
        const q = filters.q.trim().toLowerCase();
        return profesiones.filter(p => {
            const matchQ = !q || `${p.carrera || ''} ${p.nivel || ''}`.toLowerCase().includes(q);
            return matchQ;
        });
    }, [profesiones, filters]);

    const columns = [
        {
            header: "N°",
            key: "order",
            render: (_row, idx) => idx + 1
        },
        { accessor: "carrera", header: "Profesión", key: "carrera" },
        { accessor: "nivel", header: "Nivel", key: "nivel" },
        {
            header: "Acciones",
            render: (row) => (
                <div className='row-actions' style={{ display: 'flex', gap: 8 }}>
                    {tienePermiso('profesion', 'ver') && (
                        <button className='btn btn-xs btn-outline btn-view' title='Ver Detalles' onClick={() => handleView(row)}>Ver</button>
                    )}
                    {tienePermiso('profesion', 'editar') && (
                        <button className='btn btn-xs btn-outline btn-edit' title='Editar' onClick={() => handleEdit(row)}>Editar</button>
                    )}
                    {tienePermiso('profesion', 'eliminar') && (
                        <button className='btn btn-xs btn-outline btn-danger' title='Eliminar' onClick={() => openConfirmDelete(row.id)}>Eliminar</button>
                    )}
                </div>
            )
        },
    ];

    /////////////////////////////////////Peticiones/////////////////////////////////////////////////////////////// 

    const fetchProfesiones = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}profesion`, { headers: getAuthHeaders() });
            const data = response.data;
            if (!Array.isArray(data)) {
                console.warn('Respuesta inesperada /profesion:', data);
                setProfesiones([]);
                showToast?.('Respuesta inesperada del servidor', 'error', 4000);
                return;
            }
            setProfesiones(data);
        } catch (error) {
            console.error('Error obteniendo todas las profesiones:', error?.response?.data || error.message);
            showToast?.('Error obteniendo los datos', 'error', 3000);
            setProfesiones([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProfesiones();
    }, []);

    //////////////////////////////////////Manejadores///////////////////////////////////////////////////////////
    const handleView = async (row) => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}profesion/ver/${row.id}`, { headers: getAuthHeaders() });
            setProfesionToShow(response.data);
        } catch (error) {
            console.error('Error al mostrar datos:', error?.response?.data || error.message);
            showToast?.('Error al mostrar datos de esta profesión', 'error', 3000);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}profesion/eliminar/${id}`, { headers: getAuthHeaders() });
            showToast?.('Profesión eliminada con éxito', 'success', 3000);
            await fetchProfesiones();
        } catch (error) {
            console.error('Error eliminando la profesión:', error?.response?.data || error.message);
            showToast?.('Error al eliminar la profesión', 'error', 3000);
        } finally {
            setLoading(false);
        }
    }
    ///////////////////////////////////// fin Peticiones/////////////////////////////////////////////////////////////// 

    return (
        <div className='pac-page'>
            {loading && (
                <div className='spinner-overlay'>
                    <Spinner size={50} label='Cargando Profesiones....' />
                </div>
            )}

            <InfoModal
                isOpen={!!profesionToShow}
                onClose={() => setProfesionToShow(null)}
                title='Información de Profesión'
            >
                {profesionToShow && (
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        <li><b>Profesión: </b>{profesionToShow.carrera}</li>
                        <li><b>Nivel: </b>{profesionToShow.nivel}</li>
                    </ul>
                )}
            </InfoModal>

            <ConfirmModal
                isOpen={confirmModal}
                onClose={closeConfirmDelete}
                onConfirm={() => {
                    handleDelete(selectedProfesion);
                    closeConfirmDelete();
                }}
                title="¿Confirmación de Eliminación?"
                message="¿Estás seguro de eliminar este registro?"
                confirmText="Eliminar"
                cancelText="Cancelar"
            />

            <FormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editProfesion ? "Editar Profesión" : "Nueva Profesión"}
            >
                <ForProfesiones
                    profesionToEdit={editProfesion}
                    onSuccess={handleSaved}
                    onCancel={() => setModalOpen(false)}
                />
            </FormModal>

            <section className='card-container'>
                <Card color="#0033A0" title="Total de Profesiones">
                    <img src={icon.cv2} alt="Icono profesión" className='icon-card' />
                    <span className='number'>{stats.total}</span>
                    <h3>Total • Profesiones</h3>
                </Card>
            </section>

            <section className='quick-actions2'>
                <div className='pac-toolbar'>
                    <div className='filters'>
                        <div className='field'>
                            <img src={icon.lupa2} alt="Buscar" className='field-icon' />
                            <input
                                type="text"
                                placeholder='Buscar por profesión o nivel'
                                value={filters.q}
                                onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className='actions'>
                        {tienePermiso('profesion', 'crear') && (
                            <button className='btn btn-primary' onClick={handleNuevo}>
                                <img src={icon.user5} alt="Nuevo Registro" className='btn-icon' style={{ marginRight: 5 }} />
                                Nueva Profesión
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <div className='table-wrap'>
                <Tablas
                    columns={columns}
                    data={filtered}
                    rowsPerPage={8}
                />
            </div>
        </div>
    );
}

export default Profesiones;