import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
////////////////////////// PANTALLAS PÚBLICAS //////////////////////////////////////////////////////////////
import Landing from "./pages/landing.jsx";
import Login from "./pages/Login.jsx";
////////////////////////// PANTALLAS PRIVADAS //////////////////////////////////////////////////////////////
import DaskBoard from './pages/DaskBoard.jsx';
import Consultas from './pages/Consultas.jsx';
import Pacientes from './pages/Pacientes.jsx';
import Historias from './pages/Historias.jsx';
import Seguimiento from './pages/SeguimientoPaciente.jsx';
import Reposos from './pages/Reposos.jsx';
import Doctores from './pages/Doctores.jsx';
import Cargos from './pages/Cargos.jsx';
import Profesiones from './pages/Profesiones.jsx';
import Departamentos from './pages/Departamentos';
import Categoria_e from './pages/Categoria_e.jsx';
import Categoria_m from './pages/Categoria_m.jsx';
import Medicamentos from './pages/Medicamentos.jsx';
import Bitacora from './pages/Bitacora.jsx';
import Enfermedades from './pages/Enfermedades.jsx';
import Citas from './pages/Citas.jsx';
import Atenciones from './pages/Atenciones.jsx';
////////////////////////// PANTALLAS FORMULARIOS ///////////////////////////////////////////////////////////
import ForConsultas from './Formularios/ForConsultas';
import ForPacientes from './Formularios/ForPaciente.jsx';
import ForHistorias from './Formularios/ForHistorias.jsx';
import ForReposos from './Formularios/ForReposos.jsx';
import ForDoctor from './Formularios/ForDoctor.jsx';
import ForCargos from './Formularios/ForCargo.jsx';
import ForProfesiones from './Formularios/ForProfesiones.jsx';
import ForDepartamentos from './Formularios/ForDepartamento.jsx';
import ForMedicamentos from './Formularios/ForMedicamentos.jsx';
import ForCategoria_e from './Formularios/ForCategoria_e.jsx';
import ForCategoria_m from './Formularios/ForCategoria_m.jsx';
import ForAtenciones from './Formularios/ForAtenciones.jsx';
import ForCitas from './Formularios/ForCitas.jsx';
///////////////////////// COMPONENTES //////////////////////////
import MainLayout from './components/MainLayout.jsx';
import { AlertProvider } from './components/AlertProvider.jsx';
import { ToastProvider } from './components/ToapsProvider.jsx';
import AutoLogout from './components/AutoLogout.jsx';
import ProtectedRoute from './utils/ProtectedRoute.jsx';
////////////////////////// IMPORTACIONES DE SECCIONES DE PANTALLAS//////////////////////////////////////////////
import SeccionOne from './pages/SeccionOne.jsx';
import SeccionTwo from './pages/SeccionTwo.jsx';
import SeccionThree from './pages/SeccionThree.jsx';
////////////////////////// FIN IMPORTACIONES DE SECCIONES DE PANTALLAS//////////////////////////////////////////
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
              <Route path='/admin' element={<MainLayout />}>

                <Route index element={
                  <ProtectedRoute pantalla='home'>
                    <DaskBoard />
                  </ProtectedRoute>
                } />
                <Route path='Consultas' element={
                  <ProtectedRoute pantalla='consulta'>
                    <Consultas />
                  </ProtectedRoute>
                } />
                <Route path='ForConsultas' element={
                  <ProtectedRoute pantalla='consultas'>
                    <ForConsultas />
                  </ProtectedRoute>
                } />
                <Route path='Pacientes' element={
                  <ProtectedRoute pantalla='pacientes'>
                    <Pacientes />
                  </ProtectedRoute>
                } />
                <Route path='Pacientes' element={
                  <ProtectedRoute pantalla='pacientes'>
                    <ForPacientes />
                  </ProtectedRoute>
                } />
                <Route path='Historias' element={
                  <ProtectedRoute pantalla='historias'>
                    <Historias />
                  </ProtectedRoute>
                } />
                <Route path='ForHistorias' element={
                  <ProtectedRoute pantalla='historias'>
                    <ForHistorias />
                  </ProtectedRoute>
                } />
                <Route path='Seguimiento/:id' element={
                  <ProtectedRoute pantalla='seguimiento'>
                    <Seguimiento />
                  </ProtectedRoute>
                } />
                <Route path='Reposos' element={
                  <ProtectedRoute pantalla='reposos'>
                    <Reposos />
                  </ProtectedRoute>
                } />
                <Route path='ForReposos' element={
                  <ProtectedRoute pantalla='reposos'>
                    <ForReposos />
                  </ProtectedRoute>
                } />
                <Route path='Doctores' element={
                  <ProtectedRoute pantalla='doctores'>
                    <Doctores />
                  </ProtectedRoute>
                } />
                <Route path='ForDoctor' element={
                  <ProtectedRoute pantalla='doctores'>
                    <ForDoctor />
                  </ProtectedRoute>
                } />
                <Route path='SeccionOne' element={
                  <ProtectedRoute pantalla='home'>
                    <SeccionOne />
                  </ProtectedRoute>
                } />
                <Route path='SeccionTwo' element={
                  <ProtectedRoute pantalla='home'>
                    <SeccionTwo />
                  </ProtectedRoute>
                } />
                <Route path='SeccionThree' element={
                  <ProtectedRoute pantalla='home'>
                    <SeccionThree />
                  </ProtectedRoute>
                } />
                <Route path='Cargos' element={
                  <ProtectedRoute pantalla='cargos'>
                    <Cargos />
                  </ProtectedRoute>
                } />
                <Route path='ForCargos' element={
                  <ProtectedRoute pantalla='cargos'>
                    <ForCargos />
                  </ProtectedRoute>
                } />
                <Route path='Profesiones' element={
                  <ProtectedRoute pantalla='profesion'>
                    <Profesiones />
                  </ProtectedRoute>
                } />
                <Route path='ForProfesiones' element={
                  <ProtectedRoute pantalla='profesion'>
                    <ForProfesiones />
                  </ProtectedRoute>
                } />
                <Route path='Departamentos' element={
                  <ProtectedRoute pantalla='departamentos'>
                    <Departamentos />
                  </ProtectedRoute>
                } />
                <Route path='ForDepartamentos' element={
                  <ProtectedRoute pantalla='departamentos'>
                    <ForDepartamentos />
                  </ProtectedRoute>
                } />
                <Route path='Medicamentos' element={
                  <ProtectedRoute pantalla='medicamentos'>
                    <Medicamentos />
                  </ProtectedRoute>
                } />
                <Route path='Enfermedades' element={
                  <ProtectedRoute pantalla='enfermedades'>
                    <Enfermedades />
                  </ProtectedRoute>
                } />
                <Route path='ForMedicamentos' element={
                  <ProtectedRoute pantalla='medicamentos'>
                    <ForMedicamentos />
                  </ProtectedRoute>
                } />
                <Route path='Categoria_e' element={
                  <ProtectedRoute pantalla='categoria_e'>
                    <Categoria_e />
                  </ProtectedRoute>
                } />
                <Route path='ForCategoria_e' element={
                  <ProtectedRoute pantalla='categoria_e'>
                    <ForCategoria_e />
                  </ProtectedRoute>
                } />
                <Route path='Categoria_m' element={
                  <ProtectedRoute pantalla='categoria_m'>
                    <Categoria_m />
                  </ProtectedRoute>
                } />
                <Route path='ForCategoria_m' element={
                  <ProtectedRoute pantalla='categoria_m'>
                    <ForCategoria_m />
                  </ProtectedRoute>
                } />

                <Route path='Bitacora' element={
                  <ProtectedRoute pantalla='bitacora'>
                    <Bitacora />
                  </ProtectedRoute>
                } />
                <Route path='Atenciones' element={
                  <ProtectedRoute pantalla='atenciones'>
                    <Atenciones />
                  </ProtectedRoute>
                } />
                <Route path='ForAtenciones' element={
                  <ProtectedRoute pantalla='atenciones'>
                    <ForAtenciones />
                  </ProtectedRoute>
                } />
                <Route path='Citas' element={
                  <ProtectedRoute pantalla='citas'>
                    <Citas />
                  </ProtectedRoute>
                } />
                <Route path='ForCitas' element={
                  <ProtectedRoute pantalla='citas'>
                    <ForCitas />
                  </ProtectedRoute>
                } />
              </Route>

              {/* RUTA PARA ERROR 404 */}
              <Route path="*" element={<Error />} />

            </Routes>
          </BrowserRouter>
        </AlertProvider>
      </ToastProvider>
    </>
  )
}

export default App
