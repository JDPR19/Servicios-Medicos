import React, {useState, useEffect} from  'react';
import axios from 'axios';
import Spinner from '../components/spinner';
import icon from '../components/icon';
import Card from '../components/Card';
import InfoModal from '../components/InfoModal';
import ConfirmModal from '../components/ConfirmModal';
import FormModal from '../components/FormModal';
import ForCategoria_e from '../Formularios/ForCategoria_e.jsx';
import Tablas from '../components/Tablas';
import { useToast } from '../components/userToasd';
import {BaseUrl} from '../utils/Constans';
import { useMemo } from 'react';

function Categoria_e () {
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [categoria, setCategoria] = useState([]);
    const [selectedCategoria, setSelectedCategoria] = useState(null);
    const [editCategoria, setEditCategoria] = useState(null);
    const [categoriaShow, setCategoriaShow] = useState(null);
    const [filters, setFilters] = useState({estado: "todos", q: ""});
    const ShowToast = useToast();
    
    
////////////////////////////Helpers ---> Ayudantes/////////////////////////////////////////////

    const getAuhtorization = () => {
        const token = (localStorage.getItem('token') || '').trim();
        return token ? {Authorization: `Bearer ${token}`} : {};
    }

    const openConfirmModal = (id) => {
        setSelectedCategoria(id);
        setConfirmModal(true);
    }

    const closeConfirmModal = () => {
        setSelectedCategoria();
        setConfirmModal(false);
    }

    const handleNuevo = () => {
        setEditCategoria();
        setModalOpen(true);
    }

    const handleEdit = (row) => {
        setEditCategoria(row);
        setModalOpen(true);
    }

    const handleSaved = () => {
        fecthCategoria();
        setModalOpen(false);
        setEditCategoria(null);
    }

    const stats = useMemo(() => {
        const total = categoria.length;
        return { total }; 
    }, [categoria]);

    const filtered = useMemo(() => {
        const q = filters.q.trim().toLowerCase();
        return categoria.filter(c => {
            const matchQ = !q || `${c.nombre}`.toLowerCase().includes(q);
            return matchQ;
        })
    }, [categoria, filters]);

    const columns = [
        {
            header: "N°",
            key: "order",
            render: (_row, idx) => idx + 1 
        },
        {
            accessor: "nombre", header: "Nombre", key: "nombre"
        },
        {
            header: "Acciones",
            render: (row) => (
                <div className='row-actions' style={{display: 'flex', gap:8}}>
                    <button className='btn btn-xs btn-outline btn-view' title='Ver Detalles' onClick={() => handleView(row)}>Ver</button>
                    <button className='btn btn-xs btn-outline btn-edit' title='Editar' onClick={() => handleEdit(row)}>Editar</button>
                    <button className='btn btn-xs btn-outline btn-danger' title='Eliminar' onClick={() => openConfirmModal(row.id)}>Eliminar</button>
                </div>
            )
        },
    ];

/////////////////////////////////////Peticiones/////////////////////////////////////////////////////////////// 

const fecthCategoria = async () => {
    setLoading(true);
    try{
        const response = await axios.get(`${BaseUrl}categoria_e`, { headers: getAuhtorization() });
        const data = response.data;
        if(!Array.isArray(data)) {
            console.warn('Respuesta inesperada /categoria_e', data);
            setCategoria([]);
            ShowToast?.('Respuesta inesperada del Servidor', 'error', 4000);
        }
        setCategoria(data);
    }catch (error){
        console.error('Error obteniendo todos las Categorias', error?.response?.data || error.message);
        ShowToast?.('Error Obteniendo todos las Categorias', 'error', 3000);
        setCategoria([]);
    }finally {
        setLoading(false);
    }
}

useEffect(() => {
    fecthCategoria();
}, []);

//////////////////////////////////////Manejadores///////////////////////////////////////////////////////////

const handleView = async (row) => {
    setLoading(true);
    try {
        const response = await axios.get(`${BaseUrl}categoria_e/ver/${row.id}`, { headers: getAuhtorization() });
        setCategoriaShow(response.data);
    } catch (error) {
        console.error('error al mostrar datos' ,error?.response?.data || error.message);
        ShowToast?.('Error al mostrar datos de esta categoria', 'error', 3000);
    }finally{
        setLoading(false);
    }
} 

const handleDelete = async (id) => {
    setLoading(true);
    try {
        await axios.delete(`${BaseUrl}categoria_e/eliminar/${id}`, { headers: getAuhtorization() });
        ShowToast('Categoria eliminada con exito', 'success', 3000);
        await fecthCategoria();
    } catch (error) {
        console.error('Error Eliminando la categoria', error?.response?.data || error.message);
        ShowToast?.('Error eliminando la categoria', 'error', 3000);
    }finally{
        setLoading(false);
    }
}

///////////////////////////////////// fin Peticiones/////////////////////////////////////////////////////////////// 

    return (
        <div className='pac-page'>
            {loading && (
                <div className='spinner-overlay'>
                    <Spinner size={50} label='Cargando Categoria....' />
                </div>
            )}

            <InfoModal
                isOpen={!!categoriaShow}
                onClose={() => setCategoriaShow(null)}
                title='Información de Categoria'
            >
                {categoriaShow && (
                    <ul style={{listStyle: "none", padding: 0}}>
                        <li><b>Nombre de Categoria: </b>{categoriaShow.nombre}</li>
                    </ul>
                )}
            </InfoModal>
            
            <ConfirmModal
                isOpen={confirmModal}
                onClose={closeConfirmModal}
                onConfirm={() => {
                    handleDelete(selectedCategoria);
                    closeConfirmModal();
                }}
                title='¿Confirmación de Eliminación?'
                message='¿Estas Seguro de eliminar este registro?'
                confirmText='Eliminar'
                cancelText='Cancelar'
            />

            <FormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editCategoria ? 'Editar Categoria' : 'Registrar Categoria'}
            >
                <ForCategoria_e
                    initialData={editCategoria}
                    onSave={handleSaved}
                    onClose={() => setModalOpen(false)}
                />
            </FormModal>

            <section className='card-container'>
                <Card color="#0033A0" title="Total de Categorias">
                    <img src={icon.folder} alt='icono categoria'  className='icon-card'/>
                    <span className='number'>{stats.total}</span>
                    <h3>Total • Cargos</h3>
                </Card>
            </section>

            <section className='quick-actions2'>
                <div className='pac-toolbar'>
                    <div className='filters'>

                        <div className='field'>
                            <img src={icon.lupa2} alt="Buscar..." className='field-icon' />
                            <input 
                                type="text" 
                                placeholder='Buscar por Nombre'
                                value={filters.q}
                                onChange={(e) => setFilters(f => ({...f, q: e.target.value }))}
                                />
                        </div>

                    </div>

                    <div className='actions'>
                        <button className='btn btn-primary' onClick={handleNuevo}>
                            <img src={icon.user5} alt="Nuevo Registro" className='btn-icon' style={{marginRight:5}}/>
                            Nueva Categoria de Patologias 
                        </button>
                    </div>
                </div>
            </section>

            <div className='table-wrap'>
                <Tablas
                    columns={columns}
                    data={filtered}
                    rowsPerpage={8}
                />
            </div>
        </div>
    );
}

export default Categoria_e;