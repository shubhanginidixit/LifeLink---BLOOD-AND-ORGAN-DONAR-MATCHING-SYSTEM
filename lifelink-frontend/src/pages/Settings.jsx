import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError('');
    const result = await deleteAccount({ password: deletePassword });
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
          <div className="toggle-row">
            <div className="toggle-row-info">
              <h4>Donate Blood</h4>
              <p>Available for emergency blood donation near you</p>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={donateBlood} onChange={(e) => setDonateBlood(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="toggle-row">
            <div className="toggle-row-info">
              <h4>Donate Organ</h4>
              <p>Available for emergency organ donation</p>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={donateOrgan} onChange={(e) => setDonateOrgan(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>
          {donateOrgan && (
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
