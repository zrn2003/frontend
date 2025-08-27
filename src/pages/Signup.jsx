import { useState } from 'react'
import '../components/LoginForm.css'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Signup failed')
      setSuccess('Account created. You can now sign in.')
      setName('')
      setEmail('')
      setPassword('')
    } catch (e) {
      setError(e.message || 'Signup failed')
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
          <p>Join the platform to collaborate with partners efficiently.</p>
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
            <h1>Create your account</h1>
            <p className="subtitle">Sign up to get started</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Name</span>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
            {success && <div className="error" style={{ background: 'rgba(16,185,129,.15)', borderColor: 'rgba(16,185,129,.35)', color: '#bbf7d0' }}>{success}</div>}

            <button type="submit" className="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create account'}
            </button>

            <div className="meta">
              <span>Already have an account?</span>
              <a className="link" href="/">Sign in</a>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}


