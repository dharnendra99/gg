import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransfers, validateTransfer } from '../services/api';

function Transfers() {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { loadTransfers(); }, [statusFilter]);

  const loadTransfers = async () => {
    try {
      const res = await getTransfers({ status: statusFilter });
      if (res.data) setTransfers(res.data);
    } catch (err) {} finally { setLoading(false); }
  };

  const handleValidate = async (transfer) => {
    if (!window.confirm(`Validate transfer ${transfer.reference}? This will move stock.`)) return;
    try {
      await validateTransfer({ id: transfer.id });
      loadTransfers();
    } catch (err) {
      alert(err.message || 'Validation failed');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Internal Transfers</h1>
        <button className="btn btn-primary" onClick={() => navigate('/transfers/new')}>+ New Transfer</button>
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
              <th>From</th>
              <th>To</th>
              <th>Items</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transfers.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No transfers found</td></tr>
            ) : (
              transfers.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{t.reference}</td>
                  <td>{t.from_warehouse ? `${t.from_warehouse} / ${t.from_location}` : t.from_location || '-'}</td>
                  <td>{t.to_warehouse ? `${t.to_warehouse} / ${t.to_location}` : t.to_location || '-'}</td>
                  <td>{t.item_count} items</td>
                  <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                  <td>{new Date(t.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {t.status !== 'done' && t.status !== 'canceled' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleValidate(t)}>Validate</button>
                      )}
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/transfers/view/${t.id}`)}>View</button>
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

export default Transfers;
