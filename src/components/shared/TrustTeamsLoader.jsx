import React from 'react';
import './TrustTeamsLoader.css';

const TrustTeamsLoader = ({ 
  isLoading = true, 
  message = "Loading...", 
  showProgress = true,
  progress = 0,
  size = "medium" // small, medium, large
}) => {
  if (!isLoading) return null;

  return (
    <div className={`trust-teams-loader ${size}`}>
      <div className="loader-overlay">
        <div className="loader-container">
          {/* TrustTeams Logo/Brand */}
          <div className="trust-teams-brand">
            <div className="brand-icon">
              <svg viewBox="0 0 100 100" className="brand-svg">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
                <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7"/>
                <circle cx="50" cy="50" r="15" fill="currentColor" opacity="0.9"/>
                <text x="50" y="60" textAnchor="middle" fontSize="8" fill="currentColor" fontWeight="bold">TT</text>
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-name">TrustTeams</span>
              <span className="brand-tagline">Connecting Talent with Opportunity</span>
            </div>
          </div>

          {/* Loading Animation */}
          <div className="loading-animation">
            <div className="loading-dots">
              <div className="dot dot-1"></div>
              <div className="dot dot-2"></div>
              <div className="dot dot-3"></div>
            </div>
          </div>

          {/* Progress Bar */}
          {showProgress && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {progress > 0 ? `${Math.round(progress)}%` : message}
              </div>
            </div>
          )}

          {/* Loading Message */}
          {!showProgress && (
            <div className="loading-message">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrustTeamsLoader;
