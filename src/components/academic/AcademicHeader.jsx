import React, { useState, useRef, useEffect } from 'react';
import './AcademicHeader.css';

const AcademicHeader = ({ user, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="academic-header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo-section">
            <div className="logo">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h1>Academic Leader Dashboard</h1>
          </div>
        </div>

        <div className="header-center">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-container">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search students, courses, faculty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                Search
              </button>
            </div>
          </form>
        </div>

        <div className="header-right">
          <div className="profile-section" ref={profileRef}>
            <button
              className="profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" />
                ) : (
                  <span>{user?.name?.charAt(0) || 'A'}</span>
                )}
              </div>
              <span className="profile-name">{user?.name || 'Academic Leader'}</span>
              <i className={`fas fa-chevron-down ${showProfileMenu ? 'rotated' : ''}`}></i>
            </button>

            {showProfileMenu && (
              <div className="profile-menu">
                <div className="menu-header">
                  <div className="menu-avatar">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" />
                    ) : (
                      <span>{user?.name?.charAt(0) || 'A'}</span>
                    )}
                  </div>
                  <div className="menu-info">
                    <h4>{user?.name || 'Academic Leader'}</h4>
                    <p>{user?.email || 'academic@institute.edu'}</p>
                  </div>
                </div>
                <div className="menu-divider"></div>
                <div className="menu-items">
                  <button className="menu-item">
                    <i className="fas fa-user"></i>
                    Profile
                  </button>
                  <button className="menu-item">
                    <i className="fas fa-cog"></i>
                    Settings
                  </button>
                  <button className="menu-item">
                    <i className="fas fa-bell"></i>
                    Notifications
                  </button>
                  <div className="menu-divider"></div>
                  <button className="menu-item logout" onClick={onLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AcademicHeader;
