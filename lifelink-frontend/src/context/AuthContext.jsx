/**
 * @file AuthContext.jsx
 * @description Context provider module managing frontend login state, authentication session, and active user profile updates.
 * @author KrishBansod99
 * @reviewed Reviewed and documented by KrishBansod99 for code maintainability.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const TOKEN_KEY = 'lifelink_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [callLogs, setCallLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [blockedIds, setBlockedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to fetch data after login/boot
  const loadUserData = useCallback(async (token) => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch profile
      const userRes = await fetch('/api/auth/me', { headers });
      if (!userRes.ok) throw new Error('Failed to load user profile');
      const userData = await userRes.json();
      setUser(userData.user);
      setBlockedIds(userData.user.blockedIds || []);

      // Fetch call logs
      const callsRes = await fetch('/api/calls', { headers });
      if (callsRes.ok) {
        const callsData = await callsRes.json();
        setCallLogs(callsData);
      }

      // Fetch notifications
      const notifsRes = await fetch('/api/notifications', { headers });
      if (notifsRes.ok) {
        const notifsData = await notifsRes.json();
        setNotifications(notifsData);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      // Clear invalid token
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check auth status on app start
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      loadUserData(token);
    } else {
      setLoading(false);
    }
  }, [loadUserData]);

  // Poll for certificate verification status changes
  useEffect(() => {
    let intervalId = null;
    const token = localStorage.getItem(TOKEN_KEY);

    if (token && user?.profile?.eligibilityStatus === 'processing') {
      intervalId = setInterval(async () => {
        try {
          const headers = { 'Authorization': `Bearer ${token}` };
          const res = await fetch('/api/auth/me', { headers });
          if (res.ok) {
            const data = await res.json();
            if (data.user?.profile?.eligibilityStatus !== 'processing') {
              setUser(data.user);
              // Fetch latest notifications to get the verification status alert
              const notifsRes = await fetch('/api/notifications', { headers });
              if (notifsRes.ok) {
                const notifsData = await notifsRes.json();
                setNotifications(notifsData);
              }
            }
          }
        } catch (err) {
          console.error('Error polling status:', err);
        }
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user?.profile?.eligibilityStatus]);

  const signUp = useCallback(async ({ email, phone, password }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || 'Registration failed' };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  }, []);

  const login = useCallback(async ({ identifier, password }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || 'Invalid credentials' };
      }
      
      localStorage.setItem(TOKEN_KEY, data.token);
      await loadUserData(data.token);
      
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  }, [loadUserData]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setCallLogs([]);
    setNotifications([]);
    setBlockedIds([]);
  }, []);

  const resetPassword = useCallback(async ({ identifier, newPassword }) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || 'Failed to reset password' };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  }, []);

  const completeProfile = useCallback(async (profileData) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Error completing profile:', err);
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  }, []);

  const deleteAccount = useCallback(async ({ password }) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return { success: false, error: 'Unauthorized' };
    try {
      const res = await fetch('/api/auth/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || 'Failed to delete account' };
      }
      logout();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  }, [logout]);

  const addCallLog = useCallback(async (call) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      const res = await fetch('/api/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(call),
      });
      if (res.ok) {
        const entry = await res.json();
        setCallLogs((prev) => [entry, ...prev]);
        return entry;
      }
    } catch (err) {
      console.error('Error adding call log:', err);
    }
    return null;
  }, []);

  const deleteCallLog = useCallback(async (id) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const res = await fetch(`/api/calls/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setCallLogs((prev) => prev.filter((c) => c._id !== id && c.id !== id));
      }
    } catch (err) {
      console.error('Error deleting call log:', err);
    }
  }, []);

  const blockDonor = useCallback(async (donorId) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const res = await fetch(`/api/auth/block/${donorId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setBlockedIds(data.blockedIds);
      }
    } catch (err) {
      console.error('Error blocking donor:', err);
    }
  }, []);

  const unblockDonor = useCallback(async (donorId) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const res = await fetch(`/api/auth/unblock/${donorId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setBlockedIds(data.blockedIds);
      }
    } catch (err) {
      console.error('Error unblocking donor:', err);
    }
  }, []);

  const addNotification = useCallback(() => {
    // Notifications are database-driven from backend updates now
  }, []);

  const markNotificationRead = useCallback(async (id) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id || n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  }, []);

  const clearNotifications = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        profileComplete: user?.profileComplete ?? false,
        signUp,
        login,
        logout,
        resetPassword,
        completeProfile,
        updateProfile,
        deleteAccount,
        callLogs,
        addCallLog,
        deleteCallLog,
        blockedIds,
        blockDonor,
        unblockDonor,
        notifications,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        loading
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
