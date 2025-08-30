import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '../components/shared';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';
import collaborationImage from '../assets/01.jpg';

const HomePage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const { user, isAuthenticated, getDashboardPath } = useAuth();
  
  const sectionRefs = {
    hero: useRef(null),
    features: useRef(null),
    about: useRef(null),
    stats: useRef(null),
    testimonials: useRef(null),
    cta: useRef(null)
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = Object.keys(sectionRefs);
      const scrollPosition = window.scrollY + 100;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = sectionRefs[section].current;
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    sectionRefs[sectionId].current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="homepage">
      <Navigation isScrolled={isScrolled} />
      
      {/* Hero Section */}
      <section className="hero" ref={sectionRefs.hero}>
        <div className="hero-background">
          <div className="hero-pattern"></div>
          <div className="hero-gradient"></div>
        </div>
        
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                <span className="badge-icon">🚀</span>
                <span>Trusted by 10,000+ organizations</span>
              </div>
              
              <h1 className="hero-title">
                The Future of 
                <span className="gradient-text"> Collaboration</span>
                <br />
                Starts Here
              </h1>
              
              <p className="hero-description">
                Connect industries, academic institutions, and students through our 
                intelligent platform that builds trust, fosters innovation, and creates 
                meaningful partnerships.
              </p>
              
                             <div className="hero-actions">
                 {isAuthenticated() ? (
                   <Link to={getDashboardPath()} className="btn btn-primary">
                     <span>Go to Dashboard</span>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                       <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                   </Link>
                 ) : (
                   <>
                     <Link to="/signup" className="btn btn-primary">
                       <span>Get Started Free</span>
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                         <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                       </svg>
                     </Link>
                     <Link to="/login" className="btn btn-secondary">
                       Sign In
                     </Link>
                   </>
                 )}
               </div>
              
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">50K+</span>
                  <span className="stat-label">Students</span>
                </div>
                <div className="stat">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Companies</span>
                </div>
                <div className="stat">
                  <span className="stat-number">200+</span>
                  <span className="stat-label">Universities</span>
                </div>
              </div>
            </div>
            
            <div className="hero-visual">
              <div className="hero-image">
                <div className="floating-card card-1">
                  <div className="card-icon">🏭</div>
                  <div className="card-content">
                    <h4>Industry Partners</h4>
                    <p>Connect with leading companies</p>
                  </div>
                </div>
                <div className="floating-card card-2">
                  <div className="card-icon">🎓</div>
                  <div className="card-content">
                    <h4>Academic Excellence</h4>
                    <p>Research & innovation hub</p>
                  </div>
                </div>
                <div className="floating-card card-3">
                  <div className="card-icon">👨‍🎓</div>
                  <div className="card-content">
                    <h4>Student Success</h4>
                    <p>Career opportunities await</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" ref={sectionRefs.features}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose TrustTeams?</h2>
            <p className="section-subtitle">
              Our platform combines cutting-edge technology with proven collaboration 
              methodologies to deliver exceptional results.
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Trust Verification</h3>
              <p>Advanced algorithms ensure reliable partnerships and verified collaborations with comprehensive background checks.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Smart Automation</h3>
              <p>Streamlined workflows that save time and reduce administrative overhead with intelligent process optimization.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M9 19V13C9 11.8954 9.89543 11 11 11H13C14.1046 11 15 11.8954 15 13V19M9 19C9 20.1046 9.89543 21 11 21H13C14.1046 21 15 20.1046 15 19M9 19V9C9 7.89543 9.89543 7 11 7H13C14.1046 7 15 7.89543 15 9V19M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7C21 8.10457 20.1046 9 19 9H5C3.89543 9 3 8.10457 3 7V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Lifecycle Tracking</h3>
              <p>End-to-end project monitoring from inception to completion with real-time progress updates and milestone tracking.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M9 19V13C9 11.8954 9.89543 11 11 11H13C14.1046 11 15 11.8954 15 13V19M9 19C9 20.1046 9.89543 21 11 21H13C14.1046 21 15 20.1046 15 19M9 19V9C9 7.89543 9.89543 7 11 7H13C14.1046 7 15 7.89543 15 9V19M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7C21 8.10457 20.1046 9 19 9H5C3.89543 9 3 8.10457 3 7V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Impact Measurement</h3>
              <p>Quantifiable results and success metrics for all stakeholders with detailed analytics and performance insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about" ref={sectionRefs.about}>
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Building Bridges Between Innovation & Opportunity</h2>
              <p>
                TrustTeams is more than just a platform—it's a comprehensive ecosystem 
                designed to break down barriers between industry, academia, and students. 
                We believe that the best innovations happen when diverse minds collaborate 
                in an environment of trust and mutual respect.
              </p>
              <p>
                Our mission is to create a world where every student has access to 
                meaningful opportunities, every academic institution can showcase its 
                research, and every industry can find the talent and innovation it needs 
                to thrive.
              </p>
              <div className="about-actions">
                <Link to="/about" className="btn btn-outline">Learn More</Link>
                <Link to="/contact" className="btn btn-text">Contact Us</Link>
              </div>
            </div>
            <div className="about-visual">
              <div className="about-image">
                <img 
                  src={collaborationImage} 
                  alt="Team collaboration and innovation" 
                  className="collaboration-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats" ref={sectionRefs.stats}>
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Active Users</div>
              <div className="stat-description">Students, professionals, and academics</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Partner Companies</div>
              <div className="stat-description">From startups to Fortune 500</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">200+</div>
              <div className="stat-label">Universities</div>
              <div className="stat-description">Global academic institutions</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Success Rate</div>
              <div className="stat-description">Successful collaborations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials" ref={sectionRefs.testimonials}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Users Say</h2>
            <p className="section-subtitle">
              Hear from students, academics, and industry leaders about their experience with TrustTeams.
            </p>
          </div>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"TrustTeams transformed how we connect with students. The platform's verification system gives us confidence in every partnership."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍💼</div>
                <div className="author-info">
                  <h4>Sarah Johnson</h4>
                  <span>HR Director, TechCorp</span>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"As a student, I found incredible opportunities through TrustTeams. The platform made it easy to connect with industry leaders."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍🎓</div>
                <div className="author-info">
                  <h4>Michael Chen</h4>
                  <span>Computer Science Student</span>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"Our research collaborations have never been stronger. TrustTeams provides the perfect bridge between academia and industry."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👩‍🏫</div>
                <div className="author-info">
                  <h4>Dr. Emily Rodriguez</h4>
                  <span>Research Director, MIT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta" ref={sectionRefs.cta}>
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Collaboration Experience?</h2>
            <p>
              Join thousands of organizations and students already benefiting from 
              TrustTeams' innovative platform.
            </p>
            <div className="cta-actions">
              <Link to="/signup" className="btn btn-primary btn-large">
                <span>Start Your Journey</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link to="/demo" className="btn btn-outline btn-large">
                Request Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <span className="logo-icon">🤝</span>
                <span className="logo-text">TrustTeams</span>
              </div>
              <p>Building trust, fostering innovation, connecting futures.</p>
              <div className="social-links">
                <a href="#" className="social-link">Twitter</a>
                <a href="#" className="social-link">LinkedIn</a>
                <a href="#" className="social-link">GitHub</a>
              </div>
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
                <h4>Company</h4>
                <Link to="/about">About Us</Link>
                <Link to="/careers">Careers</Link>
                <Link to="/press">Press</Link>
                <Link to="/contact">Contact</Link>
              </div>
              <div className="footer-section">
                <h4>Support</h4>
                <Link to="/help">Help Center</Link>
                <Link to="/docs">Documentation</Link>
                <Link to="/status">Status</Link>
                <Link to="/security">Security</Link>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-legal">
              <span>&copy; 2025 TrustTeams. All rights reserved.</span>
              <div className="legal-links">
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms of Service</Link>
                <Link to="/cookies">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;