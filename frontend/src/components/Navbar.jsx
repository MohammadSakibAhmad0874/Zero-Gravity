import { useContext, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../App'
import { Globe, Menu, X, LogOut, User, MessageCircle, Calendar, Compass, LayoutDashboard } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = user ? [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/discover', label: 'Discover', icon: Compass },
    { path: '/chat', label: 'Chat', icon: MessageCircle },
    { path: '/meetups', label: 'Meetups', icon: Calendar },
    { path: '/profile', label: 'Profile', icon: User },
  ] : []

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <Globe size={22} />
          </div>
          <span className="brand-text">CulturaMatch</span>
        </Link>

        {user && (
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
        )}

        <div className="navbar-actions">
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
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
