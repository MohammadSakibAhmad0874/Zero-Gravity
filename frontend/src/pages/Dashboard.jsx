import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../App'
import {
  Users, MessageCircle, CalendarCheck, Star, TrendingUp,
  Globe, ArrowRight, Sparkles, Compass, Zap, Clock, Brain
} from 'lucide-react'
import useScrollReveal from '../hooks/useScrollReveal'
import './Dashboard.css'

const INSIGHTS = [
  { text: 'Your React + TypeScript stack attracts 3x more matches', time: 'AI Insight' },
  { text: 'Complete your bio to increase match visibility by 40%', time: 'Tip' },
  { text: 'Developers from your timezone are most active', time: 'Activity' },
  { text: 'Add project interests to improve compatibility scores', time: 'Tip' },
]

export default function Dashboard() {
  const { user, token, setUser } = useContext(AuthContext)
  const [matches, setMatches] = useState([])
  const [availability, setAvailability] = useState(user?.availability || 'open')
  const revealRef = useScrollReveal({ threshold: 0.1, staggerDelay: 80 })

  useEffect(() => {
    fetch('/api/matches?limit=5', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : { matches: [] })
      .then(d => setMatches(d.matches || []))
      .catch(() => {})
  }, [token])

  const updateAvailability = async (val) => {
    setAvailability(val)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ availability: val })
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch {}
  }

  const statCards = [
    { icon: <Users size={20} />, label: 'Matches Found',   value: matches.length || '—',  color: '#C6A969', bg: 'rgba(198,169,105,0.13)' },
    { icon: <MessageCircle size={20} />, label: 'Conversations', value: '—', color: '#A67C52', bg: 'rgba(166,124,82,0.12)' },
    { icon: <CalendarCheck size={20} />, label: 'Meetups',       value: '—', color: '#4A8C6F', bg: 'rgba(74,140,111,0.12)' },
    { icon: <Star size={20} />, label: 'Feedback Given',   value: '—',  color: '#B8872A', bg: 'rgba(184,135,42,0.11)' },
  ]

  const availColor = {
    open: '#4A8C6F',
    busy: '#B8872A',
    unavailable: '#B85555'
  }[availability] || '#4A8C6F'

  return (
    <div className="dashboard" ref={revealRef}>

      {/* Welcome */}
      <div className="dashboard-welcome animate-fade-in-up">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Here's your hackathon team overview</p>
        </div>
        <Link to="/discover" className="btn btn-primary">
          <Sparkles size={16} />
          Find New Matches
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card" data-scroll-reveal>
            <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div className="stat-card-info">
              <span className="stat-card-value">{s.value}</span>
              <span className="stat-card-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3-Panel Grid */}
      <div className="dashboard-grid">

        {/* LEFT: Profile + Quick Actions */}
        <div className="dashboard-section glass-card" data-scroll-reveal="left">
          <div className="section-top">
            <h2><Globe size={18} /> Profile</h2>
            <Link to="/profile" className="btn btn-ghost btn-sm">Edit <ArrowRight size={13} /></Link>
          </div>

          <div className="profile-summary">
            <div className="avatar avatar-lg">{user?.name?.charAt(0)}</div>
            <h3>{user?.name}</h3>
            <p className="profile-country">📍 {user?.country || 'Earth'}</p>

            {user?.role && (
              <span className="tag tag-primary" style={{ marginTop: '0.25rem' }}>
                {user.role}
              </span>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: availColor, boxShadow: `0 0 6px ${availColor}` }} />
              <select
                value={availability}
                onChange={e => updateAvailability(e.target.value)}
                className="form-input"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', flex: 1 }}
              >
                <option value="open">Open to Collaborate</option>
                <option value="busy">Busy — Limited Time</option>
                <option value="unavailable">Not Available</option>
              </select>
            </div>

            <div className="tags-container" style={{ justifyContent: 'center', marginTop: '0.75rem' }}>
              {(user?.skills || []).slice(0, 4).map(s => (
                <span key={s} className="tag tag-primary">{s}</span>
              ))}
              {(user?.techStack || []).slice(0, 3).map(t => (
                <span key={t} className="tag tag-accent">{t}</span>
              ))}
            </div>

            {user?.bio && <p className="profile-bio" style={{ marginTop: '0.5rem' }}>{user.bio}</p>}
          </div>

          <div className="quick-actions" style={{ marginTop: '1rem' }}>
            <Link to="/discover" className="quick-action-btn">
              <Compass size={16} /> Discover Matches
            </Link>
            <Link to="/chat" className="quick-action-btn">
              <MessageCircle size={16} /> Messages
            </Link>
            <Link to="/meetups" className="quick-action-btn">
              <CalendarCheck size={16} /> Schedule Sync
            </Link>
          </div>
        </div>

        {/* CENTER: Recent Matches */}
        <div className="dashboard-section glass-card" data-scroll-reveal>
          <div className="section-top">
            <h2><TrendingUp size={18} /> Recent Matches</h2>
            <Link to="/discover" className="btn btn-ghost btn-sm">View All <ArrowRight size={13} /></Link>
          </div>

          {matches.length > 0 ? (
            <div className="match-list">
              {matches.map((m, i) => (
                <Link key={i} to={`/chat/${m.id}`} className="match-item">
                  <div className="avatar avatar-sm">{m.name?.charAt(0)}</div>
                  <div className="match-item-info">
                    <span className="match-item-name">{m.name}</span>
                    <span className="match-item-detail">
                      {m.country && `${m.country} · `}{m.role || 'Developer'}
                    </span>
                  </div>
                  <span className="match-score">
                    <Sparkles size={11} /> {m.matchScore || 85}%
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty">
              <Globe size={40} />
              <p>No matches yet — complete your profile first!</p>
              <Link to="/discover" className="btn btn-primary btn-sm">Discover</Link>
            </div>
          )}

          {matches.length > 0 && (
            <div className="ai-highlight" style={{ marginTop: '1rem' }}>
              <span className="ai-highlight-icon">🤖</span>
              <div className="ai-highlight-text">
                AI found <strong>{matches.length} compatible teammates</strong> based on your skills & tech stack.
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Insights */}
        <div className="dashboard-section glass-card" data-scroll-reveal="right">
          <div className="section-top">
            <h2><Brain size={18} /> AI Insights</h2>
          </div>

          <div className="insights-list">
            {INSIGHTS.map((item, i) => (
              <div key={i} className="insight-item">
                <div className="insight-dot" />
                <div>
                  <div className="insight-text">{item.text}</div>
                  <div className="insight-time">{item.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <div className="divider" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Profile Completeness</span>
                <span style={{ fontWeight: 700, color: 'var(--gold-deep)' }}>
                  {Math.round(
                    (!!user?.bio + !!user?.role + !!user?.country +
                     (user?.skills?.length > 0 ? 1 : 0) +
                     (user?.techStack?.length > 0 ? 1 : 0)) / 5 * 100
                  )}%
                </span>
              </div>
              <div style={{
                height: 6, borderRadius: 99,
                background: 'rgba(198,169,105,0.14)',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: 'var(--gradient-primary)',
                  borderRadius: 99,
                  width: `${Math.round(
                    (!!user?.bio + !!user?.role + !!user?.country +
                     (user?.skills?.length > 0 ? 1 : 0) +
                     (user?.techStack?.length > 0 ? 1 : 0)) / 5 * 100
                  )}%`,
                  transition: 'width 0.8s ease',
                  boxShadow: '0 0 8px var(--glow-soft)'
                }} />
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Complete all fields to maximize match quality
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
