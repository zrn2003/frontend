import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '../components/shared';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';
import collaborationImage from '../assets/01.jpg';

const HomePage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { user, isAuthenticated, getDashboardPath } = useAuth();
  const observerRef = useRef();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observerRef.current.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "Identity Verification",
      description: "Multi-layered verification system ensures all participants are who they claim to be, building trust from the start.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "#3B82F6"
    },
    {
      title: "Smart Matching",
      description: "Advanced algorithms connect you with the most relevant opportunities and partners based on skills, interests, and project requirements.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "#10B981"
    },
    {
      title: "Project Management",
      description: "Comprehensive tools for tracking progress, managing deadlines, coordinating team efforts, and ensuring project success.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 15V3M12 15L8 11M12 15L16 11M2 17L2.621 19.485C2.72915 19.9177 2.97882 20.3018 3.33033 20.5763C3.68184 20.8508 4.11501 20.9999 4.56692 20.9999H19.4331C19.885 20.9999 20.3182 20.8508 20.6697 20.5763C21.0212 20.8508 21.2708 20.9177 21.379 19.485L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "#F59E0B"
    },
    {
      title: "Analytics & Insights",
      description: "Detailed reporting on collaboration outcomes, platform engagement, and measurable impact for all stakeholders.",
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M9 19V13C9 11.8954 9.89543 11 11 11H13C14.1046 11 15 11.8954 15 13V19M9 19C9 20.1046 9.89543 21 11 21H13C14.1046 21 15 20.1046 15 19M9 19V9C9 7.89543 9.89543 7 11 7H13C14.1046 7 15 7.89543 15 9V19M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7C21 8.10457 20.1046 9 19 9H5C3.89543 9 3 8.10457 3 7V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "#8B5CF6"
    }
  ];

  return (
    <div className="homepage">
      <Navigation isScrolled={isScrolled} />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="gradient-orb orb-1" style={{ transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)` }}></div>
          <div className="gradient-orb orb-2" style={{ transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)` }}></div>
          <div className="gradient-orb orb-3" style={{ transform: `translate(${mousePosition.x * 25}px, ${mousePosition.y * -25}px)` }}></div>
        </div>
        
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text animate-on-scroll" id="hero-text">

              
              <h1 className="hero-title">
                Bridge the Gap Between
                <span className="gradient-text"> Industry & Academia</span>
                <br />
                Through Student Innovation
              </h1>
              
              <p className="hero-description">
                TrustTeams is the premier platform connecting companies, universities, and students 
                for meaningful collaborations, research partnerships, and career development opportunities.
              </p>
              

              
              <div className="hero-actions">
                {isAuthenticated() ? (
                  <Link to={getDashboardPath()} className="btn btn-primary btn-glow">
                    <span>Go to Dashboard</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" className="btn btn-primary btn-glow">
                      <span>Get Started Free</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                    <Link to="/login" className="btn btn-secondary btn-glass">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
              

            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="value-proposition">
        <div className="container">
          <div className="section-header animate-on-scroll" id="value-header">
            <h2 className="section-title">Designed for Every Stakeholder</h2>
            <p className="section-subtitle">
              Our platform serves the unique needs of industry, academia, and students 
              with tailored features and workflows.
            </p>
          </div>
          
          <div className="value-grid">
            <div className="value-card animate-on-scroll" id="value-card-1">
              <div className="card-pattern"></div>
              <div className="value-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M19 21V19C19 17.9391 18.5786 16.9217 17.8284 16.1716C17.0783 15.4214 16.0609 15 15 15H9C7.93913 15 6.92172 15.4214 6.17157 16.1716C5.42143 16.9217 5 17.9391 5 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>For Industry Partners</h3>
              <p>Access verified student talent, collaborate on research projects, and solve real business challenges with academic expertise and fresh perspectives.</p>
              <ul className="value-features">
                <li>Verified student profiles</li>
                <li>Project management tools</li>
                <li>Research collaboration</li>
              </ul>
            </div>
            
            <div className="value-card animate-on-scroll" id="value-card-2">
              <div className="card-pattern"></div>
              <div className="value-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 14v6.5M9 16.5v4.5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>For Academic Institutions</h3>
              <p>Connect with industry partners for applied research, access funding opportunities, and provide students with real-world project experience.</p>
              <ul className="value-features">
                <li>Industry partnerships</li>
                <li>Research funding access</li>
                <li>Student placement</li>
              </ul>
            </div>
            
            <div className="value-card animate-on-scroll" id="value-card-3">
              <div className="card-pattern"></div>
              <div className="value-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>For Students</h3>
              <p>Gain practical experience, work on meaningful projects, build professional networks, and enhance your career prospects with real industry exposure.</p>
              <ul className="value-features">
                <li>Real project experience</li>
                <li>Professional networking</li>
                <li>Career development</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Features Section */}
      <section className="dynamic-features">
        <div className="container">
          <div className="section-header animate-on-scroll" id="features-header">
            <h2 className="section-title">Built for Success</h2>
            <p className="section-subtitle">
              Comprehensive tools and features designed to facilitate meaningful 
              collaborations and ensure project success.
            </p>
          </div>
          
          <div className="features-showcase">
            <div className="features-nav">
              {features.map((feature, index) => (
                <button
                  key={index}
                  className={`feature-nav-item ${activeFeature === index ? 'active' : ''}`}
                  onClick={() => setActiveFeature(index)}
                  style={{ '--feature-color': feature.color }}
                >
                  <div className="nav-icon">{feature.icon}</div>
                  <span>{feature.title}</span>
                  <div className="nav-glow"></div>
                </button>
              ))}
            </div>
            
            <div className="feature-display">
              <div className="feature-content">
                <div className="feature-icon-large" style={{ '--feature-color': features[activeFeature].color }}>
                  {features[activeFeature].icon}
                </div>
                <h3>{features[activeFeature].title}</h3>
                <p>{features[activeFeature].description}</p>
              </div>
                             <div className="feature-visual">
                 <div className="visual-illustration">
                   <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                                           {/* Identity Verification Animation */}
                      {activeFeature === 0 && (
                        <>
                          <defs>
                            <linearGradient id="verifyGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style={{stopColor: features[activeFeature].color, stopOpacity: 0.25}} />
                              <stop offset="50%" style={{stopColor: features[activeFeature].color, stopOpacity: 0.15}} />
                              <stop offset="100%" style={{stopColor: features[activeFeature].color, stopOpacity: 0.05}} />
                            </linearGradient>
                            <radialGradient id="verifyGlow" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" style={{stopColor: features[activeFeature].color, stopOpacity: 0.5}} />
                              <stop offset="70%" style={{stopColor: features[activeFeature].color, stopOpacity: 0.2}} />
                              <stop offset="100%" style={{stopColor: features[activeFeature].color, stopOpacity: 0}} />
                            </radialGradient>
                            <radialGradient id="verifyPulse" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" style={{stopColor: features[activeFeature].color, stopOpacity: 0.7}} />
                              <stop offset="100%" style={{stopColor: features[activeFeature].color, stopOpacity: 0}} />
                            </radialGradient>
                          </defs>
                          
                          {/* Enhanced Security Shield Background */}
                          <circle cx="200" cy="150" r="120" fill="url(#verifyGlow)" opacity="0.3">
                            <animate attributeName="r" values="120;130;120" dur="4s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite"/>
                          </circle>
                          <circle cx="200" cy="150" r="90" fill="url(#verifyPulse)" opacity="0.4">
                            <animate attributeName="r" values="90;100;90" dur="3s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite"/>
                          </circle>
                          
                          {/* Enhanced Main Shield */}
                          <path d="M200 70 L250 95 L250 145 C250 190 200 210 200 210 C200 210 150 190 150 145 L150 95 Z" 
                                fill="url(#verifyGrad1)" stroke={features[activeFeature].color} strokeWidth="4">
                            <animate attributeName="stroke-width" values="4;5;4" dur="2s" repeatCount="indefinite"/>
                          </path>
                          
                          {/* Shield Inner Glow */}
                          <path d="M200 75 L245 98 L245 145 C245 185 200 205 200 205 C200 205 155 185 155 145 L155 98 Z" 
                                fill="none" stroke={features[activeFeature].color} strokeWidth="1" opacity="0.6">
                            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
                          </path>
                          
                          {/* Enhanced Shield Checkmark */}
                          <path d="M180 145 L195 160 L220 135" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <animate attributeName="stroke-dasharray" values="0,60;60,0;0,60" dur="2s" repeatCount="indefinite"/>
                          </path>
                          
                          
                          
                          {/* Scanning Particles */}
                          <circle cx="100" cy="115" r="3" fill="white">
                            <animate attributeName="cx" values="100;300;300" dur="2s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite"/>
                          </circle>
                          <circle cx="100" cy="140" r="3" fill="white">
                            <animate attributeName="cx" values="100;300;300" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                            <animate attributeName="opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                          </circle>
                          <circle cx="100" cy="165" r="3" fill="white">
                            <animate attributeName="cx" values="100;300;300" dur="2s" repeatCount="indefinite" begin="1s"/>
                            <animate attributeName="opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite" begin="1s"/>
                          </circle>
                          
                          {/* Enhanced Verification Dots */}
                          <circle cx="130" cy="95" r="6" fill={features[activeFeature].color}>
                            <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
                          </circle>
                          <circle cx="270" cy="95" r="6" fill={features[activeFeature].color}>
                            <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite" begin="0.3s"/>
                            <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite" begin="0.3s"/>
                          </circle>
                          <circle cx="200" cy="195" r="6" fill={features[activeFeature].color}>
                            <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite" begin="0.6s"/>
                            <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite" begin="0.6s"/>
                          </circle>
                          
                          {/* Security Lock Icon */}
                          <g transform="translate(200, 150)">
                            <rect x="-8" y="-5" width="16" height="12" rx="2" fill={features[activeFeature].color} opacity="0.9">
                              <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite"/>
                            </rect>
                            <circle cx="0" cy="-5" r="6" fill={features[activeFeature].color} opacity="0.9">
                              <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite"/>
                            </circle>
                            <rect x="-2" y="-3" width="4" height="3" rx="1" fill="white">
                              <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
                            </rect>
                          </g>
                          
                          {/* Security Status Indicators */}
                          <g transform="translate(320, 100)">
                            <circle r="8" fill={features[activeFeature].color} opacity="0.8">
                              <animate attributeName="r" values="8;10;8" dur="1.5s" repeatCount="indefinite"/>
                            </circle>
                            <text x="0" y="3" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">✓</text>
                          </g>
                          
                          <g transform="translate(320, 130)">
                            <circle r="8" fill={features[activeFeature].color} opacity="0.8">
                              <animate attributeName="r" values="8;10;8" dur="1.5s" repeatCount="indefinite" begin="0.3s"/>
                            </circle>
                            <text x="0" y="3" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">✓</text>
                          </g>
                          
                          <g transform="translate(320, 160)">
                            <circle r="8" fill={features[activeFeature].color} opacity="0.8">
                              <animate attributeName="r" values="8;10;8" dur="1.5s" repeatCount="indefinite" begin="0.6s"/>
                            </circle>
                            <text x="0" y="3" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">✓</text>
                          </g>
                          
                          {/* Floating Security Elements */}
                          <g transform="translate(80, 100)">
                            <rect x="-15" y="-10" width="30" height="20" rx="5" fill={features[activeFeature].color} opacity="0.7">
                              <animate attributeName="y" values="0;-5;0" dur="3s" repeatCount="indefinite"/>
                              <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite"/>
                            </rect>
                            <text x="0" y="3" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">ID</text>
                          </g>
                          
                          <g transform="translate(80, 180)">
                            <rect x="-15" y="-10" width="30" height="20" rx="5" fill={features[activeFeature].color} opacity="0.7">
                              <animate attributeName="y" values="0;5;0" dur="3s" repeatCount="indefinite" begin="0.5s"/>
                              <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" begin="0.5s"/>
                            </rect>
                            <text x="0" y="3" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">2FA</text>
                          </g>
                          
                          {/* Connection Lines to Security Elements */}
                          <line x1="95" y1="100" x2="130" y2="95" stroke={features[activeFeature].color} strokeWidth="1" opacity="0.5">
                            <animate attributeName="stroke-dasharray" values="0,40;40,0;0,40" dur="2s" repeatCount="indefinite"/>
                          </line>
                          <line x1="95" y1="180" x2="130" y2="195" stroke={features[activeFeature].color} strokeWidth="1" opacity="0.5">
                            <animate attributeName="stroke-dasharray" values="0,40;40,0;0,40" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                          </line>
                          
                          {/* Verification Success Pulse */}
                          <circle cx="200" cy="150" r="15" fill="white" opacity="0.6">
                            <animate attributeName="r" values="15;25;15" dur="2s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
                          </circle>
                        </>
                      )}
                     
                                           {/* Smart Matching Animation */}
                      {activeFeature === 1 && (
                        <>
                          <defs>
                            <linearGradient id="matchGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style={{stopColor: features[activeFeature].color, stopOpacity: 0.2}} />
                              <stop offset="50%" style={{stopColor: features[activeFeature].color, stopOpacity: 0.1}} />
                              <stop offset="100%" style={{stopColor: features[activeFeature].color, stopOpacity: 0.05}} />
                            </linearGradient>
                            <radialGradient id="matchGlow" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" style={{stopColor: features[activeFeature].color, stopOpacity: 0.4}} />
                              <stop offset="70%" style={{stopColor: features[activeFeature].color, stopOpacity: 0.1}} />
                              <stop offset="100%" style={{stopColor: features[activeFeature].color, stopOpacity: 0}} />
                            </radialGradient>
                            <radialGradient id="matchPulse" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" style={{stopColor: features[activeFeature].color, stopOpacity: 0.6}} />
                              <stop offset="100%" style={{stopColor: features[activeFeature].color, stopOpacity: 0}} />
                            </radialGradient>
                          </defs>
                          
                          {/* Enhanced Central Hub */}
                          <circle cx="200" cy="150" r="60" fill="url(#matchGlow)" opacity="0.3">
                            <animate attributeName="r" values="60;70;60" dur="4s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="0.3;0.5;0.3" dur="4s" repeatCount="indefinite"/>
                          </circle>
                          <circle cx="200" cy="150" r="45" fill="url(#matchPulse)" opacity="0.4">
                            <animate attributeName="r" values="45;55;45" dur="3s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="0.4;0.6;0.4" dur="3s" repeatCount="indefinite"/>
                          </circle>
                          <circle cx="200" cy="150" r="30" fill={features[activeFeature].color} opacity="0.9">
                            <animate attributeName="r" values="30;35;30" dur="2s" repeatCount="indefinite"/>
                          </circle>
                          
                          {/* Enhanced Connection Nodes with Icons */}
                          <g transform="translate(100, 100)">
                            <circle r="18" fill="url(#matchGrad1)" stroke={features[activeFeature].color} strokeWidth="2">
                              <animate attributeName="cy" values="0;-5;0" dur="3s" repeatCount="indefinite"/>
                            </circle>
                            <text x="0" y="4" textAnchor="middle" fontSize="12" fill={features[activeFeature].color} fontWeight="bold">👨‍💼</text>
                          </g>
                          
                          <g transform="translate(300, 100)">
                            <circle r="18" fill="url(#matchGrad1)" stroke={features[activeFeature].color} strokeWidth="2">
                              <animate attributeName="cy" values="0;-5;0" dur="3s" repeatCount="indefinite" begin="1s"/>
                            </circle>
                            <text x="0" y="4" textAnchor="middle" fontSize="12" fill={features[activeFeature].color} fontWeight="bold">🏢</text>
                          </g>
                          
                          <g transform="translate(100, 200)">
                            <circle r="18" fill="url(#matchGrad1)" stroke={features[activeFeature].color} strokeWidth="2">
                              <animate attributeName="cy" values="0;5;0" dur="3s" repeatCount="indefinite" begin="0.5s"/>
                            </circle>
                            <text x="0" y="4" textAnchor="middle" fontSize="12" fill={features[activeFeature].color} fontWeight="bold">🎓</text>
                          </g>
                          
                          <g transform="translate(300, 200)">
                            <circle r="18" fill="url(#matchGrad1)" stroke={features[activeFeature].color} strokeWidth="2">
                              <animate attributeName="cy" values="0;5;0" dur="3s" repeatCount="indefinite" begin="1.5s"/>
                            </circle>
                            <text x="0" y="4" textAnchor="middle" fontSize="12" fill={features[activeFeature].color} fontWeight="bold">💼</text>
                          </g>
                          
                          {/* Enhanced Connection Lines with Data Flow */}
                          <line x1="118" y1="115" x2="170" y2="135" stroke={features[activeFeature].color} strokeWidth="3" opacity="0.8">
                            <animate attributeName="stroke-dasharray" values="0,60;60,0;0,60" dur="2s" repeatCount="indefinite"/>
                          </line>
                          <line x1="282" y1="115" x2="230" y2="135" stroke={features[activeFeature].color} strokeWidth="3" opacity="0.8">
                            <animate attributeName="stroke-dasharray" values="0,60;60,0;0,60" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                          </line>
                          <line x1="118" y1="185" x2="170" y2="165" stroke={features[activeFeature].color} strokeWidth="3" opacity="0.8">
                            <animate attributeName="stroke-dasharray" values="0,60;60,0;0,60" dur="2s" repeatCount="indefinite" begin="1s"/>
                          </line>
                          <line x1="282" y1="185" x2="230" y2="165" stroke={features[activeFeature].color} strokeWidth="3" opacity="0.8">
                            <animate attributeName="stroke-dasharray" values="0,60;60,0;0,60" dur="2s" repeatCount="indefinite" begin="1.5s"/>
                          </line>
                          
                          {/* Data Flow Particles */}
                          <circle cx="118" cy="115" r="3" fill="white">
                            <animate attributeName="cx" values="118;170;170" dur="2s" repeatCount="indefinite"/>
                            <animate attributeName="cy" values="115;135;135" dur="2s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite"/>
                          </circle>
                          <circle cx="282" cy="115" r="3" fill="white">
                            <animate attributeName="cx" values="282;230;230" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                            <animate attributeName="cy" values="115;135;135" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                            <animate attributeName="opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                          </circle>
                          <circle cx="118" cy="185" r="3" fill="white">
                            <animate attributeName="cx" values="118;170;170" dur="2s" repeatCount="indefinite" begin="1s"/>
                            <animate attributeName="cy" values="185;165;165" dur="2s" repeatCount="indefinite" begin="1s"/>
                            <animate attributeName="opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite" begin="1s"/>
                          </circle>
                          <circle cx="282" cy="185" r="3" fill="white">
                            <animate attributeName="cx" values="282;230;230" dur="2s" repeatCount="indefinite" begin="1.5s"/>
                            <animate attributeName="cy" values="185;165;165" dur="2s" repeatCount="indefinite" begin="1.5s"/>
                            <animate attributeName="opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite" begin="1.5s"/>
                          </circle>
                          
                          {/* Enhanced Matching Pulses */}
                          <circle cx="200" cy="150" r="12" fill="white" opacity="0.9">
                            <animate attributeName="r" values="12;18;12" dur="1.5s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="0.9;1;0.9" dur="1.5s" repeatCount="indefinite"/>
                          </circle>
                          <circle cx="200" cy="150" r="6" fill={features[activeFeature].color}>
                            <animate attributeName="r" values="6;8;6" dur="1s" repeatCount="indefinite"/>
                          </circle>
                          
                          {/* Matching Success Indicators */}
                          <g transform="translate(200, 150)">
                            <path d="M-8 0 L-3 5 L8 -5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                              <animate attributeName="stroke-dasharray" values="0,20;20,0;0,20" dur="2s" repeatCount="indefinite"/>
                            </path>
                          </g>
                          
                          {/* Floating Skill Tags */}
                          <rect x="50" y="80" width="40" height="20" rx="10" fill={features[activeFeature].color} opacity="0.7">
                            <animate attributeName="y" values="80;75;80" dur="3s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite"/>
                          </rect>
                          <text x="70" y="93" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">React</text>
                          
                          <rect x="310" y="80" width="40" height="20" rx="10" fill={features[activeFeature].color} opacity="0.7">
                            <animate attributeName="y" values="80;75;80" dur="3s" repeatCount="indefinite" begin="1s"/>
                            <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" begin="1s"/>
                          </rect>
                          <text x="330" y="93" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">AI/ML</text>
                          
                          <rect x="50" y="220" width="40" height="20" rx="10" fill={features[activeFeature].color} opacity="0.7">
                            <animate attributeName="y" values="220;225;220" dur="3s" repeatCount="indefinite" begin="0.5s"/>
                            <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" begin="0.5s"/>
                          </rect>
                          <text x="70" y="233" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">Python</text>
                          
                          <rect x="310" y="220" width="40" height="20" rx="10" fill={features[activeFeature].color} opacity="0.7">
                            <animate attributeName="y" values="220;225;220" dur="3s" repeatCount="indefinite" begin="1.5s"/>
                            <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" begin="1.5s"/>
                          </rect>
                          <text x="330" y="233" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">Data</text>
                          
                          {/* Connection Lines to Skill Tags */}
                          <line x1="90" y1="90" x2="118" y2="100" stroke={features[activeFeature].color} strokeWidth="1" opacity="0.5">
                            <animate attributeName="stroke-dasharray" values="0,30;30,0;0,30" dur="2s" repeatCount="indefinite"/>
                          </line>
                          <line x1="350" y1="90" x2="282" y2="100" stroke={features[activeFeature].color} strokeWidth="1" opacity="0.5">
                            <animate attributeName="stroke-dasharray" values="0,30;30,0;0,30" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                          </line>
                          <line x1="90" y1="230" x2="118" y2="200" stroke={features[activeFeature].color} strokeWidth="1" opacity="0.5">
                            <animate attributeName="stroke-dasharray" values="0,30;30,0;0,30" dur="2s" repeatCount="indefinite" begin="1s"/>
                          </line>
                          <line x1="350" y1="230" x2="282" y2="200" stroke={features[activeFeature].color} strokeWidth="1" opacity="0.5">
                            <animate attributeName="stroke-dasharray" values="0,30;30,0;0,30" dur="2s" repeatCount="indefinite" begin="1.5s"/>
                          </line>
                        </>
                      )}
                     
                                           {/* Project Management Animation */}
                      {activeFeature === 2 && (
                        <>
                          <defs>
                            <linearGradient id="manageGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style={{stopColor: features[activeFeature].color, stopOpacity: 0.15}} />
                              <stop offset="100%" style={{stopColor: features[activeFeature].color, stopOpacity: 0.05}} />
                            </linearGradient>
                            <radialGradient id="manageGlow" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" style={{stopColor: features[activeFeature].color, stopOpacity: 0.3}} />
                              <stop offset="100%" style={{stopColor: features[activeFeature].color, stopOpacity: 0}} />
                            </radialGradient>
                          </defs>
                          
                          {/* Kanban Board Background */}
                          <rect x="100" y="70" width="200" height="160" rx="12" fill="url(#manageGrad1)" stroke={features[activeFeature].color} strokeWidth="2" opacity="0.8"/>
                          
                          {/* Column Headers */}
                          <rect x="110" y="80" width="50" height="25" rx="6" fill={features[activeFeature].color} opacity="0.9">
                            <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite"/>
                          </rect>
                          <rect x="175" y="80" width="50" height="25" rx="6" fill={features[activeFeature].color} opacity="0.9">
                            <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                          </rect>
                          <rect x="240" y="80" width="50" height="25" rx="6" fill={features[activeFeature].color} opacity="0.9">
                            <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" begin="1s"/>
                          </rect>
                          
                          {/* Task Cards - To Do */}
                          <rect x="110" y="115" width="50" height="35" rx="4" fill="white" stroke={features[activeFeature].color} strokeWidth="1" opacity="0.9">
                            <animate attributeName="y" values="115;110;115" dur="3s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite"/>
                          </rect>
                          <rect x="110" y="160" width="50" height="35" rx="4" fill="white" stroke={features[activeFeature].color} strokeWidth="1" opacity="0.9">
                            <animate attributeName="y" values="160;155;160" dur="3s" repeatCount="indefinite" begin="1s"/>
                            <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" begin="1s"/>
                          </rect>
                          
                          {/* Task Cards - In Progress */}
                          <rect x="175" y="115" width="50" height="35" rx="4" fill="white" stroke={features[activeFeature].color} strokeWidth="1" opacity="0.9">
                            <animate attributeName="y" values="115;110;115" dur="3s" repeatCount="indefinite" begin="0.5s"/>
                            <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" begin="0.5s"/>
                          </rect>
                          <rect x="175" y="160" width="50" height="35" rx="4" fill="white" stroke={features[activeFeature].color} strokeWidth="1" opacity="0.9">
                            <animate attributeName="y" values="160;155;160" dur="3s" repeatCount="indefinite" begin="1.5s"/>
                            <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" begin="1.5s"/>
                          </rect>
                          
                          {/* Task Cards - Done */}
                          <rect x="240" y="115" width="50" height="35" rx="4" fill="white" stroke={features[activeFeature].color} strokeWidth="1" opacity="0.9">
                            <animate attributeName="y" values="115;110;115" dur="3s" repeatCount="indefinite" begin="1s"/>
                            <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" begin="1s"/>
                          </rect>
                          <rect x="240" y="160" width="50" height="35" rx="4" fill="white" stroke={features[activeFeature].color} strokeWidth="1" opacity="0.9">
                            <animate attributeName="y" values="160;155;160" dur="3s" repeatCount="indefinite" begin="2s"/>
                            <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" begin="2s"/>
                          </rect>
                          
                          {/* Progress Indicators on Cards */}
                          <rect x="115" y="120" width="40" height="3" rx="1.5" fill={features[activeFeature].color} opacity="0.7">
                            <animate attributeName="width" values="40;30;40" dur="2s" repeatCount="indefinite"/>
                          </rect>
                          <rect x="180" y="120" width="40" height="3" rx="1.5" fill={features[activeFeature].color} opacity="0.7">
                            <animate attributeName="width" values="40;35;40" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                          </rect>
                          <rect x="245" y="120" width="40" height="3" rx="1.5" fill={features[activeFeature].color} opacity="0.7">
                            <animate attributeName="width" values="40;40;40" dur="2s" repeatCount="indefinite" begin="1s"/>
                          </rect>
                          
                          {/* Moving Task Animation */}
                          <rect x="130" y="140" width="30" height="20" rx="3" fill={features[activeFeature].color} opacity="0.8">
                            <animate attributeName="x" values="130;175;240;240" dur="6s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="0.8;1;0.8;0.8" dur="6s" repeatCount="indefinite"/>
                          </rect>
                          
                          {/* Timeline at Bottom */}
                          <line x1="100" y1="200" x2="300" y2="200" stroke={features[activeFeature].color} strokeWidth="2" opacity="0.6"/>
                          
                          {/* Timeline Milestones */}
                          <circle cx="120" cy="200" r="4" fill={features[activeFeature].color}>
                            <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite"/>
                          </circle>
                          <circle cx="180" cy="200" r="4" fill={features[activeFeature].color}>
                            <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                          </circle>
                          <circle cx="240" cy="200" r="4" fill={features[activeFeature].color}>
                            <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" begin="1s"/>
                          </circle>
                          <circle cx="280" cy="200" r="4" fill={features[activeFeature].color}>
                            <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" begin="1.5s"/>
                          </circle>
                          
                          {/* Progress Flow Animation */}
                          <circle cx="120" cy="200" r="2" fill="white">
                            <animate attributeName="cx" values="120;180;240;280;280" dur="4s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="1;0.8;1;0.8;1" dur="4s" repeatCount="indefinite"/>
                          </circle>
                          
                          {/* Team Collaboration Indicators */}
                          <circle cx="320" cy="100" r="8" fill={features[activeFeature].color} opacity="0.7">
                            <animate attributeName="r" values="8;10;8" dur="1.5s" repeatCount="indefinite"/>
                          </circle>
                          <circle cx="335" cy="100" r="8" fill={features[activeFeature].color} opacity="0.7">
                            <animate attributeName="r" values="8;10;8" dur="1.5s" repeatCount="indefinite" begin="0.3s"/>
                          </circle>
                          <circle cx="350" cy="100" r="8" fill={features[activeFeature].color} opacity="0.7">
                            <animate attributeName="r" values="8;10;8" dur="1.5s" repeatCount="indefinite" begin="0.6s"/>
                          </circle>
                          
                          {/* Connection Lines to Team */}
                          <line x1="300" y1="120" x2="320" y2="100" stroke={features[activeFeature].color} strokeWidth="1" opacity="0.5">
                            <animate attributeName="stroke-dasharray" values="0,30;30,0;0,30" dur="2s" repeatCount="indefinite"/>
                          </line>
                        </>
                      )}
                     
                     {/* Analytics & Insights Animation */}
                     {activeFeature === 3 && (
                       <>
                         <defs>
                           <linearGradient id="analyticsGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                             <stop offset="0%" style={{stopColor: features[activeFeature].color, stopOpacity: 0.2}} />
                             <stop offset="100%" style={{stopColor: features[activeFeature].color, stopOpacity: 0.05}} />
                           </linearGradient>
                           <radialGradient id="analyticsGlow" cx="50%" cy="50%" r="50%">
                             <stop offset="0%" style={{stopColor: features[activeFeature].color, stopOpacity: 0.3}} />
                             <stop offset="100%" style={{stopColor: features[activeFeature].color, stopOpacity: 0}} />
                           </radialGradient>
                         </defs>
                         
                         {/* Chart Background */}
                         <rect x="120" y="80" width="160" height="140" rx="8" fill="url(#analyticsGrad1)" stroke={features[activeFeature].color} strokeWidth="3"/>
                         
                         {/* Bar Chart */}
                         <rect x="140" y="180" width="20" height="0" fill={features[activeFeature].color}>
                           <animate attributeName="height" values="0;40;0" dur="2s" repeatCount="indefinite"/>
                           <animate attributeName="y" values="180;140;180" dur="2s" repeatCount="indefinite"/>
                         </rect>
                         <rect x="170" y="180" width="20" height="0" fill={features[activeFeature].color}>
                           <animate attributeName="height" values="0;60;0" dur="2s" repeatCount="indefinite" begin="0.3s"/>
                           <animate attributeName="y" values="180;120;180" dur="2s" repeatCount="indefinite" begin="0.3s"/>
                         </rect>
                         <rect x="200" y="180" width="20" height="0" fill={features[activeFeature].color}>
                           <animate attributeName="height" values="0;30;0" dur="2s" repeatCount="indefinite" begin="0.6s"/>
                           <animate attributeName="y" values="180;150;180" dur="2s" repeatCount="indefinite" begin="0.6s"/>
                         </rect>
                         <rect x="230" y="180" width="20" height="0" fill={features[activeFeature].color}>
                           <animate attributeName="height" values="0;80;0" dur="2s" repeatCount="indefinite" begin="0.9s"/>
                           <animate attributeName="y" values="180;100;180" dur="2s" repeatCount="indefinite" begin="0.9s"/>
                         </rect>
                         <rect x="260" y="180" width="20" height="0" fill={features[activeFeature].color}>
                           <animate attributeName="height" values="0;50;0" dur="2s" repeatCount="indefinite" begin="1.2s"/>
                           <animate attributeName="y" values="180;130;180" dur="2s" repeatCount="indefinite" begin="1.2s"/>
                         </rect>
                         
                         {/* Line Chart */}
                         <path d="M140 160 L170 140 L200 150 L230 120 L260 130" stroke={features[activeFeature].color} strokeWidth="3" fill="none" strokeLinecap="round">
                           <animate attributeName="stroke-dasharray" values="0,200;200,0;0,200" dur="3s" repeatCount="indefinite"/>
                         </path>
                         
                         {/* Data Points */}
                         <circle cx="140" cy="160" r="4" fill={features[activeFeature].color}>
                           <animate attributeName="r" values="4;6;4" dur="1s" repeatCount="indefinite"/>
                         </circle>
                         <circle cx="170" cy="140" r="4" fill={features[activeFeature].color}>
                           <animate attributeName="r" values="4;6;4" dur="1s" repeatCount="indefinite" begin="0.2s"/>
                         </circle>
                         <circle cx="200" cy="150" r="4" fill={features[activeFeature].color}>
                           <animate attributeName="r" values="4;6;4" dur="1s" repeatCount="indefinite" begin="0.4s"/>
                         </circle>
                         <circle cx="230" cy="120" r="4" fill={features[activeFeature].color}>
                           <animate attributeName="r" values="4;6;4" dur="1s" repeatCount="indefinite" begin="0.6s"/>
                         </circle>
                         <circle cx="260" cy="130" r="4" fill={features[activeFeature].color}>
                           <animate attributeName="r" values="4;6;4" dur="1s" repeatCount="indefinite" begin="0.8s"/>
                         </circle>
                         
                         {/* Metrics Display */}
                         <rect x="140" y="90" width="60" height="20" rx="4" fill={features[activeFeature].color} opacity="0.8">
                           <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
                         </rect>
                         <rect x="220" y="90" width="60" height="20" rx="4" fill={features[activeFeature].color} opacity="0.8">
                           <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" begin="1s"/>
                         </rect>
                       </>
                     )}
                   </svg>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Overview Section */}
      <section className="platform-overview">
        <div className="container">
          <div className="section-header animate-on-scroll" id="overview-header">
            <h2 className="section-title">How TrustTeams Works</h2>
            <p className="section-subtitle">
              A streamlined process designed for secure, efficient collaboration 
              between all stakeholders.
            </p>
          </div>
          
          <div className="overview-grid">
            <div className="overview-step animate-on-scroll" id="step-1">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Create Your Profile</h3>
                <p>Set up your professional profile with verified credentials, expertise areas, and collaboration preferences.</p>
              </div>
              <div className="step-glow"></div>
            </div>
            
            <div className="overview-step animate-on-scroll" id="step-2">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Discover Opportunities</h3>
                <p>Browse projects, research collaborations, and career opportunities that match your interests and expertise.</p>
              </div>
              <div className="step-glow"></div>
            </div>
            
            <div className="overview-step animate-on-scroll" id="step-3">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Connect & Collaborate</h3>
                <p>Engage with partners through our secure communication tools and comprehensive project management system.</p>
              </div>
              <div className="step-glow"></div>
            </div>
            
            <div className="overview-step animate-on-scroll" id="step-4">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Track & Measure Impact</h3>
                <p>Monitor project milestones, measure outcomes, and build a portfolio of successful collaborations.</p>
              </div>
              <div className="step-glow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-background">
          <div className="cta-pattern"></div>
        </div>
        <div className="container">
          <div className="cta-content animate-on-scroll" id="cta-content">
            <h2>Ready to Transform Your Collaboration Experience?</h2>
            <p>
              Join our platform and discover new opportunities for growth, 
              innovation, and meaningful partnerships in a secure, professional environment.
            </p>
            <div className="cta-actions">
              {isAuthenticated() ? (
                <Link to={getDashboardPath()} className="btn btn-primary btn-large btn-glow">
                  <span>Go to Dashboard</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              ) : (
                <Link to="/signup" className="btn btn-primary btn-large btn-glow">
                  <span>Get Started Today</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              )}
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
                <span className="logo-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="logo-text">TrustTeams</span>
              </div>
              <p>Facilitating meaningful collaborations through trust, technology, and professional standards.</p>
              <div className="social-links">
                <a href="#" className="social-link">LinkedIn</a>
                <a href="#" className="social-link">Twitter</a>
                <a href="#" className="social-link">Contact</a>
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