import { useEffect, useContext, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthContext } from '../App'
import './AuthPages.css'

export default function AuthCallback() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const redirect = searchParams.get('redirect') || '/dashboard'

    if (!token) {
      setError('Authentication failed. No token received.')
      setTimeout(() => navigate('/login'), 2000)
      return
    }

    // Fetch user data with the token, then complete login
    fetch('/api/users/me', {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to fetch user')))
      .then(data => {
        login(token, data.user)
        navigate(redirect, { replace: true })
      })
      .catch(err => {
        console.error('Auth callback error:', err)
        setError('Authentication failed. Please try again.')
        setTimeout(() => navigate('/login'), 2000)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in-up" style={{ textAlign: 'center' }}>
        {error ? (
          <>
            <div className="auth-error">{error}</div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
              Redirecting to login...
            </p>
          </>
        ) : (
          <>
            <div className="loading-spinner" style={{ margin: '0 auto 1.5rem' }}></div>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Signing you in...
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Completing Google authentication
            </p>
          </>
        )}
      </div>
    </div>
  )
}
