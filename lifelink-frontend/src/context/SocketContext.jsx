import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setConnected(false);
      setOnlineUsers([]);
      return;
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'https://blood-and-organ-donar-matching-system.onrender.com';

    const s = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });

    s.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    s.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
    });

    s.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setConnected(false);
    });

    s.on('reconnect', (attempt) => {
      console.log('Socket reconnected after', attempt, 'attempts');
      setConnected(true);
    });

    s.on('reconnect_attempt', (attempt) => {
      console.log('Socket reconnect attempt:', attempt);
    });

    s.on('reconnect_failed', () => {
      console.error('Socket reconnect failed - all attempts exhausted');
      setConnected(false);
    });

    s.on('online-users', (users) => {
      setOnlineUsers(users);
    });

    socketRef.current = s;
    setSocket(s);

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [token, user]);

  return (
    <SocketContext.Provider value={{ socket, connected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
