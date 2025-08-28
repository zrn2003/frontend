import { useState } from "react";
import { api } from "../config/api.js";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";

export default function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);
  const [userType, setUserType] = useState("icm"); // 'icm' | 'student'
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.login({ email, password });

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("user", JSON.stringify(data.user));
      storage.setItem("userRole", data.user?.role || "");
      storage.setItem("userType", userType);

      if (userType === "student") {
        navigate("/student");
      } else {
        const role = data.user?.role?.toLowerCase();
        if (role === "admin" || role === "manager") navigate("/icm");
        else if (role === "viewer") navigate("/opportunities");
        else navigate("/icm");
      }

      onSubmit && onSubmit({ email, password });
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      {/* Left branding panel */}
      <aside className="branding">
        <div className="brand-content">
          <h1 className="brand-logo">ICM</h1>
          <h2>Industry Collaboration Manager</h2>
          <p>Empowering students & industry leaders to collaborate and grow together 🚀</p>
        </div>
      </aside>

      {/* Right login panel */}
      <main className="login-panel">
        <div className="login-card">
          <h2 className="login-title">Welcome Back 👋</h2>
          <p className="login-subtitle">Sign in to continue</p>

          {/* User type selector */}
          <div className="user-tabs">
            <button
              type="button"
              className={userType === "icm" ? "tab active" : "tab"}
              onClick={() => setUserType("icm")}
            >
              🏭 ICM
            </button>
            <button
              type="button"
              className={userType === "student" ? "tab active" : "tab"}
              onClick={() => setUserType("student")}
            >
              🎓 Student
            </button>
          </div>

          <form onSubmit={handleSubmit} className="form">
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                placeholder="you@example.com"
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

            <div className="options">
              <label>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#" className="link">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading
                ? "Signing in..."
                : `Sign in as ${userType === "student" ? "Student" : "ICM"}`}
            </button>
          </form>

          <p className="footer-text">
            New here? <a href="/signup" className="link">Create an account</a>
          </p>
        </div>
      </main>
    </div>
  );
}
