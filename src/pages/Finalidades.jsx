import React, {useState, useEffect, useMemo} from 'react';
import axios from 'axios';
import icon from '../components/icon';
import Card from '../components/Card';
import { BaseUrl } from '../utils/Constans';
import ConfirmModal from '../components/ConfirmModal';
import InfoModal from '../components/InfoModal';
import ForFinalidades from '../Formularios/ForFinalidades';
import FormModal from '../components/FormModal';
import Tablas from '../components/Tablas';
import { useToast } from '../components/userToasd';
import Spinner from '../components/spinner';
import '../index.css';

function Finalidades () {
    const showToast = useToast();
    const [filters, setFilters] = useState({estado: "todos", q:""});
    const [finalidades, setFinalidades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFinalidades, setSelectedFinalidades] = useState(null);
    const [editFinalidades, setEditFinalidades] = useState(null);
    const [finalidadesToShow, setFinalidadesToShow] = useState(null);

    //////////////////////////////helpers o Ayudantes/////////////////////////////////////////////////////
    const getAuthorization = () => {
        const token = (localStorage.getItem('token') || '').trim();
        return token ? { Authorization: `Bearer ${token}` } : {};
    } 

    const openConfirmDelete = (id) => {
        setSelectedFinalidades(id);
        setConfirmModal(true);
    }

    const closeConfirmDelete = () => {
        setSelectedFinalidades();
        setConfirmModal(false);
    }

    const handleNuevo = () => {
        setEditFinalidades();
        setModalOpen(true);
    } 

    const handleEdit = (row) => {
        setEditFinalidades(row);
        setModalOpen(true);
    }

    const handleSaved = () => {
        fetchFinalidades();
        setModalOpen(false);
        setEditFinalidades(null);
    }

    const stats = useMemo(() => {
        const total = finalidades.length;
        return {total};
    }, [finalidades]);

    const filtered = useMemo (() => {
        const q = filters.q.trim().toLowerCase();
        return finalidades.filter(f => {
            const matchQ = !q || `${f.nombre}`.toLowerCase().includes(q);
            return matchQ;
        })
    }, [finalidades, filters]);

    const columns = [
        {
            header: "N°",
            key: "order",
            render: (_row, idx) => idx + 1 
        },
        {accessor: "nombre", header:"Nombre", key: "nombre"},
        {
            header:"Acciones",
            render: (row) => (
                <div className='row-actions' style={{display: 'flex', gap: 8}}>
                    <button className='btn btn-xs btn-outline btn-view' title='Ver Detalles' onClick={() => handleView(row)}>Ver</button>
                    <button className='btn btn-xs btn-outline btn-edit' title='Editar' onClick={() => handleEdit(row)}>Editar</button>
                    <button className='btn btn-xs btn-outline btn-danger' title='Eliminar' onClick={() => openConfirmDelete(row.id)}>Eliminar</button>
                </div>
            )
        }
    ];

//////////////////////////////////////////////////////////////PETICIONES//////////////////////////////////////////////////////////////////////////////////////////

const fetchFinalidades =  async () => {
    setLoading(true);
    try{
        const response = await axios.get(`${BaseUrl}finalidades`, { headers: getAuthorization() });
        const data = response.data;
        if(!Array.isArray(data)) {
            console.warn('Respuesta Inesperada finalidades:', data);
            setFinalidades([]);
            showToast?.('Respuesta inesperada del servidor', 'error', 3000);
        }
        setFinalidades(data);
    }catch(error) {
        console.error('Error Obteniendo todas las finalidades', error?.response?.data || error.message);
        showToast?.('Error obteniendo los datos', 'error', 3000);
        setFinalidades([]);
    }finally {
        setLoading(false);
    }
}

    useEffect(() => {
        fetchFinalidades();
    }, []);

//////////////////////////////////////////////////////////////////Manejadores/////////////////////////////////////////////////////////////////////////// 

const handleView = async (row) => {
    setLoading(true);
    try{
        const response = await axios.get(`${BaseUrl}finalidades/ver/${row.id}`, {headers: getAuthorization() });
        setFinalidadesToShow(response.data);
    }catch(error){
        console.error('Error al mostrar los datos de esta finalidad', error?.response?.data || error.message);
        showToast?.('Error mostrando los datos de esta finalidad', 'error', 3000);
    }finally {
        setLoading(false);
    }
}

const handleDelete = async (id) => {
    setLoading(true);
    try{
        await axios.delete(`${BaseUrl}finalidades/delete/${id}`, { headers: getAuthorization() });
        showToast('Finalidad Eliminada Con exito', 'success', 3000);
        await fetchFinalidades();
    }catch(error){
        console.error('Error al Eliminar la finalidad:', error?.response.data || error.message);
        showToast?.('Error al Eliminar el Cargo', 'error', 3000);
    }finally{
        setLoading(false);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
    return(
        <div className='pac-page'>
            {loading && (
                <div className='spinner-overlay'>
                    <Spinner size={50} label='Cargando Finalidades...'/>
                </div>
            )}

            <InfoModal
                isOpen={!!finalidadesToShow}
                onClose={() => setFinalidadesToShow(null)}
                title='Informacion de Finalidad'
            >
                {finalidadesToShow && (
                    <ul style={{listStyle: "none", padding: 0}}>
                        <li><b>Nombre de la Finalidad: </b>{finalidadesToShow.nombre}</li>
                    </ul>
                )}
            </InfoModal>

            <ConfirmModal
                isOpen={confirmModal}
                onClose={closeConfirmDelete}
                onConfirm={() => {
                    handleDelete(selectedFinalidades);
                    closeConfirmDelete();
                }}
                title='¿Confirmación de Eliminación?'
                message='¿Estas Seguro de eliminar este registro?'
                confirmText='Eliminar'
                cancelText='Cancelar'
            />

            <FormModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editFinalidades ? 'Editar Finalidad' : 'Registra Finalidad'}
            >

                <ForFinalidades
                    initialData={editFinalidades}
                    onSave={handleSaved}
                    onClose={() => setModalOpen(false)}
                />

            </FormModal>

            <section>
                <Card color='#0B3A6A' title='Total de Finalidades'>
                    <img src={icon.home} alt='icono finalidad' className='icon-card'/>
                    <span className='number'>{stats.total}</span>
                    <h3>Total • Finalidades</h3>
                </Card>
            </section>

            <section className='quick-actions2'>
                <div className='pac-toolbar'>
                    <div className='filters'>

                        <div className='field'>
                            <img src={icon.lupa2} alt='Buscar..' className='field-icon' />
                            <input 
                                type="text"
                                placeholder='Buscar por nombre de finalidad'
                                value={filters.q}
                                onChange={(e) => setFilters(f => ({...f, q: e.target.value }))}
                            />
                        </div>

                        </div>
                        <div className='actions'>
                            <button className='btn btn-primary' onClick={handleNuevo}>
                                <img src={icon.user5} alt="Nuevo Registro" className='btn-icon' style={{marginRight:5}}/>
                                Nueva finalidad
                            </button>
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

export default Finalidades;