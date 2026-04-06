import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { v4 as uuidv4 } from 'uuid'
import admin from 'firebase-admin'

// ─── Firebase Admin Initialization ──────────────────────────────────────────
// Credentials come from environment variables (set in Fly.io secrets)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Fly.io encodes newlines as \n in secrets — replace literal \n with real newline
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
})

const db = admin.firestore()
const auth = admin.auth()

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express()
const PORT = process.env.PORT || 5000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const IS_PROD = process.env.NODE_ENV === 'production'

// ─── CORS ────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  FRONTEND_URL,
  ...(process.env.EXTRA_ORIGINS ? process.env.EXTRA_ORIGINS.split(',') : [])
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (origin.endsWith('.vercel.app')) return callback(null, true)
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
    callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// ─── Auth Middleware (verifies Firebase ID Token) ─────────────────────────────
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.cm_token
  if (!token) return res.status(401).json({ error: 'No token provided' })
  try {
    const decoded = await auth.verifyIdToken(token)
    req.userId = decoded.uid
    req.firebaseUser = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// ─── Firestore Helpers ────────────────────────────────────────────────────────
const usersCol = () => db.collection('users')
const chatsCol = () => db.collection('chats')
const meetupsCol = () => db.collection('meetups')
const feedbackCol = () => db.collection('feedback')

async function getUserById(uid) {
  const doc = await usersCol().doc(uid).get()
  return doc.exists ? { id: doc.id, ...doc.data() } : null
}

// ==================== AUTH SYNC ROUTE ====================
// Called by frontend AFTER Firebase Auth login/register to ensure
// a Firestore user document exists and is up to date.

app.post('/api/auth/sync', authMiddleware, async (req, res) => {
  try {
    const uid = req.userId
    const { name, email, avatar, country, timezone, bio, skills, techStack, projectInterests, role, experienceLevel, authProvider } = req.body

    const userRef = usersCol().doc(uid)
    const existing = await userRef.get()

    if (!existing.exists) {
      // New user — create Firestore doc
      const newUser = {
        id: uid,
        name: name || req.firebaseUser.name || email?.split('@')[0] || 'Developer',
        email: email || req.firebaseUser.email || '',
        avatar: avatar || req.firebaseUser.picture || '',
        country: country || '',
        timezone: timezone || '',
        bio: bio || '',
        skills: skills || [],
        techStack: techStack || [],
        projectInterests: projectInterests || [],
        role: role || '',
        experienceLevel: experienceLevel || 'beginner',
        authProvider: authProvider || 'email',
        availability: 'open',
        createdAt: new Date().toISOString()
      }
      await userRef.set(newUser)
      return res.status(201).json({ user: newUser, isNew: true })
    } else {
      // Existing user — return current data (optionally update avatar/name from Firebase)
      const userData = { id: uid, ...existing.data() }

      // Update avatar if changed (e.g., Google profile pic update)
      const updates = {}
      if (avatar && avatar !== existing.data().avatar) updates.avatar = avatar
      if (name && !existing.data().name) updates.name = name
      if (Object.keys(updates).length > 0) {
        await userRef.update(updates)
        Object.assign(userData, updates)
      }

      return res.json({ user: userData, isNew: false })
    }
  } catch (err) {
    console.error('Auth sync error:', err)
    res.status(500).json({ error: 'Failed to sync user' })
  }
})

// ==================== USER ROUTES ====================

// Get current user
app.get('/api/users/me', authMiddleware, async (req, res) => {
  try {
    const user = await getUserById(req.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' })
  }
})

// Update current user
app.put('/api/users/me', authMiddleware, async (req, res) => {
  try {
    const allowedFields = [
      'name', 'country', 'timezone', 'bio',
      'skills', 'techStack', 'projectInterests', 'role', 'experienceLevel',
      'availability', 'avatar'
    ]
    const updates = {}
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field]
    })

    const userRef = usersCol().doc(req.userId)
    await userRef.update(updates)
    const updated = await userRef.get()
    res.json({ user: { id: updated.id, ...updated.data() } })
  } catch (err) {
    console.error('Update user error:', err)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// Get user by ID
app.get('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await getUserById(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' })
  }
})

// ==================== MATCHES ====================

