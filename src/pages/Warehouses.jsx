import { useState, useEffect } from 'react';
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, getLocations } from '../services/api';

function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', address: '' });
  const [newLocations, setNewLocations] = useState([{ name: '', type: 'shelf' }]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehouseLocations, setWarehouseLocations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => { loadWarehouses(); }, []);

  const loadWarehouses = async () => {
    try {
      const res = await getWarehouses();
      if (res.data.success) setWarehouses(res.data.data);
    } catch (err) {} finally { setLoading(false); }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setForm({ name: item.name, address: item.address || '' });
    } else {
      setEditItem(null);
      setForm({ name: '', address: '' });
      setNewLocations([{ name: '', type: 'shelf' }]);
    }
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await updateWarehouse({ id: editItem.id, ...form });
      } else {
        const validLocs = newLocations.filter(l => l.name.trim());
        await createWarehouse({ ...form, locations: validLocs });
      }
      setShowModal(false);
      loadWarehouses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this warehouse and all its locations?')) return;
    try { await deleteWarehouse(id); loadWarehouses(); setSelectedWarehouse(null); } catch (err) { alert('Failed to delete'); }
  };

  const viewLocations = async (wh) => {
    setSelectedWarehouse(wh);
    try {
      const res = await getLocations(wh.id);
      if (res.data.success) setWarehouseLocations(res.data.data);
    } catch (err) {}
  };

  const addLocationField = () => setNewLocations([...newLocations, { name: '', type: 'shelf' }]);
  const updateLocationField = (index, field, value) => {
    const updated = [...newLocations]; updated[index][field] = value; setNewLocations(updated);
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Warehouses</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add Warehouse</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedWarehouse ? '1fr 1fr' : '1fr', gap: '20px' }}>
        <div className="recent-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Address</th><th>Locations</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {warehouses.map(w => (
                <tr key={w.id} style={{ cursor: 'pointer', background: selectedWarehouse?.id === w.id ? 'var(--bg-card-hover)' : '' }} onClick={() => viewLocations(w)}>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{w.name}</td>
                  <td>{w.address || '-'}</td>
                  <td>{w.location_count}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-outline btn-sm" onClick={() => openModal(w)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(w.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedWarehouse && (
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '14px' }}>Locations in {selectedWarehouse.name}</h3>
            {warehouseLocations.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No locations</p>
            ) : (
              <table className="data-table">
                <thead><tr><th>Name</th><th>Type</th></tr></thead>
                <tbody>
                  {warehouseLocations.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{l.name}</td>
                      <td><span className="badge badge-draft" style={{ textTransform: 'capitalize' }}>{l.type}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editItem ? 'Edit Warehouse' : 'Add Warehouse'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} rows="2"></textarea>
              </div>

              {!editItem && (
                <>
                  <h3 style={{ fontSize: '0.92rem', marginBottom: '10px' }}>Initial Locations</h3>
                  {newLocations.map((loc, i) => (
                    <div key={i} className="form-row" style={{ marginBottom: '8px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <input type="text" value={loc.name} onChange={(e) => updateLocationField(i, 'name', e.target.value)} placeholder="Location name" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <select value={loc.type} onChange={(e) => updateLocationField(i, 'type', e.target.value)}>
                          <option value="shelf">Shelf</option>
                          <option value="rack">Rack</option>
                          <option value="bin">Bin</option>
                          <option value="floor">Floor</option>
                          <option value="zone">Zone</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn btn-outline btn-sm" onClick={addLocationField}>+ Add Location</button>
                </>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Warehouses;
