<div align="center">

# 🌐 CivicTrack — Smart City Issue Management Platform

[![React](https://img.shields.io/badge/React-19-blue.svg?style=flat-square&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-darkgreen.svg?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Google Auth](https://img.shields.io/badge/Google-Sign--In-red.svg?style=flat-square&logo=google)](https://developers.google.com/identity)
[![Leaflet](https://img.shields.io/badge/Leaflet-Mapping-orange.svg?style=flat-square&logo=leaflet)](https://leafletjs.com/)
[![Live Demo](https://img.shields.io/badge/Demo-Render-brightgreen.svg?style=flat-square&logo=render)](https://civictrack-xis4.onrender.com)

> A **premium, full-stack smart city platform** featuring a 3D particle background, real Google Sign-In, AI-powered CCTV surveillance simulation, video evidence uploads, and instant demo access for Admin & Worker dashboards.

**[🚀 Live Demo →](https://civictrack-xis4.onrender.com)**

</div>

---

## ✨ What's New (Latest Update)

| Feature | Description |
| :--- | :--- |
| **3D Particle Background** | Interactive WebGL-style constellation on auth pages — reacts to mouse movement |
| **Real Google Sign-In** | Official Google Identity Services OAuth, not a placeholder |
| **Demo Access Buttons** | One-click Admin & Worker access on Login/Register — no signup needed |
| **Live CCTV Feed** | 6 animated camera feeds with AI bounding box anomaly detection |
| **Video Uploads** | Citizens can attach video evidence to issue reports (up to 100MB) |
| **3-Step Report Wizard** | Category picker, priority levels, GPS map, drag-drop photo & video |
| **Premium Dark UI** | Full glassmorphism design system with animations, stat cards, role badges |

---

## 🌟 All Features

### 🔐 Authentication
- **Real Google Sign-In** via Google Identity Services SDK — one-click signup/login for citizens
- **Demo Admin & Worker** buttons on Login and Register — explore full dashboards instantly
- **Email + Password** registration with TOTP OTP email verification
- **Two-Factor Authentication** (TOTP / Google Authenticator) support
- **Forgot Password** — self-service reset link flow
- **JWT sessions** with role-based 7-day tokens (2h for demo sessions)

### 📍 Issue Reporting
- **3-step guided wizard**: Details → Location → Evidence
- **8 categories**: Pothole, Waterlogging, Garbage, Streetlight, Drainage, Encroachment, Noise, Other
- **4 priority levels**: Low / Medium / High / Critical
- **GPS auto-detect** or click-to-pin on interactive map
- **Photo upload** with drag-and-drop preview
- **Video upload** up to 100MB (MP4, MOV, WebM) with in-browser preview
- **Address / landmark** field for faster field response

### 📹 Live CCTV Feed (NEW)
- 6 simulated camera feeds rendered on HTML5 Canvas
- Moving AI detection bounding boxes with confidence scores (82–96%)
- Anomaly types: Pothole, Waterlogging, Debris, Stray Animals, Illegal Parking, Garbage, Street Light Out
- HUD overlay: timestamp, REC indicator, zone name, anomaly status
- Live alerts panel with auto-refreshing events every ~6 seconds
- "File Report →" shortcut from any alert directly to the reporting form

### 👥 Role-Based Dashboards
- **Citizen**: Report issues, track status, earn points & badges, view city map
- **Admin**: Manage all issues, assign workers, publish announcements, export CSV, view analytics
- **Worker**: View assignments, mark in-progress, submit completion photos/videos

### 🏆 Gamification
- Points system (tracked per user)
- Achievement badges: Civic Starter, Swift Resolver, Civic Hero
- Leaderboard rankings for citizens (by reports & votes) and workers (by resolutions)

### 🗺️ City Map & Analytics
- Interactive Leaflet map with status-based marker coloring
- City Health Index — live resolved/total ratio
- Charts: issue status breakdown, category distribution, resolution trends
- Notification bell with live issue update alerts

### 🤖 AI Chatbot
- Floating AI assistant powered by OpenRouter (Gemma 2 9B → Llama → Mistral fallback)
- Answers platform-specific questions and general city queries

---

## 🛠️ Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, React Router v7, Axios | Single Page Application |
| **Styling** | Vanilla CSS, CSS Variables, Glassmorphism | Premium design system |
| **3D Background** | HTML5 Canvas (no external deps) | Interactive particle constellation |
| **Mapping** | React-Leaflet, OpenStreetMap | Geolocation & issue plotting |
| **Charts** | Recharts | Dashboards & analytics |
| **Auth** | Google Identity Services SDK, JWT, TOTP | OAuth + 2FA + demo sessions |
| **Backend** | Node.js, Express | RESTful API |
| **Database** | MongoDB, Mongoose | Users, issues, roles |
| **AI** | OpenAI SDK, OpenRouter | Gemma 2 9B chatbot |
| **Media** | Multer (images + videos) | Disk storage for evidence uploads |

---

## 📡 API Reference

### 🔐 Auth (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/register` | Email registration with OTP verification |
| POST | `/login` | Email + password login, returns JWT |
| POST | `/google-login` | Real Google OAuth — verifies ID token, returns JWT |
| POST | `/demo-login` | Instant demo access `{ role: "admin" \| "worker" }` — 2h JWT |
| POST | `/verify-otp` | OTP verification after registration |
| POST | `/forgot-password` | Send self-service reset link |
| POST | `/login/2fa-verify` | Verify TOTP code for 2FA login |

### 📍 Issues (`/api/issues`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/` | Create issue — supports `image` + `video` multipart upload |
| GET | `/` | Fetch issues by role |
| PUT | `/:id` | Update status (Admin/Worker) |
| PUT | `/assign/:id` | Assign issue to worker (Admin) |
| GET | `/worker` | Issues assigned to calling worker |
| PUT | `/complete/:id` | Submit completion with media (Worker) |

### 🤖 AI (`/api/chat`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/chat` | Chat with AI assistant (OpenRouter) |

---

## 📁 Project Structure

```
civictrack/
├── client/                       # React Frontend
│   ├── public/
│   │   └── index.html            # Google Identity Services SDK loaded here
│   └── src/
│       ├── components/
│       │   ├── ThreeBackground.js  # 3D particle constellation (NEW)
│       │   ├── Navbar.js           # Glassmorphic navbar with notifications
│       │   ├── Sidebar.js          # Role-aware sidebar with demo badge
│       │   ├── Chatbot.js          # AI assistant
│       │   └── ProtectedRoute.js   # JWT + role gate
│       ├── pages/
│       │   ├── Login.js            # Two-panel: Google + demo access buttons
│       │   ├── Register.js         # Two-panel: demo preview + registration
│       │   ├── LiveFeed.js         # CCTV AI simulation (NEW)
│       │   ├── CreateIssue.js      # 3-step wizard with video upload
│       │   ├── Dashboard.js        # Citizen dashboard
│       │   ├── AdminDashboard.js   # Admin management
│       │   ├── WorkerDashboard.js  # Worker task view
│       │   ├── MapView.js          # City map
│       │   ├── Issues.js           # Issue list with filters
│       │   ├── Profile.js          # User profile + 2FA
│       │   └── Leaderboard.js      # Rankings
│       ├── index.css               # Full premium design system
│       └── App.js                  # Routing (+ /livefeed route)
└── server/
    ├── models/
    │   ├── User.js                 # Extended: googleId, avatar, isDemo, points
    │   └── Issue.js                # Extended: video, category, priority, votes
    ├── routes/
    │   ├── authRoutes.js           # + /google-login, /demo-login endpoints
    │   └── issueRoutes.js          # + video upload support (100MB)
    ├── middleware/auth.js
    ├── createUsers.js              # Seed script
    └── server.js
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- OpenRouter API Key (free at [openrouter.ai](https://openrouter.ai/))

### 1. Backend
```bash
cd server
# Create .env:
# PORT=5000
# MONGO_URI=mongodb://127.0.0.1:27017/civictrack
# JWT_SECRET=your_secret_here
# OPENROUTER_API_KEY=your_openrouter_key

npm install
node createUsers.js   # seed test accounts
npm run dev
```

### 2. Frontend
```bash
cd client
# Optional — for real Google Sign-In:
# Add to .env: REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

npm install --legacy-peer-deps
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Demo Access

### Instant (No Account Needed)
Click **"Try Admin Dashboard"** or **"Try Worker Dashboard"** on the Login or Register page for a 2-hour fully functional demo session.

### Seeded Test Accounts (password: `123456`)
| Role | Email |
| :--- | :--- |
| Admin | `admin@gmail.com` |
| Worker 1 | `worker1@gmail.com` |
| Worker 2 | `worker2@gmail.com` |
| Citizen | Register with email or Google |

### Google Sign-In Setup (optional)
1. [console.cloud.google.com](https://console.cloud.google.com) → **Credentials → OAuth 2.0 Client IDs**
2. Add `http://localhost:3000` to **Authorized JavaScript origins**
3. Copy Client ID → add to `client/.env` as `REACT_APP_GOOGLE_CLIENT_ID=...`
4. Restart `npm start`

> Without the env var, clicking "Sign in with Google" prompts you to paste the Client ID — it's stored in localStorage for the session.

---

<div align="center">

Built with ❤️ | [Live Demo](https://civictrack-xis4.onrender.com) | [GitHub](https://github.com/HiteshChugh-2006/civictrack)

</div>