import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import DonorCard from '../components/ui/DonorCard';
import ContactModal from '../components/ui/ContactModal';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { BLOOD_GROUPS, ORGANS } from '../utils/helpers';
import api from '../api/axios';

export default function SearchPage() {
  const { type } = useParams();
  const { location } = useLocation();
  const { blockedIds } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [contactDonor, setContactDonor] = useState(null);
  const [showContact, setShowContact] = useState(false);

  const isBlood = type === 'blood';
  const chips = isBlood ? BLOOD_GROUPS : ORGANS;

  const abortRef = useRef(null);

  useEffect(() => {
    runSearch('');
  }, [type, location, blockedIds]);

  const runSearch = async (q) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const { data } = await api.get('/search/donors', {
        params: {
          type,
          query: q,
          lat: location.lat,
          lng: location.lng
        },
        signal: controller.signal
      });
      const res = data.filter((d) => !blockedIds.includes(d.id));
      setResults(res);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error('Error fetching donors:', err);
        setResults([]);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    runSearch(query);
  };

  const handleChipClick = (chip) => {
    setQuery(chip);
    runSearch(chip);
  };

  const handleContact = (donor) => {
    setContactDonor(donor);
    setShowContact(true);
  };

  return (
    <>
      <div className="search-page">
        <div className="search-header">
          <h1>Search for {isBlood ? 'Blood' : 'Organ'}</h1>
          <p>Showing donors near {location.city}. No personal details are displayed.</p>
        </div>

        <form onSubmit={handleSearch} className="search-filters">
          <input
            className="form-input search-filter-input"
            type="text"
            placeholder={isBlood ? 'Enter blood type (e.g. O+)' : 'Enter organ (e.g. Kidney)'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        <div className="filter-chips" style={{ marginBottom: 28 }}>
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              className={`filter-chip ${query === chip ? 'filter-chip-active' : ''}`}
              onClick={() => handleChipClick(chip)}
            >
              {chip}
            </button>
          ))}
        </div>

        {results.length === 0 ? (
          <div className="empty-state glass">
            <div className="empty-state-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <p>No matching donors found nearby.</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20, fontWeight: 500 }}>
              {results.length} donor{results.length !== 1 ? 's' : ''} found, sorted by distance
            </p>
            <div className="results-grid">
              {results.map((donor) => (
                <DonorCard
                  key={donor.id}
                  donor={donor}
                  type={type}
                  onContact={handleContact}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
        donor={contactDonor}
        type={type}
      />
    </>
  );
}
