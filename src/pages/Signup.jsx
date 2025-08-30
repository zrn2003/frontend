import { useState, useEffect } from "react";
import { api } from "../config/api.js";
import "../components/shared/LoginForm.css"; // reuse premium styles
import "./Signup.css"; // custom styles for signup

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // default role
  const [university_id, setUniversityId] = useState("");
  const [institute_name, setInstituteName] = useState("");
  const [universities, setUniversities] = useState([]);
  const [universityMode, setUniversityMode] = useState("select"); // "select" or "create"
  const [university_name, setUniversityName] = useState("");
  const [university_domain, setUniversityDomain] = useState("");
  const [university_address, setUniversityAddress] = useState("");
  const [university_website, setUniversityWebsite] = useState("");
  const [university_contact_email, setUniversityContactEmail] = useState("");
  const [university_contact_phone, setUniversityContactPhone] = useState("");
  const [university_established_year, setUniversityEstablishedYear] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [strength, setStrength] = useState(0);

  // Load universities on component mount
  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    try {
      console.log('Loading universities...');
      const data = await api.getUniversities();
      console.log('Universities loaded:', data);
      setUniversities(data.universities || []);
    } catch (error) {
      console.error('Failed to load universities:', error);
    }
  };

  function evalStrength(pw) {
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
    if (/\d/.test(pw) || /[^\w\s]/.test(pw)) s++
    setStrength(s)
  }

  function getPanelContent() {
    switch (role) {
      case 'manager':
        return {
          logo: 'TT',
          title: 'Industry Collaboration Manager',
          description: 'Join TrustTeams to coordinate with partners, streamline approvals, and accelerate partnerships.',
          highlights: [
            '✨ Secure role-based access',
            '🚀 Real-time partner updates',
            '🔐 Centralized records'
          ]
        }
      case 'student':
        return {
          logo: 'TT',
          title: 'Student Portal',
          description: 'Join TrustTeams to access opportunities, track applications, and manage your academic journey.',
          highlights: [
            '✨ Browse opportunities',
            '🚀 Track applications',
            '🔐 Manage profile'
          ]
        }
      case 'academic':
        return {
          logo: 'TT',
          title: 'Academic Leader Dashboard',
          description: 'Join TrustTeams to manage student applications, approve opportunities, and oversee academic partnerships.',
          highlights: [
            '✨ Review applications',
            '🚀 Approve opportunities',
            '🔐 Academic oversight'
          ]
        }
      case 'university':
        return {
          logo: 'TT',
          title: 'University Administration',
          description: 'Join TrustTeams to manage institutional partnerships, oversee academic programs, and coordinate with industry.',
          highlights: [
            '✨ Institutional management',
            '🚀 Program oversight',
            '🔐 Partnership coordination'
          ]
        }
      default:
        return {
          logo: 'TT',
          title: 'Join TrustTeams',
          description: 'Build trusted collaboration across industry, academia and students.',
          highlights: [
            '✨ Modern, secure onboarding',
            '🚀 Role-tailored experiences',
            '🔐 Data privacy first'
          ]
        }
    }
  }

  const requiresUniversity = role === 'student' || role === 'academic' || role === 'university';

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate required fields based on role
    if (role === 'university') {
      if (universityMode === "select" && !university_id) {
        setError("Please select a university");
        setLoading(false);
        return;
      } else if (universityMode === "create") {
        if (!university_name.trim() || !university_domain.trim()) {
          setError("University name and domain are required");
          setLoading(false);
          return;
        }
      }
    } else if (requiresUniversity && !university_id) {
      setError("Please select a university");
      setLoading(false);
      return;
    }

    if ((role === 'student' || role === 'academic') && !institute_name.trim()) {
      setError("Please enter your institute name");
      setLoading(false);
      return;
    }

    try {
      const mappedRole = role === 'academic' ? 'academic_leader' : role === 'university' ? 'university_admin' : role;
      
      const signupData = {
        name,
        email,
        password,
        role: mappedRole
      };

      // Add university and institute data for relevant roles
      if (role === 'university') {
        if (universityMode === "select") {
          signupData.university_id = parseInt(university_id);
        } else {
          signupData.university_name = university_name.trim();
          signupData.university_domain = university_domain.trim();
          signupData.university_address = university_address.trim();
          signupData.university_website = university_website.trim();
          signupData.university_contact_email = university_contact_email.trim();
          signupData.university_contact_phone = university_contact_phone.trim();
          signupData.university_established_year = university_established_year ? parseInt(university_established_year) : null;
        }
      } else if (requiresUniversity) {
        signupData.university_id = parseInt(university_id);
      }

      if (role === 'student' || role === 'academic') {
        signupData.institute_name = institute_name.trim();
      }

      const response = await api.signup(signupData);
      
      if (response.message.includes('pending approval')) {
        setSuccess("🎉 Registration submitted successfully! Please wait for university administrator approval before you can log in.");
      } else {
        setSuccess("🎉 Account created successfully! You can now sign in.");
      }
      
      // Reset form
      setName(""); 
      setEmail(""); 
      setPassword(""); 
      setRole("student"); 
      setUniversityId("");
      setInstituteName("");
      setUniversityMode("select");
      setUniversityName("");
      setUniversityDomain("");
      setUniversityAddress("");
      setUniversityWebsite("");
      setUniversityContactEmail("");
      setUniversityContactPhone("");
      setUniversityEstablishedYear("");
      setStrength(0);
    } catch (e) {
      setError(e.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  const panelContent = getPanelContent()

  return (
    <div className="login-page">
      {/* Left branding */}
      <aside className="brand-panel">
        <div className="brand-content">
          <div className="logo-mark">{panelContent.logo}</div>
          <h2>{panelContent.title}</h2>
          <p>{panelContent.description}</p>
          <ul className="highlights">
            {panelContent.highlights.map((highlight, index) => (
              <li key={index}>{highlight}</li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Right form panel */}
      <main className="form-panel">
        <div className="login-card">
          <h2 className="login-title">Create your account</h2>
          <p className="login-subtitle">It takes less than a minute</p>

          <form onSubmit={handleSubmit} className="form">
            {/* Role Selection */}
            <div className="role-select" style={{ marginBottom: 10 }}>
              <button type="button" className={`role-btn ${role === "student" ? "active" : ""}`} onClick={() => setRole("student")}>🎓 Student</button>
              <button type="button" className={`role-btn ${role === "manager" ? "active" : ""}`} onClick={() => setRole("manager")}>🏢 Industry Manager</button>
              <button type="button" className={`role-btn ${role === "academic" ? "active" : ""}`} onClick={() => setRole("academic")}>🎓 Academic Leader</button>
              <button type="button" className={`role-btn ${role === "university" ? "active" : ""}`} onClick={() => setRole("university")}>🏛️ University Admin</button>
            </div>

            <label className="field">
              <span>Name</span>
              <input type="text" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>

            <label className="field">
              <span>Email</span>
              <input type="email" placeholder="you@institute.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>

            {/* University Selection */}
            {requiresUniversity && (
              <>
                {role === 'university' && (
                  <div className="field">
                    <span>University Registration Mode</span>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setUniversityMode("select")}
                        style={{
                          padding: '8px 16px',
                          border: universityMode === "select" ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                          borderRadius: '6px',
                          backgroundColor: universityMode === "select" ? '#3b82f6' : 'white',
                          color: universityMode === "select" ? 'white' : '#374151',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Select Existing University
                      </button>
                      <button
                        type="button"
                        onClick={() => setUniversityMode("create")}
                        style={{
                          padding: '8px 16px',
                          border: universityMode === "create" ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                          borderRadius: '6px',
                          backgroundColor: universityMode === "create" ? '#3b82f6' : 'white',
                          color: universityMode === "create" ? 'white' : '#374151',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Create New University
                      </button>
                    </div>
                  </div>
                )}

                {(universityMode === "select" || role !== 'university') ? (
                  <label className="field">
                    <span>University</span>
                    <select 
                      value={university_id} 
                      onChange={(e) => setUniversityId(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: 'white',
                        color: 'black'
                      }}
                    >
                      <option value="">Select a university</option>
                      {universities.map(uni => (
                        <option key={uni.id} value={uni.id}>
                          {uni.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : role === 'university' && (
                  <div className="university-creation-fields">
                    <label className="field">
                      <span>University Name *</span>
                      <input 
                        type="text" 
                        placeholder="e.g., Massachusetts Institute of Technology" 
                        value={university_name} 
                        onChange={(e) => setUniversityName(e.target.value)} 
                        required 
                      />
                    </label>

                    <label className="field">
                      <span>University Domain *</span>
                      <input 
                        type="text" 
                        placeholder="e.g., mit.edu" 
                        value={university_domain} 
                        onChange={(e) => setUniversityDomain(e.target.value)} 
                        required 
                      />
                    </label>

                    <label className="field">
                      <span>University Address</span>
                      <input 
                        type="text" 
                        placeholder="e.g., 77 Massachusetts Ave, Cambridge, MA 02139" 
                        value={university_address} 
                        onChange={(e) => setUniversityAddress(e.target.value)} 
                      />
                    </label>

                    <label className="field">
                      <span>University Website</span>
                      <input 
                        type="url" 
                        placeholder="e.g., https://mit.edu" 
                        value={university_website} 
                        onChange={(e) => setUniversityWebsite(e.target.value)} 
                      />
                    </label>

                    <label className="field">
                      <span>Contact Email</span>
                      <input 
                        type="email" 
                        placeholder="e.g., admissions@mit.edu" 
                        value={university_contact_email} 
                        onChange={(e) => setUniversityContactEmail(e.target.value)} 
                      />
                    </label>

                    <label className="field">
                      <span>Contact Phone</span>
                      <input 
                        type="tel" 
                        placeholder="e.g., +1-617-253-1000" 
                        value={university_contact_phone} 
                        onChange={(e) => setUniversityContactPhone(e.target.value)} 
                      />
                    </label>

                    <label className="field">
                      <span>Established Year</span>
                      <input 
                        type="number" 
                        placeholder="e.g., 1861" 
                        value={university_established_year} 
                        onChange={(e) => setUniversityEstablishedYear(e.target.value)} 
                        min="1000"
                        max={new Date().getFullYear()}
                      />
                    </label>
                  </div>
                )}
              </>
            )}

            {/* Institute Name for Students and Academic Leaders */}
            {(role === 'student' || role === 'academic') && (
              <label className="field">
                <span>Institute/Department Name</span>
                <input 
                  type="text" 
                  placeholder="e.g., Computer Science Department, Engineering Institute" 
                  value={institute_name} 
                  onChange={(e) => setInstituteName(e.target.value)} 
                  required 
                />
              </label>
            )}

            <label className="field">
              <span>Password</span>
              <div className="password-box">
                <input type={showPassword ? "text" : "password"} placeholder="At least 8 characters" value={password} onChange={(e) => { setPassword(e.target.value); evalStrength(e.target.value) }} required />
                <button type="button" className="toggle" onClick={() => setShowPassword((s) => !s)}>{showPassword ? "🙈" : "👁️"}</button>
              </div>
              <div className={`strength s${strength}`} aria-hidden>
                <div className="bar" />
                <div className="bar" />
                <div className="bar" />
              </div>
            </label>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Creating…" : `Create ${(role === 'academic' ? 'academic_leader' : role === 'university' ? 'university_admin' : role)} account`}
            </button>

            <p className="footer-text" style={{ color:'#cbd5e1' }}>
              Already have an account?
              <a href="/login" className="link"> Sign in</a>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
