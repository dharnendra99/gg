import { NavLink, useNavigate } from 'react-router-dom';
import headerLogo from '../assets/header logo.png';
import './Sidebar.component.css';

function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <img src={headerLogo} alt="MetroInventery" className="logo-img" />
        <div>
          <h2>MetroInventery</h2>
          <span>Management System</span>
        </div>
      </div>

      <nav className="nav">
        <div className="nav-section">
          <div className="nav-section-title">Main</div>
          <NavLink to="/dashboard" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">📊</span> Dashboard
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Inventory</div>
          <NavLink to="/products" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">📦</span> Products
          </NavLink>
          <NavLink to="/categories" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">🏷️</span> Categories
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Operations</div>
          <NavLink to="/receipts" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">📥</span> Receipts
          </NavLink>
          <NavLink to="/deliveries" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">📤</span> Delivery Orders
          </NavLink>
          <NavLink to="/transfers" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">🔄</span> Internal Transfers
          </NavLink>
          <NavLink to="/adjustments" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">📋</span> Adjustments
          </NavLink>
          <NavLink to="/move-history" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">📜</span> Move History
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Settings</div>
          <NavLink to="/warehouses" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="icon">🏭</span> Warehouses
          </NavLink>
        </div>
      </nav>

      <div className="footer">
        <div className="user" onClick={() => navigate('/profile')}>
          <div className="avatar">{getInitials(user.name)}</div>
          <div className="user-info">
            <div className="name">{user.name || 'User'}</div>
            <div className="role">{user.role || 'staff'}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <span className="icon">🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
