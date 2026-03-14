import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      if (res.data) setCategories(res.data);
    } catch (err) {} finally { setLoading(false); }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setForm({ name: item.name, description: item.description || '' });
    } else {
      setEditItem(null);
      setForm({ name: '', description: '' });
    }
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await updateCategory({ id: editItem.id, ...form });
      } else {
        await createCategory(form);
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      setError(err.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await deleteCategory(id); loadCategories(); } catch (err) { alert('Failed to delete'); }
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Categories</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Add Category</button>
      </div>

      <div className="recent-table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Description</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No categories</td></tr>
            ) : (
              categories.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{c.name}</td>
                  <td>{c.description || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openModal(c)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editItem ? 'Edit Category' : 'Add Category'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows="3"></textarea>
              </div>
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

export default Categories;
