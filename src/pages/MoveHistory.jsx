import { useState, useEffect } from 'react';
import { getStockLedger, getProducts, getLocations, getWarehouses } from '../services/api';

function MoveHistory() {
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ product: '', location: '', type: '' });
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    getProducts({}).then(res => { if (res.data) setProducts(res.data); }).catch(() => {});
    getWarehouses().then(res => { if (res.data) setWarehouses(res.data); }).catch(() => {});
    getLocations().then(res => { if (res.data) setLocations(res.data); }).catch(() => {});
  }, []);

  useEffect(() => { loadMoves(); }, [filters]);

  const loadMoves = async () => {
    try {
      const res = await getStockLedger(filters);
      if (res.data) setMoves(res.data);
    } catch (err) {} finally { setLoading(false); }
  };

  const getTypeBadge = (type) => {
    const map = {
      'receipt': 'type-receipt',
      'delivery': 'type-delivery',
      'transfer_in': 'type-transfer',
      'transfer_out': 'type-transfer',
      'adjustment': 'type-adjustment'
    };
    return map[type] || '';
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Move History / Stock Ledger</h1>
      </div>

      <div className="filters-bar">
        <select value={filters.product} onChange={(e) => setFilters({...filters, product: e.target.value})}>
          <option value="">All Products</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
        </select>
        <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
          <option value="">All Types</option>
          <option value="receipt">Receipt</option>
          <option value="delivery">Delivery</option>
          <option value="transfer_in">Transfer In</option>
          <option value="transfer_out">Transfer Out</option>
          <option value="adjustment">Adjustment</option>
        </select>
        <select value={filters.location} onChange={(e) => setFilters({...filters, location: e.target.value})}>
          <option value="">All Locations</option>
          {locations.map(l => <option key={l.id} value={l.id}>{l.warehouse_name} / {l.name}</option>)}
        </select>
      </div>

      <div className="recent-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Location</th>
              <th>Type</th>
              <th>Change</th>
              <th>Balance After</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {moves.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No stock movements found</td></tr>
            ) : (
              moves.map(m => (
                <tr key={m.id}>
                  <td>{new Date(m.created_at).toLocaleString()}</td>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{m.product_name} <span style={{ color: 'var(--text-muted)' }}>({m.sku})</span></td>
                  <td>{m.warehouse_name ? `${m.warehouse_name} / ${m.location_name}` : m.location_name || '-'}</td>
                  <td><span className={`type-badge ${getTypeBadge(m.operation_type)}`}>{m.operation_type.replace('_', ' ')}</span></td>
                  <td style={{ fontWeight: 600, color: Number(m.quantity_change) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {Number(m.quantity_change) > 0 ? '+' : ''}{m.quantity_change}
                  </td>
                  <td>{m.balance_after}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{m.notes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MoveHistory;
