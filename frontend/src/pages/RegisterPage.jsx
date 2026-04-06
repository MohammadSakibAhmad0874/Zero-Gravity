import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../App'
import { UserPlus, Eye, EyeOff, X } from 'lucide-react'
import './AuthPages.css'

const SKILLS_OPTIONS = [
  'Music', 'Cooking', 'Photography', 'Painting', 'Dance', 'Coding',
  'Writing', 'Yoga', 'Martial Arts', 'Gardening', 'Pottery', 'Calligraphy',
  'Film Making', 'Theatre', 'Fashion Design', 'Woodworking', 'Knitting',
  'Chess', 'Mathematics', 'History', 'Philosophy', 'Science'
]

const LANGUAGES_OPTIONS = [
  'English', 'Spanish', 'Mandarin', 'Hindi', 'French', 'Arabic',
  'Portuguese', 'Russian', 'Japanese', 'Korean', 'German', 'Italian',
  'Turkish', 'Vietnamese', 'Thai', 'Swahili', 'Dutch', 'Swedish'
]

const INTERESTS_OPTIONS = [
  'Art & Music', 'Food & Cuisine', 'History & Heritage', 'Technology',
  'Sports & Fitness', 'Travel', 'Literature', 'Film & Cinema',
  'Fashion', 'Festivals & Traditions', 'Nature & Environment',
  'Spirituality', 'Architecture', 'Folklore & Mythology'
]

export default function RegisterPage() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    country: '', timezone: '',
    bio: '',
    skills: [],
    languages: [],
    interests: []
  })

  const toggleItem = (field, item) => {
    const list = form[field]
    setForm({
      ...form,
      [field]: list.includes(item)
        ? list.filter(x => x !== item)
        : [...list, item]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container register-container animate-fade-in-up">
        <div className="auth-header">
          <div className="auth-icon">
            <UserPlus size={24} />
          </div>
          <h1>Join CulturaMatch</h1>
          <p>Create your profile and start connecting</p>
        </div>

        <div className="step-indicators">
          {[1, 2, 3].map(s => (
            <div key={s} className={`step-dot ${step >= s ? 'active' : ''}`}>
              {s}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          {step === 1 && (
            <div className="form-step animate-fade-in">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Your name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  id="register-name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  id="register-email"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
                    id="register-password"
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. India, Japan, Brazil"
                  value={form.country}
                  onChange={e => setForm({ ...form, country: e.target.value })}
                  required
                  id="register-country"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <select
                  className="form-input"
                  value={form.timezone}
                  onChange={e => setForm({ ...form, timezone: e.target.value })}
                  required
                  id="register-timezone"
                >
                  <option value="">Select timezone</option>
                  <option value="UTC-12">UTC-12</option>
                  <option value="UTC-8">UTC-8 (Pacific)</option>
                  <option value="UTC-5">UTC-5 (Eastern)</option>
                  <option value="UTC-3">UTC-3 (Brazil)</option>
                  <option value="UTC+0">UTC+0 (London)</option>
                  <option value="UTC+1">UTC+1 (Europe)</option>
                  <option value="UTC+3">UTC+3 (Moscow)</option>
                  <option value="UTC+5:30">UTC+5:30 (India)</option>
                  <option value="UTC+8">UTC+8 (China)</option>
                  <option value="UTC+9">UTC+9 (Japan)</option>
                  <option value="UTC+10">UTC+10 (Australia)</option>
                </select>
              </div>
              <button type="button" className="btn btn-primary btn-lg auth-submit" onClick={() => setStep(2)} id="register-next-1">
                Next — Skills & Languages
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="form-step animate-fade-in">
              <div className="form-group">
                <label className="form-label">Skills You Can Teach</label>
                <div className="chips-picker">
                  {SKILLS_OPTIONS.map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`tag ${form.skills.includes(s) ? 'tag-primary' : ''}`}
                      onClick={() => toggleItem('skills', s)}
                    >
                      {s}
                      {form.skills.includes(s) && <X size={12} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Languages You Speak</label>
                <div className="chips-picker">
                  {LANGUAGES_OPTIONS.map(l => (
                    <button
                      key={l}
                      type="button"
                      className={`tag ${form.languages.includes(l) ? 'tag-accent' : ''}`}
                      onClick={() => toggleItem('languages', l)}
                    >
                      {l}
                      {form.languages.includes(l) && <X size={12} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <button type="button" className="btn btn-secondary btn-lg" onClick={() => setStep(1)}>Back</button>
                <button type="button" className="btn btn-primary btn-lg" onClick={() => setStep(3)} id="register-next-2">
                  Next — Interests
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step animate-fade-in">
              <div className="form-group">
                <label className="form-label">Cultural Interests</label>
                <div className="chips-picker">
                  {INTERESTS_OPTIONS.map(i => (
                    <button
                      key={i}
                      type="button"
                      className={`tag ${form.interests.includes(i) ? 'tag-success' : ''}`}
                      onClick={() => toggleItem('interests', i)}
                    >
                      {i}
                      {form.interests.includes(i) && <X size={12} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio (Optional)</label>
                <textarea
                  className="form-input"
                  placeholder="Tell others about yourself and what you'd like to learn or share..."
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  id="register-bio"
                />
              </div>
              <div className="form-row">
                <button type="button" className="btn btn-secondary btn-lg" onClick={() => setStep(2)}>Back</button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="register-submit">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
