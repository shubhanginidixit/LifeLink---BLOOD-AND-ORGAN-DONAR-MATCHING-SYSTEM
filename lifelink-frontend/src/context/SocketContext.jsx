import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/axios';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const esRef = useRef(null);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    if (!token || !user) {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      setConnected(false);
      setOnlineUsers([]);
      return;
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'https://blood-and-organ-donar-matching-system.onrender.com';
    const url = `${serverUrl}/api/stream?token=${token}`;

    const es = new EventSource(url);
    esRef.current = es;

    const dispatch = (event, data) => {
      const handlers = listenersRef.current.get(event);
      if (handlers) {
        for (const handler of handlers) {
          handler(data);
        }
      }
    };

    es.addEventListener('connect', () => {
      console.log('SSE connected');
      setConnected(true);
    });

    es.addEventListener('online-users', (e) => {
      try { setOnlineUsers(JSON.parse(e.data)); } catch {}
    });

    es.addEventListener('new-notification', (e) => {
      try { dispatch('new-notification', JSON.parse(e.data)); } catch {}
    });

    es.addEventListener('new-request', (e) => {
      try { dispatch('new-request', JSON.parse(e.data)); } catch {}
    });

    es.addEventListener('receive-message', (e) => {
      try { dispatch('receive-message', JSON.parse(e.data)); } catch {}
    });

    es.addEventListener('message-sent', (e) => {
      try { dispatch('message-sent', JSON.parse(e.data)); } catch {}
    });

    es.addEventListener('chat-error', (e) => {
      try { dispatch('chat-error', JSON.parse(e.data)); } catch {}
    });

    es.addEventListener('user-typing', (e) => {
      try { dispatch('user-typing', JSON.parse(e.data)); } catch {}
    });

    es.addEventListener('user-stop-typing', (e) => {
      try { dispatch('user-stop-typing', JSON.parse(e.data)); } catch {}
    });

    es.addEventListener('messages-read', (e) => {
      try { dispatch('messages-read', JSON.parse(e.data)); } catch {}
    });

    es.onerror = () => {
      console.log('SSE connection error / reconnecting');
      setConnected(false);
    };

    return () => {
      es.close();
      esRef.current = null;
      setConnected(false);
    };
  }, [token, user]);

  const socket = useRef({
    _handlers: new Map(),
    on(event, handler) {
      if (!this._handlers.has(event)) this._handlers.set(event, new Set());
      this._handlers.get(event).add(handler);
      listenersRef.current = this._handlers;
    },
    off(event, handler) {
      const set = this._handlers.get(event);
      if (set) set.delete(handler);
      listenersRef.current = this._handlers;
    },
    emit(event, data) {
      if (event === 'send-message') {
        api.post(`/chat/${data.receiverId}/send`, { text: data.text }).catch(() => {});
      } else if (event === 'typing') {
        api.post(`/chat/${data.receiverId}/typing`).catch(() => {});
      } else if (event === 'stop-typing') {
        api.post(`/chat/${data.receiverId}/stop-typing`).catch(() => {});
      } else if (event === 'mark-read') {
        api.post(`/chat/${data.userId}/read`).catch(() => {});
      }
    },
    disconnect() {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    },
  }).current;

  return (
    <SocketContext.Provider value={{ socket, connected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
