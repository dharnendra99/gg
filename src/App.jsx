import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Categories from './pages/Categories';
import Receipts from './pages/Receipts';
import ReceiptForm from './pages/ReceiptForm';
import Deliveries from './pages/Deliveries';
import DeliveryForm from './pages/DeliveryForm';
import Transfers from './pages/Transfers';
import TransferForm from './pages/TransferForm';
import Adjustments from './pages/Adjustments';
import AdjustmentForm from './pages/AdjustmentForm';
import MoveHistory from './pages/MoveHistory';
import Warehouses from './pages/Warehouses';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/edit/:id" element={<ProductForm />} />
            <Route path="categories" element={<Categories />} />
            <Route path="receipts" element={<Receipts />} />
            <Route path="receipts/new" element={<ReceiptForm />} />
            <Route path="receipts/edit/:id" element={<ReceiptForm />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="deliveries/new" element={<DeliveryForm />} />
            <Route path="deliveries/edit/:id" element={<DeliveryForm />} />
            <Route path="transfers" element={<Transfers />} />
            <Route path="transfers/new" element={<TransferForm />} />
            <Route path="transfers/view/:id" element={<TransferForm />} />
            <Route path="adjustments" element={<Adjustments />} />
            <Route path="adjustments/new" element={<AdjustmentForm />} />
            <Route path="adjustments/view/:id" element={<AdjustmentForm />} />
            <Route path="move-history" element={<MoveHistory />} />
            <Route path="warehouses" element={<Warehouses />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
