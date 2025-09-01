import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import './EmailVerification.css';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus('no-token');
      setError('No verification token provided');
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      setVerificationStatus('verifying');
      setMessage('Verifying your email...');
      setError('');

      const response = await api.verifyEmail(token);
      
      // Debug logging
      console.log('Verification response:', response);
      console.log('Response message:', response.message);
      console.log('Message includes successfully:', response.message && response.message.includes('successfully'));
      
      // Backend returns success with status 200 and message
      if (response.message && response.message.includes('successfully')) {
        console.log('Setting success status');
        setVerificationStatus('success');
        setMessage(response.message || 'Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        console.log('Setting error status');
        setVerificationStatus('error');
        setError(response.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
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
            <h2>Verifying Your Email</h2>
            <p>{message}</p>
          </div>
        );

      case 'success':
        return (
          <div className="verification-success">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>Email Verified Successfully!</h2>
            <p>{message}</p>
            <div className="success-actions">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/login')}
              >
                Sign In Now
              </button>
              <p className="redirect-message">
                Redirecting to login page in a few seconds...
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
        return null;
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
        </div>

        <div className="verification-content">
          {renderContent()}
        </div>

        <div className="verification-footer">
          <p>Need help? <a href="/contact">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
