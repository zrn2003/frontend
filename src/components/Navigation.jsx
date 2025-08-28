import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">🤝</span>
            <span className="brand-text">TrustTeams</span>
          </Link>
        </div>
        
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/opportunities" className="nav-link">Opportunities</Link>
          <Link to="/icm" className="nav-link">ICM Dashboard</Link>
          <Link to="/student" className="nav-link">Student Dashboard</Link>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/signup" className="nav-link nav-cta">Get Started</Link>
        </div>
        
        <div className="nav-toggle" onClick={toggleMenu}>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
