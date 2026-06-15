/**
 * @file Login.jsx
 * @description Sign In form page checking credentials and authenticating user sessions.
 * @author KrishBansod99
 * @reviewed Reviewed and documented by KrishBansod99 for code maintainability.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login({ identifier, password });
    if (!result.success) {
      setError(result.error);
      return;
    }
    if (!result.user.profileComplete) {
      navigate('/complete-profile');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <div className="bg-gradient" />
      <div className="auth-card glass-strong">
        <div className="auth-logo">
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>
            <path
              d="M16 3C16 3 26 12 26 18C26 23.5228 21.5228 28 16 28C10.4772 28 6 23.5228 6 18C6 12 16 3 16 3Z"
              fill="url(#logoGrad)"
            />
            <path
              d="M11 18H13.5L15 13L17 21L18.5 18H21"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="logo-text">LIFELINK</span>
        </div>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to your account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email or Phone</label>
            <input
              className="form-input"
              type="text"
              placeholder="Enter email or phone number"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
            Login
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
        <p className="auth-footer" style={{ marginTop: 32 }}>
          <Link to="/" className="btn btn-glass btn-sm" style={{ width: '100%' }}>
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
