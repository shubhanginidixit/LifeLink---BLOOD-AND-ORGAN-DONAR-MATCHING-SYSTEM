import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BLOOD_GROUPS, ORGANS, calculateAge } from '../utils/helpers';
import './Auth.css';

export default function CompleteProfile() {
  const { completeProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [smoker, setSmoker] = useState(false);
  const [alcoholic, setAlcoholic] = useState(false);
  const [illnesses, setIllnesses] = useState('');
  const [donateBlood, setDonateBlood] = useState(false);
  const [donateOrgan, setDonateOrgan] = useState(false);
  const [selectedOrgans, setSelectedOrgans] = useState([]);
  const [error, setError] = useState('');

  const [eligibilityFile, setEligibilityFile] = useState('');
  const [eligibilityFileName, setEligibilityFileName] = useState('');
  const [eligibilityFileType, setEligibilityFileType] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const age = calculateAge(dob);

  const toggleOrgan = (organ) => {
    setSelectedOrgans((prev) =>
      prev.includes(organ) ? prev.filter((o) => o !== organ) : [...prev, organ]
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file) => {
    setUploadError('');
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid format. Please upload a PDF, PNG, JPG, or JPEG file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File is too large. Please upload a file smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setEligibilityFile(reader.result);
      setEligibilityFileName(file.name);
      setEligibilityFileType(file.type);
    };
    reader.onerror = () => {
      setUploadError('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setEligibilityFile('');
    setEligibilityFileName('');
    setEligibilityFileType('');
    setUploadError('');
    setDonateBlood(false);
    setDonateOrgan(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!dob) {
      setError('Date of birth is required');
      return;
    }
    if (!bloodGroup) {
      setError('Blood group is required');
      return;
    }

    completeProfile({
      name: name.trim(),
      dob,
      age,
      bloodGroup,
      gender: gender || 'Not specified',
      weight: weight || 'Not specified',
      smoker,
      alcoholic,
      illnesses: illnesses || 'None',
      donateBlood: eligibilityFileName ? donateBlood : false,
      donateOrgan: eligibilityFileName ? donateOrgan : false,
      organs: eligibilityFileName ? selectedOrgans : [],
      eligibilityFile,
      eligibilityFileName,
      eligibilityFileType,
      eligibilityStatus: eligibilityFileName ? 'processing' : 'none',
    });
    navigate('/dashboard');
  };

  return (
    <div className="profile-page">
      <div className="bg-gradient" />
      <div className="profile-card glass-strong">
        <h2>Complete Your Profile</h2>
        <p className="auth-subtitle">
          Help others find you in emergencies. Required fields are marked with *.
        </p>

        <form onSubmit={handleSubmit}>
          <p className="profile-section-title">Personal Information *</p>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              className="form-input"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input
                className="form-input"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                className="form-input"
                type="text"
                value={age !== null ? `${age} years` : ''}
                disabled
                placeholder="Auto-calculated"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Blood Group *</label>
              <select
                className="form-input"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-input"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <p className="profile-section-title">Medical Details (Optional)</p>
          <div className="form-group">
            <label className="form-label">Weight</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. 70 kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="toggle-row">
              <div className="toggle-row-info">
                <h4>Smoker</h4>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={smoker} onChange={(e) => setSmoker(e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <div className="toggle-row-info">
                <h4>Alcoholic</h4>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={alcoholic} onChange={(e) => setAlcoholic(e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Existing Illnesses / Notes</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="Any medical conditions or notes"
              value={illnesses}
              onChange={(e) => setIllnesses(e.target.value)}
            />
          </div>

          <p className="profile-section-title">Eligibility Verification</p>
          <div className="form-group">
            <label className="form-label">Doctor Certification (Optional)</label>
            <p className="form-hint" style={{ marginBottom: 12 }}>
              Upload a doctor's certificate stating you are fit to donate blood or organs. Without it, you cannot set yourself active as a donor.
            </p>
            
            <div 
              className={`upload-zone glass ${dragActive ? 'upload-zone-active' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
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
                id="cert-file-input"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
              {!eligibilityFileName ? (
                <label htmlFor="cert-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ color: 'var(--text-light)', marginBottom: '4px' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}><strong>Choose a file</strong> or drag it here</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>PDF, PNG, JPG or JPEG (Max 2MB)</span>
                </label>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', gap: '12px', width: '100%' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: eligibilityFileType === 'application/pdf' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(13, 148, 136, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {eligibilityFileType === 'application/pdf' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--black)', wordBreak: 'break-all', textAlign: 'left' }}>{eligibilityFileName}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--green-dark)', background: 'var(--green-light)', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', fontWeight: 600 }}>Ready to upload</span>
                  </div>
                  <button type="button" onClick={removeFile} style={{
                    padding: '8px',
                    borderRadius: '50%',
                    color: 'var(--text-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.02)',
                    transition: 'var(--transition)'
                  }} onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-light)'} title="Remove File">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            {uploadError && <p className="form-error" style={{ marginTop: 8 }}>{uploadError}</p>}
          </div>
 
          <p className="profile-section-title">Donation Preferences</p>
          <div className="toggle-row" style={{ opacity: !eligibilityFileName ? 0.6 : 1 }}>
            <div className="toggle-row-info">
              <h4>Donate Blood in Emergency {!eligibilityFileName && <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 'normal', marginLeft: '6px' }}>(Requires medical certificate)</span>}</h4>
              <p>Allow others to find you when blood is urgently needed nearby</p>
            </div>
            <label className="toggle" style={{ cursor: !eligibilityFileName ? 'not-allowed' : 'pointer' }}>
              <input 
                type="checkbox" 
                checked={donateBlood} 
                onChange={(e) => setDonateBlood(e.target.checked)} 
                disabled={!eligibilityFileName}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="toggle-row" style={{ opacity: !eligibilityFileName ? 0.6 : 1 }}>
            <div className="toggle-row-info">
              <h4>Donate Organ in Emergency {!eligibilityFileName && <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 'normal', marginLeft: '6px' }}>(Requires medical certificate)</span>}</h4>
              <p>Register as an organ donor for critical situations</p>
            </div>
            <label className="toggle" style={{ cursor: !eligibilityFileName ? 'not-allowed' : 'pointer' }}>
              <input 
                type="checkbox" 
                checked={donateOrgan} 
                onChange={(e) => setDonateOrgan(e.target.checked)} 
                disabled={!eligibilityFileName}
              />
              <span className="toggle-slider" />
            </label>
          </div>
 
          {donateOrgan && eligibilityFileName && (
            <div className="form-group" style={{ marginTop: 12 }}>
              <label className="form-label">Organs willing to donate</label>
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
 
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}>
            Save & Continue to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
