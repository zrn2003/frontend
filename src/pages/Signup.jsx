import { useState } from "react";
import { api } from "../config/api.js";
import "../components/LoginForm.css"; // reuse premium styles

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // default role
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [strength, setStrength] = useState(0);

  function evalStrength(pw) {
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
    if (/\d/.test(pw) || /[^\w\s]/.test(pw)) s++
    setStrength(s)
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const mappedRole = role === 'academic' ? 'academic_leader' : role === 'university' ? 'university_admin' : role;
      await api.signup({ name, email, password, role: mappedRole });
      setSuccess("🎉 Account created successfully! You can now sign in.");
      setName(""); setEmail(""); setPassword(""); setRole("student"); setStrength(0);
    } catch (e) {
      setError(e.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Left branding */}
      <aside className="brand-panel">
        <div className="brand-content">
          <div className="logo-mark">ICM</div>
          <h2>Join TrustTeams</h2>
          <p>Build trusted collaboration across industry, academia and students.</p>
          <ul className="highlights">
            <li>✨ Modern, secure onboarding</li>
            <li>🚀 Role-tailored experiences</li>
            <li>🔐 Data privacy first</li>
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
