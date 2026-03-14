import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createAdjustment, getAdjustment, getProducts, getWarehouses, getLocations } from '../services/api';

function AdjustmentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isView = Boolean(id);

  const [form, setForm] = useState({ warehouse_id: '', location_id: '', reason: '', notes: '' });
  const [items, setItems] = useState([{ product_id: '', counted_qty: '' }]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adjData, setAdjData] = useState(null);

  useEffect(() => {
    getProducts({}).then(res => { if (res.data.success) setProducts(res.data.data); }).catch(() => {});
    getWarehouses().then(res => { if (res.data.success) setWarehouses(res.data.data); }).catch(() => {});

    if (isView) {
      getAdjustment(id).then(res => {
        if (res.data.success) setAdjData(res.data.data);
      }).catch(() => {});
    }
  }, [id]);

  const handleWarehouseChange = async (whId) => {
    setForm(f => ({ ...f, warehouse_id: whId, location_id: '' }));
    if (whId) {
      const res = await getLocations(whId);
      if (res.data.success) setLocations(res.data.data);
    } else { setLocations([]); }
  };

  const addItem = () => setItems([...items, { product_id: '', counted_qty: '' }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index, field, value) => {
    const updated = [...items]; updated[index][field] = value; setItems(updated);
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const validItems = items.filter(i => i.product_id && i.counted_qty !== '');
    if (validItems.length === 0) { setError('Add at least one item'); setLoading(false); return; }

    try {
      await createAdjustment({ location_id: form.location_id, reason: form.reason, notes: form.notes, items: validItems, created_by: user.id });
      navigate('/adjustments');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed');
    } finally { setLoading(false); }
  };

  if (isView && adjData) {
    return (
      <div>
        <div className="page-header">
          <h1>Adjustment {adjData.reference}</h1>
          <span className={`badge badge-${adjData.status}`}>{adjData.status}</span>
        </div>
        <div className="card" style={{ maxWidth: '700px' }}>
          <div className="form-row">
            <div><strong style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Location</strong><p>{adjData.warehouse_name} / {adjData.location_name}</p></div>
            <div><strong style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Reason</strong><p>{adjData.reason || '-'}</p></div>
          </div>
          <h3 style={{ fontSize: '0.95rem', margin: '18px 0 12px', color: 'var(--text-primary)' }}>Items</h3>
          <table className="data-table">
            <thead><tr><th>Product</th><th>Recorded</th><th>Counted</th><th>Difference</th></tr></thead>
            <tbody>
              {adjData.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.product_name} ({item.sku})</td>
                  <td>{item.recorded_qty}</td>
                  <td>{item.counted_qty}</td>
                  <td style={{ color: Number(item.difference) >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                    {Number(item.difference) > 0 ? '+' : ''}{item.difference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="modal-actions"><button className="btn btn-outline" onClick={() => navigate('/adjustments')}>Back</button></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header"><h1>New Stock Adjustment</h1></div>
      <div className="card" style={{ maxWidth: '800px' }}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Warehouse *</label>
              <select value={form.warehouse_id} onChange={(e) => handleWarehouseChange(e.target.value)} required>
                <option value="">Select Warehouse</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Location *</label>
              <select value={form.location_id} onChange={(e) => setForm({...form, location_id: e.target.value})} required>
                <option value="">Select Location</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.type})</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Reason</label>
            <input type="text" value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value})} placeholder="e.g. Damaged items, Physical count mismatch" />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} rows="2"></textarea>
          </div>

          <h3 style={{ fontSize: '0.95rem', marginBottom: '14px', color: 'var(--text-primary)' }}>Products - Enter Physical Count</h3>
          {items.map((item, index) => (
            <div key={index} className="form-row" style={{ alignItems: 'flex-end', marginBottom: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Product</label>
                <select value={item.product_id} onChange={(e) => updateItem(index, 'product_id', e.target.value)} required>
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku}) - Stock: {p.total_stock}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Counted Quantity</label>
                <input type="number" value={item.counted_qty} onChange={(e) => updateItem(index, 'counted_qty', e.target.value)} min="0" required />
              </div>
              {items.length > 1 && (
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(index)} style={{ marginBottom: '2px' }}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={addItem} style={{ marginTop: '8px' }}>+ Add Item</button>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/adjustments')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Adjustment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdjustmentForm;
