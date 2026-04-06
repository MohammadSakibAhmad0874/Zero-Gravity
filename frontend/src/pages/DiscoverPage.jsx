import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../App'
import { Compass, Heart, MessageCircle, MapPin, RefreshCw, Sparkles } from 'lucide-react'
import FeedbackModal from '../components/FeedbackModal'
import './DiscoverPage.css'

export default function DiscoverPage() {
  const { token } = useContext(AuthContext)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedbackUser, setFeedbackUser] = useState(null)

  const fetchMatches = () => {
    setLoading(true)
    fetch('/api/matches', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : { matches: [] })
      .then(data => { setMatches(data.matches || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchMatches() }, [token])

  return (
    <div className="page-container discover-page">
      <div className="section-header">
        <div className="discover-header">
          <div>
            <h1><Sparkles size={28} /> Discover Matches</h1>
            <p>AI-powered cultural exchange matches tailored for you</p>
          </div>
          <button className="btn btn-secondary" onClick={fetchMatches} id="refresh-matches">
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="discover-loading">
          <div className="loading-spinner"></div>
          <p>Finding your perfect matches...</p>
        </div>
      ) : matches.length > 0 ? (
        <div className="card-grid">
          {matches.map((m, i) => (
            <div key={m.id || i} className="match-card glass-card animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="match-card-header">
                <div className="avatar avatar-lg">{m.name?.charAt(0)}</div>
                <div className="match-score">
                  <Sparkles size={14} /> {m.matchScore || 85}%
                </div>
              </div>

              <div className="match-card-body">
                <h3>{m.name}</h3>
                <p className="match-location"><MapPin size={14} /> {m.country}</p>
                {m.bio && <p className="match-bio">{m.bio}</p>}

                <div className="match-section">
                  <span className="match-section-label">Skills</span>
                  <div className="tags-container">
                    {(m.skills || []).slice(0, 4).map(s => (
                      <span key={s} className="tag tag-primary">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="match-section">
                  <span className="match-section-label">Languages</span>
                  <div className="tags-container">
                    {(m.languages || []).slice(0, 4).map(l => (
                      <span key={l} className="tag tag-accent">{l}</span>
                    ))}
                  </div>
                </div>

                <div className="match-section">
                  <span className="match-section-label">Interests</span>
                  <div className="tags-container">
                    {(m.interests || []).slice(0, 3).map(i => (
                      <span key={i} className="tag tag-success">{i}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="match-card-actions">
                <Link to={`/chat/${m.id}`} className="btn btn-primary btn-sm">
                  <MessageCircle size={16} /> Chat
                </Link>
                <button className="btn btn-secondary btn-sm" onClick={() => setFeedbackUser(m)}>
                  <Heart size={16} /> Feedback
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Compass size={64} />
          <h3>No matches found yet</h3>
          <p>Complete your profile to get better matches!</p>
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
