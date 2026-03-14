import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import './Layout.component.css';

function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <Navbar />
        <div className="container">
          <Outlet />
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Layout;
