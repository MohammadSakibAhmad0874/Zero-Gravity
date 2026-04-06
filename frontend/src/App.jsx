import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext } from 'react'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import DiscoverPage from './pages/DiscoverPage'
import ProfilePage from './pages/ProfilePage'
import ChatPage from './pages/ChatPage'
import MeetupPage from './pages/MeetupPage'

export const AuthContext = createContext(null)

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('cm_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => { setUser(data.user); setLoading(false) })
        .catch(() => { setToken(null); localStorage.removeItem('cm_token'); setLoading(false) })
    } else {
      setLoading(false)
    }
  }, [token])

  const login = (newToken, userData) => {
    localStorage.setItem('cm_token', newToken)
    setToken(newToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('cm_token')
    setToken(null)
    setUser(null)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading CulturaMatch...</p>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
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
            </Routes>
          </main>
        </div>
      </Router>
    </AuthContext.Provider>
  )
}

export default App
