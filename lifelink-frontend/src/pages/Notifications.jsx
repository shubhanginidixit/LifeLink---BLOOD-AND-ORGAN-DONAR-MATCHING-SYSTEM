import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime } from '../utils/helpers';

export default function Notifications() {
  const navigate = useNavigate();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useAuth();

  const handleNotifClick = (notif) => {
    markNotificationRead(notif.id);
    if (notif.redirect) {
      navigate(notif.redirect);
    }
  };

  return (
    <>
      <div className="notif-page">
        <h1>Notifications</h1>
        <div className="notif-actions">
          <button className="btn btn-outline btn-sm" onClick={markAllNotificationsRead}>
            Mark all read
          </button>
          <button className="btn btn-outline btn-sm" onClick={clearNotifications}>
            Clear all
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state glass">
            <div className="empty-state-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <p>No notifications yet.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notif-item ${!notif.read ? 'notif-item-unread' : ''}`}
                onClick={() => handleNotifClick(notif)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleNotifClick(notif)}
              >
                {!notif.read && <div className="notif-dot" />}
                <div className="notif-content" style={{ flex: 1 }}>
                  <h4>{notif.title}</h4>
                  <p>{notif.message}</p>
                  <div className="notif-time">
                     {formatDate(notif.timestamp)} · {formatTime(notif.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
