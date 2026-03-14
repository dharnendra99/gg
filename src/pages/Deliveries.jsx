import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeliveries, validateDelivery } from '../services/api';

function Deliveries() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { loadDeliveries(); }, [statusFilter]);

  const loadDeliveries = async () => {
    try {
      const res = await getDeliveries({ status: statusFilter });
      if (res.data) setDeliveries(res.data);
    } catch (err) {} finally { setLoading(false); }
  };

  const handleValidate = async (delivery) => {
    if (!window.confirm(`Validate delivery ${delivery.reference}? This will decrease stock.`)) return;
    try {
      await validateDelivery({ id: delivery.id });
      loadDeliveries();
    } catch (err) {
      alert(err.message || 'Validation failed');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Delivery Orders (Outgoing)</h1>
        <button className="btn btn-primary" onClick={() => navigate('/deliveries/new')}>+ New Delivery</button>
      </div>

      <div className="filters-bar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
              <th>Customer</th>
              <th>Warehouse</th>
              <th>Items</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No deliveries found</td></tr>
            ) : (
              deliveries.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{d.reference}</td>
                  <td>{d.customer || '-'}</td>
                  <td>{d.warehouse_name || '-'}</td>
                  <td>{d.item_count} items</td>
                  <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
                  <td>{new Date(d.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {d.status !== 'done' && d.status !== 'canceled' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleValidate(d)}>Validate</button>
                      )}
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/deliveries/edit/${d.id}`)}>View</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Deliveries;
