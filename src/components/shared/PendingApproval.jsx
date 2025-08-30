import React, { useState, useEffect } from 'react';
import './PendingApproval.css';

const PendingApproval = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const pendingUser = localStorage.getItem('pendingUser');
    if (pendingUser) {
      setUser(JSON.parse(pendingUser));
    }
  }, []);

  if (!user) {
    return (
      <div className="pending-approval">
        <div className="pending-approval-content">
          <div className="pending-icon">❌</div>
          <h2>No Pending Registration Found</h2>
          <p>No pending registration was found. Please try logging in again.</p>
          <button 
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem('pendingUser');
              window.location.href = '/login';
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="pending-approval">
      <div className="pending-approval-content">
        <div className="pending-icon">⏳</div>
        <h2>Registration Pending Approval</h2>
        <p>
          Thank you for registering with TrustTeams! Your account is currently pending approval from your university administrator.
        </p>
        
        <div className="user-details">
          <div className="detail-item">
            <strong>Name:</strong> {user.name}
          </div>
          <div className="detail-item">
            <strong>Email:</strong> {user.email}
          </div>
          <div className="detail-item">
            <strong>Role:</strong> {user.role === 'student' ? 'Student' : 'Academic Leader'}
          </div>
          <div className="detail-item">
            <strong>Institute:</strong> {user.institute_name}
          </div>
        </div>

        <div className="approval-status">
          <div className="status-badge pending">
            <span className="status-icon">⏳</span>
            <span className="status-text">Pending Approval</span>
          </div>
        </div>

        <div className="next-steps">
          <h3>What happens next?</h3>
          <ul>
            <li>Your university administrator will review your registration request</li>
            <li>You'll receive an email notification once your account is approved</li>
            <li>Once approved, you'll be able to access your dashboard</li>
            <li>If you have any questions, please contact your university administrator</li>
          </ul>
        </div>

        <div className="contact-info">
          <p>
            <strong>Need help?</strong> If you haven't heard back within 48 hours, 
            please contact your university's IT department or the system administrator.
          </p>
        </div>

        <button 
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem('pendingUser');
            window.location.href = '/';
          }}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default PendingApproval;
