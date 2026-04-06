import { useContext, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext, ThemeContext } from '../App'
import { Code2, Menu, X, LogOut, User, MessageCircle, Calendar, Compass, LayoutDashboard, Settings, Sun, Moon } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const { theme, toggleTheme } = useContext(ThemeContext)
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }) } catch {}
    logout()
    navigate('/')
  }

  // Smooth scroll to section on landing page
  const scrollToSection = (e, sectionId) => {
    e.preventDefault()
    setMobileOpen(false)
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      navigate('/')
      setTimeout(() => {
        const el = document.getElementById(sectionId)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  const navLinks = user ? [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/discover', label: 'Discover', icon: Compass },
    { path: '/chat', label: 'Chat', icon: MessageCircle },
    { path: '/meetups', label: 'Meetups', icon: Calendar },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
  ] : []

  // Landing page section links (shown when not logged in)
  const landingLinks = [
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'cta', label: 'Get Started' },
  ]

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <Code2 size={22} />
          </div>
          <span className="brand-text">DevMatch</span>
        </Link>

        {user ? (
          <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
            {landingLinks.map(link => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="nav-link"
                onClick={(e) => scrollToSection(e, link.id)}
              >
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        )}

        <div className="navbar-actions">
          {/* Theme toggle — always visible */}
          <button
            className="btn btn-ghost btn-sm theme-toggle"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            id="theme-toggle-btn"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <>
              <div className="nav-user">
                <div className="avatar avatar-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="nav-user-name">{user.name}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn">
                <LogOut size={18} />
              </button>
              <button
                className="mobile-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" id="login-nav-btn">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="register-nav-btn">Get Started</Link>
              <button
                className="mobile-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
