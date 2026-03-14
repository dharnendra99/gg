import { useState, useEffect } from 'react';
import { getDashboardKPIs, getRecentOperations, getWarehouses, getCategories } from '../services/api';
import './Dashboard.component.css';

function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', status: '' });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadOperations();
  }, [filters]);

  const loadData = async () => {
    try {
      const res = await getDashboardKPIs();
      if (res.data.success) setKpis(res.data.data);
    } catch (err) {
      console.error('Failed to load KPIs');
    }
    loadOperations();
  };

  const loadOperations = async () => {
    try {
      const res = await getRecentOperations(filters);
      if (res.data.success) setOperations(res.data.data);
    } catch (err) {
      console.error('Failed to load operations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-center"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="dashboard-kpis">
        <div className="kpi-card" style={{'--kpi-color': '#0871d4'}}>
          <div className="kpi-icon">📦</div>
          <div className="kpi-value">{kpis?.product_count || 0}</div>
          <div className="kpi-label">Total Products</div>
        </div>
        <div className="kpi-card" style={{'--kpi-color': '#f59e0b'}}>
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-value">{kpis?.low_stock || 0}</div>
          <div className="kpi-label">Low Stock Items</div>
        </div>
        <div className="kpi-card" style={{'--kpi-color': '#ef4444'}}>
          <div className="kpi-icon">🚫</div>
          <div className="kpi-value">{kpis?.out_of_stock || 0}</div>
          <div className="kpi-label">Out of Stock</div>
        </div>
        <div className="kpi-card" style={{'--kpi-color': '#10b981'}}>
          <div className="kpi-icon">📥</div>
          <div className="kpi-value">{kpis?.pending_receipts || 0}</div>
          <div className="kpi-label">Pending Receipts</div>
        </div>
        <div className="kpi-card" style={{'--kpi-color': '#3b82f6'}}>
          <div className="kpi-icon">📤</div>
          <div className="kpi-value">{kpis?.pending_deliveries || 0}</div>
          <div className="kpi-label">Pending Deliveries</div>
        </div>
        <div className="kpi-card" style={{'--kpi-color': '#a855f7'}}>
          <div className="kpi-icon">🔄</div>
          <div className="kpi-value">{kpis?.scheduled_transfers || 0}</div>
          <div className="kpi-label">Transfers Scheduled</div>
        </div>
      </div>

      {kpis?.low_stock_products?.length > 0 && (
        <div className="section">
          <h3>⚠️ Low Stock Alerts</h3>
          <div className="recent-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Current Stock</th>
                  <th>Minimum Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {kpis.low_stock_products.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.name}</td>
                    <td>{p.sku}</td>
                    <td style={{ color: Number(p.current_stock) === 0 ? 'var(--danger)' : 'var(--warning)' }}>
                      {p.current_stock}
                    </td>
                    <td>{p.min_stock}</td>
                    <td>
                      <span className={`badge ${Number(p.current_stock) === 0 ? 'badge-canceled' : 'badge-waiting'}`}>
                        {Number(p.current_stock) === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="dashboard-section">
        <h3>Recent Operations</h3>
        <div className="filters-bar">
          <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
            <option value="">All Types</option>
            <option value="receipt">Receipts</option>
            <option value="delivery">Deliveries</option>
            <option value="transfer">Transfers</option>
            <option value="adjustment">Adjustments</option>
          </select>
          <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="waiting">Waiting</option>
            <option value="ready">Ready</option>
            <option value="done">Done</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>

        <div className="recent-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Partner / Details</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {operations.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No operations found</td></tr>
              ) : (
                operations.map((op, i) => (
                  <tr key={`${op.type}-${op.id}-${i}`}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{op.reference}</td>
                    <td><span className={`type-badge type-${op.type}`}>{op.type}</span></td>
                    <td>{op.partner || '-'}</td>
                    <td><span className={`badge badge-${op.status}`}>{op.status}</span></td>
                    <td>{new Date(op.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
