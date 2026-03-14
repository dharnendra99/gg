import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct, getCategories, getStockByProduct } from '../services/api';
import './Products.component.css';

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockModal, setStockModal] = useState(null);
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    loadProducts();
    getCategories().then(res => { if (res.data) setCategories(res.data); }).catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => loadProducts(), 300);
    return () => clearTimeout(timeout);
  }, [search, categoryFilter]);

  const loadProducts = async () => {
    try {
      const res = await getProducts({ search, category: categoryFilter });
      if (res.data) setProducts(res.data);
    } catch (err) {
      console.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      loadProducts();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const showStockByLocation = async (product) => {
    try {
      const res = await getStockByProduct(product.id);
      if (res.data) {
        setStockData(res.data);
        setStockModal(product);
      }
    } catch (err) {
      alert('Failed to load stock data');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <div className="actions">
          <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
            + Add Product
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <input type="text" placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ minWidth: '240px' }} />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="recent-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>UoM</th>
              <th>Total Stock</th>
              <th>Min Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No products found</td></tr>
            ) : (
              products.map(p => {
                const stock = Number(p.total_stock);
                const minStock = Number(p.min_stock);
                let stockStatus = 'In Stock';
                let statusClass = 'badge-done';
                if (stock === 0) { stockStatus = 'Out of Stock'; statusClass = 'badge-canceled'; }
                else if (minStock > 0 && stock <= minStock) { stockStatus = 'Low Stock'; statusClass = 'badge-waiting'; }

                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</td>
                    <td>{p.sku}</td>
                    <td>{p.category_name || '-'}</td>
                    <td>{p.unit_of_measure}</td>
                    <td>
                      <span style={{ cursor: 'pointer', color: 'var(--primary-light)', textDecoration: 'underline' }} onClick={() => showStockByLocation(p)}>
                        {stock}
                      </span>
                    </td>
                    <td>{p.min_stock}</td>
                    <td><span className={`badge ${statusClass}`}>{stockStatus}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/products/edit/${p.id}`)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {stockModal && (
        <div className="modal-overlay" onClick={() => setStockModal(null)}>
          <div className="modal-content product-stock-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Stock by Location - {stockModal.name}</h2>
            <div className="stock-locations">
              {stockData.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No stock records</p>
              ) : (
                stockData.map(s => (
                  <div key={s.id} className="stock-location-row">
                    <div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.warehouse_name}</span>
                      <span style={{ color: 'var(--text-muted)' }}> / {s.location_name}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{s.quantity}</span>
                  </div>
                ))
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setStockModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
