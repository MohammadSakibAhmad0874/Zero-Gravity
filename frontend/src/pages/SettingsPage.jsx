import { useContext, useState } from 'react'
import { AuthContext, ThemeContext } from '../App'
import {
  Settings, Bell, Shield, Eye, Palette, Trash2, Save,
  CheckCircle, Moon, Sun, Globe, Lock, AlertTriangle
} from 'lucide-react'
import './SettingsPage.css'

export default function SettingsPage() {
  const { user, token, logout } = useContext(AuthContext)
  const { theme, toggleTheme } = useContext(ThemeContext)
  const [saved, setSaved] = useState(false)
  const [notif, setNotif] = useState({
    matches: true,
    messages: true,
    meetups: true,
    digest: false,
  })
  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showEmail: false,
    showCountry: true,
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const Toggle = ({ value, onChange, id }) => (
    <button
      id={id}
      className={`settings-toggle ${value ? 'on' : ''}`}
      onClick={() => onChange(!value)}
      type="button"
      aria-pressed={value}
    >
      <span className="toggle-knob" />
    </button>
  )

  return (
    <div className="page-container settings-page">
      {/* Header */}
      <div className="section-header">
        <h1><Settings size={28} /> Settings</h1>
        <p>Manage your account preferences and privacy settings</p>
      </div>

      <div className="settings-layout">

        {/* ── Notifications ── */}
        <div className="settings-card glass-card">
          <div className="settings-card-header">
            <Bell size={20} />
            <h2>Notifications</h2>
          </div>

          <div className="settings-rows">
            {[
              { key: 'matches', label: 'New Matches', desc: 'Get notified when new teammates match you' },
              { key: 'messages', label: 'Messages', desc: 'Receive alerts for new chat messages' },
              { key: 'meetups', label: 'Meetup Reminders', desc: 'Reminders before your scheduled syncs' },
              { key: 'digest', label: 'Weekly Digest', desc: 'Summary of platform activity each week' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="settings-row">
                <div className="settings-row-info">
                  <span className="settings-row-label">{label}</span>
                  <span className="settings-row-desc">{desc}</span>
                </div>
                <Toggle
                  value={notif[key]}
                  onChange={(v) => setNotif({ ...notif, [key]: v })}
                  id={`notif-${key}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Privacy ── */}
        <div className="settings-card glass-card">
          <div className="settings-card-header">
            <Eye size={20} />
            <h2>Privacy</h2>
          </div>

          <div className="settings-rows">
            {[
              { key: 'publicProfile', label: 'Public Profile', desc: 'Allow other developers to discover you via Discover page' },
              { key: 'showEmail', label: 'Show Email', desc: 'Display your email address on your public profile' },
              { key: 'showCountry', label: 'Show Location', desc: 'Display your country on your profile card' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="settings-row">
                <div className="settings-row-info">
                  <span className="settings-row-label">{label}</span>
                  <span className="settings-row-desc">{desc}</span>
                </div>
                <Toggle
                  value={privacy[key]}
                  onChange={(v) => setPrivacy({ ...privacy, [key]: v })}
                  id={`privacy-${key}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Appearance ── */}
        <div className="settings-card glass-card">
          <div className="settings-card-header">
            <Palette size={20} />
            <h2>Appearance</h2>
          </div>

          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-row-label">Color Theme</span>
              <span className="settings-row-desc">Choose between light and dark mode</span>
            </div>
            <div className="theme-switcher">
              <button
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => { if (theme !== 'light') toggleTheme() }}
                id="theme-light"
              >
                <Sun size={16} />
                Light
              </button>
              <button
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => { if (theme !== 'dark') toggleTheme() }}
                id="theme-dark"
              >
                <Moon size={16} />
                Dark
              </button>
            </div>
          </div>
        </div>

        {/* ── Account ── */}
        <div className="settings-card glass-card">
          <div className="settings-card-header">
            <Shield size={20} />
            <h2>Account</h2>
          </div>

          <div className="settings-rows">
            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Email Address</span>
                <span className="settings-row-desc">{user?.email}</span>
              </div>
              <span className="settings-badge">
                <Lock size={13} />
                Locked
              </span>
            </div>

            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Auth Provider</span>
                <span className="settings-row-desc">
                  {user?.authProvider === 'google' ? '🔵 Google Account' : '🔑 Email & Password'}
                </span>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-info">
                <span className="settings-row-label">Member Since</span>
                <span className="settings-row-desc">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Danger Zone ── */}
        <div className="settings-card settings-card-danger glass-card">
          <div className="settings-card-header">
            <AlertTriangle size={20} />
            <h2>Danger Zone</h2>
          </div>

          <div className="danger-zone-body">
            <div className="danger-item">
              <div className="settings-row-info">
                <span className="settings-row-label">Sign Out</span>
                <span className="settings-row-desc">Log out of your DevMatch account on this device</span>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={async () => {
                  try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }) } catch {}
                  logout()
                }}
                id="settings-logout-btn"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* ── Save ── */}
        <div className="settings-save-bar">
          <button className="btn btn-primary btn-lg" onClick={handleSave} id="save-settings-btn">
            <Save size={18} />
            Save Preferences
          </button>
        </div>
      </div>

      {saved && (
        <div className="toast toast-success">
          <CheckCircle size={16} />
          Settings saved successfully!
        </div>
      )}
    </div>
  )
}
