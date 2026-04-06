import { Link } from 'react-router-dom'
import { Code2, Users, Brain, MessageCircle, TrendingUp, ArrowRight, Sparkles, Layers, CalendarCheck, Zap } from 'lucide-react'
import useScrollReveal from '../hooks/useScrollReveal'
import './LandingPage.css'

const LIVE_FEED = [
  { icon: '🔥', text: <><strong>Rahul M.</strong> matched with <strong>Priya K.</strong></>, badge: '94%', delay: 0 },
  { icon: '🚀', text: <><strong>New team</strong> formed — 4 devs</>, badge: 'New', delay: 100 },
  { icon: '🤖', text: <>AI found <strong>5 matches</strong> for Alex</>, badge: 'AI', delay: 200 },
  { icon: '💬', text: <><strong>Lena S.</strong> started chatting</>, badge: 'Chat', delay: 300 },
  { icon: '⚡', text: <><strong>Marcus T.</strong> joined DevMatch</>, badge: 'New', delay: 400 },
  { icon: '🎯', text: <>Hackathon team <strong>Alpha built!</strong></>, badge: '3/3', delay: 500 },
]

const FEATURES = [
  {
    icon: '🧠',
    iconBg: 'linear-gradient(135deg, #C6A969, #A67C52)',
    blobColor: 'rgba(198,169,105,0.25)',
    title: 'AI-Powered Matching',
    desc: 'Neural networks & fuzzy logic score compatibility across skills, tech stack, and developer role to find your ideal teammate — instantly.',
    pill: '⚡ Neural Network',
  },
  {
    icon: '💻',
    iconBg: 'linear-gradient(135deg, #8A7250, #6B5540)',
    blobColor: 'rgba(138,114,80,0.20)',
    title: 'Tech Stack Alignment',
    desc: 'Find developers who share your language and framework ecosystem — or perfectly complement yours. Build faster, together.',
    pill: '🔗 Stack Sync',
  },
  {
    icon: '👥',
    iconBg: 'linear-gradient(135deg, #4A8C6F, #3A7060)',
    blobColor: 'rgba(74,140,111,0.18)',
    title: 'Role-Based Matching',
    desc: 'Frontend needs a backend? ML engineer looking for a DevOps partner? DevMatch finds the exact role your team is missing.',
    pill: '🎯 Role Smart',
  },
  {
    icon: '💬',
    iconBg: 'linear-gradient(135deg, #B8872A, #9A6E22)',
    blobColor: 'rgba(184,135,42,0.20)',
    title: 'Real-time Chat',
    desc: 'Connect instantly with your matched developers. Align on ideas, split responsibilities, and start building your vision.',
    pill: '📡 Instant Connect',
  },
]

const PREVIEW_MATCHES = [
  { name: 'Sarah K.', role: 'Full Stack Dev', score: '96%', color: '#C6A969' },
  { name: 'Marcus T.', role: 'ML Engineer', score: '91%', color: '#A67C52' },
  { name: 'Priya R.', role: 'DevOps Lead', score: '88%', color: '#8A7250' },
]

