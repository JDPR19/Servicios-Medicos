import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
////////////////////////// PANTALLAS PÚBLICAS //////////////////////////
import Landing from "./pages/landing.jsx";
import Login from "./pages/Login.jsx";
////////////////////////// PANTALLAS PRIVADAS //////////////////////////
import DaskBoard from './pages/DaskBoard.jsx';
import Consultas from './pages/Consultas.jsx';
import Pacientes from './pages/Pacientes.jsx';
import Historias from './pages/Historias.jsx';
import Seguimiento from './pages/SeguimientoPaciente.jsx';
import Reposos from './pages/Reposos.jsx';
import Doctores from './pages/Doctores.jsx';
import Cargos from './pages/Cargos.jsx';
import Departamentos from './pages/Departamentos';
////////////////////////// PANTALLAS FORMULARIOS ////////////////
import ForConsultas from './Formularios/ForConsultas';
import ForPacientes from './Formularios/ForPaciente.jsx'; 
import ForHistorias from './Formularios/ForHistorias.jsx';
import ForReposos from './Formularios/ForReposos.jsx';
import ForDoctor from './Formularios/ForDoctor.jsx';
import ForCargos from './Formularios/ForCargo.jsx';
import ForDepartamentos from './Formularios/ForDepartamento.jsx';
///////////////////////// COMPONENTES //////////////////////////
import MainLayout from './components/MainLayout.jsx';
import { AlertProvider } from './components/AlertProvider.jsx';
import { ToastProvider } from './components/ToapsProvider.jsx';
import AutoLogout from './components/AutoLogout.jsx';
////////////////////////// IMPORTACIONES DE SECCIONES DE PANTALLAS//////////////////////////
import SeccionOne from './pages/SeccionOne.jsx';
////////////////////////// FIN IMPORTACIONES DE SECCIONES DE PANTALLAS//////////////////////////
//////////////////////////IMPORTACIONES DE PANTALLAS DE ERRORES Y SEGURIDAD PARA RUTAS//////////////////////////
import Error from './pages/Error.jsx';
//////////////////////////FIN PANTALLA DE ERROR - SEGURIDAD PARA RUTAS///////////////////
function App() {


  return (
    <>
    <ToastProvider>
      <AlertProvider>
        <BrowserRouter>
          <AutoLogout />
          <Routes>
            {/* RUTAS PÚBLICAS */}
              <Route 
                path="/" 
                element={
                  <Landing />
                } 
              />
              <Route 
                path="/login" 
                element={
                  <>
                    <Login />
                
                  </>
                } 
              />

              {/* RUTAS PRIVADAS */}
                <Route path='/admin' element={<MainLayout/>}>
                  <Route index element={<DaskBoard/>} />
                  <Route path='Consultas' element={<Consultas/>} />
                  <Route path='ForConsultas' element={<ForConsultas/>} />
                  <Route path='Pacientes' element={<Pacientes/>} />
                  <Route path='ForPacientes' element={<ForPacientes/>} />
                  <Route path='Historias' element={<Historias/>} />
                  <Route path='ForHistorias' element={<ForHistorias/>} />
                  <Route path='Seguimiento' element={<Seguimiento/>} />
                  <Route path='Reposos' element={<Reposos/>} />
                  <Route path='ForReposos' element={<ForReposos/>} />
                  <Route path='Doctores' element={<Doctores/>} />
                  <Route path='ForDoctor' element={<ForDoctor/>} />
                  <Route path='SeccionOne' element={<SeccionOne/>} />
                  <Route path='Cargos' element={<Cargos/>} />
                  <Route path='ForCargos' element={<ForCargos/>} />
                  <Route path='Departamentos' element={<Departamentos/>} />
                  <Route path='ForDepartamentos' element={<ForDepartamentos/>}/>
                </Route>

              {/* RUTA PARA ERROR 404 */}
              <Route path="*" element={<Error/>} />
              
          </Routes>   
        </BrowserRouter>
      </AlertProvider>
    </ToastProvider>
    </>
  )
}

export default App
