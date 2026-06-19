<div align="center">

# 🚀 CivicTrack — Smart Civic Issue Reporting & Management System

[![React](https://img.shields.io/badge/React-19-blue.svg?style=flat-square&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-darkgreen.svg?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![OpenRouter AI](https://img.shields.io/badge/AI-Gemma--2--9B-purple.svg?style=flat-square&logo=google)](https://openrouter.ai/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Mapping-orange.svg?style=flat-square&logo=leaflet)](https://leafletjs.com/)

> A premium fullstack web application designed for civic issue reporting, automated mapping, role-based workflows (User, Admin, Worker), and AI-assisted civic support.

</div>

---

## 🌟 Key Features

*   **📍 Interactive Leaflet Maps**: Real-time geolocation targeting and issue plotting with status-based marker coloring.
*   **👥 Role-Based Workspaces**:
    *   **User Dashboard**: Report local issues with geo-locations, descriptions, and photographic evidence.
    *   **Admin Dashboard**: Manage, search, filter, and assign reported issues to workers.
    *   **Worker Dashboard**: View assigned tasks, update work status, upload resolution images, and document remarks.
*   **🤖 AI Civic Assistant**: Intelligent assistant powered by `google/gemma-2-9b-it:free` through OpenRouter to guide users on reporting steps and city rules.
*   **🔒 Secure Operations**: JWT-based login credentials, bcrypt password hashing, and endpoint-level assignment validations.
*   **✨ Premium Visual Experience**: Dark radial gradients, modern Outfit typeface, glassmorphic layout elements, and micro-interactive transitions.

---

## 🛠️ Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, React Router v7, Axios | Single Page Application framework & router |
| **Styling** | Vanilla CSS, Glassmorphic tokens | Premium UI design & animations |
| **Mapping** | React-Leaflet, OpenStreetMap | Geolocation picker and marker map |
| **Charts** | Recharts | Visual status dashboards and statistics |
| **Backend** | Node.js, Express | RESTful API server |
| **Database** | MongoDB, Mongoose | Persistent storage for users, roles, and issues |
| **AI Integration**| OpenAI SDK, OpenRouter AI | Gemma 2 9B model chatbot assistant |
| **Media** | Multer | Disk storage for issue reporting and resolution photos |

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
*   `POST /register` — Register a new account (validates email uniqueness).
*   `POST /login` — Authenticate and retrieve JWT token.

### 📍 Issue Management (`/api/issues`)
*   `POST /` — Create a new issue (supports file upload and location JSON).
*   `GET /` — Fetch issues matching the caller's role privileges.
*   `PUT /:id` — Update issue status (Admin & Workers).
*   `PUT /assign/:id` — Assign issue to a designated worker (Admin only).
*   `GET /worker` — Retrieve issues assigned to the calling worker.
*   `PUT /complete/:id` — Upload resolution image & remarks (Assigned Worker only).

### 🤖 AI Service (`/api/ai` & `/api/chat`)
*   `POST /chat` — Stream interactions to/from the Gemma 2 AI model.

---

## 📁 Project Structure

```
civictrack/
├── client/                 # Frontend React Application
│   ├── public/             # Static templates and icons
│   └── src/
│       ├── components/     # Chatbot, Navbar, Sidebar, ProtectedRoute
│       ├── layout/         # Main layout wrapper
│       ├── pages/          # Login, Register, Dashboards, Map, Issues
│       ├── api.js          # Shared Axios configuration
│       ├── index.css       # Typography, global animations, and glass styles
│       └── App.js          # Client routing configuration
└── server/                 # Backend Node/Express Server
    ├── middleware/         # JWT Authenticator
    ├── models/             # User and Issue mongoose schemas
    ├── routes/             # Express route files
    ├── uploads/            # Disk storage for image uploads (auto-created)
    ├── createUsers.js      # Seed file for default accounts
    └── server.js           # Express main server script
```

---

## 🚀 Getting Started

### 📋 Prerequisites
*   Node.js (v18+)
*   MongoDB Instance (Local database or MongoDB Atlas cloud URI)
*   OpenRouter API Key (Create one for free at [openrouter.ai](https://openrouter.ai/))

### 1. Server Configuration
Navigate to the server directory:
```bash
cd server
```

Create a `.env` configuration file:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/civictrack
JWT_SECRET=your_jwt_signing_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Install dependencies:
```bash
npm install
```

Seed the default testing database accounts:
```bash
node createUsers.js
```

Start the backend:
```bash
npm run dev   # Node.js development server
```

### 2. Client Configuration
Open a new terminal session and navigate to the client folder:
```bash
cd client
```

Install dependencies with legacy peer resolutions (React 19 support):
```bash
npm install --legacy-peer-deps
```

Start the frontend development server:
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔑 Seed Testing Credentials

The `createUsers.js` script initializes the database with the following preconfigured testing accounts (password is `123456` for all):

| Role | Email Address | Purpose |
| :--- | :--- | :--- |
| **Administrator** | `admin@gmail.com` | Full assignment and status overview dashboard |
| **Worker 1** | `worker1@gmail.com` | Assigned tasks list & completion forms |
| **Worker 2** | `worker2@gmail.com` | Assigned tasks list & completion forms |
| **Regular User** | *Register in app* | Submit issue forms and view own reports |