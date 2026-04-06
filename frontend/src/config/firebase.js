// ─── Firebase Client SDK Configuration ──────────────────────────────────────
// All values come from environment variables (set in Vercel dashboard for production)

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAGFSwUN-D9kHEOPWryUCilqgvx0PFDfM0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'devmatch-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'devmatch-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'devmatch-app.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '729365532868',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:729365532868:web:936ccb0628da19343f3991'
}

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)

// Auth
export const auth = getAuth(firebaseApp)
export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('profile')
googleProvider.addScope('email')

// Firestore (optional — only if you want direct frontend reads)
export const db = getFirestore(firebaseApp)

export default firebaseApp
