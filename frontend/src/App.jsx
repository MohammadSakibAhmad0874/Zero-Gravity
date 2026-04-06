import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './config/firebase'
import { authFetch } from './config/api'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import DiscoverPage from './pages/DiscoverPage'
import ProfilePage from './pages/ProfilePage'
import ChatPage from './pages/ChatPage'
import MeetupPage from './pages/MeetupPage'
import SettingsPage from './pages/SettingsPage'

export const AuthContext = createContext(null)
export const ThemeContext = createContext(null)

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ─── Theme ───
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('dm_theme') || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('dm_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  // ─── Firebase Auth State Listener ────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore via backend
          const res = await authFetch('/api/users/me')
          if (res.ok) {
            const data = await res.json()
            setUser(data.user)
          } else {
            // Backend returned error (e.g. user doc not in Firestore yet)
            // Use minimal Firebase user data while sync happens
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || '',
              email: firebaseUser.email,
              avatar: firebaseUser.photoURL || ''
            })
          }
        } catch (err) {
          console.error('Failed to load user profile:', err)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    await auth.signOut()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading DevMatch...</p>
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ user, setUser, logout }}>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
                <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
                <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
                <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/discover" element={user ? <DiscoverPage /> : <Navigate to="/login" />} />
                <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
                <Route path="/profile/:id" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
                <Route path="/chat" element={user ? <ChatPage /> : <Navigate to="/login" />} />
                <Route path="/chat/:userId" element={user ? <ChatPage /> : <Navigate to="/login" />} />
                <Route path="/meetups" element={user ? <MeetupPage /> : <Navigate to="/login" />} />
                <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  )
}

export default App
