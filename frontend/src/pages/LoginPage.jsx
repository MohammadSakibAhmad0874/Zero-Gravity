import { useState, useContext, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthContext } from '../App'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { LogIn, Eye, EyeOff, Mail } from 'lucide-react'
import './AuthPages.css'

// SVG Google icon
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
)

export default function LoginPage() {
  const { setUser } = useContext(AuthContext)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signInWithEmail, signInWithGoogle, resetPassword, loading, error, clearError } = useFirebaseAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [localError, setLocalError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  useEffect(() => {
    const msg = searchParams.get('message')
    if (msg === 'reset_sent') setLocalError('✅ Password reset email sent! Check your inbox.')
  }, [searchParams])

  const displayError = localError || error

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    clearError()
    try {
      const { user } = await signInWithEmail(form.email, form.password)
      setUser(user)
      navigate('/dashboard')
    } catch (err) {
      // error already set in hook
    }
  }

  const handleGoogleLogin = async () => {
    setLocalError('')
    clearError()
    try {
      const result = await signInWithGoogle()
      if (!result) return  // user cancelled popup
      setUser(result.user)
      navigate(result.isNew ? '/profile' : '/dashboard')
    } catch (err) {
      // error already set in hook
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!resetEmail) return setLocalError('Please enter your email address')
    try {
      await resetPassword(resetEmail)
      setResetSent(true)
    } catch (err) {
      // error already set in hook
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in-up">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <LogIn size={24} />
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to your DevMatch account</p>
          </div>

          {/* Google Sign In */}
          <button
            className="btn-google"
            onClick={handleGoogleLogin}
            disabled={loading}
            id="google-login-btn"
          >
            <GoogleIcon />
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="auth-divider">
            <span>or sign in with email</span>
          </div>

          {!showReset ? (
            <form onSubmit={handleSubmit} className="auth-form">
              {displayError && <div className="auth-error">{displayError}</div>}

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  id="login-email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    id="login-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="forgot-password-link"
                onClick={() => { setShowReset(true); clearError(); setLocalError('') }}
              >
                Forgot password?
              </button>

              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading} id="login-submit">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="auth-info">
                <Mail size={18} />
                <span>Enter your email to receive a password reset link</span>
              </div>
              {displayError && <div className="auth-error">{displayError}</div>}
              {resetSent && <div className="auth-success">✅ Reset email sent! Check your inbox.</div>}

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <button type="button" className="btn btn-secondary btn-lg" onClick={() => setShowReset(false)}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading || resetSent}>
                  {loading ? 'Sending...' : resetSent ? 'Email Sent ✅' : 'Send Reset Email'}
                </button>
              </div>
            </form>
          )}

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
