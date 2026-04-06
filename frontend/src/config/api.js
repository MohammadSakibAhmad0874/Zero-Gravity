// ─── API Base URL + Authenticated Fetch Helper ──────────────────────────────
//
// In development:  Uses Vite proxy → /api → localhost:5000
// In production:   VITE_API_URL points to Fly.io backend
//
// Example: VITE_API_URL=https://devmatch-backend.fly.dev

import { auth } from './firebase'

export const API_BASE = import.meta.env.VITE_API_URL || ''

// Build a full API path
export const apiUrl = (path) => `${API_BASE}${path}`

/**
 * Authenticated fetch — automatically attaches the Firebase ID token
 * as Authorization: Bearer <token> on every request.
 *
 * Usage:
 *   const data = await authFetch('/api/users/me')
 *   const data = await authFetch('/api/meetups', { method: 'POST', body: JSON.stringify({...}) })
 */
export async function authFetch(path, options = {}) {
  const user = auth.currentUser
  let headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  if (user) {
    try {
      const token = await user.getIdToken()
      headers['Authorization'] = `Bearer ${token}`
    } catch (err) {
      console.warn('Could not get Firebase ID token:', err)
    }
  }

  const res = await fetch(apiUrl(path), {
    ...options,
    headers,
    credentials: 'include'
  })

  return res
}
