import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import icon from '../components/icon';
import Card from '../components/Card';
import Spinner from '../components/spinner';
import Table from '../components/Tablas';
import { useToast } from '../components/userToasd';
import { BaseUrl } from '../utils/Constans';
import InfoModal from '../components/InfoModal';
import ConfirmModal from '../components/ConfirmModal';
import FormModal from '../components/FormModal';
import ForEnfermedades from '../Formularios/ForEnfermedades';
// import '../index.css';

function Enfermedades() {
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [enfermedades, setEnfermedades] = useState([]);
    const [filters, setFilters] = useState({ estado: "todas", q: "" });
    const [selectedEnfermedad, setSelectedEnfermedad] = useState(null);
    const [editEnfermedades, setEditEnfermedades] = useState(null);
    const [showEnfermedad, setShowEnfermedad] = useState(null);
    const showToast = useToast();

    /////////////////////////////////////////////////////////////////////////////////////////////// 
    const getAuthorization = () => {
        const token = (localStorage.getItem('token') || '').trim();
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const openConfirmDelete = (id) => {
        setSelectedEnfermedad(id);
        setConfirmModal(true);
    };

    const closeConfirmModal = () => {
        setSelectedEnfermedad(null);
        setConfirmModal(false);
    };

    const handleNuevo = () => {
        setEditEnfermedades(null);
        setModalOpen(true);
    };

    const handleEdit = (row) => {
        setEditEnfermedades(row);
        setModalOpen(true);
    };

    const handleSaved = () => {
        fetchEnfermedades();
        setModalOpen(false);
        setEditEnfermedades(null);
    };


    /////////////////////////////////////////////////////////////////////////////////////////////// 

    const fetchEnfermedades = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}enfermedades`, { headers: getAuthorization() });
            const data = response.data;
            if (!Array.isArray(data)) {
                console.warn('Respuesta inesperada /enfermedades:', data);
                setEnfermedades([]);
                showToast?.('Respuesta inesperada del servidor', 'error', 4000);
                return;
            }
            setEnfermedades(data);
        } catch (error) {
            const msg = error?.response?.data?.message || 'Error interno en el servidor no se pudieron obtener los datos';
            showToast?.(msg, 'error');
        } finally {
            setLoading(false);
        }
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    const handleView = async (row) => {
        setLoading(true);
        try {
            const response = await axios.get(`${BaseUrl}enfermedades/ver/${row.id}`, { headers: getAuthorization() });
            setShowEnfermedad(response.data);
        } catch (error) {
            const msg = error?.response?.data?.message || 'Respuesta inespedara del servidor error al obtener los datos de este registro';
            showToast?.(msg, 'error', 4000);
        } finally {
            setLoading(false);
        }
    };
    ///////////////////////////////////////////////////////////////////////////////////////////////
    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${BaseUrl}enfermedades/eliminar/${id}`, { headers: getAuthorization() });
            showToast?.('Registro Eliminado con éxito', 'success', 3000);
            await fetchEnfermedades();
        } catch (error) {
            const msg = error?.response?.data?.message || 'Respuesta inesperada del servidor al intentar eliminar este registro';
            showToast?.(msg, 'error');
        } finally {
            setLoading(false);
        }
    };
    ///////////////////////////////////////////////////////////////////////////////////////////////
    useEffect(() => {
        fetchEnfermedades();
    }, []);
    ///////////////////////////////////////////////////////////////////////////////////////////////
    const stats = useMemo(() => {
        const total = enfermedades.length;
        return { total };
    }, [enfermedades]);

    const filtered = useMemo(() => {
        const q = filters.q.trim().toLowerCase();
        const est = filters.estado;
        return enfermedades.filter(e => {
            const matchQ = !q || `${e.nombre} ${e.descripcion} ${e.categoria_e_nombre}`.toLowerCase().includes(q);
            const isActive = e.estado === true || e.estado === 'activo';
            const matchEstado = est === 'todas' ? true : (est === 'activo' ? isActive : !isActive);
            return matchQ && matchEstado;
        });
    }, [enfermedades, filters]);

    const columns = [
        {
            header: "N°",
            key: "order",
            render: (_row, idx) => idx + 1
        },
        { accessor: "nombre", header: "Nombre", key: "nombre" },
        { accessor: "descripcion", header: "Descripción", key: "descripcion" },
        { accessor: "categoria_e_nombre", header: "Categoría", key: "categoria_e_nombre" },
        {
            header: "Acciones",
            render: (row) => (
                <div className='row-actions' style={{ display: 'flex', gap: 8 }}>
                    <button className='btn btn-xs btn-outline btn-view' title='Ver Detalles' onClick={() => handleView(row)}>Ver</button>
                    <button className='btn btn-xs btn-outline btn-edit' title='Editar' onClick={() => handleEdit(row)}>Editar</button>
                    <button className='btn btn-xs btn-outline btn-danger' title='Eliminar' onClick={() => openConfirmDelete(row.id)}>Eliminar</button>
                </div>
            )
        },
    ];
    /////////////////////////////////////////////////////////////////////////////////////////////// 
    return (
        <div className='pac-page'>

            {loading && (
                <div className='spinner-overlay'>
                    <Spinner size={50} label='Cargando Enfermedades....' />
                </div>
            )}

            <InfoModal
                isOpen={!!showEnfermedad}
                onClose={() => setShowEnfermedad(null)}
                title='Información de enfermedad o Patología'
            >
                {showEnfermedad && (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li><b>Nombre: </b> {showEnfermedad.nombre}</li>
                        <li><b>Descripción: </b> {showEnfermedad.descripcion || 'N/A'}</li>
                        <li><b>Categoría: </b> {showEnfermedad.categoria_e_nombre || 'N/A'}</li>
                        <li><b>Estado: </b> {showEnfermedad.estado ? 'Activo' : 'Inactivo'}</li>
                    </ul>
                )}
            </InfoModal>

            <ConfirmModal
                isOpen={confirmModal}
                isClose={closeConfirmModal}
                onConfirm={() => {
                    handleDelete(selectedEnfermedad);
                    closeConfirmModal();
                }}
                title='¿Confirmación de Eliminación?'
                message="¿Estás seguro de eliminar este registro?"
                confirmText='Eliminar'
                cancelText='Cancelar'
            />

            <FormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editEnfermedades ? 'Editar Enfermedad o Patología' : 'Registrar Enfermedad o Patología'}
            >
                <ForEnfermedades
                    initialData={editEnfermedades}
                    onSave={handleSaved}
                    onClose={() => setModalOpen(false)}
                />
            </FormModal>

            <section className='card-container'>
                <Card
                    color='#0033A0'
                    title='Total de Enfermedades y Patolodías'
                >
                    <img src={icon.mascarilla2} alt="Icono enfermedada" className='icon-card' />
                    <span className='number'>{stats.total}</span>
                    <h3>Total • Enfermedades</h3>
                </Card>
            </section>

            <section className='quick-actions2'>
                <div className='pac-toolbar'>
                    <div className='filters'>

                        <div className='field'>
                            <img src={icon.lupa2} alt="Buscardor" className='field-icon' />
                            <input
                                type="text"
                                placeholder='Buscar por Nombre, Categoria, descripción'
                                value={filters.q}
                                onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className='actions'>
                        <button className='btn btn-primary' onClick={handleNuevo}>
                            <img src={icon.user5} alt="icono de registro" className='btn-icon' style={{ marginRight: 5 }} /> Nuevo Registro
                        </button>
                    </div>

                </div>
            </section>

            <div className='table-wrap'>
                <Table
                    columns={columns}
                    data={filtered}
                    rowsPerPage={8}
                />
            </div>
        </div>
    );
}

export default Enfermedades;