export default function LandingPage() {
  const revealRef = useScrollReveal({ threshold: 0.07, staggerDelay: 100 })

  const scrollTo = (e, id) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="landing" ref={revealRef}>

      {/* ─── HERO — Split Layout ─── */}
      <section className="hero" id="hero">
        <div className="hero-bg-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>

        {/* LEFT: Editorial text */}
        <div className="hero-content animate-fade-in-up">
          <div className="hero-badge">
            <Sparkles size={13} />
            <span>Powered by Neural Networks &amp; Fuzzy Logic</span>
          </div>

          <h1 className="hero-title">
            Find Your Team,<br />
            <span className="hero-gradient-text">Build Something</span><br />
            Incredible
          </h1>

          <p className="hero-subtitle">
            DevMatch uses advanced AI to connect hackathon developers by skills,
            tech stack, and role — so you spend less time searching and more time building.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-xl" id="hero-cta">
              Find My Team
              <ArrowRight size={18} />
            </Link>
            <a
              href="#features"
              className="btn btn-secondary btn-xl"
              id="hero-explore"
              onClick={(e) => scrollTo(e, 'features')}
            >
              Explore Features
            </a>
          </div>

          <div className="hero-stats">
            {[
              { value: '500+', label: 'Developers' },
              { value: '120+', label: 'Teams Formed' },
              { value: '30+',  label: 'Tech Stacks' },
              { value: '94%',  label: 'Match Rate' },
            ].map((s, i) => (
              <div key={i} className="stat-item">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Floating dashboard preview */}
        <div className="hero-visual animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="hero-preview">
            {/* Main card */}
            <div className="preview-main-card">
              <div className="preview-header">
                <span className="preview-title">Your Top Matches</span>
                <span className="preview-badge">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4A8C6F', display: 'inline-block' }} />
                  Live
                </span>
              </div>

              <div className="preview-stats-row">
                {[
                  { val: '12', lbl: 'Matches' },
                  { val: '94%', lbl: 'Accuracy' },
                  { val: '3h', lbl: 'Avg Time' },
                ].map((s, i) => (
                  <div key={i} className="preview-stat">
                    <span className="preview-stat-val">{s.val}</span>
                    <span className="preview-stat-lbl">{s.lbl}</span>
                  </div>
                ))}
              </div>

              <div className="preview-matches">
                {PREVIEW_MATCHES.map((m, i) => (
                  <div key={i} className="preview-match-item">
                    <div className="preview-match-avatar" style={{ background: `linear-gradient(135deg, ${m.color}, rgba(166,124,82,0.8))` }} />
                    <div className="preview-match-info">
                      <span className="preview-match-name">{m.name}</span>
                      <span className="preview-match-role">{m.role}</span>
                    </div>
                    <span className="preview-match-score">{m.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating accent cards */}
            <div className="float-card float-card-1">
              <span style={{ fontSize: '1.1rem' }}>🤖</span>
              AI Match Found!
            </div>
            <div className="float-card float-card-2">
              <span className="fc-dot" />
              3 devs online now
            </div>
            <div className="float-card float-card-3">
              <span style={{ fontSize: '1rem' }}>⚡</span>
              96% Compatible
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ROW ─── */}
      <section className="stats-section">
        <div className="stats-floating-layout">
          {[
            { value: '500+', label: 'Developers', icon: <Users size={18} /> },
            { value: '120+', label: 'Teams Formed', icon: <Sparkles size={18} /> },
            { value: '94%',  label: 'Match Accuracy', icon: <TrendingUp size={18} /> },
            { value: '30+',  label: 'Tech Stacks', icon: <Layers size={18} /> },
          ].map((s, i) => (
            <div key={i} className="stats-float-card" data-scroll-reveal>
              <div className="sfc-icon">{s.icon}</div>
              <div>
                <div className="sfc-value">{s.value}</div>
                <div className="sfc-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES — Editorial Zig-Zag ─── */}
      <section className="features-section" id="features">
        <div className="page-container" style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <div data-scroll-reveal>
            <span className="features-overline">What We Offer</span>
            <div className="section-header">
              <h2>Built for Serious<br />Hackathon Teams</h2>
              <p>Everything you need to find, connect, and build with the right people.</p>
            </div>
          </div>

          <div className="features-zigzag">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`feature-row ${i % 2 === 1 ? 'reverse' : ''}`}
                data-scroll-reveal={i % 2 === 0 ? 'left' : 'right'}
              >
                <div className="feature-visual">
                  <div className="feature-visual-bg-blob" style={{ background: f.blobColor }} />
                  <div className="feature-visual-icon" style={{ background: f.iconBg, fontSize: '2.2rem' }}>
                    {f.icon}
                  </div>
                </div>
                <div className="feature-text">
                  <span className="feature-pill">{f.pill}</span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <Link to="/register" className="feature-cta">
                    Get started <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="how-section" id="how-it-works">
        <div className="page-container" style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }} data-scroll-reveal>
            <span className="features-overline">The Process</span>
            <div className="section-header" style={{ textAlign: 'center' }}>
              <h2>From Profile to<br />Perfect Team</h2>
              <p>Four simple steps to your ideal hackathon teammates</p>
            </div>
          </div>

          <div className="steps-timeline">
            {[
              { n: '01', emoji: '👤', title: 'Build Profile', desc: 'Add your skills, stack & interests. More detail = smarter matches.' },
              { n: '02', emoji: '🤖', title: 'AI Matches', desc: 'Fuzzy logic + neural net score compatibility and surface top teammates.' },
              { n: '03', emoji: '💬', title: 'Connect', desc: 'Chat with matches, align on ideas, and get to know your team.' },
              { n: '04', emoji: '🚀', title: 'Build & Win', desc: 'Schedule syncs, divide tasks, and arrive at the hackathon ready to win.' },
            ].map((s, i) => (
              <div key={i} className="step-box" data-scroll-reveal>
                <div className="step-num">{s.n}</div>
                <span className="step-emoji">{s.emoji}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIVE FEED ─── */}
      <section className="live-feed-section" id="live-feed">
        <div className="page-container" style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <div data-scroll-reveal>
            <div className="live-feed-header">
              <div className="live-dot" />
              <span className="live-label">Live Activity</span>
            </div>
            <div className="section-header">
              <h2>Happening Right Now</h2>
              <p>Real-time developer connections forming across the platform</p>
            </div>
          </div>

          <div className="live-feed-grid" data-scroll-reveal>
            {LIVE_FEED.map((item, i) => (
              <div key={i} className="feed-item" style={{ animationDelay: `${item.delay}ms` }}>
                <div className="feed-icon">{item.icon}</div>
                <div className="feed-text">{item.text}</div>
                <span className="feed-badge">{item.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section" id="cta">
        <div className="cta-card" data-scroll-reveal="scale">
          <h2>Ready to Build<br />Something Great?</h2>
          <p>Join hundreds of developers using DevMatch to form winning hackathon teams.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-xl" id="cta-register">
              Find My Teammates
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-xl">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="landing-footer" id="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Code2 size={20} />
            <span>DevMatch</span>
          </div>
          <p className="footer-copy">© 2026 DevMatch — Matching developers, forming dream teams.</p>
          <div className="footer-links">
            <a href="#features" onClick={e => scrollTo(e, 'features')}>Features</a>
            <a href="#how-it-works" onClick={e => scrollTo(e, 'how-it-works')}>How It Works</a>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
