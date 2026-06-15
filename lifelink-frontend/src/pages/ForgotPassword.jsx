/**
 * @file ForgotPassword.jsx
 * @description Forgot Password page allowing verification code check and credential recovery.
 * @author KrishBansod99
 * @reviewed Reviewed and documented by KrishBansod99 for code maintainability.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { generateOTP } from '../utils/helpers';
import './Auth.css';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('identifier');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Enter your email or phone number');
      return;
    }
    setSentOtp(generateOTP());
    setStep('otp');
    setError('');
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (otp !== sentOtp) {
      setError('Invalid OTP. Use 123456 for demo.');
      return;
    }
    setStep('password');
    setError('');
  };

  const handleReset = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const result = resetPassword({ identifier, newPassword });
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
        <h2>Reset Password</h2>
        <p className="auth-subtitle">
          {step === 'identifier' && 'Enter your email or phone to receive OTP'}
          {step === 'otp' && 'Enter the OTP sent to your number'}
          {step === 'password' && 'Create your new password'}
        </p>

        {step === 'identifier' && (
          <form onSubmit={handleSendOTP}>
            <div className="form-group">
              <label className="form-label">Email or Phone</label>
              <input
                className="form-input"
                type="text"
                placeholder="Enter email or phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
              Send OTP
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP}>
            <div className="form-group">
              <label className="form-label">OTP</label>
              <input
                className="form-input"
                type="text"
                placeholder="6-digit OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
              <p className="form-hint">Demo OTP: 123456</p>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
              Verify OTP
            </button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
              Reset Password
            </button>
          </form>
        )}

        <p className="auth-footer" style={{ marginTop: 24 }}>
          <Link to="/login">← Back to login</Link>
        </p>
      </div>
    </div>
  );
}
