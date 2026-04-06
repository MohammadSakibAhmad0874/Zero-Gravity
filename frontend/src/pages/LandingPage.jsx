import { Link } from 'react-router-dom'
import { Globe, Users, Brain, MessageCircle, Star, ArrowRight, Sparkles, Languages, CalendarCheck } from 'lucide-react'
import './LandingPage.css'

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Matching',
      desc: 'Neural networks & fuzzy logic analyze your skills, interests, and cultural background to find your perfect exchange partner.',
      gradient: 'var(--gradient-primary)'
    },
    {
      icon: Languages,
      title: 'Language Exchange',
      desc: 'Practice languages with native speakers. Our matching considers proficiency levels and learning goals.',
      gradient: 'var(--gradient-cool)'
    },
    {
      icon: Users,
      title: 'Skill Sharing',
      desc: 'Teach what you know, learn what you love. From cooking to coding, music to mathematics.',
      gradient: 'var(--gradient-warm)'
    },
    {
      icon: MessageCircle,
      title: 'Real-time Chat',
      desc: 'Connect instantly with your matches. Share ideas, plan sessions, and build lasting friendships.',
      gradient: 'var(--gradient-primary)'
    },
    {
      icon: CalendarCheck,
      title: 'Virtual Meetups',
      desc: 'Schedule and manage cultural exchange sessions with integrated calendar and reminders.',
      gradient: 'var(--gradient-cool)'
    },
    {
      icon: Star,
      title: 'Feedback & Growth',
      desc: 'Rate your experiences and watch your cultural competency grow with AI-refined recommendations.',
      gradient: 'var(--gradient-warm)'
    }
  ]

  const stats = [
    { value: '150+', label: 'Countries' },
    { value: '50K+', label: 'Exchanges' },
    { value: '200+', label: 'Skills' },
    { value: '98%', label: 'Match Rate' }
  ]

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        <div className="hero-content animate-fade-in-up">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>Powered by Neural Networks & Fuzzy Logic</span>
          </div>

          <h1 className="hero-title">
            Connect Cultures,<br />
            <span className="hero-gradient-text">Share Skills,</span><br />
            Grow Together
          </h1>

          <p className="hero-subtitle">
            CulturaMatch uses advanced AI to connect you with people worldwide
            for meaningful skill sharing, language learning, and cultural exchange.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg" id="hero-cta">
              Start Your Journey
              <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg" id="hero-login">
              Sign In
            </Link>
          </div>

          <div className="hero-stats">
            {stats.map((stat, i) => (
              <div key={i} className="stat-item">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual animate-fade-in">
          <div className="hero-globe-container">
            <div className="globe-ring ring-1"></div>
            <div className="globe-ring ring-2"></div>
            <div className="globe-ring ring-3"></div>
            <div className="globe-center">
              <Globe size={64} />
            </div>
            <div className="floating-card fc-1 glass-card">
              <span className="fc-emoji">🎵</span>
              <span>Music Exchange</span>
            </div>
            <div className="floating-card fc-2 glass-card">
              <span className="fc-emoji">🗣️</span>
              <span>Language Partner</span>
            </div>
            <div className="floating-card fc-3 glass-card">
              <span className="fc-emoji">👨‍🍳</span>
              <span>Cooking Skills</span>
            </div>
            <div className="floating-card fc-4 glass-card">
              <span className="fc-emoji">💻</span>
              <span>Tech Mentorship</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="page-container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <h1>Why CulturaMatch?</h1>
            <p>AI-driven features designed to create meaningful cultural connections</p>
          </div>

          <div className="features-grid">
            {features.map((feature, i) => (
              <div
                key={i}
                className="feature-card glass-card animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="feature-icon" style={{ background: feature.gradient }}>
                  <feature.icon size={24} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-section">
        <div className="page-container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <h1>How It Works</h1>
            <p>Three simple steps to start your cultural exchange journey</p>
          </div>

          <div className="steps-container">
            <div className="step-card glass-card animate-fade-in-up">
              <div className="step-number">01</div>
              <h3>Create Your Profile</h3>
              <p>Tell us about your skills, languages, and cultural interests. The more you share, the better your matches.</p>
            </div>
            <div className="step-connector">
              <ArrowRight size={24} />
            </div>
            <div className="step-card glass-card animate-fade-in-up animate-delay-200">
              <div className="step-number">02</div>
              <h3>Get AI Matches</h3>
              <p>Our neural network and fuzzy logic engine analyze profiles to find your ideal cultural exchange partners.</p>
            </div>
            <div className="step-connector">
              <ArrowRight size={24} />
            </div>
            <div className="step-card glass-card animate-fade-in-up animate-delay-400">
              <div className="step-number">03</div>
              <h3>Connect & Grow</h3>
              <p>Chat, schedule meetups, share skills, and expand your cultural horizons with people worldwide.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-content glass-card">
          <h2>Ready to Explore the World?</h2>
          <p>Join thousands of cultural explorers sharing skills and building connections across borders.</p>
          <Link to="/register" className="btn btn-primary btn-lg" id="cta-register">
            Get Started Free
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="page-container">
          <div className="footer-inner">
            <div className="footer-brand">
              <Globe size={20} />
              <span>CulturaMatch</span>
            </div>
            <p className="footer-copy">© 2026 CulturaMatch. Connecting cultures through technology.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
