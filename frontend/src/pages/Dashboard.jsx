import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../App'
import { Users, MessageCircle, CalendarCheck, Star, TrendingUp, Globe, ArrowRight, Sparkles } from 'lucide-react'
import './Dashboard.css'

export default function Dashboard() {
  const { user, token } = useContext(AuthContext)
  const [matches, setMatches] = useState([])
  const [stats, setStats] = useState({ totalMatches: 0, chats: 0, meetups: 0, feedbacks: 0 })

  useEffect(() => {
    fetch('/api/matches?limit=3', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : { matches: [] })
      .then(data => setMatches(data.matches || []))
      .catch(() => {})

    // Mock stats for now
    setStats({ totalMatches: 12, chats: 8, meetups: 3, feedbacks: 15 })
  }, [token])

  const statCards = [
    { icon: Users, label: 'Matches Found', value: stats.totalMatches, color: 'var(--primary)' },
    { icon: MessageCircle, label: 'Conversations', value: stats.chats, color: 'var(--accent)' },
    { icon: CalendarCheck, label: 'Meetups', value: stats.meetups, color: 'var(--info)' },
    { icon: Star, label: 'Feedback Given', value: stats.feedbacks, color: 'var(--warning)' },
  ]

  return (
    <div className="page-container dashboard">
      <div className="dashboard-welcome animate-fade-in-up">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Here's your cultural exchange overview</p>
        </div>
        <Link to="/discover" className="btn btn-primary">
          <Sparkles size={18} />
          Find New Matches
        </Link>
      </div>

      <div className="stats-grid animate-fade-in-up animate-delay-100">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card glass-card">
            <div className="stat-card-icon" style={{ background: `${s.color}20`, color: s.color }}>
              <s.icon size={22} />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-value">{s.value}</span>
              <span className="stat-card-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid animate-fade-in-up animate-delay-200">
        <div className="dashboard-section glass-card">
          <div className="section-top">
            <h2><TrendingUp size={20} /> Recent Matches</h2>
            <Link to="/discover" className="btn btn-ghost btn-sm">View All <ArrowRight size={14} /></Link>
          </div>

          {matches.length > 0 ? (
            <div className="match-list">
              {matches.map((m, i) => (
                <div key={i} className="match-item">
                  <div className="avatar">{m.name?.charAt(0)}</div>
                  <div className="match-item-info">
                    <span className="match-item-name">{m.name}</span>
                    <span className="match-item-detail">{m.country} · {m.skills?.[0]}</span>
                  </div>
                  <span className="match-score">{m.matchScore || 85}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty">
              <Globe size={40} />
              <p>No matches yet. Start discovering!</p>
              <Link to="/discover" className="btn btn-primary btn-sm">Discover</Link>
            </div>
          )}
        </div>

        <div className="dashboard-section glass-card">
          <div className="section-top">
            <h2><Globe size={20} /> Your Profile</h2>
            <Link to="/profile" className="btn btn-ghost btn-sm">Edit <ArrowRight size={14} /></Link>
          </div>
          <div className="profile-summary">
            <div className="avatar avatar-lg">{user?.name?.charAt(0)}</div>
            <h3>{user?.name}</h3>
            <p className="profile-country">{user?.country || 'Earth'}</p>
            <div className="tags-container" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
              {(user?.skills || []).slice(0, 4).map(s => (
                <span key={s} className="tag tag-primary">{s}</span>
              ))}
              {(user?.languages || []).slice(0, 3).map(l => (
                <span key={l} className="tag tag-accent">{l}</span>
              ))}
            </div>
            {user?.bio && <p className="profile-bio">{user.bio}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
