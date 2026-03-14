import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../services/api';
import './Auth.css';

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: otp+new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [displayOtp, setDisplayOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const allowedDomains = ['gmail.com', 'yahoo.com', 'yahoo.in', 'outlook.com', 'hotmail.com', 'live.com', 'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com', 'rediffmail.com', 'mail.com', 'yandex.com', 'gmx.com'];
  const validateEmail = (email) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    const domain = email.split('@')[1].toLowerCase();
    return allowedDomains.includes(domain);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please use a valid email provider (e.g. @gmail.com, @yahoo.com, @outlook.com)');
      return;
    }

    setLoading(true);

    try {
      const res = await forgotPassword({ email });
      if (res.data.success) {
        setDisplayOtp(res.data.otp); // For testing - displayed on screen
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await resetPassword({ email, otp, new_password: newPassword });
      if (res.data.success) {
        setSuccess('Password reset successful! You can now sign in.');
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">CI</div>
          <h1>CoreInventory</h1>
        </div>

        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">
          {step === 1 && 'Enter your email to receive a reset code'}
          {step === 2 && 'Enter the OTP code and your new password'}
          {step === 3 && 'Your password has been reset'}
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {step === 1 && (
          <form onSubmit={handleRequestOtp}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <>
            {displayOtp && (
              <div className="otp-section">
                <p>Your OTP code (for testing):</p>
                <div className="otp-display">{displayOtp}</div>
                <p>This code expires in 10 minutes</p>
              </div>
            )}

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>OTP Code</label>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" required maxLength={6} />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" required minLength={6} />
              </div>
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        <div className="auth-link">
          <Link to="/login">← Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
