import { useState } from "react";
import { api } from "../config/api.js";
import "../components/LoginForm.css"; // reuse same styles

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // default role
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.signup({ name, email, password, role }); // include role
      setSuccess("🎉 Account created successfully! You can now sign in.");
      setName("");
      setEmail("");
      setPassword("");
      setRole("student");
    } catch (e) {
      setError(e.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      {/* Left branding */}
      <aside className="branding">
        <div className="brand-content">
          <h1 className="brand-logo">ICM</h1>
          <h2>Industry Collaboration Manager</h2>
          <p>Join the platform to collaborate with partners efficiently.</p>
          <ul className="highlights">
            <li>✅ Secure role-based access</li>
            <li>⚡ Real-time partner updates</li>
            <li>📂 Centralized records</li>
          </ul>
        </div>
      </aside>

      {/* Right form panel */}
      <main className="login-panel">
        <div className="login-card">
          <h2 className="login-title">Create your account</h2>
          <p className="login-subtitle">Sign up to get started</p>

          <form onSubmit={handleSubmit} className="form">
            {/* Role Selection */}
            <div className="role-select">
              <button
                type="button"
                className={`role-btn ${role === "student" ? "active" : ""}`}
                onClick={() => setRole("student")}
              >
                🎓 Student
              </button>
              <button
                type="button"
                className={`role-btn ${role === "manager" ? "active" : ""}`}
                onClick={() => setRole("manager")}
              >
                🏢 Industry Manager
              </button>
            </div>

            <label className="field">
              <span>Name</span>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Password</span>
              <div className="password-box">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </label>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Creating…" : `Create ${role} account`}
            </button>

            <p className="footer-text">
              Already have an account?
              <a href="/" className="link"> Sign in</a>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