app.get('/api/matches', authMiddleware, async (req, res) => {
  try {
    const currentUser = await getUserById(req.userId)
    if (!currentUser) return res.status(404).json({ error: 'User not found' })

    const limit = parseInt(req.query.limit) || 10

    // Get all other users from Firestore
    const snapshot = await usersCol().where(admin.firestore.FieldPath.documentId(), '!=', req.userId).get()
    const otherUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Local matching — 50% skills, 30% tech stack, 20% role
    const matches = otherUsers.map(other => {
      const skillOverlap = (currentUser.skills || []).filter(s => (other.skills || []).includes(s)).length
      const techOverlap = (currentUser.techStack || []).filter(t => (other.techStack || []).includes(t)).length
      const roleMatch = currentUser.role && other.role && currentUser.role !== other.role ? 1 : 0

      const maxSkills = Math.max((currentUser.skills || []).length, (other.skills || []).length, 1)
      const maxTech = Math.max((currentUser.techStack || []).length, (other.techStack || []).length, 1)

      const score = Math.round(
        ((skillOverlap / maxSkills) * 0.50 +
         (techOverlap / maxTech) * 0.30 +
         roleMatch * 0.20) * 100
      )

      return { ...other, matchScore: Math.max(score, 15) }
    })

    matches.sort((a, b) => b.matchScore - a.matchScore)
    res.json({ matches: matches.slice(0, limit) })
  } catch (err) {
    console.error('Matches error:', err)
    res.status(500).json({ error: 'Failed to get matches' })
  }
})

// ==================== CHAT ====================

// Auto-reply generator (reads from Firestore)
async function generateAutoReply(senderId, recipientId) {
  const recipientUser = await getUserById(recipientId)
  const senderUser = await getUserById(senderId)
  if (!recipientUser) return null

  const name = recipientUser.name || 'Developer'
  const firstName = name.split(' ')[0]
  const senderFirst = senderUser?.name?.split(' ')[0] || 'there'
  const role = recipientUser.role?.replace(/_/g, ' ') || 'Developer'
  const skills = recipientUser.skills || []
  const techStack = recipientUser.techStack || []
  const experience = recipientUser.experienceLevel || 'beginner'
  const interests = recipientUser.projectInterests || []
  const availability = recipientUser.availability || 'open'
  const country = recipientUser.country || ''

  const greetings = [
    `Hey ${senderFirst}! 👋 Thanks for reaching out!`,
    `Hi ${senderFirst}! Great to connect with you! 🙌`,
    `Hello ${senderFirst}! Glad you messaged me! ✨`,
    `Hey there ${senderFirst}! 🚀 Nice to hear from you!`,
    `Hi ${senderFirst}! Excited to connect! 💡`
  ]
  const greeting = greetings[Math.floor(Math.random() * greetings.length)]

  const expEmoji = { beginner: '🌱', intermediate: '⚡', advanced: '🚀' }
  const expLabel = experience.charAt(0).toUpperCase() + experience.slice(1)

  let profileLines = []
  profileLines.push(`I'm ${firstName}, a ${role} developer${country ? ` based in ${country}` : ''}.`)
  profileLines.push(`${expEmoji[experience] || '⚡'} Experience: ${expLabel}`)

  if (skills.length > 0) {
    profileLines.push(`🛠️ Skills: ${skills.slice(0, 5).join(', ')}${skills.length > 5 ? ` +${skills.length - 5} more` : ''}`)
  }
  if (techStack.length > 0) {
    profileLines.push(`💻 Tech Stack: ${techStack.slice(0, 4).join(', ')}${techStack.length > 4 ? ` +${techStack.length - 4} more` : ''}`)
  }
  if (interests.length > 0) {
    profileLines.push(`🎯 Interested in: ${interests.slice(0, 3).join(', ')}`)
  }

  const availabilityMessages = {
    open: `\n✅ I'm currently **open for collaboration** and looking to team up!`,
    busy: `\n⏳ I'm currently a bit busy, but feel free to share your idea!`,
    unavailable: `\n🔴 I'm not available right now, but let's stay connected!`
  }
  const availMsg = availabilityMessages[availability] || availabilityMessages.open

  const closings = [
    `Looking forward to chatting more! 🤝`,
    `Let me know what project you have in mind! 🎯`,
    `Would love to hear about your hackathon idea! 💡`,
    `Let's make something amazing together! 🔥`,
    `Feel free to share more about your project! 🌟`
  ]
  const closing = closings[Math.floor(Math.random() * closings.length)]

  return `${greeting}\n\n${profileLines.join('\n')}${availMsg}\n\n${closing}`
}

