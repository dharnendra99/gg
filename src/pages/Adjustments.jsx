import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdjustments, validateAdjustment } from '../services/api';

function Adjustments() {
  const navigate = useNavigate();
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { loadAdjustments(); }, [statusFilter]);

  const loadAdjustments = async () => {
    try {
      const res = await getAdjustments({ status: statusFilter });
      if (res.data.success) setAdjustments(res.data.data);
    } catch (err) {} finally { setLoading(false); }
  };

  const handleValidate = async (adj) => {
    if (!window.confirm(`Validate adjustment ${adj.reference}? This will correct stock.`)) return;
    try {
      await validateAdjustment({ id: adj.id });
      loadAdjustments();
    } catch (err) {
      alert(err.response?.data?.error || 'Validation failed');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Stock Adjustments</h1>
        <button className="btn btn-primary" onClick={() => navigate('/adjustments/new')}>+ New Adjustment</button>
      </div>

      <div className="filters-bar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="done">Done</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>

      <div className="recent-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Location</th>
              <th>Reason</th>
              <th>Items</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adjustments.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No adjustments found</td></tr>
            ) : (
              adjustments.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{a.reference}</td>
                  <td>{a.warehouse_name ? `${a.warehouse_name} / ${a.location_name}` : a.location_name || '-'}</td>
                  <td>{a.reason || '-'}</td>
                  <td>{a.item_count} items</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  <td>{new Date(a.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {a.status === 'draft' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleValidate(a)}>Validate</button>
                      )}
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/adjustments/view/${a.id}`)}>View</button>
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

export default Adjustments;
