import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

const USER_KEY = 'lifelink_user';
const TOKEN_KEY = 'lifelink_token';
const CALLS_KEY = 'lifelink_calls';
const NOTIFS_KEY = 'lifelink_notifications';
const BLOCKED_KEY = 'lifelink_blocked';

function loadJSON(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, data) {
  if (data === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadJSON(USER_KEY, null));
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  const [callLogs, setCallLogs] = useState(() => loadJSON(CALLS_KEY, []));
  const [notifications, setNotifications] = useState(() => loadJSON(NOTIFS_KEY, []));
  const [blockedIds, setBlockedIds] = useState(() => loadJSON(BLOCKED_KEY, []));

  useEffect(() => {
    saveJSON(CALLS_KEY, callLogs);
  }, [callLogs]);

  useEffect(() => {
    saveJSON(NOTIFS_KEY, notifications);
  }, [notifications]);

  useEffect(() => {
    saveJSON(BLOCKED_KEY, blockedIds);
  }, [blockedIds]);

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  // Sync user to localStorage
  useEffect(() => {
    saveJSON(USER_KEY, user);
  }, [user]);

  // Fetch the MongoDB profile from the backend on load if we have a token
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // If token is invalid, clear it
        if (err.response?.status === 401) {
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // ── Auth: Sign Up ──────────────────────────────────
  const signUp = useCallback(async ({ email, phone, password }) => {
    try {
      const { data } = await api.post('/auth/register', { email, phone, password });
      const { token: _, ...userData } = data;
      setUser(userData);
      setToken(data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, []);

  // ── Auth: Login ────────────────────────────────────
  const login = useCallback(async ({ identifier, password }) => {
    try {
      const { data } = await api.post('/auth/login', { identifier, password });
      const { token: _, ...userData } = data;
      setUser(userData);
      setToken(data.token);
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, []);

  // ── Auth: Logout ───────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  // ── Auth: Reset Password ───────────────────────────
  const resetPassword = useCallback(async ({ identifier, newPassword }) => {
    try {
      // In a real app, this would hit an endpoint like /api/auth/reset-password
      // We'll just fake success here for UI purposes since it's not fully implemented on backend
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // ── Profile: Complete Profile ──────────────────────
  const completeProfile = useCallback(async (profileData) => {
    try {
      const { data } = await api.put('/auth/profile', profileData);
      setUser(data);
      return { success: true };
    } catch (err) {
      console.error('Failed to complete profile:', err);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, []);

  // ── Profile: Update Profile ────────────────────────
  const updateProfile = useCallback(async (profileData) => {
    try {
      const { data } = await api.put('/auth/profile', profileData);
      setUser(data);
      return { success: true };
    } catch (err) {
      console.error('Failed to update profile:', err);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, []);

  // ── Account: Delete Account ────────────────────────
  const deleteAccount = useCallback(async ({ password }) => {
    try {
      logout();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [logout]);

  // ── Call Logs (kept in localStorage for now) ───────
  const addCallLog = useCallback((call) => {
    const entry = {
      id: `call_${Date.now()}`,
      ...call,
      timestamp: new Date().toISOString(),
    };
    setCallLogs((prev) => [entry, ...prev]);
    return entry;
  }, []);

  const deleteCallLog = useCallback((id) => {
    setCallLogs((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // ── Blocked Donors (kept in localStorage) ──────────
  const blockDonor = useCallback((donorId) => {
    setBlockedIds((prev) => [...new Set([...prev, donorId])]);
  }, []);

  const unblockDonor = useCallback((donorId) => {
    setBlockedIds((prev) => prev.filter((id) => id !== donorId));
  }, []);

  // ── Notifications (kept in localStorage) ───────────
  const addNotification = useCallback((notif) => {
    const entry = {
      id: `n_${Date.now()}`,
      read: false,
      timestamp: new Date().toISOString(),
      ...notif,
    };
    setNotifications((prev) => [entry, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
