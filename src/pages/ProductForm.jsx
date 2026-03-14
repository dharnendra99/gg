import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, getProduct, updateProduct, getCategories, getLocations, getWarehouses } from '../services/api';

function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', sku: '', category_id: '', unit_of_measure: 'Units',
    min_stock: 0, description: '', initial_stock: 0, location_id: ''
  });
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then(res => { if (res.data.success) setCategories(res.data.data); }).catch(() => {});
    getWarehouses().then(res => { if (res.data.success) setWarehouses(res.data.data); }).catch(() => {});

    if (isEdit) {
      getProduct(id).then(res => {
        if (res.data.success) {
          const p = res.data.data;
          setForm({ name: p.name, sku: p.sku, category_id: p.category_id || '', unit_of_measure: p.unit_of_measure, min_stock: p.min_stock, description: p.description || '', initial_stock: 0, location_id: '' });
        }
      }).catch(() => {});
    }
  }, [id]);

  const handleWarehouseChange = async (warehouseId) => {
    if (warehouseId) {
      const res = await getLocations(warehouseId);
      if (res.data.success) setLocations(res.data.data);
    } else {
      setLocations([]);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await updateProduct({ id: Number(id), ...form });
      } else {
        await createProduct(form);
      }
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      </div>

      <div className="card" style={{ maxWidth: '700px' }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Steel Rods" required />
            </div>
            <div className="form-group">
              <label>SKU / Code *</label>
              <input type="text" name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. STL-ROD-001" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="category_id" value={form.category_id} onChange={handleChange}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Unit of Measure</label>
              <select name="unit_of_measure" value={form.unit_of_measure} onChange={handleChange}>
                <option value="Units">Units</option>
                <option value="Kg">Kg</option>
                <option value="Liters">Liters</option>
                <option value="Meters">Meters</option>
                <option value="Pieces">Pieces</option>
                <option value="Boxes">Boxes</option>
                <option value="Tons">Tons</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Minimum Stock (Reorder Level)</label>
            <input type="number" name="min_stock" value={form.min_stock} onChange={handleChange} min="0" />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Product description..."></textarea>
          </div>

          {!isEdit && (
            <>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '14px', color: 'var(--text-primary)' }}>Initial Stock (Optional)</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Warehouse</label>
                  <select onChange={(e) => handleWarehouseChange(e.target.value)}>
                    <option value="">Select Warehouse</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <select name="location_id" value={form.location_id} onChange={handleChange}>
                    <option value="">Select Location</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.type})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Initial Quantity</label>
                  <input type="number" name="initial_stock" value={form.initial_stock} onChange={handleChange} min="0" />
                </div>
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/products')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
