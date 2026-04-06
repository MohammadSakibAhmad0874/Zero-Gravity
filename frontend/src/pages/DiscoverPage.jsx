import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../App'
import { Compass, Heart, MessageCircle, MapPin, RefreshCw, Sparkles, Code2, Layers, AlertCircle } from 'lucide-react'
import FeedbackModal from '../components/FeedbackModal'
import useScrollReveal from '../hooks/useScrollReveal'
import './DiscoverPage.css'

const ROLE_BADGE = {
  frontend:     { label: 'Frontend',     color: '#6E9E7B' },
  backend:      { label: 'Backend',      color: '#4A8C6F' },
  full_stack:   { label: 'Full Stack',   color: '#A67C52' },
  ml_ai:        { label: 'ML / AI',      color: '#B8872A' },
  devops:       { label: 'DevOps',       color: '#8A6A35' },
  design:       { label: 'Design',       color: '#C6A969' },
  mobile:       { label: 'Mobile',       color: '#5E7FA6' },
  data_science: { label: 'Data Science', color: '#7B6EA0' },
  security:     { label: 'Security',     color: '#B85555' },
}

const EXP_BADGE = {
  beginner:     '🌱',
  intermediate: '⚡',
  advanced:     '🚀',
  expert:       '🚀',
}

export default function DiscoverPage() {
  const { token } = useContext(AuthContext)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)
  const [feedbackUser, setFeedbackUser] = useState(null)
  const revealRef = useScrollReveal({ threshold: 0.05, staggerDelay: 80 })

  const fetchMatches = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/matches?limit=20', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Server error ${res.status}`)
      }
      const data = await res.json()
      setMatches(data.matches || [])
    } catch (err) {
      console.error('Discover fetch error:', err)
      setError(err.message || 'Failed to load matches')
      setMatches([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMatches() }, [token])

  return (
    <div className="page-container discover-page" ref={revealRef}>
      <div className="section-header">
        <div className="discover-header">
          <div>
            <h1><Sparkles size={28} /> Discover Teammates</h1>
            <p>AI-powered developer matches ranked by team compatibility</p>
          </div>
          <button className="btn btn-secondary" onClick={fetchMatches} id="refresh-matches" disabled={loading}>
            <RefreshCw size={18} style={{ animation: loading ? 'spin 0.9s linear infinite' : 'none' }} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="discover-loading">
          <div className="loading-spinner"></div>
          <p>Finding your perfect teammates...</p>
        </div>
      ) : error ? (
        <div className="discover-error">
          <AlertCircle size={48} />
          <h3>Could not load matches</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchMatches}>Try Again</button>
        </div>
      ) : matches.length > 0 ? (
        <div className="card-grid">
          {matches.map((m, i) => {
            const roleMeta = ROLE_BADGE[m.role] || { label: m.role || 'Dev', color: '#C6A969' }
            const expIcon  = EXP_BADGE[m.experienceLevel] || '⚡'
            return (
              <div key={m.id || i} className="match-card glass-card" data-scroll-reveal style={{ animationDelay: `${i * 60}ms` }}>
                <div className="match-card-header">
                  <div className="avatar avatar-lg">
                    {m.avatar
                      ? <img src={m.avatar} alt={m.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      : m.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="match-score">
                    <Sparkles size={14} /> {m.matchScore || 85}%
                  </div>
                </div>

                <div className="match-card-body">
                  <h3>{m.name}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    {m.role && (
                      <span className="tag" style={{ background: `${roleMeta.color}22`, color: roleMeta.color, border: `1px solid ${roleMeta.color}44` }}>
                        {roleMeta.label}
                      </span>
                    )}
                    {m.experienceLevel && (
                      <span className="tag">{expIcon} {m.experienceLevel}</span>
                    )}
                    {m.country && (
                      <span className="match-location"><MapPin size={13} /> {m.country}</span>
                    )}
                  </div>
                  {m.bio && <p className="match-bio">{m.bio}</p>}

                  {(m.skills?.length > 0) && (
                    <div className="match-section">
                      <span className="match-section-label"><Code2 size={13} /> Skills</span>
                      <div className="tags-container">
                        {m.skills.slice(0, 4).map(s => (
                          <span key={s} className="tag tag-primary">{s}</span>
                        ))}
                        {m.skills.length > 4 && <span className="tag">+{m.skills.length - 4}</span>}
                      </div>
                    </div>
                  )}

                  {(m.techStack?.length > 0) && (
                    <div className="match-section">
                      <span className="match-section-label"><Layers size={13} /> Tech Stack</span>
                      <div className="tags-container">
                        {m.techStack.slice(0, 4).map(t => (
                          <span key={t} className="tag tag-accent">{t}</span>
                        ))}
                        {m.techStack.length > 4 && <span className="tag">+{m.techStack.length - 4}</span>}
                      </div>
                    </div>
                  )}

                  {(m.projectInterests?.length > 0) && (
                    <div className="match-section">
                      <span className="match-section-label">Interests</span>
                      <div className="tags-container">
                        {m.projectInterests.slice(0, 3).map(p => (
                          <span key={p} className="tag tag-success">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="match-card-actions">
                  <Link to={`/chat/${m.id}`} className="btn btn-primary btn-sm">
                    <MessageCircle size={16} /> Chat
                  </Link>
                  <button className="btn btn-secondary btn-sm" onClick={() => setFeedbackUser(m)}>
                    <Heart size={16} /> Rate
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty-state">
          <Compass size={64} />
          <h3>No matches found yet</h3>
          <p>Complete your profile with skills and tech stack to get better teammate matches, or check back later as more developers join!</p>
          <Link to="/profile" className="btn btn-primary">Update Profile</Link>
        </div>
      )}

      {feedbackUser && (
        <FeedbackModal
          user={feedbackUser}
          onClose={() => setFeedbackUser(null)}
          token={token}
        />
      )}
    </div>
  )
}