// Send message (with auto-reply)
app.post('/api/chat/send', authMiddleware, async (req, res) => {
  try {
    const { recipientId, text } = req.body
    if (!recipientId || !text) return res.status(400).json({ error: 'recipientId and text are required' })

    const messageId = uuidv4()
    const message = {
      id: messageId,
      senderId: req.userId,
      recipientId,
      text,
      timestamp: new Date().toISOString(),
      isAutoReply: false
    }

    await chatsCol().doc(messageId).set(message)

    // Check if auto-reply already sent
    const existingAutoReplies = await chatsCol()
      .where('senderId', '==', recipientId)
      .where('recipientId', '==', req.userId)
      .where('isAutoReply', '==', true)
      .get()

    let autoReply = null
    const replyId = uuidv4()

    if (existingAutoReplies.empty) {
      // First message — full profile auto-reply
      const replyText = await generateAutoReply(req.userId, recipientId)
      if (replyText) {
        autoReply = {
          id: replyId,
          senderId: recipientId,
          recipientId: req.userId,
          text: replyText,
          timestamp: new Date(Date.now() + 2000).toISOString(),
          isAutoReply: true
        }
        await chatsCol().doc(replyId).set(autoReply)
      }
    } else {
      // Subsequent messages — short reply
      const quickReplies = [
        `Thanks for the message! I'll review this and get back to you shortly 📩`,
        `Got it! Let me think about this and respond properly soon 🤔`,
        `Noted! I appreciate you sharing that — let's sync up on this 🤝`,
        `Thanks! I'm excited about this — will respond in detail soon ✨`,
        `Received! Looking forward to diving deeper into this 🚀`
      ]
      autoReply = {
        id: replyId,
        senderId: recipientId,
        recipientId: req.userId,
        text: quickReplies[Math.floor(Math.random() * quickReplies.length)],
        timestamp: new Date(Date.now() + 2000).toISOString(),
        isAutoReply: true
      }
      await chatsCol().doc(replyId).set(autoReply)
    }

    res.status(201).json({ message, autoReply })
  } catch (err) {
    console.error('Chat send error:', err)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// Get chat history between two users
app.get('/api/chat/:userId', authMiddleware, async (req, res) => {
  try {
    const otherUserId = req.params.userId

    // Get messages in both directions
    const [sent, received] = await Promise.all([
      chatsCol()
        .where('senderId', '==', req.userId)
        .where('recipientId', '==', otherUserId)
        .get(),
      chatsCol()
        .where('senderId', '==', otherUserId)
        .where('recipientId', '==', req.userId)
        .get()
    ])

    const messages = [
      ...sent.docs.map(doc => doc.data()),
      ...received.docs.map(doc => doc.data())
    ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    res.json({ messages })
  } catch (err) {
    console.error('Chat get error:', err)
    res.status(500).json({ error: 'Failed to get messages' })
  }
})

// ==================== MEETUPS ====================

app.post('/api/meetups', authMiddleware, async (req, res) => {
  try {
    const { partnerId, title, date, time, duration, notes } = req.body
    const meetupId = uuidv4()
    const meetup = {
      id: meetupId,
      organizerId: req.userId,
      partnerId: partnerId || null,
      title: title || 'Team Sync Session',
      date,
      time,
      duration: duration || '30',
      notes: notes || '',
      createdAt: new Date().toISOString()
    }

    await meetupsCol().doc(meetupId).set(meetup)
    res.status(201).json({ meetup })
  } catch (err) {
    console.error('Create meetup error:', err)
    res.status(500).json({ error: 'Failed to create meetup' })
  }
})

app.get('/api/meetups', authMiddleware, async (req, res) => {
  try {
    const [organized, participated] = await Promise.all([
      meetupsCol().where('organizerId', '==', req.userId).get(),
      meetupsCol().where('partnerId', '==', req.userId).get()
    ])

    const meetupMap = new Map()
    ;[...organized.docs, ...participated.docs].forEach(doc => {
      meetupMap.set(doc.id, doc.data())
    })

    const meetups = Array.from(meetupMap.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    res.json({ meetups })
  } catch (err) {
    console.error('Get meetups error:', err)
    res.status(500).json({ error: 'Failed to get meetups' })
  }
})

// ==================== FEEDBACK ====================

app.post('/api/feedback', authMiddleware, async (req, res) => {
  try {
    const { targetUserId, rating, comment } = req.body
    const feedbackId = uuidv4()
    const feedback = {
      id: feedbackId,
      fromUserId: req.userId,
      targetUserId,
      rating,
      comment: comment || '',
      createdAt: new Date().toISOString()
    }

    await feedbackCol().doc(feedbackId).set(feedback)
    res.status(201).json({ feedback })
  } catch (err) {
    console.error('Feedback error:', err)
    res.status(500).json({ error: 'Failed to submit feedback' })
  }
})

// ==================== HEALTH ====================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'devmatch-backend',
    database: 'firestore',
    timestamp: new Date().toISOString()
  })
})

// ==================== START ====================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ DevMatch Backend (Firebase) running on http://0.0.0.0:${PORT}`)
})
