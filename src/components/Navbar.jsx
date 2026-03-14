import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardKPIs } from '../services/api';
import headerLogo from '../assets/header logo.png';
import './Navbar.component.css';

function Navbar() {
  const [showAlerts, setShowAlerts] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  useEffect(() => {
    getDashboardKPIs()
      .then(res => {
        if (res.data.success) {
          setLowStockProducts(res.data.data.low_stock_products || []);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="navbar">
      <div className="navbar-left">
        <img src={headerLogo} alt="CoreInventory" className="navbar-logo" />
        <div className="search">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search products, orders, transfers..." />
        </div>
      </div>

      <div className="right">
        <div style={{ position: 'relative' }}>
          <button className="alert-btn" onClick={() => setShowAlerts(!showAlerts)}>
            🔔
            {lowStockProducts.length > 0 && <span className="alert-dot"></span>}
          </button>

          {showAlerts && (
            <div className="alert-dropdown">
              <h4>Low Stock Alerts ({lowStockProducts.length})</h4>
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map(p => (
                  <div key={p.id} className="alert-item">
                    <span className="warning-icon">⚠️</span>
                    <div>
                      <div className="product-name">{p.name}</div>
                      <div className="stock-info">
                        Stock: {p.current_stock} / Min: {p.min_stock}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-alerts">No low stock alerts</div>
              )}
            </div>
          )}
        </div>

        <div className="user" style={{ position: 'relative' }}>
          <button className="user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="avatar">{getInitials(user.name)}</div>
            <span className="username">{user.name || 'User'}</span>
            <span className="dropdown-arrow">▾</span>
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="avatar large">{getInitials(user.name)}</div>
                <div>
                  <div className="dropdown-name">{user.name || 'User'}</div>
                  <div className="dropdown-email">{user.email || ''}</div>
                </div>
              </div>
              <div className="user-dropdown-divider"></div>
              <button className="user-dropdown-item" onClick={() => { setShowUserMenu(false); navigate('/profile'); }}>
                <span>👤</span> My Profile
              </button>
              <div className="user-dropdown-divider"></div>
              <button className="user-dropdown-item signout" onClick={handleSignOut}>
                <span>🚪</span> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
