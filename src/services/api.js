import axios from 'axios';

const API_BASE = 'http://localhost:8081/coreinventory-api/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

export const signup = (data) => api.post('/auth/signup.php', data);
export const login = (data) => api.post('/auth/login.php', data);
export const forgotPassword = (data) => api.post('/auth/forgot-password.php', data);
export const resetPassword = (data) => api.post('/auth/reset-password.php', data);

export const getProducts = (params) => api.get('/products/list.php', { params });
export const getProduct = (id) => api.get('/products/read.php', { params: { id } });
export const createProduct = (data) => api.post('/products/create.php', data);
export const updateProduct = (data) => api.post('/products/update.php', data);
export const deleteProduct = (id) => api.post('/products/delete.php', { id });

export const getCategories = () => api.get('/categories/list.php');
export const createCategory = (data) => api.post('/categories/create.php', data);
export const updateCategory = (data) => api.post('/categories/update.php', data);
export const deleteCategory = (id) => api.post('/categories/delete.php', { id });

export const getReceipts = (params) => api.get('/receipts/list.php', { params });
export const getReceipt = (id) => api.get('/receipts/read.php', { params: { id } });
export const createReceipt = (data) => api.post('/receipts/create.php', data);
export const updateReceipt = (data) => api.post('/receipts/update.php', data);
export const validateReceipt = (data) => api.post('/receipts/validate.php', data);

export const getDeliveries = (params) => api.get('/deliveries/list.php', { params });
export const getDelivery = (id) => api.get('/deliveries/read.php', { params: { id } });
export const createDelivery = (data) => api.post('/deliveries/create.php', data);
export const updateDelivery = (data) => api.post('/deliveries/update.php', data);
export const validateDelivery = (data) => api.post('/deliveries/validate.php', data);

export const getTransfers = (params) => api.get('/transfers/list.php', { params });
export const getTransfer = (id) => api.get('/transfers/read.php', { params: { id } });
export const createTransfer = (data) => api.post('/transfers/create.php', data);
export const validateTransfer = (data) => api.post('/transfers/validate.php', data);

export const getAdjustments = (params) => api.get('/adjustments/list.php', { params });
export const getAdjustment = (id) => api.get('/adjustments/read.php', { params: { id } });
export const createAdjustment = (data) => api.post('/adjustments/create.php', data);
export const validateAdjustment = (data) => api.post('/adjustments/validate.php', data);

export const getStockLedger = (params) => api.get('/stock/ledger.php', { params });
export const getStockByProduct = (productId) => api.get('/stock/by-product.php', { params: { product_id: productId } });

export const getWarehouses = () => api.get('/warehouses/list.php');
export const createWarehouse = (data) => api.post('/warehouses/create.php', data);
export const updateWarehouse = (data) => api.post('/warehouses/update.php', data);
export const deleteWarehouse = (id) => api.post('/warehouses/delete.php', { id });
export const getLocations = (warehouseId) => api.get('/warehouses/locations.php', { params: { warehouse_id: warehouseId } });

export const getDashboardKPIs = () => api.get('/dashboard/kpis.php');
export const getRecentOperations = (params) => api.get('/dashboard/recent.php', { params });

export const getProfile = (id) => api.get('/profile/read.php', { params: { id } });
export const updateProfile = (data) => api.post('/profile/update.php', data);

export default api;
