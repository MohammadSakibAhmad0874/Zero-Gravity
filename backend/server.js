import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'culturamatch-secret-key-2026'

// Middleware
app.use(cors())
app.use(express.json())

// --- Data Storage Helpers ---
const DATA_DIR = path.join(__dirname, 'data')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const dataFile = (name) => path.join(DATA_DIR, `${name}.json`)

function readData(name) {
  const file = dataFile(name)
  if (!fs.existsSync(file)) { fs.writeFileSync(file, '[]'); return [] }
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) }
  catch { return [] }
}

function writeData(name, data) {
  fs.writeFileSync(dataFile(name), JSON.stringify(data, null, 2))
}

// --- Auth Middleware ---
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token provided' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, country, timezone, bio, skills, languages, interests } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }

    const users = readData('users')
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      country: country || '',
      timezone: timezone || '',
      bio: bio || '',
      skills: skills || [],
      languages: languages || [],
      interests: interests || [],
      createdAt: new Date().toISOString()
    }

    users.push(user)
    writeData('users', users)

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    const { password: _, ...safeUser } = user

    res.status(201).json({ token, user: safeUser })
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const users = readData('users')
    const user = users.find(u => u.email === email)
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    const { password: _, ...safeUser } = user

    res.json({ token, user: safeUser })
  } catch (err) {
    res.status(500).json({ error: 'Login failed' })
  }
})

// ==================== USER ROUTES ====================

// Get current user
app.get('/api/users/me', authMiddleware, (req, res) => {
  const users = readData('users')
  const user = users.find(u => u.id === req.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  const { password, ...safeUser } = user
  res.json({ user: safeUser })
})

// Update current user
app.put('/api/users/me', authMiddleware, (req, res) => {
  const users = readData('users')
  const idx = users.findIndex(u => u.id === req.userId)
  if (idx === -1) return res.status(404).json({ error: 'User not found' })

  const allowedFields = ['name', 'country', 'timezone', 'bio', 'skills', 'languages', 'interests']
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) users[idx][field] = req.body[field]
  })

  writeData('users', users)
  const { password, ...safeUser } = users[idx]
  res.json({ user: safeUser })
})

// Get user by ID
app.get('/api/users/:id', authMiddleware, (req, res) => {
  const users = readData('users')
  const user = users.find(u => u.id === req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  const { password, ...safeUser } = user
  res.json({ user: safeUser })
})

// ==================== MATCHES ========================

// Get AI matches — calls Python service or falls back to local matching
app.get('/api/matches', authMiddleware, async (req, res) => {
  try {
    const users = readData('users')
    const currentUser = users.find(u => u.id === req.userId)
    if (!currentUser) return res.status(404).json({ error: 'User not found' })

    const limit = parseInt(req.query.limit) || 10

    // Try Python AI service first
    try {
      const aiRes = await fetch('http://localhost:5001/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: req.userId, users: users.map(u => ({ ...u, password: undefined })) })
      })
      if (aiRes.ok) {
        const aiData = await aiRes.json()
        return res.json({ matches: aiData.matches.slice(0, limit) })
      }
    } catch {
      // AI service not available, fall back to local scoring
    }

    // Local fallback matching
    const otherUsers = users.filter(u => u.id !== req.userId)
    const matches = otherUsers.map(other => {
      const { password, ...safeOther } = other

      // Simple matching score
      const skillOverlap = (currentUser.skills || []).filter(s => (other.skills || []).includes(s)).length
      const langOverlap = (currentUser.languages || []).filter(l => (other.languages || []).includes(l)).length
      const interestOverlap = (currentUser.interests || []).filter(i => (other.interests || []).includes(i)).length

      const maxSkills = Math.max((currentUser.skills || []).length, (other.skills || []).length, 1)
      const maxLangs = Math.max((currentUser.languages || []).length, (other.languages || []).length, 1)
      const maxInterests = Math.max((currentUser.interests || []).length, (other.interests || []).length, 1)

      const score = Math.round(
        ((skillOverlap / maxSkills) * 0.4 +
         (langOverlap / maxLangs) * 0.35 +
         (interestOverlap / maxInterests) * 0.25) * 100
      )

      return { ...safeOther, matchScore: Math.max(score, 15) }
    })

    matches.sort((a, b) => b.matchScore - a.matchScore)
    res.json({ matches: matches.slice(0, limit) })
  } catch (err) {
    res.status(500).json({ error: 'Failed to get matches' })
  }
})

// ==================== CHAT ===========================

// Send message
app.post('/api/chat/send', authMiddleware, (req, res) => {
  const { recipientId, text } = req.body
  if (!recipientId || !text) return res.status(400).json({ error: 'recipientId and text are required' })

  const chats = readData('chats')
  const message = {
    id: uuidv4(),
    senderId: req.userId,
    recipientId,
    text,
    timestamp: new Date().toISOString()
  }

  chats.push(message)
  writeData('chats', chats)
  res.status(201).json({ message })
})

// Get chat history
app.get('/api/chat/:userId', authMiddleware, (req, res) => {
  const chats = readData('chats')
  const otherUserId = req.params.userId

  const messages = chats.filter(m =>
    (m.senderId === req.userId && m.recipientId === otherUserId) ||
    (m.senderId === otherUserId && m.recipientId === req.userId)
  ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  res.json({ messages })
})

// ==================== MEETUPS ========================

// Create meetup
app.post('/api/meetups', authMiddleware, (req, res) => {
  const { partnerId, title, date, time, duration, notes } = req.body

  const meetups = readData('meetups')
  const meetup = {
    id: uuidv4(),
    organizerId: req.userId,
    partnerId: partnerId || null,
    title: title || 'Cultural Exchange Session',
    date,
    time,
    duration: duration || '30',
    notes: notes || '',
    createdAt: new Date().toISOString()
  }

  meetups.push(meetup)
  writeData('meetups', meetups)
  res.status(201).json({ meetup })
})

// Get meetups
app.get('/api/meetups', authMiddleware, (req, res) => {
  const meetups = readData('meetups')
  const userMeetups = meetups.filter(m =>
    m.organizerId === req.userId || m.partnerId === req.userId
  ).sort((a, b) => new Date(a.date) - new Date(b.date))

  res.json({ meetups: userMeetups })
})

// ==================== FEEDBACK =======================

// Submit feedback
app.post('/api/feedback', authMiddleware, (req, res) => {
  const { targetUserId, rating, comment } = req.body

  const feedbacks = readData('feedback')
  const feedback = {
    id: uuidv4(),
    fromUserId: req.userId,
    targetUserId,
    rating,
    comment: comment || '',
    createdAt: new Date().toISOString()
  }

  feedbacks.push(feedback)
  writeData('feedback', feedbacks)

  // Optionally forward to Python AI service for model training
  fetch('http://localhost:5001/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedback)
  }).catch(() => {}) // Non-blocking

  res.status(201).json({ feedback })
})

// ==================== HEALTH =========================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'culturamatch-backend', timestamp: new Date().toISOString() })
})

// ==================== START ==========================

app.listen(PORT, () => {
  console.log(`🌍 CulturaMatch Backend running on http://localhost:${PORT}`)
})
