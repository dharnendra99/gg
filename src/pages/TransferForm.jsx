import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createTransfer, getTransfer, getProducts, getWarehouses, getLocations } from '../services/api';

function TransferForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isView = Boolean(id);

  const [form, setForm] = useState({ from_warehouse_id: '', from_location_id: '', to_warehouse_id: '', to_location_id: '', notes: '' });
  const [items, setItems] = useState([{ product_id: '', quantity: '' }]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [fromLocations, setFromLocations] = useState([]);
  const [toLocations, setToLocations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferData, setTransferData] = useState(null);

  useEffect(() => {
    getProducts({}).then(res => { if (res.data.success) setProducts(res.data.data); }).catch(() => {});
    getWarehouses().then(res => { if (res.data.success) setWarehouses(res.data.data); }).catch(() => {});

    if (isView) {
      getTransfer(id).then(res => {
        if (res.data.success) {
          const t = res.data.data;
          setTransferData(t);
          setItems(t.items.map(i => ({ product_id: i.product_id, quantity: i.quantity, product_name: i.product_name, sku: i.sku })));
        }
      }).catch(() => {});
    }
  }, [id]);

  const loadLocations = async (whId, setter) => {
    if (whId) {
      const res = await getLocations(whId);
      if (res.data.success) setter(res.data.data);
    } else { setter([]); }
  };

  const addItem = () => setItems([...items, { product_id: '', quantity: '' }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index, field, value) => {
    const updated = [...items]; updated[index][field] = value; setItems(updated);
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const validItems = items.filter(i => i.product_id && i.quantity);
    if (validItems.length === 0) { setError('Add at least one item'); setLoading(false); return; }

    try {
      await createTransfer({ from_location_id: form.from_location_id, to_location_id: form.to_location_id, notes: form.notes, items: validItems, created_by: user.id });
      navigate('/transfers');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed');
    } finally { setLoading(false); }
  };

  if (isView) {
    return (
      <div>
        <div className="page-header">
          <h1>Transfer {transferData?.reference || ''}</h1>
          {transferData && <span className={`badge badge-${transferData.status}`}>{transferData.status}</span>}
        </div>
        <div className="card" style={{ maxWidth: '700px' }}>
          <div className="form-row">
            <div><strong style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>From</strong><p>{transferData?.from_warehouse} / {transferData?.from_location}</p></div>
            <div><strong style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>To</strong><p>{transferData?.to_warehouse} / {transferData?.to_location}</p></div>
          </div>
          <h3 style={{ fontSize: '0.95rem', margin: '18px 0 12px', color: 'var(--text-primary)' }}>Items</h3>
          <table className="data-table">
            <thead><tr><th>Product</th><th>SKU</th><th>Quantity</th></tr></thead>
            <tbody>
              {(transferData?.items || items).map((item, i) => (
                <tr key={i}>
                  <td>{item.product_name || '-'}</td>
                  <td>{item.sku || '-'}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="modal-actions"><button className="btn btn-outline" onClick={() => navigate('/transfers')}>Back</button></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header"><h1>New Internal Transfer</h1></div>

      <div className="card" style={{ maxWidth: '800px' }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '14px', color: 'var(--text-primary)' }}>Source</h3>
          <div className="form-row">
            <div className="form-group">
              <label>From Warehouse *</label>
              <select value={form.from_warehouse_id} onChange={(e) => { setForm({...form, from_warehouse_id: e.target.value, from_location_id: ''}); loadLocations(e.target.value, setFromLocations); }} required>
                <option value="">Select Warehouse</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>From Location *</label>
              <select value={form.from_location_id} onChange={(e) => setForm({...form, from_location_id: e.target.value})} required>
                <option value="">Select Location</option>
                {fromLocations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.type})</option>)}
              </select>
            </div>
          </div>

          <h3 style={{ fontSize: '0.95rem', marginBottom: '14px', color: 'var(--text-primary)' }}>Destination</h3>
          <div className="form-row">
            <div className="form-group">
              <label>To Warehouse *</label>
              <select value={form.to_warehouse_id} onChange={(e) => { setForm({...form, to_warehouse_id: e.target.value, to_location_id: ''}); loadLocations(e.target.value, setToLocations); }} required>
                <option value="">Select Warehouse</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>To Location *</label>
              <select value={form.to_location_id} onChange={(e) => setForm({...form, to_location_id: e.target.value})} required>
                <option value="">Select Location</option>
                {toLocations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.type})</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} rows="2"></textarea>
          </div>

          <h3 style={{ fontSize: '0.95rem', marginBottom: '14px', color: 'var(--text-primary)' }}>Products</h3>
          {items.map((item, index) => (
            <div key={index} className="form-row" style={{ alignItems: 'flex-end', marginBottom: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Product</label>
                <select value={item.product_id} onChange={(e) => updateItem(index, 'product_id', e.target.value)} required>
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Quantity</label>
                <input type="number" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} min="1" required />
              </div>
              {items.length > 1 && (
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(index)} style={{ marginBottom: '2px' }}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={addItem} style={{ marginTop: '8px' }}>+ Add Item</button>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/transfers')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Transfer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransferForm;
