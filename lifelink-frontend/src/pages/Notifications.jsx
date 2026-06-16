import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { formatDate, formatTime } from '../utils/helpers';

export default function Notifications() {
  const {
    notifications,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handler = (notif) => {
      addNotification(notif);
    };
    socket.on('new-notification', handler);
    return () => socket.off('new-notification', handler);
  }, [socket, addNotification]);

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
                key={notif._id}
                className={`notif-item ${!notif.read ? 'notif-item-unread' : ''}`}
                onClick={() => markNotificationRead(notif._id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && markNotificationRead(notif._id)}
              >
                {!notif.read && <div className="notif-dot" />}
                <div className="notif-content" style={{ flex: 1 }}>
                  <h4>{notif.title}</h4>
                  <p>{notif.message}</p>
                  <div className="notif-time">
                     {formatDate(notif.createdAt)} · {formatTime(notif.createdAt)}
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
