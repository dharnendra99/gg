import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createReceipt, getReceipt, getProducts, getWarehouses, getLocations } from '../services/api';

function ReceiptForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ supplier: '', warehouse_id: '', location_id: '', notes: '' });
  const [items, setItems] = useState([{ product_id: '', quantity: '' }]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    getProducts({}).then(res => { if (res.data.success) setProducts(res.data.data); }).catch(() => {});
    getWarehouses().then(res => { if (res.data.success) setWarehouses(res.data.data); }).catch(() => {});

    if (isEdit) {
      getReceipt(id).then(res => {
        if (res.data.success) {
          const r = res.data.data;
          setReceiptData(r);
          setForm({ supplier: r.supplier, warehouse_id: r.warehouse_id, location_id: r.location_id, notes: r.notes || '' });
          if (r.warehouse_id) handleWarehouseChange(r.warehouse_id);
          setItems(r.items.map(i => ({ product_id: i.product_id, quantity: i.expected_qty, received_qty: i.received_qty })));
        }
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

  const addItem = () => setItems([...items, { product_id: '', quantity: '' }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validItems = items.filter(i => i.product_id && i.quantity);
    if (validItems.length === 0) { setError('Add at least one item'); setLoading(false); return; }

    try {
      await createReceipt({ ...form, items: validItems, created_by: user.id });
      navigate('/receipts');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create receipt');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? `Receipt ${receiptData?.reference || ''}` : 'New Receipt'}</h1>
        {receiptData && <span className={`badge badge-${receiptData.status}`}>{receiptData.status}</span>}
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Supplier *</label>
              <input type="text" value={form.supplier} onChange={(e) => setForm({...form, supplier: e.target.value})} placeholder="Vendor name" required disabled={isEdit && receiptData?.status === 'done'} />
            </div>
            <div className="form-group">
              <label>Warehouse *</label>
              <select value={form.warehouse_id} onChange={(e) => handleWarehouseChange(e.target.value)} required disabled={isEdit}>
                <option value="">Select Warehouse</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Location *</label>
              <select value={form.location_id} onChange={(e) => setForm({...form, location_id: e.target.value})} required disabled={isEdit}>
                <option value="">Select Location</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.type})</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} rows="2" disabled={isEdit && receiptData?.status === 'done'}></textarea>
          </div>

          <h3 style={{ fontSize: '0.95rem', marginBottom: '14px', color: 'var(--text-primary)' }}>Products</h3>

          {items.map((item, index) => (
            <div key={index} className="form-row" style={{ alignItems: 'flex-end', marginBottom: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Product</label>
                <select value={item.product_id} onChange={(e) => updateItem(index, 'product_id', e.target.value)} required disabled={isEdit}>
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Quantity</label>
                <input type="number" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} min="1" required disabled={isEdit} />
              </div>
              {!isEdit && items.length > 1 && (
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(index)} style={{ marginBottom: '2px' }}>✕</button>
              )}
            </div>
          ))}

          {!isEdit && (
            <button type="button" className="btn btn-outline btn-sm" onClick={addItem} style={{ marginTop: '8px' }}>+ Add Item</button>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/receipts')}>Back</button>
            {!isEdit && <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Receipt'}</button>}
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReceiptForm;
