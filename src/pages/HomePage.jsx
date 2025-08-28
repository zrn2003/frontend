import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import './HomePage.css';

const HomePage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState({
    hero: false,
    mission: false,
    student: false,
    vision: false,
    features: false,
    cta: false
  });
  
  const sectionRefs = {
    hero: useRef(null),
    mission: useRef(null),
    student: useRef(null),
    vision: useRef(null),
    features: useRef(null),
    cta: useRef(null)
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Check which sections are in view
      const newVisibility = {...isVisible};
      Object.keys(sectionRefs).forEach(key => {
        if (sectionRefs[key].current) {
          const rect = sectionRefs[key].current.getBoundingClientRect();
          newVisibility[key] = rect.top < window.innerHeight - 100 && rect.bottom > 0;
        }
      });
      setIsVisible(newVisibility);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="homepage">
      <Navigation isScrolled={isScrolled} />
      
      {/* Hero Section */}
      <section className={`hero ${isVisible.hero ? 'visible' : ''}`} ref={sectionRefs.hero}>
        <div className="hero-background">
          <div className="particles-container">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="particle" style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}></div>
            ))}
          </div>
          <div className="gradient-overlay"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome to <span className="highlight">TrustTeams</span>
            </h1>
            <p className="hero-subtitle">
              The world-class, trust-driven collaboration ecosystem connecting industries, 
              institutions, and students for impactful innovation.
            </p>
            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary magnetic">
                <span className="btn-text">Get Started</span>
              </Link>
              <Link to="/signup" className="btn btn-secondary magnetic">
                <span className="btn-text">Join Now</span>
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-cards">
              <div className="card industry floating">🏭 Industry</div>
              <div className="card academic floating delayed-1">🎓 Academic</div>
              <div className="card student floating delayed-2">👨‍🎓 Student</div>
            </div>
          </div>
        </div>
        
        <div className="scroll-indicator">
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={`mission ${isVisible.mission ? 'visible' : ''}`} ref={sectionRefs.mission}>
        <div className="container">
          <h2 className="section-title">Our Mission</h2>
          <div className="mission-content">
            <div className="mission-text">
              <p className="mission-description">
                For industries, academic institutions, and students who struggle to find a 
                trustworthy and seamless platform to collaborate on projects, research, and 
                skill-building, TrustTeams is a collaboration ecosystem and innovation platform 
                that creates impactful connections by blending automation, trust scoring, and 
                end-to-end project lifecycle tracking.
              </p>
              <p className="mission-difference">
                Unlike fragmented, unverified collaboration workflows or one-sided portals, 
                our product ensures trusted, measurable, and equitable engagement across all stakeholders.
              </p>
            </div>
            <div className="mission-visual">
              <div className="ecosystem-diagram">
                <div className="ecosystem-node industry-node orbit">
                  <span>🏭</span>
                  <p>Industries</p>
                </div>
                <div className="ecosystem-node academic-node orbit delayed-1">
                  <span>🎓</span>
                  <p>Academic Institutions</p>
                </div>
                <div className="ecosystem-node student-node orbit delayed-2">
                  <span>👨‍🎓</span>
                  <p>Students</p>
                </div>
                <div className="ecosystem-center pulse">
                  <span>🤝</span>
                  <p>TrustTeams</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Section */}
      <section className={`student-section ${isVisible.student ? 'visible' : ''}`} ref={sectionRefs.student}>
        <div className="container">
          <h2 className="section-title">For Students</h2>
          <div className="student-content">
            <div className="student-features">
              <div className="student-feature slide-in">
                <div className="feature-icon">🔍</div>
                <h3>Find Verified Opportunities</h3>
                <p>Filter and apply to verified, high-value internships and projects that match your interests and skills.</p>
              </div>
              <div className="student-feature slide-in delayed-1">
                <div className="feature-icon">📁</div>
                <h3>Build Your Portfolio</h3>
                <p>Automatically build and maintain your portfolio and skills graph as you complete each activity.</p>
              </div>
              <div className="student-feature slide-in delayed-2">
                <div className="feature-icon">👥</div>
                <h3>Connect with Mentors</h3>
                <p>Search for mentors who share your background or specialization for relatable guidance.</p>
              </div>
              <div className="student-feature slide-in delayed-3">
                <div className="feature-icon">🏆</div>
                <h3>Earn Credentials</h3>
                <p>Get recognized micro-credentials for project completions to showcase to future employers.</p>
              </div>
            </div>
            <div className="student-cta">
              <h3>Ready to Start Your Journey?</h3>
              <p>Access opportunities through our unbiased, transparent platform and compete on merit alone.</p>
              <Link to="/student" className="btn btn-primary btn-large magnetic">
                <span className="btn-text">Access Student Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className={`vision ${isVisible.vision ? 'visible' : ''}`} ref={sectionRefs.vision}>
        <div className="container">
          <h2 className="section-title">Our Vision</h2>
          <div className="vision-content">
            <div className="vision-card fade-in">
              <div className="vision-icon">🌟</div>
              <h3>World-Class Ecosystem</h3>
              <p>Creating a premier platform that sets the standard for collaborative innovation</p>
            </div>
            <div className="vision-card fade-in delayed-1">
              <div className="vision-icon">🔗</div>
              <h3>Seamless Connections</h3>
              <p>Bridging the gap between different stakeholders with intuitive technology</p>
            </div>
            <div className="vision-card fade-in delayed-2">
              <div className="vision-icon">📈</div>
              <h3>Measurable Growth</h3>
              <p>Providing clear metrics and outcomes for all participants</p>
            </div>
            <div className="vision-card fade-in delayed-3">
              <div className="vision-icon">⚖️</div>
              <h3>Equitable Opportunities</h3>
              <p>Ensuring fair access and balanced benefits for everyone involved</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`features ${isVisible.features ? 'visible' : ''}`} ref={sectionRefs.features}>
        <div className="container">
          <h2 className="section-title">Why Choose TrustTeams?</h2>
          <div className="features-grid">
            <div className="feature-item scale-in">
              <div className="feature-icon">🔒</div>
              <h3>Trust Scoring</h3>
              <p>Advanced algorithms ensure reliable partnerships and verified collaborations</p>
            </div>
            <div className="feature-item scale-in delayed-1">
              <div className="feature-icon">🤖</div>
              <h3>Smart Automation</h3>
              <p>Streamlined workflows that save time and reduce administrative overhead</p>
            </div>
            <div className="feature-item scale-in delayed-2">
              <div className="feature-icon">📊</div>
              <h3>Lifecycle Tracking</h3>
              <p>End-to-end project monitoring from inception to completion</p>
            </div>
            <div className="feature-item scale-in delayed-3">
              <div className="feature-icon">🎯</div>
              <h3>Impact Measurement</h3>
              <p>Quantifiable results and success metrics for all stakeholders</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`cta ${isVisible.cta ? 'visible' : ''}`} ref={sectionRefs.cta}>
        <div className="cta-background">
          <div className="cta-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="cta-particle" style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 5}s`
              }}></div>
            ))}
          </div>
        </div>
        <div className="container">
          <h2>Ready to Transform Collaboration?</h2>
          <p>Join thousands of organizations and students already benefiting from TrustTeams</p>
          <div className="cta-buttons">
            <Link to="/signup" className="btn btn-primary btn-large magnetic">
              <span className="btn-text">Start Your Journey</span>
            </Link>
            <Link to="/login" className="btn btn-outline btn-large magnetic">
              <span className="btn-text">Sign In</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>TrustTeams</h3>
              <p>Building trust, fostering innovation, connecting futures</p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Platform</h4>
                <Link to="/opportunities">Opportunities</Link>
                <Link to="/icm">ICM Dashboard</Link>
                <Link to="/student">Student Dashboard</Link>
                <Link to="/profile">Profile</Link>
              </div>
              <div className="footer-section">
                <h4>Support</h4>
                <a href="#help">Help Center</a>
                <a href="#contact">Contact Us</a>
                <a href="#docs">Documentation</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 TrustTeams. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;