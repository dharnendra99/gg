import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/api';
import headerLogo from '../assets/header logo.png';
import './Auth.css';

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'staff' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setForm({ ...form, phone: value.replace(/\D/g, '').slice(0, 10) });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const allowedDomains = ['gmail.com', 'yahoo.com', 'yahoo.in', 'outlook.com', 'hotmail.com', 'live.com', 'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com', 'rediffmail.com', 'mail.com', 'yandex.com', 'gmx.com'];
  const validateEmail = (email) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    const domain = email.split('@')[1].toLowerCase();
    return allowedDomains.includes(domain);
  };
  const validatePhone = (phone) => !phone || /^[0-9]{10}$/.test(phone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(form.email)) {
      setError('Please use a valid email provider (e.g. @gmail.com, @yahoo.com, @outlook.com)');
      return;
    }
    if (form.phone && !validatePhone(form.phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);

    try {
      await signup(form);
      // Supabase signIn/signUp handles sessions slightly differently but
      // for signup we'll just redirect them to login with a success param or directly log them in.
      // Easiest path: direct them to login.
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src={headerLogo} alt="MetroInventery" className="auth-logo-img" />
          <h1>MetroInventery</h1>
        </div>

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Start managing your inventory today</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" required />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" required />
          </div>

          <div className="auth-form-row">
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit phone number" maxLength={10} pattern="[0-9]{10}" />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="staff">Warehouse Staff</option>
                <option value="manager">Inventory Manager</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Create a password" required minLength={6} />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
