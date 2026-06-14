import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'lifelink_auth';
const USERS_KEY = 'lifelink_users';
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
  localStorage.setItem(key, JSON.stringify(data));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadJSON(STORAGE_KEY, null));
  const [callLogs, setCallLogs] = useState(() => loadJSON(CALLS_KEY, []));
  const [notifications, setNotifications] = useState(() => loadJSON(NOTIFS_KEY, []));
  const [blockedIds, setBlockedIds] = useState(() => loadJSON(BLOCKED_KEY, []));
  const timerRef = useRef(null);

  useEffect(() => {
    if (user) saveJSON(STORAGE_KEY, user);
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  useEffect(() => {
    saveJSON(CALLS_KEY, callLogs);
  }, [callLogs]);

  useEffect(() => {
    saveJSON(NOTIFS_KEY, notifications);
  }, [notifications]);

  useEffect(() => {
    saveJSON(BLOCKED_KEY, blockedIds);
  }, [blockedIds]);

  useEffect(() => {
    const hasProcessing = user?.profile?.eligibilityStatus === 'processing';
    if (hasProcessing && !timerRef.current) {
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const users = loadJSON(USERS_KEY, []);
        const currentUser = loadJSON(STORAGE_KEY, null);
        if (!currentUser) return;
        const idx = users.findIndex((u) => u.id === currentUser.id);
        if (idx !== -1) {
          const fileName = currentUser.profile?.eligibilityFileName || '';
          const isSuccess = !/fail|invalid/i.test(fileName);
          const nextStatus = isSuccess ? 'verified' : 'failed';
          
          const updatedProfile = {
            ...users[idx].profile,
            eligibilityStatus: nextStatus,
          };
          
          // If failed, automatically turn off donor switches
          if (!isSuccess) {
            updatedProfile.donateBlood = false;
            updatedProfile.donateOrgan = false;
          }
          
          users[idx].profile = updatedProfile;
          
          saveJSON(USERS_KEY, users);
          setUser({ ...users[idx] });
          
          // Generate notification
          const notif = {
            id: `n_${Date.now()}`,
            read: false,
            timestamp: new Date().toISOString(),
            title: isSuccess ? 'Eligibility Verified' : 'Verification Failed',
            message: isSuccess 
              ? 'Your medical eligibility certificate has been verified. You can now toggle donor availability.'
              : 'Medical certificate verification failed. Click here to re-upload.',
            type: isSuccess ? 'success' : 'error',
            redirect: '/dashboard/settings#eligibility'
          };
          
          setNotifications((prev) => {
            const updated = [notif, ...prev];
            saveJSON(NOTIFS_KEY, updated);
            return updated;
          });
        }
      }, 7000);
    }
    
    return () => {
      if (!hasProcessing && timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [user?.profile?.eligibilityStatus, user?.profile?.eligibilityFileName, user?.id, notifications]);

  const getUsers = () => loadJSON(USERS_KEY, []);

  const signUp = useCallback(({ email, phone, password }) => {
    const users = getUsers();
    if (users.find((u) => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    if (users.find((u) => u.phone === phone)) {
      return { success: false, error: 'Phone number already registered' };
    }
    const newUser = {
      id: `u_${Date.now()}`,
      email,
      phone,
      password,
      profileComplete: false,
      profile: {},
      createdAt: new Date().toISOString(),
    };
    saveJSON(USERS_KEY, [...users, newUser]);
    return { success: true };
  }, []);

  const login = useCallback(({ identifier, password }) => {
    const users = getUsers();
    const found = users.find(
      (u) =>
        (u.email === identifier || u.phone === identifier) &&
        u.password === password
    );
    if (!found) return { success: false, error: 'Invalid credentials' };
    setUser(found);
    return { success: true, user: found };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const resetPassword = useCallback(({ identifier, newPassword }) => {
    const users = getUsers();
    const idx = users.findIndex(
      (u) => u.email === identifier || u.phone === identifier
    );
    if (idx === -1) return { success: false, error: 'Account not found' };
    users[idx].password = newPassword;
    saveJSON(USERS_KEY, users);
    return { success: true };
  }, []);

  const completeProfile = useCallback((profileData) => {
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx === -1) return;
    users[idx].profile = profileData;
    users[idx].profileComplete = true;
    saveJSON(USERS_KEY, users);
    setUser({ ...users[idx] });
  }, [user]);

  const updateProfile = useCallback((profileData) => {
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx === -1) return;
    users[idx].profile = { ...users[idx].profile, ...profileData };
    saveJSON(USERS_KEY, users);
    setUser({ ...users[idx] });
  }, [user]);

  const deleteAccount = useCallback(({ password }) => {
    if (user.password !== password) {
      return { success: false, error: 'Incorrect password' };
    }
    const users = getUsers();
    const filtered = users.filter((u) => u.id !== user.id);
    saveJSON(USERS_KEY, filtered);
    setUser(null);
    return { success: true };
  }, [user]);

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

  const blockDonor = useCallback((donorId) => {
    setBlockedIds((prev) => [...new Set([...prev, donorId])]);
  }, []);

  const unblockDonor = useCallback((donorId) => {
    setBlockedIds((prev) => prev.filter((id) => id !== donorId));
  }, []);

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
