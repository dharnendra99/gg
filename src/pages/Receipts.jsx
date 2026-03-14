import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReceipts, validateReceipt } from '../services/api';

function Receipts() {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { loadReceipts(); }, [statusFilter]);

  const loadReceipts = async () => {
    try {
      const res = await getReceipts({ status: statusFilter });
      if (res.data) setReceipts(res.data);
    } catch (err) {} finally { setLoading(false); }
  };

  const handleValidate = async (receipt) => {
    if (!window.confirm(`Validate receipt ${receipt.reference}? This will increase stock.`)) return;
    try {
      await validateReceipt({ id: receipt.id });
      loadReceipts();
    } catch (err) {
      alert(err.message || 'Validation failed');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Receipts (Incoming)</h1>
        <button className="btn btn-primary" onClick={() => navigate('/receipts/new')}>+ New Receipt</button>
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
              <th>Supplier</th>
              <th>Warehouse</th>
              <th>Items</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {receipts.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No receipts found</td></tr>
            ) : (
              receipts.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.reference}</td>
                  <td>{r.supplier || '-'}</td>
                  <td>{r.warehouse_name || '-'}</td>
                  <td>{r.item_count} items</td>
                  <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {r.status !== 'done' && r.status !== 'canceled' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleValidate(r)}>Validate</button>
                      )}
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/receipts/edit/${r.id}`)}>View</button>
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

export default Receipts;
