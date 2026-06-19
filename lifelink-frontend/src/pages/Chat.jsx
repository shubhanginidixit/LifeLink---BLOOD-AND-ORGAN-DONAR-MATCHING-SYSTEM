import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import './Chat.css';

export default function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, connected, onlineUsers } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [chatError, setChatError] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    api.get('/chat').then(({ data }) => setConversations(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!userId) return;
    setChatError('');
    api.get(`/chat/${userId}`).then(({ data }) => setMessages(data)).catch(() => {});
    api.post(`/chat/${userId}/read`).catch(() => {});
    setOtherTyping(false);
  }, [userId]);

  useEffect(() => {
    if (!socket) return;

    const onReceiveMessage = (msg) => {
      if (msg.sender === userId) {
        setMessages((prev) => [...prev, msg]);
        socket.emit('mark-read', { userId });
      }
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.userId === msg.sender);
        const updated = {
          userId: msg.sender,
          lastMessage: msg.text,
          lastMessageTime: msg.createdAt,
          unreadCount: msg.sender === userId ? 0 : (prev[idx]?.unreadCount || 0) + 1,
          name: prev[idx]?.name || 'User',
          bloodGroup: prev[idx]?.bloodGroup || '',
          city: prev[idx]?.city || '',
        };
        if (idx >= 0) {
          const copy = [...prev];
          copy.splice(idx, 1);
          return [updated, ...copy];
        }
        return [updated, ...prev];
      });
    };

    const onMessageSent = (msg) => {
      setMessages((prev) => [...prev, {
        _id: msg._id,
        sender: msg.sender,
        receiver: msg.receiver,
        text: msg.text,
        createdAt: msg.createdAt,
        read: msg.read,
      }]);
    };

    const onChatError = (err) => {
      console.error('Chat error:', err.message);
      setChatError(err.message || 'Failed to send message');
    };

    const onUserTyping = ({ userId: uid }) => {
      if (uid === userId) setOtherTyping(true);
    };

    const onUserStopTyping = ({ userId: uid }) => {
      if (uid === userId) setOtherTyping(false);
    };

    const onMessagesRead = ({ userId: uid }) => {
      if (uid === userId) {
        setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
      }
    };

    socket.on('receive-message', onReceiveMessage);
    socket.on('message-sent', onMessageSent);
    socket.on('chat-error', onChatError);
    socket.on('user-typing', onUserTyping);
    socket.on('user-stop-typing', onUserStopTyping);
    socket.on('messages-read', onMessagesRead);

    return () => {
      socket.off('receive-message', onReceiveMessage);
      socket.off('message-sent', onMessageSent);
      socket.off('chat-error', onChatError);
      socket.off('user-typing', onUserTyping);
      socket.off('user-stop-typing', onUserStopTyping);
      socket.off('messages-read', onMessagesRead);
    };
  }, [socket, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    setChatError('');
    if (!input.trim() || !userId || !socket) return;
    if (!connected) {
      setChatError('Not connected. Please wait for reconnection...');
      return;
    }

    socket.emit('send-message', { receiverId: userId, text: input.trim() });
    socket.emit('stop-typing', { receiverId: userId });
    setInput('');
    setTyping(false);
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    setChatError('');
    if (!socket || !userId || !connected) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', { receiverId: userId });
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socket.emit('stop-typing', { receiverId: userId });
    }, 1500);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!userId) {
    return (
      <div className="chat-page">
        <div className="chat-list">
          <h2>Conversations</h2>
          {!connected && (
            <div className="chat-connection-banner">
              Reconnecting to server...
            </div>
          )}
          {conversations.length === 0 ? (
            <div className="empty-state glass">
              <p>No conversations yet.</p>
              <p style={{ fontSize: '0.8rem', marginTop: 8 }}>Start a chat from donor search results.</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.userId}
                className={`chat-list-item ${conv.unreadCount > 0 ? 'unread' : ''}`}
                onClick={() => navigate(`/dashboard/chat/${conv.userId}`)}
              >
                <div className="chat-avatar">
                  {(conv.name || 'U')[0].toUpperCase()}
                </div>
                <div className="chat-list-info">
                  <div className="chat-list-top">
                    <span className="chat-list-name">{conv.name}</span>
                    <span className="chat-list-time">
                      {formatTime(conv.lastMessageTime)}
                    </span>
                  </div>
                  <div className="chat-list-bottom">
                    <span className="chat-list-last">{conv.lastMessage}</span>
                    {conv.unreadCount > 0 && (
                      <span className="chat-unread-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  const otherOnline = onlineUsers?.includes(userId);

  return (
    <div className="chat-page">
      <div className="chat-header-bar">
        <button className="btn btn-glass btn-sm" onClick={() => navigate('/dashboard/chat')}>
          &larr; Back
        </button>
        <div className="chat-header-info">
          <div className="chat-avatar chat-avatar-sm">
            {(conversations.find((c) => c.userId === userId)?.name || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div className="chat-header-name">
              {conversations.find((c) => c.userId === userId)?.name || 'User'}
            </div>
            <div className={`chat-header-status ${otherOnline ? 'online' : ''}`}>
              {!connected ? 'Reconnecting...' : otherOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {!connected && (
          <div className="chat-connection-banner">
            Reconnecting to server...
          </div>
        )}
        {messages.length === 0 && (
          <div className="empty-state">
            <p>Send a message to start the conversation.</p>
          </div>
        )}
        {messages.map((msg) => {
          const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
          const isSelf = senderId === user?._id;
          return (
            <div key={msg._id} className={`chat-bubble ${isSelf ? 'self' : 'other'}`}>
              <div className="chat-bubble-text">{msg.text}</div>
              <div className="chat-bubble-time">
                {formatTime(msg.createdAt)}
                {isSelf && msg.read && <span className="chat-read-check"> ✓✓</span>}
              </div>
            </div>
          );
        })}
        {otherTyping && (
          <div className="chat-typing">
            <span className="chat-typing-dot" />
            <span className="chat-typing-dot" />
            <span className="chat-typing-dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {chatError && (
        <div className="chat-error-banner">{chatError}</div>
      )}

      <form className="chat-input-bar" onSubmit={handleSend}>
        <input
          className="form-input chat-input"
          type="text"
          placeholder={!connected ? 'Reconnecting...' : 'Type a message...'}
          value={input}
          onChange={handleInput}
          autoComplete="off"
          disabled={!connected}
        />
        <button type="submit" className="btn btn-primary" disabled={!input.trim() || !connected}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}
