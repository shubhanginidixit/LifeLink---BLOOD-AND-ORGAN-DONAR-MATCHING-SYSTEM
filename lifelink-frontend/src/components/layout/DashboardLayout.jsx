/**
 * @file DashboardLayout.jsx
 * @description Core dashboard layout wrapping top navigation bar, responsive sidebar, and workspace canvas.
 * @author KrishBansod99
 * @reviewed Reviewed and documented by KrishBansod99 for code maintainability.
 */

import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../context/LocationContext';
import { useLocation as useAppLocation } from '../../context/LocationContext';
import './DashboardLayout.css';

function getNavIcon(label) {
  switch (label) {
    case 'Dashboard':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      );
    case 'Search Blood':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C12 2 20 10 20 15C20 19.4183 16.4183 23 12 23C7.58172 23 4 19.4183 4 15C4 10 12 2 12 2Z" />
        </svg>
      );
    case 'Search Organ':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case 'Contact History':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case 'Notifications':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case 'Settings':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'Help Center':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
        </svg>
      );
    default:
      return null;
  }
}

function Sidebar() {
  const { notifications } = useAuth();
  const unread = notifications.filter((n) => !n.read).length;
  const routerLocation = useLocation();
  const sidebarRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0, opacity: 0 });

  const mainItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/dashboard/search/blood', label: 'Search Blood' },
    { path: '/dashboard/search/organ', label: 'Search Organ' },
    { path: '/dashboard/calls', label: 'Contact History' },
    { path: '/dashboard/notifications', label: 'Notifications' },
  ];

  const isSettingsActive = routerLocation.pathname.startsWith('/dashboard/settings');
  const isHelpActive = routerLocation.pathname.startsWith('/dashboard/help');

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = sidebarRef.current?.querySelector('.sidebar-link-active');
      if (activeEl) {
        setIndicatorStyle({
          top: activeEl.offsetTop,
          height: activeEl.offsetHeight,
          opacity: 1
        });
      } else {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    // Schedule a small delay to handle DOM paint and layout changes correctly
    const timer = setTimeout(updateIndicator, 50);
    return () => clearTimeout(timer);
  }, [routerLocation.pathname]);

  return (
    <aside className="sidebar glass">
      <nav className="sidebar-nav" ref={sidebarRef} style={{ position: 'relative' }}>
        {/* Sliding indicator */}
        <div
          className="sidebar-indicator"
          style={{
            transform: `translateY(${indicatorStyle.top}px)`,
            height: `${indicatorStyle.height}px`,
            opacity: indicatorStyle.opacity,
          }}
        />

        <div className="sidebar-nav-main" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {mainItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              <span className="sidebar-icon">{getNavIcon(item.label)}</span>
              <span style={{ position: 'relative', zIndex: 2 }}>{item.label}</span>
              {item.label === 'Notifications' && unread > 0 && (
                <span className="sidebar-badge" style={{ position: 'relative', zIndex: 2 }}>{unread}</span>
              )}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-nav-footer" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <NavLink
            to="/dashboard/help"
            className={() =>
              `sidebar-link ${isHelpActive ? 'sidebar-link-active' : ''}`
            }
          >
            <span className="sidebar-icon">{getNavIcon('Help Center')}</span>
            <span>Help Center</span>
          </NavLink>
          <NavLink
            to="/dashboard/settings"
            className={() =>
              `sidebar-link ${isSettingsActive ? 'sidebar-link-active' : ''}`
            }
          >
            <span className="sidebar-icon">{getNavIcon('Settings')}</span>
            <span>Settings</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}

export function TopBar() {
  const { user, logout } = useAuth();
  const { location, setPincode } = useAppLocation();
  const navigate = useNavigate();
  const [showLocation, setShowLocation] = useState(false);
  const [pincodeInput, setPincodeInput] = useState(location.pincode || '');

  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    if (pincodeInput.length === 6) {
      setPincode(pincodeInput);
      setShowLocation(false);
    }
  };

  return (
    <header className="topbar glass-strong">
      <div className="topbar-left">
        <div className="topbar-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="dbLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>
            <path
              d="M16 3C16 3 26 12 26 18C26 23.5228 21.5228 28 16 28C10.4772 28 6 23.5228 6 18C6 12 16 3 16 3Z"
              fill="url(#dbLogoGrad)"
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
      </div>

      <div className="topbar-right">
        <div className="topbar-location-wrapper">
          <button className="location-btn" onClick={() => setShowLocation(!showLocation)}>
            <span className="location-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <span>{location.city}{location.pincode ? ` (${location.pincode})` : ''}</span>
          </button>
          {showLocation && (
            <div className="location-dropdown glass-strong">
              <form onSubmit={handlePincodeSubmit}>
                <label className="form-label">Change location by pincode</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: 8 }}>
                  Update Location
                </button>
              </form>
            </div>
          )}
        </div>

        <button
          className="profile-btn"
          onClick={() => navigate('/dashboard/settings')}
          title={user?.profile?.name || 'Profile'}
        >
          <div className="profile-avatar">
            {(user?.profile?.name || 'U')[0].toUpperCase()}
          </div>
        </button>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <div className="bg-gradient">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />
      </div>
      <TopBar />
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-main">{children || <Outlet />}</main>
      </div>
    </div>
  );
}
