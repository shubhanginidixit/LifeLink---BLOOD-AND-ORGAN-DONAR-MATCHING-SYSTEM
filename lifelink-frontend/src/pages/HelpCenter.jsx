export default function HelpCenter() {
  const faqs = [
    {
      q: 'How does secure masked calling work?',
      a: 'When you choose to connect with a donor, we route the connection through a secure virtual number. Both parties receive a call from this masked system, meaning your actual mobile number is never visible, protecting you from spam and data exposure.'
    },
    {
      q: 'Is LIFELINK free to use?',
      a: 'Yes, LIFELINK is a social impact utility built entirely to save lives in critical emergencies. We do not charge fees, run commercial advertisements, or sell member data.'
    },
    {
      q: 'How do I toggle my availability as a donor?',
      a: 'You can manage your donation preferences directly in your settings panel. Turning off "Donate Blood" or "Donate Organ" will instantly hide your profile from search results.'
    },
    {
      q: 'How do I report a user or block contacts?',
      a: 'Inside your Contact History log, you can click the "Block" button next to any call logs. Once blocked, that profile will be prevented from requesting calls or seeing your updates.'
    }
  ];

  return (
    <>
      <div className="settings-page">
        <h1>Help Center</h1>

        <div className="settings-section">
          <h3>Emergency Support & Hotlines</h3>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">National Medical Emergency line</div>
              <div className="settings-row-desc">Direct medical ambulance alerts</div>
            </div>
            <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>Dial 102 / 108</span>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">LIFELINK Verification Helpline</div>
              <div className="settings-row-desc">Encountering problems with OTP codes or account set up</div>
            </div>
            <span className="badge badge-gray">support@lifelink.org</span>
          </div>
        </div>

        <div className="settings-section">
          <h3>Frequently Asked Questions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 12 }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ borderBottom: idx !== faqs.length - 1 ? '1px solid rgba(15, 23, 42, 0.05)' : 'none', paddingBottom: idx !== faqs.length - 1 ? 16 : 0 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--black)', marginBottom: 6 }}>{faq.q}</h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h3>Platform Code of Conduct</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            LIFELINK operates on a foundation of mutual support. Commercial transactions or requests for monetary compensation in exchange for donations are strictly prohibited. Violators will have their access terminated immediately and local authorities will be notified.
          </p>
        </div>
      </div>
    </>
  );
}
