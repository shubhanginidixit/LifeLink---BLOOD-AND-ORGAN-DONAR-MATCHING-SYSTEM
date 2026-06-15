/**
 * @file SignUp.jsx
 * @description Sign Up form page managing new user registration and validation.
 * @author KrishBansod99
 * @reviewed Reviewed and documented by KrishBansod99 for code maintainability.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePhone } from '../utils/helpers';
import './Auth.css';

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Enter a valid email address');
      return;
    }
    if (!validatePhone(phone)) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = signUp({ email, phone, password });
    if (!result.success) {
      setError(result.error);
      return;
    }
    navigate('/login');
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
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join the LIFELINK community</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              className="form-input"
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Create Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
            Sign Up
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
        <p className="auth-footer" style={{ marginTop: 24 }}>
          <Link to="/" className="btn btn-glass btn-sm" style={{ width: '100%' }}>
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
