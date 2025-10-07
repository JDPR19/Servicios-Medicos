import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
////////////////////////// PANTALLAS PÚBLICAS //////////////////////////
import Landing from "./pages/landing.jsx";
import Login from "./pages/Login.jsx";
////////////////////////// PANTALLAS PRIVADAS //////////////////////////
import DaskBoard from './pages/DaskBoard.jsx';
///////////////////////// COMPONENTES //////////////////////////
import MainLayout from './components/MainLayout.jsx';
import Header from "./components/header.jsx";
////////////////////////// FIN IMPORTACIONES DE COMPONENTES//////////////////////////

function App() {


  return (
    <>
    <BrowserRouter>
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
              <Header/>
                <Login />
            
              </>
            } 
          />

          {/* RUTAS PRIVADAS */}
            <Route path='/admin' element={<MainLayout/>}>
              <Route index element={<DaskBoard/>} />

            </Route>

          {/* RUTA PARA ERRPR 404 */}
          <Route path="*" element={<h1> Página no encontrada -- Error 404 -- </h1>} />
          
      </Routes>   
    </BrowserRouter>
    </>
  )
}

export default App
