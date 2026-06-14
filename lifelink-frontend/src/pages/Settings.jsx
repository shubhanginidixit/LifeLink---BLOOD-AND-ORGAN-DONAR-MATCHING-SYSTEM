import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { BLOOD_GROUPS, ORGANS } from '../utils/helpers';
import Modal from '../components/ui/Modal';

export default function Settings() {
  const { user, updateProfile, logout, deleteAccount } = useAuth();
  const { location, setPincode } = useLocation();
  const profile = user?.profile || {};
  const navigate = useNavigate();

  const [name, setName] = useState(profile.name || '');
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup || '');
  const [donateBlood, setDonateBlood] = useState(profile.donateBlood || false);
  const [donateOrgan, setDonateOrgan] = useState(profile.donateOrgan || false);
  const [selectedOrgans, setSelectedOrgans] = useState(profile.organs || []);
  const [pincode, setPincodeInput] = useState(location.pincode || '');
  const [saved, setSaved] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [dragActive, setDragActive] = useState(false);
  const eligibilityRef = useRef(null);

  // Sync states if backend verification completes in the background
  useEffect(() => {
    setName(profile.name || '');
    setBloodGroup(profile.bloodGroup || '');
    setDonateBlood(profile.donateBlood || false);
    setDonateOrgan(profile.donateOrgan || false);
    setSelectedOrgans(profile.organs || []);
  }, [
    profile.name,
    profile.bloodGroup,
    profile.donateBlood,
    profile.donateOrgan,
    profile.organs
  ]);

  // Smooth scroll to eligibility section if hashtag exists in URL
  useEffect(() => {
    if (window.location.hash === '#eligibility' && eligibilityRef.current) {
      setTimeout(() => {
        eligibilityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 400);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid format. Please upload a PDF, PNG, JPG, or JPEG file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Please upload a file smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({
        eligibilityFile: reader.result,
        eligibilityFileName: file.name,
        eligibilityFileType: file.type,
        eligibilityStatus: 'processing'
      });
    };
    reader.readAsDataURL(file);
  };

  const openCertificate = () => {
    const fileDataUrl = profile.eligibilityFile;
    if (!fileDataUrl) return;
    try {
      const parts = fileDataUrl.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (e) {
      window.open(fileDataUrl, '_blank');
    }
  };

  const handleDeleteAccount = (e) => {
    e.preventDefault();
    setDeleteError('');
    const result = deleteAccount({ password: deletePassword });
    if (!result.success) {
      setDeleteError(result.error);
      return;
    }
    navigate('/');
  };

  const toggleOrgan = (organ) => {
    setSelectedOrgans((prev) =>
      prev.includes(organ) ? prev.filter((o) => o !== organ) : [...prev, organ]
    );
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      bloodGroup,
      donateBlood,
      donateOrgan,
      organs: selectedOrgans,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveLocation = (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setPincode(pincode);
    }
  };

  return (
    <>
      <div className="settings-page">
        <h1>Settings</h1>

        <div className="settings-section">
          <h3>Account</h3>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Email</div>
              <div className="settings-row-desc">{user?.email}</div>
            </div>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Phone</div>
              <div className="settings-row-desc">{user?.phone}</div>
            </div>
          </div>
        </div>

        <div className="settings-section" ref={eligibilityRef} id="eligibility">
          <h3>Donor Eligibility Verification</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            LIFELINK requires a doctor's certification to list you as an active blood or organ donor.
          </p>

          {/* Render state card based on profile.eligibilityStatus */}
          {(!profile.eligibilityStatus || profile.eligibilityStatus === 'none') && (
            <div className="eligibility-status-box" style={{ padding: '20px', borderRadius: 'var(--radius-sm)', background: 'rgba(15, 23, 42, 0.03)', border: '1px solid rgba(15, 23, 42, 0.08)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>No Certificate Uploaded</h4>
                  <p style={{ fontSize: '0.775rem', marginTop: '2px' }}>Please upload a certification to activate donor features.</p>
                </div>
              </div>
            </div>
          )}

          {profile.eligibilityStatus === 'processing' && (
            <div className="eligibility-status-box" style={{ padding: '20px', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#d97706' }}>
                <svg className="spinner-rotate" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1.5s linear infinite', flexShrink: 0 }}>
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Verification in Progress</h4>
                  <p style={{ fontSize: '0.775rem', marginTop: '2px', color: '#b45309' }}>Our team is reviewing your certificate: <strong>{profile.eligibilityFileName}</strong>. You can navigate and use the site normally.</p>
                </div>
              </div>
            </div>
          )}

          {profile.eligibilityStatus === 'verified' && (
            <div className="eligibility-status-box" style={{ padding: '20px', borderRadius: 'var(--radius-sm)', background: 'rgba(13, 148, 136, 0.08)', border: '1px solid rgba(13, 148, 136, 0.3)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--green-dark)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--green-dark)' }}>Verified - You can be a donor</h4>
                  <p style={{ fontSize: '0.775rem', marginTop: '2px', color: 'var(--green-dark)' }}>Your certificate is active: <strong>{profile.eligibilityFileName}</strong>. You are now live as a donor on the platform!</p>
                </div>
                <button type="button" className="btn btn-glass btn-sm" onClick={openCertificate} style={{ background: 'white', flexShrink: 0 }}>
                  Open File
                </button>
              </div>
            </div>
          )}

          {profile.eligibilityStatus === 'failed' && (
            <div className="eligibility-status-box" style={{ padding: '20px', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#dc2626' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#dc2626' }}>Failed to Verify</h4>
                  <p style={{ fontSize: '0.775rem', marginTop: '2px', color: '#b91c1c' }}>Verification failed for certificate: <strong>{profile.eligibilityFileName}</strong>. Please retry with a valid document.</p>
                </div>
                {profile.eligibilityFile && (
                  <button type="button" className="btn btn-glass btn-sm" onClick={openCertificate} style={{ background: 'white', color: '#dc2626', flexShrink: 0 }}>
                    Open File
                  </button>
                )}
              </div>
            </div>
          )}

          {/* File Upload Zone for None, Failed, or Re-upload */}
          {profile.eligibilityStatus !== 'processing' && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="form-label" style={{ margin: 0 }}>
                  {profile.eligibilityStatus === 'verified' ? 'Update Certificate' : 'Upload Doctor Certification'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>PDF, PNG, JPG or JPEG (Max 2MB)</span>
              </div>
              
              <div 
                className={`upload-zone glass ${dragActive ? 'upload-zone-active' : ''}`}
                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
                style={{
                  border: '2px dashed rgba(15, 23, 42, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '24px',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <input
                  type="file"
                  id="settings-cert-file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="settings-cert-file" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ color: 'var(--text-light)', marginBottom: '4px' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <span style={{ fontSize: '0.85rem' }}><strong>Choose certificate file</strong> to upload</span>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-light)' }}>Tip: To test failure, name the file 'fail.png'</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <form className="settings-section" onSubmit={handleSaveProfile}>
          <h3>Profile Details</h3>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <select className="form-input" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
              <option value="">Select blood group</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
          
          <p className="profile-section-title" style={{ marginTop: 24, fontSize: '0.75rem' }}>Donation Availability</p>
          <div className="toggle-row" style={{ opacity: profile.eligibilityStatus !== 'verified' ? 0.6 : 1 }}>
            <div className="toggle-row-info">
              <h4>Donate Blood {profile.eligibilityStatus !== 'verified' && <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 'normal', marginLeft: '6px' }}>(Requires verified certificate)</span>}</h4>
              <p>Available for emergency blood donation near you</p>
            </div>
            <label className="toggle" style={{ cursor: profile.eligibilityStatus !== 'verified' ? 'not-allowed' : 'pointer' }}>
              <input 
                type="checkbox" 
                checked={donateBlood} 
                onChange={(e) => setDonateBlood(e.target.checked)} 
                disabled={profile.eligibilityStatus !== 'verified'}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="toggle-row" style={{ opacity: profile.eligibilityStatus !== 'verified' ? 0.6 : 1 }}>
            <div className="toggle-row-info">
              <h4>Donate Organ {profile.eligibilityStatus !== 'verified' && <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 'normal', marginLeft: '6px' }}>(Requires verified certificate)</span>}</h4>
              <p>Available for emergency organ donation</p>
            </div>
            <label className="toggle" style={{ cursor: profile.eligibilityStatus !== 'verified' ? 'not-allowed' : 'pointer' }}>
              <input 
                type="checkbox" 
                checked={donateOrgan} 
                onChange={(e) => setDonateOrgan(e.target.checked)} 
                disabled={profile.eligibilityStatus !== 'verified'}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          {donateOrgan && profile.eligibilityStatus === 'verified' && (
            <div style={{ marginTop: 16 }}>
              <label className="form-label" style={{ marginBottom: 10, display: 'block' }}>Organs willing to donate</label>
              <div className="filter-chips">
                {ORGANS.map((organ) => (
                  <button
                    key={organ}
                    type="button"
                    className={`filter-chip ${selectedOrgans.includes(organ) ? 'filter-chip-active' : ''}`}
                    onClick={() => toggleOrgan(organ)}
                  >
                    {organ}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 20 }}>
            {saved ? 'Saved ✓' : 'Save Profile'}
          </button>
        </form>

        <form className="settings-section" onSubmit={handleSaveLocation}>
          <h3>Default Location</h3>
          <div className="form-group">
            <label className="form-label">Default Pincode</label>
            <input
              className="form-input"
              type="text"
              maxLength={6}
              placeholder="6-digit pincode"
              value={pincode}
              onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
            />
            <p className="form-hint" style={{ marginTop: 6 }}>Current active city: {location.city} {location.pincode && `(PIN: ${location.pincode})`}</p>
          </div>
          <button type="submit" className="btn btn-glass btn-sm" style={{ marginTop: 8 }}>Update Location</button>
        </form>

        <div className="settings-section">
          <h3>Privacy & Security</h3>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Masked Calling</div>
              <div className="settings-row-desc">Your phone number is never shared directly</div>
            </div>
            <span className="badge badge-green">Active</span>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Data Privacy</div>
              <div className="settings-row-desc">Personal details hidden until secure contact is authorized</div>
            </div>
            <span className="badge badge-green">Protected</span>
          </div>
        </div>

        <div className="settings-section" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h3 style={{ color: '#ef4444' }}>Danger Zone</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Permanently delete your LIFELINK account and all related data. This action is irreversible.
          </p>
          
          {!deleteConfirm ? (
            <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(true)}>
              Delete Account Permanently
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} style={{ marginTop: 12 }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#ef4444' }}>Confirm your password *</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Enter account password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                  style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}
                />
              </div>
              {deleteError && <p className="form-error" style={{ color: '#ef4444' }}>{deleteError}</p>}
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="submit" className="btn btn-danger btn-sm">
                  Confirm Permanent Deletion
                </button>
                <button type="button" className="btn btn-glass btn-sm" onClick={() => { setDeleteConfirm(false); setDeletePassword(''); setDeleteError(''); }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <button className="btn btn-glass btn-sm" onClick={() => setShowLogoutConfirm(true)} style={{ width: '100%', padding: '12px', color: 'var(--text-muted)', border: '1px solid rgba(15, 23, 42, 0.08)' }}>
          Logout from Account
        </button>
      </div>

      <Modal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} title="Confirm Logout">
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem', lineHeight: 1.5 }}>
          Are you sure you want to log out of your LIFELINK account?
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-glass btn-sm" onClick={() => setShowLogoutConfirm(false)}>
            Cancel
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { logout(); navigate('/'); }}>
            Yes, Logout
          </button>
        </div>
      </Modal>
    </>
  );
}
