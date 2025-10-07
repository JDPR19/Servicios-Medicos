import SideBar from '../components/SideBar';
import Header from '../components/navigation';
import { Outlet } from 'react-router-dom';
import '../styles/layout.css';

function MainLayout () {
    return (
        <div className="layout-container">
            <SideBar/>

            <div className="layout-content">
                <main className='layout-main'>
                    <Header/>
                    
                    <Outlet/>
                </main>


            </div>
        </div>
    );
}

export default MainLayout;