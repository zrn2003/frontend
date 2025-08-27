import { useState } from 'react'
import './LoginForm.css'

export default function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await Promise.resolve()
      onSubmit && onSubmit({ email, password })
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <aside className="brand-panel">
        <div className="brand-content">
          <div className="logo-mark" aria-hidden>ICM</div>
          <h2>Industry Collaboration Manager</h2>
          <p>Coordinate with partners, streamline approvals, and accelerate partnerships.</p>
          <ul className="highlights">
            <li>Secure role-based access</li>
            <li>Real-time partner updates</li>
            <li>Centralized records</li>
          </ul>
        </div>
      </aside>
      <main className="form-panel">
        <div className="login-card">
          <div className="login-header">
            <h1>Welcome back</h1>
            <p className="subtitle">Sign in to continue</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
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
              <div className="password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            {error && <div className="error" role="alert">{error}</div>}

            <button type="submit" className="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <div className="meta">
              <label className="remember">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a className="link" href="#">Forgot password?</a>
            </div>
          </form>
          <div className="footer-note">
            <span>New to ICM?</span>
            <a className="link" href="#">Request access</a>
          </div>
        </div>
      </main>
    </div>
  )
}


