import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { BLOOD_GROUPS, ORGANS } from '../utils/helpers';
import Modal from '../components/ui/Modal';
import api from '../api/axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, callLogs, notifications, addNotification } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState({ totalDonors: 0, activeRequests: 0, successfulMatches: 0, registeredHospitals: 0 });
  const [myRequests, setMyRequests] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState('blood');
  const [bloodGroup, setBloodGroup] = useState('');
  const [organType, setOrganType] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

  const recentCalls = callLogs.slice(0, 3);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {});
    api.get('/requests/mine')
      .then(({ data }) => setMyRequests(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (notif) => addNotification(notif);
    socket.on('new-notification', handler);
    return () => socket.off('new-notification', handler);
  }, [socket, addNotification]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setRequestError('');
    setRequestSuccess(false);

    if (requestType === 'blood' && !bloodGroup) {
      setRequestError('Select a blood group');
      return;
    }
    if (requestType === 'organ' && !organType) {
      setRequestError('Select an organ type');
      return;
    }

    try {
      await api.post('/requests/donor', {
        requestType,
        bloodGroup: requestType === 'blood' ? bloodGroup : undefined,
        organType: requestType === 'organ' ? organType : undefined,
        isEmergency,
        urgencyLevel: isEmergency ? 'critical' : 'medium',
      });
      setRequestSuccess(true);
      setBloodGroup('');
      setOrganType('');
      setIsEmergency(false);
      api.get('/requests/mine').then(({ data }) => setMyRequests(data)).catch(() => {});
      setTimeout(() => {
        setShowRequestModal(false);
        setRequestSuccess(false);
      }, 1500);
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Failed to create request');
    }
  };

  return (
    <>
      <div className="dashboard-home">
        <div className="dashboard-stats">
          <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div className="stat-card-value">{callLogs.length}</div>
            <div className="stat-card-label">Total Calls</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div className="stat-card-value">{unreadNotifs}</div>
            <div className="stat-card-label">Notifications</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
            <div className="stat-card-value">{user?.profile?.bloodGroup || '—'}</div>
            <div className="stat-card-label">Your Blood Group</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="stat-card-value">
              {user?.profile?.donateBlood ? 'Active' : 'Off'}
            </div>
            <div className="stat-card-label">Donor Profile</div>
          </div>
        </div>

        <div className="dashboard-actions">
          <button
            className="action-card action-card-blood"
            onClick={() => navigate('/dashboard/search/blood')}
          >
            <div className="action-card-img-wrapper">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="dropGrad" cx="50%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#ff4d6d" />
                    <stop offset="70%" stopColor="#c9184a" />
                    <stop offset="100%" stopColor="#800f2f" />
                  </radialGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#ff4d6d" floodOpacity="0.4"/>
                  </filter>
                </defs>
                <path
                  d="M32 6C32 6 52 26 52 39C52 49.5 43 58 32 58C21 58 12 49.5 12 39C12 26 32 6 32 6Z"
                  fill="url(#dropGrad)"
                  filter="url(#glow)"
                />
                <path
                  d="M32 14C32 14 46 29 46 39C46 46.5 39.5 52.5 32 52.5C24.5 52.5 18 46.5 18 39C18 29 32 14 32 14Z"
                  fill="white"
                  fillOpacity="0.12"
                />
                <circle cx="26" cy="30" r="4" fill="white" fillOpacity="0.4" filter="blur(1px)" />
              </svg>
            </div>
            <h3>Search Blood</h3>
            <p>Connect instantly with nearby donors of any blood group</p>
            <span className="btn btn-outline btn-sm" style={{ marginTop: 'auto', border: '1px solid rgba(225, 29, 72, 0.25)', color: 'var(--primary)' }}>Search Blood Groups &rarr;</span>
          </button>

          <button
            className="action-card action-card-organ"
            onClick={() => navigate('/dashboard/search/organ')}
          >
            <div className="action-card-img-wrapper">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2dd4bf" />
                    <stop offset="50%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#115e59" />
                  </linearGradient>
                  <filter id="organGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0d9488" floodOpacity="0.35"/>
                  </filter>
                </defs>
                <path
                  d="M32 8L16 15V32C16 43.5 22.8 52.5 32 56C41.2 52.5 48 43.5 48 32V15L32 8Z"
                  fill="url(#shieldGrad)"
                  filter="url(#organGlow)"
                />
                <path
                  d="M32 14L20 19.2V32C20 40.8 25.1 48 32 51C38.9 48 44 40.8 44 32V19.2L32 14Z"
                  fill="white"
                  fillOpacity="0.1"
                />
                <path
                  d="M26 31C26 27.68 28.68 25 32 25C35.32 25 38 27.68 38 31C38 35 32 40 32 40C32 40 26 35 26 31Z"
                  fill="white"
                  fillOpacity="0.85"
                />
                <circle cx="32" cy="31" r="2.5" fill="#0d9488" />
              </svg>
            </div>
            <h3>Search Organ</h3>
            <p>Locate registered emergency kidney, liver, or cornea donors</p>
            <span className="btn btn-outline btn-sm" style={{ marginTop: 'auto', border: '1px solid rgba(13, 148, 136, 0.25)', color: '#0d9488' }}>Search Organ Donors &rarr;</span>
          </button>

          <button
            className="action-card"
            style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)' }}
            onClick={() => setShowRequestModal(true)}
          >
            <div className="action-card-img-wrapper">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="requestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
                <circle cx="32" cy="32" r="26" fill="url(#requestGrad)" />
                <line x1="32" y1="20" x2="32" y2="44" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <line x1="20" y1="32" x2="44" y2="32" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <h3>Create Request</h3>
            <p>Post a blood or organ request and notify matching donors</p>
            <span className="btn btn-outline btn-sm" style={{ marginTop: 'auto', border: '1px solid rgba(245, 158, 11, 0.25)', color: '#d97706' }}>Create New Request &rarr;</span>
          </button>
        </div>

        <div className="dashboard-analytics" style={{ marginTop: 8 }}>
          <div className="analytics-card">
            <h4>Blood Search Activity</h4>
            <div className="stat-card-value" style={{ fontSize: '1.5rem', marginBottom: 0 }}>{stats.activeRequests}</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Active requests in your area</p>
            <div className="analytics-bar">
              <div className="analytics-bar-fill" style={{ width: `${Math.min(stats.activeRequests * 2, 100)}%`, background: 'var(--primary)' }}></div>
            </div>
          </div>
          <div className="analytics-card">
            <h4>Organ Donor Matches</h4>
            <div className="stat-card-value" style={{ fontSize: '1.5rem', marginBottom: 0 }}>{stats.successfulMatches}</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Successful matches so far</p>
            <div className="analytics-bar">
              <div className="analytics-bar-fill" style={{ width: `${Math.min(stats.successfulMatches * 5, 100)}%`, background: '#0d9488' }}></div>
            </div>
          </div>
          <div className="analytics-card">
            <h4>Recent Activity Log</h4>
            <div style={{ marginTop: 10 }}>
              {recentCalls.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No recent calls</p>
              ) : (
                recentCalls.map((call) => (
                  <p key={call._id} style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: call.type === 'blood' ? 'var(--primary)' : '#0d9488' }}></span>
                    {call.bloodGroup} donor · {call.city}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>

        {myRequests.length > 0 && (
          <div className="my-requests" style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>My Requests</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myRequests.map((req) => (
                <div key={req._id} className="glass" style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: req.status === 'Matched' ? '#10b981' : req.status === 'Fulfilled' ? '#3b82f6' : req.isEmergency ? '#ef4444' : '#f59e0b',
                      flexShrink: 0,
                    }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {req.requestType === 'blood' ? req.bloodGroup : req.organType} {req.requestType === 'blood' ? 'Blood' : 'Organ'} Request
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {req.city} &middot; {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 20,
                    background: req.status === 'Matched' ? 'rgba(16, 185, 129, 0.1)' : req.status === 'Fulfilled' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: req.status === 'Matched' ? '#059669' : req.status === 'Fulfilled' ? '#2563eb' : '#d97706',
                    whiteSpace: 'nowrap',
                  }}>
                    {req.status}{req.isEmergency ? ' · Emergency' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Create Donation Request">
        {requestSuccess ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✓</div>
            <p style={{ fontWeight: 500, color: 'var(--green-dark)' }}>Request Created Successfully</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>Matching donors have been notified.</p>
          </div>
        ) : (
          <form onSubmit={handleCreateRequest}>
            <div className="form-group">
              <label className="form-label">Request Type</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className={`btn btn-sm ${requestType === 'blood' ? 'btn-primary' : 'btn-glass'}`}
                  onClick={() => setRequestType('blood')}
                  style={{ flex: 1 }}
                >
                  Blood
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${requestType === 'organ' ? 'btn-primary' : 'btn-glass'}`}
                  onClick={() => setRequestType('organ')}
                  style={{ flex: 1 }}
                >
                  Organ
                </button>
              </div>
            </div>

            {requestType === 'blood' && (
              <div className="form-group">
                <label className="form-label">Blood Group *</label>
                <select className="form-input" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} required>
                  <option value="">Select blood group</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            )}

            {requestType === 'organ' && (
              <div className="form-group">
                <label className="form-label">Organ Type *</label>
                <select className="form-input" value={organType} onChange={(e) => setOrganType(e.target.value)} required>
                  <option value="">Select organ</option>
                  {ORGANS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="toggle-row" style={{ marginBottom: 16 }}>
              <div className="toggle-row-info">
                <h4>Emergency Request</h4>
                <p>Notify all matching donors immediately</p>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={isEmergency} onChange={(e) => setIsEmergency(e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>

            {requestError && <p className="form-error">{requestError}</p>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
              Post Request
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}