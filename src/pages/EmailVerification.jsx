import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import './EmailVerification.css';

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const verificationAttempted = useRef(false);

  useEffect(() => {
    console.log('🔍 useEffect triggered:', { token, verificationAttempted: verificationAttempted.current });
    if (token && !verificationAttempted.current) {
      console.log('🚀 Starting verification process...');
      verificationAttempted.current = true;
      verifyEmail(token);
    } else if (!token) {
      setVerificationStatus('no-token');
      setError('No verification token provided');
    } else {
      console.log('⏭️ Skipping verification - already attempted or no token');
    }
  }, [token]);

  const verifyEmail = async (token) => {
    console.log('🔐 verifyEmail called with token:', token);
    
    // Prevent multiple verification attempts
    if (verificationAttempted.current && verificationStatus !== 'verifying') {
      console.log('⏭️ Verification already completed, skipping...');
      return;
    }
    
    // Set flag to prevent multiple calls
    verificationAttempted.current = true;
    console.log('✅ Verification attempt flag set');
    
    try {
      setVerificationStatus('verifying');
      setMessage('Verifying your email...');
      setError('');

      console.log('📡 Making API call to verify email...');
      const response = await api.verifyEmail(token);
      
      // Debug logging
      console.log('📨 Verification response:', response);
      console.log('📝 Response message:', response.message);
      console.log('✅ Message includes successfully:', response.message && response.message.includes('successfully'));
      
      // Backend returns success with status 200 and message
      if (response.message && response.message.includes('successfully')) {
        console.log('🎉 SUCCESS: Setting success status');
        setVerificationStatus('success');
        setMessage(response.message || 'Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          console.log('🔄 Redirecting to login...');
          navigate('/login');
        }, 3000);
      } else if (response.alreadyVerified) {
        // Handle already verified case
        console.log('✅ ALREADY VERIFIED: Setting already verified status');
        setVerificationStatus('already-verified');
        setMessage(response.message || 'Email already verified!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          console.log('🔄 Redirecting to login...');
          navigate('/login');
        }, 3000);
      } else {
        console.log('❌ UNEXPECTED RESPONSE: Setting error status');
        setVerificationStatus('error');
        setError(response.message || 'Verification failed');
      }
    } catch (error) {
      console.error('💥 VERIFICATION ERROR:', error);
      console.error('Error message:', error.message);
      console.error('Error type:', error.name);
      setVerificationStatus('error');
      setError(error.message || 'Verification failed. Please try again.');
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    
    if (!resendEmail) {
      setResendStatus('Please enter your email address');
      return;
    }

    try {
      setResendStatus('Sending verification email...');
      
      const response = await api.resendVerification(resendEmail);
      
      // Backend returns success with status 200 and message
      if (response.message && response.message.includes('successfully')) {
        setResendStatus('Verification email sent successfully! Check your inbox.');
        setShowResendForm(false);
        setResendEmail('');
      } else {
        setResendStatus(response.message || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setResendStatus(error.message || 'Failed to send verification email');
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <div className="verification-loading">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            
            <h2 className="loading-text">Verifying Your Email</h2>
            <p className="loading-text">{message}</p>
            
            {/* Enhanced loading progress bar */}
            <div className="loading-progress">
              <div className="loading-progress-bar"></div>
            </div>
            
            {/* Loading dots animation */}
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
            
            <div style={{ 
              marginTop: '24px', 
              padding: '16px', 
              background: 'rgba(102, 126, 234, 0.1)', 
              borderRadius: '12px',
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}>
              <p style={{ margin: '0', fontSize: '14px', color: '#667eea' }}>
                <i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>
                This process usually takes a few seconds. Please wait...
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="verification-success">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>Email Verified Successfully! 🎉</h2>
            <p>{message}</p>
            <div className="success-actions">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/login')}
              >
                <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i>
                Sign In Now
              </button>
              <p className="redirect-message">
                <i className="fas fa-clock" style={{ marginRight: '6px' }}></i>
                Redirecting to login page in a few seconds...
              </p>
            </div>
            <div style={{ 
              marginTop: '24px', 
              padding: '16px', 
              background: 'rgba(72, 187, 120, 0.1)', 
              borderRadius: '12px',
              border: '1px solid rgba(72, 187, 120, 0.2)'
            }}>
              <p style={{ margin: '0', fontSize: '14px', color: '#38a169' }}>
                <i className="fas fa-shield-check" style={{ marginRight: '8px' }}></i>
                Your account is now secure and ready to use!
              </p>
            </div>
          </div>
        );

      case 'already-verified':
        return (
          <div className="verification-success">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>Email Already Verified! ✅</h2>
            <p>{message}</p>
            <div className="success-actions">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/login')}
              >
                <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i>
                Sign In Now
              </button>
              <p className="redirect-message">
                <i className="fas fa-clock" style={{ marginRight: '6px' }}></i>
                Redirecting to login page in a few seconds...
              </p>
            </div>
            <div style={{ 
              marginTop: '24px', 
              padding: '16px', 
              background: 'rgba(102, 126, 234, 0.1)', 
              borderRadius: '12px',
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}>
              <p style={{ margin: '0', fontSize: '14px', color: '#667eea' }}>
                <i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>
                No need to verify again - your account is already active!
              </p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="verification-error">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Verification Failed</h2>
            <p className="error-message">{error}</p>
            
            <div className="error-actions">
              <button 
                className="btn btn-outline"
                onClick={() => setShowResendForm(true)}
              >
                Resend Verification Email
              </button>
              
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/signup')}
              >
                Create New Account
              </button>
            </div>

            {showResendForm && (
              <div className="resend-form">
                <h3>Resend Verification Email</h3>
                <form onSubmit={handleResendVerification}>
                  <div className="form-group">
                    <label htmlFor="resendEmail">Email Address</label>
                    <input
                      type="email"
                      id="resendEmail"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  
                  {resendStatus && (
                    <div className={`status-message ${resendStatus.includes('successfully') ? 'success' : 'error'}`}>
                      {resendStatus}
                    </div>
                  )}
                  
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Send Verification Email
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline"
                      onClick={() => setShowResendForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );

      case 'no-token':
        return (
          <div className="verification-error">
            <div className="error-icon">
              <i className="fas fa-link-slash"></i>
            </div>
            <h2>Invalid Verification Link</h2>
            <p className="error-message">{error}</p>
            
            <div className="error-actions">
              <button 
                className="btn btn-outline"
                onClick={() => setShowResendForm(true)}
              >
                Resend Verification Email
              </button>
              
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/signup')}
              >
                Create New Account
              </button>
            </div>

            {showResendForm && (
              <div className="resend-form">
                <h3>Resend Verification Email</h3>
                <form onSubmit={handleResendVerification}>
                  <div className="form-group">
                    <label htmlFor="resendEmail">Email Address</label>
                    <input
                      type="email"
                      id="resendEmail"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  
                  {resendStatus && (
                    <div className={`status-message ${resendStatus.includes('successfully') ? 'success' : 'error'}`}>
                      {resendStatus}
                    </div>
                  )}
                  
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Send Verification Email
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline"
                      onClick={() => setShowResendForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="verification-loading">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            
            <h2 className="loading-text">Preparing Verification</h2>
            <p className="loading-text">Please wait while we prepare your verification...</p>
            
            {/* Enhanced loading progress bar */}
            <div className="loading-progress">
              <div className="loading-progress-bar"></div>
            </div>
            
            {/* Loading dots animation */}
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
            
            <div style={{ 
              marginTop: '24px', 
              padding: '16px', 
              background: 'rgba(102, 126, 234, 0.1)', 
              borderRadius: '12px',
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}>
              <p style={{ margin: '0', fontSize: '14px', color: '#667eea' }}>
                <i className="fas fa-rocket" style={{ marginRight: '8px' }}></i>
                Setting up secure verification process...
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="email-verification-page">
      <div className="verification-container">
        <div className="verification-header">
          <div className="logo">
            <i className="fas fa-graduation-cap"></i>
            <span>TrustTeams</span>
          </div>
          <h1>Email Verification</h1>
          <p style={{ color: '#718096', fontSize: '16px', margin: '16px 0 0 0' }}>
            Secure your account with email verification
          </p>
        </div>

        <div className="verification-content">
          {renderContent()}
        </div>

        <div className="verification-footer">
          <p>Need help? <a href="/contact">Contact Support</a></p>
          <p style={{ marginTop: '8px', fontSize: '12px', color: '#a0aec0' }}>
            © 2024 TrustTeams. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
