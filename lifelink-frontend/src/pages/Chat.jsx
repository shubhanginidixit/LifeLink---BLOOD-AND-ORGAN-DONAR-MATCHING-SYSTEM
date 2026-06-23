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
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch conversation list
  useEffect(() => {
    api.get('/chat').then(({ data }) => setConversations(data)).catch(() => {});
  }, []);

  // Fetch messages when userId changes
  useEffect(() => {
    if (!userId) return;
    setChatError('');
    setLoadingMessages(true);
    api.get(`/chat/${userId}`)
      .then(({ data }) => setMessages(data))
      .catch(() => {})
      .finally(() => setLoadingMessages(false));
    api.post(`/chat/${userId}/read`).catch(() => {});
    setOtherTyping(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [userId]);

  // Socket event handlers
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
          name: prev[idx]?.name || msg.senderName || 'User',
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
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, {
          _id: msg._id,
          sender: msg.sender,
          receiver: msg.receiver,
          text: msg.text,
          createdAt: msg.createdAt,
          read: msg.read,
        }];
      });
    };

    const onChatError = (err) => {
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
      setChatError('Not connected. Please wait...');
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend(e);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const getAvatarColor = (str) => {
    const colors = [
      '#E74C3C', '#E67E22', '#F39C12', '#27AE60',
      '#16A085', '#2980B9', '#8E44AD', '#D35400',
    ];
    let hash = 0;
    for (let i = 0; i < (str || '').length; i++) hash = str.charCodeAt(i) + (hash << 5) - hash;
    return colors[Math.abs(hash) % colors.length];
  };

  const filteredConversations = conversations.filter((c) =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.bloodGroup?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConv = conversations.find((c) => c.userId === userId);
  const otherOnline = onlineUsers?.includes(userId);

  // ── Conversation List (no active chat selected) ──────────────────────
  if (!userId) {
    return (
      <div className="chat-root">
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2 className="chat-sidebar-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Messages
            </h2>
            <div className={`chat-status-pill ${connected ? 'online' : 'offline'}`}>
              <span className="status-dot" />
              {connected ? 'Live' : 'Connecting…'}
            </div>
          </div>

          <div className="chat-search-wrapper">
            <svg className="chat-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="chat-search-input"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="chat-list-scroll">
            {filteredConversations.length === 0 ? (
              <div className="chat-empty-state">
                <div className="chat-empty-icon">💬</div>
                <p className="chat-empty-title">No conversations yet</p>
                <p className="chat-empty-sub">
                  Search for a donor and click <strong>"Contact Securely"</strong> to start chatting.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isOnline = onlineUsers?.includes(conv.userId);
                const bgColor = getAvatarColor(conv.name);
                return (
                  <div
                    key={conv.userId}
                    className={`chat-list-item ${conv.unreadCount > 0 ? 'unread' : ''}`}
                    onClick={() => navigate(`/dashboard/chat/${conv.userId}`)}
                  >
                    <div className="chat-avatar-wrap">
                      <div className="chat-avatar" style={{ background: bgColor }}>
                        {getInitials(conv.name)}
                      </div>
                      {isOnline && <span className="chat-online-dot" />}
                    </div>
                    <div className="chat-list-info">
                      <div className="chat-list-top">
                        <span className="chat-list-name">{conv.name}</span>
                        <span className="chat-list-time">{formatDate(conv.lastMessageTime)}</span>
                      </div>
                      <div className="chat-list-bottom">
                        <span className="chat-list-last">{conv.lastMessage}</span>
                        {conv.unreadCount > 0 && (
                          <span className="chat-unread-badge">{conv.unreadCount}</span>
                        )}
                      </div>
                      {(conv.bloodGroup || conv.city) && (
                        <div className="chat-list-meta">
                          {conv.bloodGroup && <span className="chat-blood-tag">{conv.bloodGroup}</span>}
                          {conv.city && <span className="chat-city-tag">📍 {conv.city}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Welcome panel for desktop */}
        <div className="chat-welcome-panel">
          <div className="chat-welcome-inner">
            <div className="chat-welcome-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="chat-welcome-title">Connect with Donors</h3>
            <p className="chat-welcome-sub">
              Select a conversation from the left, or search for donors and start a new conversation.
            </p>
            <div className="chat-welcome-features">
              <div className="chat-feature-card">
                <span>🔴</span>
                <span>Real-time messaging</span>
              </div>
              <div className="chat-feature-card">
                <span>✓✓</span>
                <span>Read receipts</span>
              </div>
              <div className="chat-feature-card">
                <span>🔒</span>
                <span>Private & Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Active Chat Window ────────────────────────────────────────────────
  const bgColor = getAvatarColor(activeConv?.name);

  // Group messages by date
  const groupedMessages = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const d = new Date(msg.createdAt);
    const dateKey = d.toDateString();
    if (dateKey !== lastDate) {
      groupedMessages.push({ type: 'date', key: dateKey, label: formatDate(msg.createdAt) });
      lastDate = dateKey;
    }
    groupedMessages.push({ type: 'message', ...msg });
  });

  return (
    <div className="chat-root">
      {/* Sidebar (collapsed on small screens when chat is open) */}
      <div className="chat-sidebar chat-sidebar-hidden-mobile">
        <div className="chat-sidebar-header">
          <h2 className="chat-sidebar-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Messages
          </h2>
          <div className={`chat-status-pill ${connected ? 'online' : 'offline'}`}>
            <span className="status-dot" />
            {connected ? 'Live' : 'Connecting…'}
          </div>
        </div>

        <div className="chat-search-wrapper">
          <svg className="chat-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="chat-search-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="chat-list-scroll">
          {filteredConversations.map((conv) => {
            const isOnline = onlineUsers?.includes(conv.userId);
            const isActive = conv.userId === userId;
            const bgC = getAvatarColor(conv.name);
            return (
              <div
                key={conv.userId}
                className={`chat-list-item ${conv.unreadCount > 0 ? 'unread' : ''} ${isActive ? 'active' : ''}`}
                onClick={() => navigate(`/dashboard/chat/${conv.userId}`)}
              >
                <div className="chat-avatar-wrap">
                  <div className="chat-avatar" style={{ background: bgC }}>
                    {getInitials(conv.name)}
                  </div>
                  {isOnline && <span className="chat-online-dot" />}
                </div>
                <div className="chat-list-info">
                  <div className="chat-list-top">
                    <span className="chat-list-name">{conv.name}</span>
                    <span className="chat-list-time">{formatDate(conv.lastMessageTime)}</span>
                  </div>
                  <div className="chat-list-bottom">
                    <span className="chat-list-last">{conv.lastMessage}</span>
                    {conv.unreadCount > 0 && (
                      <span className="chat-unread-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Window */}
      <div className="chat-window">
        {/* Header */}
        <div className="chat-window-header">
          <button className="chat-back-btn" onClick={() => navigate('/dashboard/chat')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="chat-header-avatar-wrap">
            <div className="chat-avatar chat-avatar-md" style={{ background: bgColor }}>
              {getInitials(activeConv?.name || 'U')}
            </div>
            {otherOnline && <span className="chat-online-dot" />}
          </div>
          <div className="chat-header-text">
            <div className="chat-header-name">{activeConv?.name || 'User'}</div>
            <div className={`chat-header-status ${otherOnline ? 'online' : ''}`}>
              {!connected
                ? '⚡ Reconnecting...'
                : otherTyping
                ? 'Typing...'
                : otherOnline
                ? '● Online'
                : '○ Offline'}
            </div>
          </div>
          <div className="chat-header-tags">
            {activeConv?.bloodGroup && (
              <span className="chat-blood-tag">{activeConv.bloodGroup}</span>
            )}
            {activeConv?.city && (
              <span className="chat-city-tag">📍 {activeConv.city}</span>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="chat-messages">
          {!connected && (
            <div className="chat-connection-banner">
              ⚡ Reconnecting to server…
            </div>
          )}

          {loadingMessages && (
            <div className="chat-loading">
              <div className="chat-loading-spinner" />
            </div>
          )}

          {!loadingMessages && messages.length === 0 && (
            <div className="chat-start-state">
              <div className="chat-avatar chat-avatar-lg" style={{ background: bgColor }}>
                {getInitials(activeConv?.name || 'U')}
              </div>
              <div className="chat-start-name">{activeConv?.name || 'Donor'}</div>
              {activeConv?.city && (
                <div className="chat-start-meta">📍 {activeConv.city}</div>
              )}
              <p className="chat-start-hint">
                This is the beginning of your conversation. Send a message to connect!
              </p>
            </div>
          )}

          {groupedMessages.map((item, idx) => {
            if (item.type === 'date') {
              return (
                <div key={`date-${idx}`} className="chat-date-divider">
                  <span>{item.label}</span>
                </div>
              );
            }
            const senderId = typeof item.sender === 'object' ? item.sender?._id : item.sender;
            const isSelf = senderId === user?._id;
            return (
              <div key={item._id} className={`chat-bubble-row ${isSelf ? 'self' : 'other'}`}>
                {!isSelf && (
                  <div className="chat-bubble-avatar" style={{ background: bgColor }}>
                    {getInitials(activeConv?.name || 'U')}
                  </div>
                )}
                <div className={`chat-bubble ${isSelf ? 'self' : 'other'}`}>
                  <div className="chat-bubble-text">{item.text}</div>
                  <div className="chat-bubble-meta">
                    <span className="chat-bubble-time">{formatTime(item.createdAt)}</span>
                    {isSelf && (
                      <span className={`chat-tick ${item.read ? 'read' : ''}`}>
                        {item.read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {otherTyping && (
            <div className="chat-bubble-row other">
              <div className="chat-bubble-avatar" style={{ background: bgColor }}>
                {getInitials(activeConv?.name || 'U')}
              </div>
              <div className="chat-typing-bubble">
                <span className="chat-typing-dot" />
                <span className="chat-typing-dot" />
                <span className="chat-typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {chatError && (
          <div className="chat-error-banner">{chatError}</div>
        )}

        {/* Input Bar */}
        <form className="chat-input-bar" onSubmit={handleSend}>
          <input
            ref={inputRef}
            className="chat-input"
            type="text"
            placeholder={!connected ? 'Reconnecting...' : 'Type a message…'}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            disabled={!connected}
            id="chat-message-input"
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!input.trim() || !connected}
            id="chat-send-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
