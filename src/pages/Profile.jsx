import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';
import { useAuth } from '../AuthContext';

function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', current_password: '', new_password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { user: authUser } = useAuth();
  const storedUser = authUser || {};

  useEffect(() => {
    loadProfile();
  }, [authUser]);

  const loadProfile = async () => {
    if (!storedUser?.id) return;
    try {
      const res = await getProfile(storedUser.id);
      if (res.data) {
        setUser(res.data);
        setForm(f => ({ ...f, name: res.data.name, phone: res.data.phone || '' }));
      }
    } catch (err) {} finally { setLoading(false); }
  };

  const validatePhone = (phone) => !phone || /^[0-9]{10}$/.test(phone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');

    if (form.phone && !validatePhone(form.phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setSaving(true);

    try {
      const payload = { id: storedUser.id, name: form.name, phone: form.phone };
      if (form.new_password) {
        payload.current_password = form.current_password;
        payload.new_password = form.new_password;
      }
      const res = await updateProfile(payload);
      if (res.data) {
        setMessage('Profile updated successfully');
        setForm(f => ({ ...f, current_password: '', new_password: '' }));
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
      </div>

      <div className="card" style={{ maxWidth: '550px' }}>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: '700', color: 'white' }}>
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{user?.name}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role} · Joined {new Date(user?.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} placeholder="10-digit phone number" maxLength={10} />
          </div>

          <h3 style={{ fontSize: '0.95rem', margin: '24px 0 14px', color: 'var(--text-primary)' }}>Change Password (Optional)</h3>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" value={form.current_password} onChange={(e) => setForm({...form, current_password: e.target.value})} placeholder="Enter current password" />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" value={form.new_password} onChange={(e) => setForm({...form, new_password: e.target.value})} placeholder="Enter new password" />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
