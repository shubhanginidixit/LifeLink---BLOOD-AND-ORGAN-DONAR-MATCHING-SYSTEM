import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Landing.css';

export default function LandingNavbar() {
  const { isAuthenticated } = useAuth();
  return (
    <nav className="landing-nav glass-strong">
      <div className="landing-nav-inner">
        <Link to="/" className="landing-logo">
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>
            <path
              d="M16 3C16 3 26 12 26 18C26 23.5228 21.5228 28 16 28C10.4772 28 6 23.5228 6 18C6 12 16 3 16 3Z"
              fill="url(#logoGrad)"
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
        </Link>

        <div className="landing-nav-links">
          <a href="#how-it-works">How It Works</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>

        <div className="landing-nav-auth">
          <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Register</Link>
        </div>
      </div>
    </nav>
  );
}
