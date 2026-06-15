import { useState } from 'react';
import ContactModal from '../components/ui/ContactModal';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime } from '../utils/helpers';

export default function CallLogs() {
  const { callLogs, deleteCallLog, blockDonor, blockedIds } = useAuth();
  const [contactDonor, setContactDonor] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [contactType, setContactType] = useState('blood');

  const handleContactAgain = (call) => {
    const donor = {
      id: call.donorId,
      bloodGroup: call.bloodGroup,
      age: call.age,
      gender: call.gender,
      city: call.city,
    };
    setContactDonor(donor);
    setContactType(call.type);
    setShowContact(true);
  };

  return (
    <>
      <div className="call-logs-page">
        <h1>Contact History</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 28 }}>
          Your secure masked contact history. Re-contact, block, or delete entries.
        </p>

        {callLogs.length === 0 ? (
          <div className="empty-state glass">
            <div className="empty-state-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <p>No calls yet. Search for donors and connect securely.</p>
          </div>
        ) : (
          <div className="call-list">
            {callLogs.map((call) => (
              <div key={call.id} className="call-item">
                <div className="call-item-icon" style={{ background: call.direction === 'incoming' ? 'rgba(13, 148, 136, 0.08)' : 'var(--primary-light)', color: call.direction === 'incoming' ? '#0d9488' : 'var(--primary)' }}>
                  {call.direction === 'incoming' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <polyline points="19 12 12 19 5 12"></polyline>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="19" x2="12" y2="5"></line>
                      <polyline points="5 12 12 5 19 12"></polyline>
                    </svg>
                  )}
                </div>
                <div className="call-item-info">
                  <h4>
                    {call.bloodGroup} · {call.age}y {call.gender}
                  </h4>
                  <p>
                    {call.direction === 'incoming' ? 'Received from' : 'Dialed to'} masked contact · {formatDate(call.timestamp)} at {formatTime(call.timestamp)}
                  </p>
                </div>
                <div className="call-item-actions">
                  {!blockedIds.includes(call.donorId) && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleContactAgain(call)}
                    >
                      Connect Again
                    </button>
                  )}
                  {!blockedIds.includes(call.donorId) ? (
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--primary)', borderColor: 'rgba(225, 29, 72, 0.15)' }}
                      onClick={() => blockDonor(call.donorId)}
                    >
                      Block
                    </button>
                  ) : (
                    <span className="badge badge-gray">Blocked</span>
                  )}
                  <button
                    className="btn btn-sm"
                    style={{ background: 'rgba(15, 23, 42, 0.05)', color: 'var(--black)' }}
                    onClick={() => deleteCallLog(call.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
        donor={contactDonor}
        type={contactType}
      />
    </>
  );
}
