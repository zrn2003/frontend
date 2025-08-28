import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate()

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || localStorage.getItem('userData') || 'null') } catch { return null }
  }, [])
  const role = (user?.role || '').toLowerCase()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  }

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
          {(role === 'admin' || role === 'manager' || role === 'viewer') && (
            <Link to="/icm" className="nav-link">ICM Dashboard</Link>
          )}
          {role === 'student' && (
            <Link to="/student" className="nav-link">Student Dashboard</Link>
          )}
          {(role === 'academic_leader' || role === 'admin') && (
            <Link to="/academic" className="nav-link">Academic Dashboard</Link>
          )}
          {(role === 'university_admin' || role === 'admin') && (
            <Link to="/university" className="nav-link">University Dashboard</Link>
          )}

          {!user ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link nav-cta">Get Started</Link>
            </>
          ) : (
            <>
              <span className="nav-link" style={{ opacity:.8 }}>
                {user.name || user.email}
              </span>
              <button onClick={handleLogout} className="nav-link" style={{ background:'transparent', border:'none', cursor:'pointer' }}>Logout</button>
            </>
          )}
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
