/**
 * @file ContactModal.jsx
 * @description Re-usable UI overlay contact details popup modal supporting secure masked calls.
 * @author KrishBansod99
 * @reviewed Reviewed and documented by KrishBansod99 for code maintainability.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { generateOTP, validatePhone } from '../../utils/helpers';
import Modal from './Modal';

export default function ContactModal({ isOpen, onClose, donor, type }) {
  const navigate = useNavigate();
  const { user, addCallLog, addNotification, blockedIds } = useAuth();
  const [step, setStep] = useState(user ? 'confirm' : 'phone');
  const [phone, setPhone] = useState(user?.phone || '');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [error, setError] = useState('');
  const [calling, setCalling] = useState(false);

  const reset = () => {
    setStep(user ? 'confirm' : 'phone');
    setPhone(user?.phone || '');
    setOtp('');
    setSentOtp('');
    setError('');
    setCalling(false);
  };

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, user]);

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!donor) return null;

  const donorId = donor.id || donor._id;

  if (blockedIds.includes(donorId)) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Contact Unavailable">
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
          This donor has been blocked and cannot be contacted.
        </p>
        <button className="btn btn-glass" onClick={handleClose}>Close</button>
      </Modal>
    );
  }

  const handleSendOTP = () => {
    if (!validatePhone(phone)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    const code = generateOTP();
    setSentOtp(code);
    setStep('otp');
    setError('');
  };

  const handleConnect = () => {
    setStep('calling');
    setCalling(true);
    setError('');

    setTimeout(() => {
      addCallLog({
        donorId: donorId,
        type,
        direction: 'outgoing',
        bloodGroup: donor.bloodGroup,
        age: donor.age,
        gender: donor.gender,
        city: donor.city,
        status: 'connected',
      });
      addNotification({
        title: 'Masked Call Connected',
        message: `Your secure call with a ${donor.bloodGroup} donor (${donor.age}y, ${donor.gender}) was connected via masked number.`,
        type: 'call',
      });
      setCalling(false);
      setStep('done');
    }, 2500);
  };

  const handleVerifyOTP = () => {
    if (otp !== sentOtp) {
      setError('Invalid OTP. Use 123456 for demo.');
      return;
    }
    handleConnect();
  };

  const handleCallAgain = () => {
    setStep('calling');
    setCalling(true);
    setTimeout(() => {
      addCallLog({
        donorId: donorId,
        type,
        direction: 'outgoing',
        bloodGroup: donor.bloodGroup,
        age: donor.age,
        gender: donor.gender,
        city: donor.city,
        status: 'connected',
      });
      addNotification({
        title: 'Masked Call Connected',
        message: `Your secure call with a ${donor.bloodGroup} donor (${donor.age}y, ${donor.gender}) was connected via masked number.`,
        type: 'call',
      });
      setCalling(false);
      setStep('done');
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Secure Contact">
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Your identity is protected. Both numbers are masked during the call.
        </p>
      </div>

      {step === 'confirm' && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📞</div>
          <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 8 }}>
            Connect with {donor.bloodGroup} Donor
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 24 }}>
            Would you like to initiate a secure masked call to this donor in {donor.city}? Your number will remain hidden.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-glass" style={{ flex: 1 }} onClick={handleClose}>
              Cancel
            </button>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => {
              handleClose();
              navigate(`/dashboard/chat/${donorId}`);
            }}>
              Send Message
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleConnect}>
              Call Now
            </button>
          </div>
        </div>
      )}

      {step === 'phone' && (
        <>
          <div className="form-group">
            <label className="form-label">Your Phone Number</label>
            <input
              className="form-input"
              type="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handleSendOTP}>
            Send OTP
          </button>
        </>
      )}

      {step === 'otp' && (
        <>
          <div className="form-group">
            <label className="form-label">Enter OTP sent to {phone}</label>
            <input
              className="form-input"
              type="text"
              placeholder="6-digit OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            <p className="form-hint">Demo OTP: 123456</p>
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handleVerifyOTP}>
            Verify & Connect
          </button>
          <button className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: 8 }} onClick={() => setStep('phone')}>
            Change Number
          </button>
        </>
      )}

      {step === 'calling' && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div className="calling-pulse" />
          <p style={{ marginTop: 16, fontWeight: 500 }}>
            {calling ? 'Connecting via masked number...' : 'Connected!'}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Your number and the donor&apos;s number are both protected
          </p>
        </div>
      )}

      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✓</div>
          <p style={{ fontWeight: 500, color: 'var(--green-dark)' }}>Call Connected Successfully</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 8 }}>
            This contact has been saved to your Contact History
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button className="btn btn-glass" style={{ flex: 1 }} onClick={handleCallAgain}>
              Call Again
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleClose}>
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
