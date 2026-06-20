import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LandingNavbar from '../components/layout/LandingNavbar';
import DonorCard from '../components/ui/DonorCard';
import ContactModal from '../components/ui/ContactModal';
import DNABackground from '../components/ui/DNABackground';
import { useLocation } from '../context/LocationContext';
import { BLOOD_GROUPS, ORGANS } from '../utils/helpers';
import api from '../api/axios';
import '../components/layout/Landing.css';

export default function Landing() {
  const { location, requestGPS, setPincode, loading: locLoading } = useLocation();
  const [query, setQuery] = useState('');
  const [pincodeVal, setPincodeVal] = useState('');
  const [results, setResults] = useState(null);
  const [searchType, setSearchType] = useState('blood');
  const [locationGranted, setLocationGranted] = useState(false);
  const [contactDonor, setContactDonor] = useState(null);
  const [showContact, setShowContact] = useState(false);

  // Sync pincode value when location is updated via GPS or default
  useEffect(() => {
    if (location && location.pincode) {
      setPincodeVal(location.pincode);
    }
  }, [location]);

  const handleGPSClick = async () => {
    try {
      const loc = await requestGPS();
      setLocationGranted(true);
      if (loc && loc.pincode) {
        setPincodeVal(loc.pincode);
      } else {
        setPincodeVal('');
      }
    } catch {
      setLocationGranted(false);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    
    let currentLat = location.lat;
    let currentLng = location.lng;

    // If a manual pincode is entered and differs from the context, update it first
    if (pincodeVal && pincodeVal.trim() !== location.pincode) {
      try {
        const updatedLoc = setPincode(pincodeVal.trim());
        currentLat = updatedLoc.lat;
        currentLng = updatedLoc.lng;
      } catch (err) {
        console.error('Pincode update failed', err);
      }
    }

    const type = detectSearchType(query);
    setSearchType(type);

    try {
      const { data } = await api.get('/search', {
        params: {
          type,
          query: query.trim(),
          lat: currentLat,
          lng: currentLng,
        },
      });
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const detectSearchType = (q) => {
    const upper = q.toUpperCase().trim();
    if (BLOOD_GROUPS.includes(upper)) return 'blood';
    if (ORGANS.some((o) => o.toLowerCase().includes(q.toLowerCase()))) return 'organ';
    return 'blood';
  };

  const handleContact = (donor) => {
    setContactDonor(donor);
    setShowContact(true);
  };

  return (
    <div className="landing-page">
      <DNABackground />
      <LandingNavbar />

      <section className="landing-hero">
        <h1>
          Save Lives with <span>LIFELINK</span>
        </h1>
        <p className="landing-tagline">
          Instantly find nearby blood and organ donors in emergencies. 
          Privacy-first: no names or contact details are shared until you choose to connect securely.
        </p>

        <div className="landing-search-wrapper">
          <form className="landing-search glass-3d" onSubmit={handleSearch}>
            <div className="search-query-group">
              <span className="search-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search blood type (O+) or organ (Kidney)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            
            <div className="search-divider"></div>
            
            <div className="search-location-group">
              <button
                type="button"
                className={`gps-btn ${location.source === 'gps' ? 'active' : ''}`}
                onClick={handleGPSClick}
                title="Use current location"
                disabled={locLoading}
              >
                {locLoading ? (
                  <span className="loading-spinner">...</span>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="3"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                  </svg>
                )}
              </button>
              <input
                type="text"
                placeholder="PIN Code..."
                value={pincodeVal}
                onChange={(e) => setPincodeVal(e.target.value)}
                style={{ width: '80px', flex: 'none' }}
              />
            </div>

            <button type="submit" className="landing-search-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </form>
          <p className="landing-search-hint">
            {location.city ? `Showing results near ${location.city}` : 'Provide search queries and location code to begin'}
          </p>
        </div>

        <div className="landing-cta">
          <Link to="/signup" className="btn btn-glass">Register</Link>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>

        {results && (
          <div className="landing-results">
            <div className="landing-results-header">
              <h2>
                {results.length} {searchType === 'blood' ? 'Blood' : 'Organ'} Donor{results.length !== 1 ? 's' : ''} Found
              </h2>
              <span className="badge badge-gray">Near {location.city}</span>
            </div>
            {results.length === 0 ? (
              <div className="empty-state glass">
                <div className="empty-state-icon">🔍</div>
                <p>No donors found matching your search nearby.</p>
              </div>
            ) : (
              <div className="landing-results-grid">
                {results.slice(0, 6).map((donor) => (
                  <DonorCard
                    key={donor.id || donor._id}
                    donor={donor}
                    type={searchType}
                    onContact={handleContact}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="landing-features">
          <div className="landing-feature">
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3>Location Based</h3>
            <p>Find the nearest available donors using GPS or manual pincode search</p>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3>Privacy Protected</h3>
            <p>No personal details shown. Secure masked calling keeps both parties safe</p>
          </div>
          <div className="landing-feature">
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3>Emergency Ready</h3>
            <p>Real-time availability for blood and organ donations in critical moments</p>
          </div>
        </div>
      </section>

      {/* Elegant minimalist Content Sections */}
      <section className="landing-info-sections">
        <div id="how-it-works" className="info-card">
          <div className="info-content">
            <h2>How It Works</h2>
            <p className="info-desc">
              LIFELINK connects donors and recipients in seconds while keeping identity completely protected. Here is the life-saving process:
            </p>
            <div className="info-steps">
              <div className="info-step">
                <div className="step-num">1</div>
                <div className="step-text">
                  <h4>Search Anonymously</h4>
                  <p>Type your request (e.g. O+ or Kidney). The platform looks up verified donor profiles near your area.</p>
                </div>
              </div>
              <div className="info-step">
                <div className="step-num">2</div>
                <div className="step-text">
                  <h4>Review Health Metrics</h4>
                  <p>Inspect health summaries, including age, weight, and general health parameters, to ensure a match.</p>
                </div>
              </div>
              <div className="info-step">
                <div className="step-num">3</div>
                <div className="step-text">
                  <h4>Connect Safely</h4>
                  <p>Request connections via a single button. We set up an encrypted call where your actual number is never exposed.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="info-graphic">
            <div className="graphic-badge-container">
              <div className="graphic-badge">
                <span>🔍</span> O+ Search Active
              </div>
              <div className="graphic-badge glow">
                <span>📍</span> 1.4 km Match Found
              </div>
              <div className="graphic-badge">
                <span>📞</span> Secure Masked Call
              </div>
            </div>
          </div>
        </div>

        <div id="features" className="info-card">
          <div className="info-graphic">
            <div className="graphic-badge-container">
              <div className="graphic-badge glow">
                <span>🛡️</span> Private OTP Verified
              </div>
              <div className="graphic-badge">
                <span>🔒</span> Anonymous Profiles
              </div>
              <div className="graphic-badge">
                <span>⚡</span> Instant Alert Routing
              </div>
            </div>
          </div>
          <div className="info-content">
            <h2>Built for Emergencies</h2>
            <p className="info-desc">
              Every second matters when a medical crisis strikes. We developed our systems to be streamlined, lightweight, and focused purely on saving lives without administrative overhead.
            </p>
            <div className="info-steps">
              <div className="info-step">
                <div className="step-num">✓</div>
                <div className="step-text">
                  <h4>Calm, Uncluttered Interface</h4>
                  <p>Designed with clean typography and glass surfaces to help you stay composed under pressure.</p>
                </div>
              </div>
              <div className="info-step">
                <div className="step-num">✓</div>
                <div className="step-text">
                  <h4>Instant Alert Broadcasts</h4>
                  <p>Notify active donors matching the blood group or organ requirement instantly in real time.</p>
                </div>
              </div>
              <div className="info-step">
                <div className="step-num">✓</div>
                <div className="step-text">
                  <h4>Donor Autonomy</h4>
                  <p>Donors have total control over their availability toggle. Hide your profile when you're unable to donate.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="about" className="info-card">
          <div className="info-content">
            <h2>About LIFELINK</h2>
            <p className="info-desc">
              LIFELINK is a social-impact initiative bridging the critical communication gap between patients in emergency situations and willing local donors.
            </p>
            <p className="info-desc" style={{ fontSize: '0.95rem' }}>
              We believe medical connections should be immediate, safe, and open to all. By removing commercial barriers, phone-number spam, and manual tracking delays, we establish a secure layer where mutual care operates at peak efficiency. Join our network today to be the lifeline someone needs tomorrow.
            </p>
          </div>
          <div className="info-graphic">
            <div className="graphic-badge-container">
              <div className="graphic-badge">
                <span>🌐</span> Nationwide Network
              </div>
              <div className="graphic-badge glow">
                <span>❤️</span> 10,000+ Lifesavers
              </div>
              <div className="graphic-badge">
                <span>💬</span> 24/7 Verified Support
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Multi-Column Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="footerLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#e11d48" />
                  </linearGradient>
                </defs>
                <path
                  d="M16 3C16 3 26 12 26 18C26 23.5228 21.5228 28 16 28C10.4772 28 6 23.5228 6 18C6 12 16 3 16 3Z"
                  fill="url(#footerLogoGrad)"
                />
                <path
                  d="M11 18H13.5L15 13L17 21L18.5 18H21"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="logo-text">LIFELINK</span>
            </div>
            <p>Connecting donors and recipients securely, in real-time, under high-urgency conditions.</p>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About Us</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><Link to="/signup">Register</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><a href="#about">FAQs & Guidelines</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Emergency Contact</h4>
            <ul>
              <li style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>Hotlines:</strong> 102 / 108
              </li>
              <li style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>Email:</strong> support@lifelink.org
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">
            © {new Date().getFullYear()} LIFELINK. All rights reserved. Connecting with care.
          </div>
          <div className="footer-links">
            <Link to="#">Privacy Policy</Link>
            <span className="footer-separator">•</span>
            <Link to="#">Terms & Conditions</Link>
          </div>
        </div>
      </footer>

      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
        donor={contactDonor}
        type={searchType}
      />
    </div>
  );
}
