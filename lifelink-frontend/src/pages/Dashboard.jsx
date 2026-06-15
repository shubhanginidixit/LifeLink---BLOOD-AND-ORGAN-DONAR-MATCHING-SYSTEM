/**
 * @file Dashboard.jsx
 * @description Main dashboard landing page showing donor statistics, recent activities, and search entries.
 * @author KrishBansod99
 * @reviewed Reviewed and documented by KrishBansod99 for code maintainability.
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, callLogs, notifications } = useAuth();

  const recentCalls = callLogs.slice(0, 3);
  const unreadNotifs = notifications.filter((n) => !n.read).length;

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
        </div>

        <div className="dashboard-analytics" style={{ marginTop: 8 }}>
          <div className="analytics-card">
            <h4>Blood Search Activity</h4>
            <div className="stat-card-value" style={{ fontSize: '1.5rem', marginBottom: 0 }}>412</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Requests matching your area today</p>
            <div className="analytics-bar">
              <div className="analytics-bar-fill" style={{ width: '68%', background: 'var(--primary)' }}></div>
            </div>
          </div>
          <div className="analytics-card">
            <h4>Organ Donor Matches</h4>
            <div className="stat-card-value" style={{ fontSize: '1.5rem', marginBottom: 0 }}>94</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Active emergency shields near you</p>
            <div className="analytics-bar">
              <div className="analytics-bar-fill" style={{ width: '42%', background: '#0d9488' }}></div>
            </div>
          </div>
          <div className="analytics-card">
            <h4>Recent Activity Log</h4>
            <div style={{ marginTop: 10 }}>
              {recentCalls.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No recent calls</p>
              ) : (
                recentCalls.map((call) => (
                  <p key={call.id} style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: call.type === 'blood' ? 'var(--primary)' : '#0d9488' }}></span>
                    {call.bloodGroup} donor · {call.city}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
