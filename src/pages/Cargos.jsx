import React, {useState, useEffect, useMemo} from 'react';
import axios from 'axios';
import '../index.css';
import Card from '../components/Card';
import Tablas from '../components/Tablas';
import icon from '../components/icon';
import Spinner from '../components/spinner';
import {BaseUrl} from '../utils/Constans';
import ConfirmModal from '../components/ConfirmModal';
import InfoModal from "../components/InfoModal";
import FormModal from "../components/FormModal";
import ForCargo from '../Formularios/ForCargo';
import { useToast } from '../components/userToasd';

function Cargos () {
const [loading, setLoading] = useState(false);
const [cargos, setCargos] = useState([]);
const [filters, setFilters] = useState({estado: "todos", q:""});
const [confirmModal, setConfirmModal] = useState(false);
const [selectedCargo, setSelectedCargo] = useState(null);
const [editCargo, setEditCargo] = useState(null);
const [modalOpen, setModalOpen] = useState(false);
const [cargosToshow, setCargosToShow] = useState(null);
const showToast = useToast();
    
////////////////////////////Helpers ---> Ayudantes/////////////////////////////////////////////
const getAuhtHeaders = () =>{
    const token = (localStorage.getItem('token') || '').trim();
    return token ? {Authorization: `Bearer ${token} `} : {};
};

const openConfirmDelete = (id) => {
    setSelectedCargo(id);
    setConfirmModal(true);
}

const closeConfirmDelete = () => {
    setSelectedCargo();
    setConfirmModal(false);
}

const handleNuevo = () => {
    setEditCargo();
    setModalOpen(true);
}

const handleEdit = (row) => {
    setEditCargo(row);
    setModalOpen(true);
}

const handleSaved = () => {
    fecthCargos();
    setModalOpen(false);
    setEditCargo(null);
}

const stats = useMemo(() => {
    const total = cargos.length;
    return { total };
},[cargos]);

const filtered = useMemo (() => {
    const q = filters.q.trim().toLowerCase();
    return cargos.filter(c => {
        const matchQ = !q || `${c.nombre}`.toLowerCase().includes(q); 
        return matchQ ;
    });
}, [cargos, filters]);

const columns = [
    {
        header: "N°",
        key: "order",
        render: (_row, idx) => idx + 1
    },
    {accessor: "nombre", header: "Nombre", key: "nombre"},
    {
        header: "Acciones",
        render: (row) => (
            <div className='row-actions' style={{display: 'flex', gap: 8}}>
                <button className='btn btn-xs btn-outline btn-view' title='Ver Detalles' onClick={() => handleView(row)}>Ver</button>
                <button className='btn btn-xs btn-outline btn-edit' title='Editar' onClick={() => handleEdit(row)}>Editar</button>
                <button className='btn btn-xs btn-outline btn-danger' title='Eliminar' onClick={() => openConfirmDelete(row.id)}>Eliminar</button>
            </div>
        ) 
    },
];


/////////////////////////////////////Peticiones/////////////////////////////////////////////////////////////// 
    
const fecthCargos = async () => {
    setLoading(true);
    try {
        const response = await axios.get(`${BaseUrl}cargos`, { headers: getAuhtHeaders() });
        const data = response.data;
        if(!Array.isArray(data)) {
            console.warn('Respuesta inesperada /cargos:', data);
            setCargos([]);
            showToast?.('Respuesta inesperada del servidor', 'error', 4000);
        }
        setCargos(data);
    } catch (error) {
        console.error('Error obteniendo todos los cargos:', error?.response?.data || error.message);
        showToast?.('Error obteniendo los datos', 'error', 3000);
        setCargos([]);
    } finally {
        setLoading(false);
    }
}

useEffect(() => {
    fecthCargos();
}, []);

// ////////////////////////////////////Manejadores///////////////////////////////////////////////////////////
const handleView = async (row) => {
    setLoading(true);
    try{
        const response = await axios.get(`${BaseUrl}cargos/ver/${row.id}`, { headers: getAuhtHeaders()});
        setCargosToShow(response.data);
    }catch(error) {
        console.error('Error al mostrar datos:', error?.response?.data || error.message);
        showToast('error al mostrar datos de este cargo', 'error', 3000 );
    }finally {
        setLoading(false);
    }
}

const handleDelete = async (id) => {
    setLoading(true);
    try{
        await axios.delete(`${BaseUrl}cargos/eliminar/${id}`, { headers: getAuhtHeaders() });
        showToast('Cargo eliminado con exito', 'success', 3000);
        await fecthCargos();
    }catch(error) {
        console.error('Error Eliminado el cargo:', error?.response.data || error.message);
        showToast?.('Error al Eliminar el cargo', 'error', 3000);
    }finally {
        setLoading(false);
    }
} 
///////////////////////////////////// fin Peticiones/////////////////////////////////////////////////////////////// 


    return (
        <div className='pac-page'>
            {loading && (
                <div className='spinner-overlay'>
                    <Spinner size={50} label='Cargando Cargos....'/>
                </div>
            )}

            <InfoModal 
                isOpen={!!cargosToshow}
                onClose={() => setCargosToShow(null)}
                title='Información de cargo'
            >
                {cargosToshow && (
                    <ul style={{listStyle:"none", padding: 0}}>
                        <li><b>Nombre del Cargo: </b>{cargosToshow.nombre}</li>
                    </ul>
                )}
            </InfoModal>

            <ConfirmModal
                isOpen={confirmModal}
                onClose={closeConfirmDelete}
                onConfirm={() => {
                    handleDelete(selectedCargo);
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
                title={editCargo ? 'Editar Cargo' : 'Registrar Cargo'}
            >
                <ForCargo
                    initialData={editCargo}
                    onSave={handleSaved}
                    onClose={() => setModalOpen(false)}
                />

            </FormModal>

            <section className='card-container'>
                <Card color="#0033A0" title="Total de Cargos">
                    <img src={icon.cv2} alt="Icono cargo" className='icon-card' />
                    <span className='number'>{stats.total}</span>
                    <h3>Total • Cargos</h3>
                </Card>
            </section>
            
            <section className='quick-actions2'>
                <div className='pac-toolbar'>
                    <div className='filters'>
                        
                        <div className='field'>
                            <img src={icon.lupa2} alt="Buscar" className='field-icon' />
                            <input 
                                type="text" 
                                placeholder='Buscar por cédula, nombre o apellido'
                                value={filters.q}
                                onChange={(e) => setFilters(f => ({...f, q: e.target.value }))}
                            />
                        </div>

                    </div>

                    <div className='actions'>
                        <button className='btn btn-primary' onClick={handleNuevo}>
                            <img src={icon.user5} alt="Nuevo Registro" className='btn-icon' style={{marginRight:5}}/>
                            Nuevo Cargo
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

export default Cargos;