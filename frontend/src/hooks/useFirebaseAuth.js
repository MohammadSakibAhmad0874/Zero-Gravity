// ─── Firebase Auth Hook ──────────────────────────────────────────────────────
// Wraps Firebase Auth methods and syncs user to Firestore via backend

import { useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail
} from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'
import { authFetch } from '../config/api'

export function useFirebaseAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function clearError() { setError('') }

  /**
   * Sync Firebase user to backend Firestore.
   * Called after every login/register to ensure the backend has user data.
   */
  async function syncToBackend(firebaseUser, extraData = {}) {
    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/api/auth/sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({
            name: firebaseUser.displayName || extraData.name || '',
            email: firebaseUser.email,
            avatar: firebaseUser.photoURL || '',
            authProvider: firebaseUser.providerData[0]?.providerId || 'password',
            ...extraData
          })
        }
      )
      if (!res.ok) throw new Error('Backend sync failed')
      const data = await res.json()
      return data  // { user, isNew }
    } catch (err) {
      console.error('Backend sync error:', err)
      // Non-fatal — return minimal user object from Firebase
      return {
        user: {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL || ''
        },
        isNew: false
      }
    }
  }

  /**
   * Email/Password Sign In
   */
  async function signInWithEmail(email, password) {
    setLoading(true)
    setError('')
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password)
      const { user, isNew } = await syncToBackend(firebaseUser)
      return { user, isNew, firebaseUser }
    } catch (err) {
      const msg = getFirebaseErrorMessage(err.code)
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Email/Password Register
   */
  async function registerWithEmail(email, password, profileData = {}) {
    setLoading(true)
    setError('')
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
      const { user, isNew } = await syncToBackend(firebaseUser, profileData)
      return { user, isNew, firebaseUser }
    } catch (err) {
      const msg = getFirebaseErrorMessage(err.code)
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Google Sign In (popup)
   */
  async function signInWithGoogle() {
    setLoading(true)
    setError('')
    try {
      const { user: firebaseUser } = await signInWithPopup(auth, googleProvider)
      const { user, isNew } = await syncToBackend(firebaseUser)
      return { user, isNew, firebaseUser }
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setLoading(false)
        return null  // User cancelled — not an error
      }
      const msg = getFirebaseErrorMessage(err.code)
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Send password reset email
   */
  async function resetPassword(email) {
    setLoading(true)
    setError('')
    try {
      await sendPasswordResetEmail(auth, email)
      return true
    } catch (err) {
      const msg = getFirebaseErrorMessage(err.code)
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Sign out
   */
  async function signOut() {
    try {
      await firebaseSignOut(auth)
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  return {
    loading,
    error,
    clearError,
    signInWithEmail,
    registerWithEmail,
    signInWithGoogle,
    resetPassword,
    signOut
  }
}

/**
 * Convert Firebase error codes to human-readable messages
 */
function getFirebaseErrorMessage(code) {
  const messages = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'This email is already registered. Try signing in.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/popup-blocked': 'Popup was blocked by your browser. Please allow popups for this site.',
    'auth/cancelled-popup-request': 'Sign-in cancelled.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.'
  }
  return messages[code] || 'An error occurred. Please try again.'
}
