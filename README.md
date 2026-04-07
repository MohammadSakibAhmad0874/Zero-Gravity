<p align="center">
  <img src="https://img.shields.io/badge/Zero--Gravity-DevMatch-blueviolet?style=for-the-badge&logo=rocket&logoColor=white" alt="Zero-Gravity DevMatch" />
</p>

<h1 align="center">🚀 Zero-Gravity — DevMatch</h1>

<p align="center">
  <strong>AI-Powered Hackathon Team Formation Platform</strong><br/>
  Find your perfect hackathon teammates using Fuzzy Logic + Neural Network matching
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Fly.io-Backend-8B5CF6?style=flat-square&logo=fly.io" />
  <img src="https://img.shields.io/badge/Vercel-Frontend-000000?style=flat-square&logo=vercel" />
  <img src="https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker" />
  <img src="https://img.shields.io/badge/Python-Flask-3776AB?style=flat-square&logo=python" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

---

## 📖 Table of Contents

- [About](#-about)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [AI Matching Algorithm](#-ai-matching-algorithm)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About

**Zero-Gravity DevMatch** is a full-stack platform designed to solve one of the biggest challenges in hackathons — **finding the right teammates**. Instead of random team formation, DevMatch uses a hybrid **Fuzzy Logic + Neural Network** AI engine to intelligently match developers based on their skills, tech stack, role preferences, and experience levels.

The platform is powered by **Firebase Auth + Firestore** for authentication and data persistence, deployed on **Fly.io** (backend) and **Vercel** (frontend) for production-grade reliability and global performance.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://devmatch-app.vercel.app |
| **Backend API** | https://devmatch-backend.fly.dev |
| **Health Check** | https://devmatch-backend.fly.dev/api/health |

---

## ✨ Features

### 🔐 Authentication (Firebase)
- **Email/Password** — Register and login via Firebase Auth
- **Google Sign-In** — One-click OAuth via Firebase Google Provider (popup flow)
- **Token-based API Auth** — Firebase ID tokens verified by the backend using Admin SDK
- **Persistent Sessions** — `onAuthStateChanged` keeps users logged in across page refreshes

### 🤖 AI-Powered Matching
- **Fuzzy Logic Engine** — Triangular & trapezoidal membership functions for nuanced compatibility scoring
- **Neural Network** — 2-layer feedforward network (4→8→1) that refines predictions based on user feedback
- **Hybrid Scoring** — 60% fuzzy logic + 40% neural network for optimal match quality
- **Match Weights** — 50% skills overlap, 30% tech stack similarity, 20% role compatibility

### 👥 Developer Discovery
- **Discover Page** — Browse and filter potential teammates with compatibility scores
- **Profile Cards** — View skills, tech stack, experience level, and availability at a glance
- **Smart Filtering** — Filter by role, experience, and tech preferences

### 💬 Real-Time Chat
- **Direct Messaging** — Chat with matched developers instantly
- **Smart Auto-Replies** — AI-generated contextual responses
- **Message History** — Persistent conversation threads stored in Firestore

### 📅 Meetup Scheduling
- **Team Sync Sessions** — Schedule meetups with matched teammates
- **Personal Dashboard** — View all upcoming meetups in one place

### ⭐ Feedback System
- **Rate Matches** — Provide feedback (1–5 stars) to train the neural network
- **Continuous Improvement** — The AI gets smarter with every interaction

### 🎨 Premium UI/UX
- **Luxury Editorial Design** — Cream-to-Gold premium aesthetic
- **Glassmorphism** — Frosted-glass UI components
- **Micro-Animations** — Smooth reveal animations & hover interactions
- **Fully Responsive** — Desktop, tablet, and mobile

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework with hooks & context API |
| **React Router v6** | Client-side routing & navigation |
| **Vite 6** | Lightning-fast build tool & dev server |
| **Firebase SDK v11** | Auth (email + Google) + Firestore client |
| **Lucide React** | Icon library |
| **Vanilla CSS** | Custom luxury design system |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js / Express** | REST API server |
| **Firebase Admin SDK** | ID token verification + Firestore reads/writes |
| **Docker** | Containerized deployment |
| **Fly.io** | Global edge deployment platform |
| **cors / dotenv** | CORS + environment management |

### Database & Auth
| Technology | Purpose |
|---|---|
| **Firebase Auth** | User identity (email/password + Google) |
| **Cloud Firestore** | NoSQL database (users, chats, meetups, feedback) |

### AI Service
| Technology | Purpose |
|---|---|
| **Python / Flask** | AI microservice |
| **NumPy** | Neural network computations |
| **scikit-fuzzy** | Fuzzy logic membership functions |

---

## 🏗 Architecture

### Production Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER                              │
└──────────────────┬──────────────────────────┬───────────────────────┘
                   │                          │
                   ▼                          ▼
    ┌──────────────────────┐     ┌────────────────────────────┐
    │   Vercel (Frontend)  │     │   Firebase Auth SDK        │
    │  devmatch.vercel.app │     │   (login / register /      │
    │                      │     │    Google Sign-In)         │
    │  React + Vite SPA    │     └────────────┬───────────────┘
    │  Firebase SDK v11    │                  │
    └──────────┬───────────┘                  │ ID Token
               │                             │
               │  REST API + Bearer Token     │
               ▼                             ▼
    ┌──────────────────────────────────────────────────────────┐
    │            Fly.io  (Docker — Node.js/Express)            │
    │           devmatch-backend.fly.dev                       │
    │                                                          │
    │  POST /api/auth/sync   ← create / ensure Firestore doc   │
    │  GET  /api/users/me    ← fetch profile from Firestore    │
    │  GET  /api/matches     ← AI-scored matches               │
    │  POST /api/chat/send   ← store message in Firestore      │
    │  GET  /api/chat/:id    ← fetch chat history              │
    │  POST /api/meetups     ← create meetup                   │
    │  GET  /api/meetups     ← fetch meetups                   │
    │  POST /api/feedback    ← submit match rating             │
    │  GET  /api/health      ← uptime health check             │
    │                                                          │
    │  Auth Middleware: admin.auth().verifyIdToken(token)      │
    └───────────────────────────┬──────────────────────────────┘
                                │  Firebase Admin SDK
                                ▼
    ┌──────────────────────────────────────────────────────────┐
    │                    Firebase (Google Cloud)               │
    │                                                          │
    │   ┌─────────────────┐    ┌──────────────────────────┐   │
    │   │  Firebase Auth  │    │     Cloud Firestore       │   │
    │   │  - Email/Pass   │    │  Collections:             │   │
    │   │  - Google OAuth │    │  • users                  │   │
    │   │  - ID Tokens    │    │  • chats                  │   │
    │   └─────────────────┘    │  • meetups                │   │
    │                          │  • feedback               │   │
    │                          └──────────────────────────┘   │
    └──────────────────────────────────────────────────────────┘
                                │  HTTP (internal)
                                ▼
    ┌──────────────────────────────────────────────────────────┐
    │              AI Service (Python / Flask)                 │
    │                       port 5001                          │
    │                                                          │
    │   ┌────────────────────┐   ┌──────────────────────────┐  │
    │   │  Fuzzy Logic (60%) │   │  Neural Network (40%)    │  │
    │   │  Triangular &      │   │  Input(4) → Hidden(8)    │  │
    │   │  Trapezoidal MFs   │   │  → Output(1, Sigmoid)    │  │
    │   └────────────────────┘   └──────────────────────────┘  │
    └──────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
User clicks "Login with Google"
        │
        ▼
Firebase Google Popup (browser-side)
        │
        ▼
Firebase returns User + ID Token (JWT signed by Google)
        │
        ▼
Frontend calls POST /api/auth/sync  { idToken }
        │
        ▼
Backend: admin.auth().verifyIdToken(idToken)  ✅
        │
        ▼
Backend checks Firestore users/{uid}
  ├── Exists → return user doc
  └── New → create user doc → return it
        │
        ▼
Frontend stores nothing in localStorage
All API calls use: Authorization: Bearer <fresh ID Token>
```

### Firestore Data Model

```
users/{uid}
  ├── uid: string
  ├── name: string
  ├── email: string
  ├── role: string          (Frontend / Backend / ML / DevOps / ...)
  ├── skills: string[]
  ├── techStack: string[]
  ├── experience: string    (Beginner / Intermediate / Expert)
  ├── bio: string
  ├── availability: string
  ├── photoURL: string
  └── createdAt: timestamp

chats/{chatId}
  ├── participants: string[]
  ├── messages: Message[]
  └── updatedAt: timestamp

meetups/{meetupId}
  ├── organizer: string
  ├── participants: string[]
  ├── title: string
  ├── date: string
  ├── time: string
  └── createdAt: timestamp

feedback/{feedbackId}
  ├── fromUser: string
  ├── toUser: string
  ├── rating: number
  └── createdAt: timestamp
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **Firebase project** (see [Firebase Setup](#firebase-setup))
- **Python** ≥ 3.9 (for AI service — optional locally)

### Local Development

**1. Clone the repository**
```bash
git clone https://github.com/MohammadSakibAhmad0874/Zero-Gravity.git
cd Zero-Gravity
```

**2. Install dependencies**
```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

**3. Configure environment variables**

Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Firebase Admin SDK — from Service Account JSON
FIREBASE_PROJECT_ID=devmatch-app
FIREBASE_CLIENT_EMAIL=your-sa@devmatch-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Frontend — the Firebase config is already embedded with fallback defaults. For a custom project, set `VITE_FIREBASE_*` vars (see `.env.production.example`).

**4. Start development servers**
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev

# Terminal 3 — AI Service (optional)
cd ai-service && python app.py
```

**5. Open in browser**
```
Frontend:   http://localhost:5173
Backend:    http://localhost:5000/api/health
AI Service: http://localhost:5001
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | `development` or `production` |
| `FRONTEND_URL` | Allowed CORS origin |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Service account private key (newlines as `\n`) |

### Frontend (`vercel.json` / dashboard)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend URL (e.g. `https://devmatch-backend.fly.dev`) |
| `VITE_FIREBASE_API_KEY` | Firebase web app API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

---

## 📡 API Reference

All protected endpoints require:
```
Authorization: Bearer <Firebase ID Token>
```

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/sync` | ✅ | Create or sync user in Firestore after Firebase login |
| `GET` | `/api/health` | ❌ | Health check |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/users/me` | ✅ | Get current user profile |
| `PUT` | `/api/users/me` | ✅ | Update current user profile |
| `GET` | `/api/users/:id` | ✅ | Get user by ID |

### Matching

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/matches` | ✅ | Get AI-powered teammate matches |

### Chat

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/chat/send` | ✅ | Send a message |
| `GET` | `/api/chat/:userId` | ✅ | Get chat history with a user |

### Meetups

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/meetups` | ✅ | Create a meetup |
| `GET` | `/api/meetups` | ✅ | Get current user's meetups |

### Feedback

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/feedback` | ✅ | Submit match feedback (1–5 stars) |

---

## 🧠 AI Matching Algorithm

DevMatch uses a **hybrid AI approach** combining two complementary techniques:

### 1. Fuzzy Logic Engine (60% weight)

Uses **membership functions** to handle inherent uncertainty in developer compatibility:

- **Skill Overlap** (50% weight) — Triangular membership for complementary skill scoring
- **Tech Stack Similarity** (30% weight) — Trapezoidal membership for shared technology evaluation
- **Role Compatibility** (20% weight) — Pair bonus scoring (e.g. Frontend + Backend = 100%)

### 2. Neural Network (40% weight)

A lightweight **feedforward neural network** refined by user feedback:

```
Architecture: Input(4) → Hidden(8, ReLU) → Output(1, Sigmoid)
Training:     Online backpropagation from match ratings
Init:         Xavier/He initialization
```

### Score Formula

```
Final Score = (Fuzzy Score × 0.60) + (Neural Score × 0.40)
Range: 5 – 99 (normalized for display)
```

---

## 📁 Project Structure

```
Zero-Gravity/
├── frontend/                        # React SPA — deployed on Vercel
│   ├── src/
│   │   ├── config/
│   │   │   ├── firebase.js          # Firebase SDK initialization
│   │   │   └── api.js               # authFetch helper (auto-attaches token)
│   │   ├── hooks/
│   │   │   ├── useFirebaseAuth.js   # Auth hook (signIn / signUp / Google / signOut)
│   │   │   └── useScrollReveal.js   # Scroll animation hook
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── FeedbackModal.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx        # Firebase email + Google login
│   │   │   ├── RegisterPage.jsx     # Firebase createUser + /api/auth/sync
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DiscoverPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   └── MeetupPage.jsx
│   │   ├── App.jsx                  # onAuthStateChanged router guard
│   │   ├── main.jsx
│   │   └── index.css                # Luxury Editorial design system
│   ├── vercel.json                  # SPA rewrites + cache headers
│   ├── vite.config.js
│   └── package.json
│
├── backend/                         # Node.js/Express API — deployed on Fly.io (Docker)
│   ├── server.js                    # All routes + Firebase Admin middleware
│   ├── migrate.js                   # One-time JSON → Firestore migration script
│   ├── Dockerfile                   # Multi-stage Docker build (no file volumes)
│   ├── fly.toml                     # Fly.io app configuration
│   ├── .env                         # Local dev environment (not committed)
│   ├── .env.example                 # Template for env vars
│   └── package.json
│
├── ai-service/                      # Python AI microservice
│   ├── app.py                       # Flask + Fuzzy Logic + Neural Network
│   └── requirements.txt
│
├── docker-compose.yml               # Local full-stack dev environment
├── .gitignore
├── package.json                     # Root monorepo scripts
└── README.md
```

---

## 🚢 Deployment

### Firebase Setup (one-time)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create project → enable **Authentication** (Email/Password + Google)
3. Enable **Firestore** (Production Mode, `nam5` region)
4. **Project Settings → Service Accounts → Generate New Private Key** (for backend)
5. **Project Settings → General → Your Apps → Web App** (for frontend config)

### Backend → Fly.io

```bash
# Install flyctl: https://fly.io/docs/hands-on/install-flyctl/
cd backend

# First deploy
fly launch --name devmatch-backend --region sin

# Set secrets (from your service account JSON)
fly secrets set \
  FIREBASE_PROJECT_ID=devmatch-app \
  FIREBASE_CLIENT_EMAIL=your-sa@devmatch-app.iam.gserviceaccount.com \
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n" \
  FRONTEND_URL=https://your-app.vercel.app

# Deploy
fly deploy
```

### Frontend → Vercel

```bash
cd frontend

# Deploy (env vars set via Vercel dashboard or CLI -e flags)
vercel deploy --prod \
  -e VITE_FIREBASE_API_KEY=AIzaSy... \
  -e VITE_FIREBASE_AUTH_DOMAIN=devmatch-app.firebaseapp.com \
  -e VITE_FIREBASE_PROJECT_ID=devmatch-app \
  -e VITE_FIREBASE_STORAGE_BUCKET=devmatch-app.firebasestorage.app \
  -e VITE_FIREBASE_MESSAGING_SENDER_ID=729365532868 \
  -e VITE_FIREBASE_APP_ID=1:729365532868:web:... \
  -e VITE_API_URL=https://devmatch-backend.fly.dev
```

### One-Time Data Migration (optional)

If migrating from the old JSON-file system:
```bash
cd backend
# Set Firebase credentials in .env first
node migrate.js
```

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 👨‍💻 Team

| Name | Role |
|------|------|
| **Zero-Gravity** |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for hackathon enthusiasts everywhere<br/>
  <strong>Zero-Gravity DevMatch</strong> — Because great teams build great products.
</p>
