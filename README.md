<div align="center">

<br/>

```
██╗   ██╗ █████╗      ██████╗      ██████╗  █████╗ ███████╗██╗  ██╗
██║   ██║██╔══██╗     ╚════██╗     ██╔══██╗██╔══██╗██╔════╝██║  ██║
██║   ██║╚█████╔╝      █████╔╝     ██║  ██║███████║███████╗███████║
╚██╗ ██╔╝██╔══██╗      ╚═══██╗     ██║  ██║██╔══██║╚════██║██╔══██║
 ╚████╔╝ ╚█████╔╝     ██████╔╝     ██████╔╝██║  ██║███████║██║  ██║
  ╚═══╝   ╚════╝      ╚═════╝      ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
```

# **V8 Dashboard**
### *Enterprise-Grade Mental Health Admin Platform*

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)
[![SQL Server](https://img.shields.io/badge/SQL_Server-Remote-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)](https://www.microsoft.com/sql-server)

<br/>

> **A production-ready, full-stack admin dashboard** engineered for mental health platforms.  
> Real-time AI chat, doctor & patient management, session tracking, social feeds, podcast CMS, and deep analytics — all in one.

<br/>

---

</div>

## 📸 Overview

V8 Dashboard is an admin control center built specifically for mental health service providers. It bridges a **Next.js 14 frontend** with a **NestJS 10 backend**, connected to a remote **SQL Server** database via Prisma ORM. The system supports everything from patient management and doctor scheduling to AI-powered emotional analysis and podcast content delivery.

---

## ⚡ Feature Matrix

| Module | Description |
|--------|-------------|
| 🔐 **Authentication** | JWT (Access + Refresh tokens), Role-Based Access Control |
| 📊 **Analytics Dashboard** | Real-time KPIs, charts, usage trends, user behavior |
| 👥 **User Management** | Full CRUD, role assignment, status control, avatar |
| 🩺 **Doctor Management** | Profiles, specializations, experience, ratings, national IDs |
| 🗓️ **Session Tracking** | Doctor–patient sessions, scheduling, session types |
| 📁 **Patient Records** | Diagnoses, treatment plans, clinical notes |
| 🤖 **AI Assistant** | Emotion-aware chat bot with multipart media support |
| 💬 **Real-Time Chat** | WebSocket-based messaging with session history |
| 📱 **Social Feed** | Posts, comments, likes — full community module |
| 🎙️ **Podcast CMS** | Upload, publish and manage audio episodes |
| 📚 **Resource Library** | Videos, PDFs, articles with categorization |
| 🎫 **Support Tickets** | Help desk and ticket lifecycle management |
| 🔔 **Notifications** | In-app notification system per user |
| ⚙️ **Settings & RBAC** | Role editor, audit logs, system preferences |
| 🧠 **Knowledge Base** | FAQs and structured knowledge management |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                         │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              Next.js 14 (App Router)                │   │
│   │   React 18 · TypeScript · Zustand · Framer Motion  │   │
│   └──────────────────────┬──────────────────────────────┘   │
└──────────────────────────┼──────────────────────────────────┘
                           │ REST API / WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   NestJS 10 Backend                         │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │   Auth   │ │  Users   │ │ Doctors  │ │   Sessions   │  │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────────┤  │
│  │  Social  │ │ Podcasts │ │   Chat   │ │  Resources   │  │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────────┤  │
│  │ Tickets  │ │ Records  │ │Dashboard │ │  Knowledge   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│                                                             │
│              Prisma ORM · Passport JWT · bcryptjs           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│           SQL Server (Remote · DatabaseASP.net)             │
│  AspNetUsers · Doctors · Patients · ChatSessions ·          │
│  BotMessages · Posts · Comments · PodcastEpisodes · ...     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.x | React framework (App Router) |
| **TypeScript** | 5.2 | Type safety |
| **Zustand** | 4.4 | Global state management |
| **Framer Motion** | 12.x | Animations & transitions |
| **Radix UI** | Latest | Headless accessible components |
| **TanStack Query** | 5.0 | Server state & caching |
| **Chart.js** | 4.4 | Analytics charts |
| **Axios** | 1.6 | HTTP client |
| **DnD Kit** | 6.x | Drag-and-drop interfaces |
| **Lucide React** | Latest | Icon library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **NestJS** | 10.x | Modular Node.js framework |
| **TypeScript** | 5.2 | Type safety |
| **Prisma** | 6.x | ORM & database migrations |
| **Passport JWT** | 4.0 | Authentication strategy |
| **bcryptjs** | 2.4 | Password hashing |
| **class-validator** | 0.14 | DTO validation |
| **Multer** | Latest | File upload handling |
| **Axios** | 1.6 | Proxy requests to .NET API |
| **Winston** | 3.11 | Logging |
| **Helmet** | 7.1 | HTTP security headers |

### Database & Infrastructure
| Technology | Details |
|------------|---------|
| **SQL Server** | Remote (DatabaseASP.net) |
| **Prisma ORM** | Schema-first, binary engine |
| **ASP.NET Media API** | External media endpoint for mobile integration |

---

## 📁 Project Structure

```
V8-Dashboard/
│
├── 📂 backend/                     # NestJS API server
│   ├── 📂 src/
│   │   ├── 📂 modules/             # Feature modules
│   │   │   ├── auth/               # JWT auth, signin/signup/refresh
│   │   │   ├── users/              # User CRUD & stats
│   │   │   ├── doctors/            # Doctor profiles & management
│   │   │   ├── sessions/           # Doctor-patient sessions
│   │   │   ├── records/            # Patient medical records
│   │   │   ├── chat/               # Chat sessions & bot messages
│   │   │   ├── social/             # Posts, comments, likes
│   │   │   ├── podcasts/           # Podcast CMS
│   │   │   ├── resources/          # Media resource library
│   │   │   ├── tickets/            # Support ticket system
│   │   │   ├── knowledge/          # FAQ & knowledge base
│   │   │   ├── dashboard/          # Analytics & KPIs
│   │   │   ├── admin-compat/       # ASP.NET compat layer
│   │   │   └── prisma/             # Prisma service
│   │   ├── 📂 common/              # Guards, decorators, filters
│   │   ├── 📂 config/              # App configuration
│   │   └── main.ts                 # Bootstrap entry point
│   ├── 📂 prisma/
│   │   └── schema.prisma           # SQL Server schema (30+ models)
│   ├── .env                        # Environment variables
│   └── package.json
│
├── 📂 frontend/                    # Next.js 14 App
│   ├── 📂 app/                     # App Router pages
│   │   ├── dashboard/              # Main analytics dashboard
│   │   ├── users/                  # User management
│   │   ├── therapists/             # Doctor management
│   │   ├── sessions/               # Session management
│   │   ├── clinical/               # Clinical records
│   │   ├── chat/                   # Real-time chat
│   │   ├── social/                 # Social feed
│   │   ├── podcasts/               # Podcast manager
│   │   ├── library/                # Resource library
│   │   ├── analytics/              # Deep analytics
│   │   ├── operations/             # Operations & tickets
│   │   ├── notifications/          # Notification center
│   │   ├── settings/               # System settings & RBAC
│   │   └── auth/                   # Login & Signup
│   ├── 📂 components/              # Reusable components
│   │   ├── ai/                     # AI assistant component
│   │   ├── chat/                   # Chat UI
│   │   ├── dashboard/              # Dashboard widgets
│   │   ├── layout/                 # App shell & sidebar
│   │   ├── navigation/             # Nav menus
│   │   ├── podcasts/               # Podcast player/uploader
│   │   ├── operations/             # Ticket & ops UI
│   │   └── ui/                     # Design system primitives
│   ├── 📂 services/                # API service layer
│   ├── 📂 store/                   # Zustand stores
│   ├── 📂 hooks/                   # Custom React hooks
│   ├── 📂 types/                   # Global TypeScript types
│   ├── 📂 lib/                     # Utilities & helpers
│   └── 📂 styles/                  # Global CSS
│
├── ARCHITECTURE.md                 # System architecture deep-dive
├── API_REFERENCE.md                # Full API endpoint reference
├── DEPLOYMENT.md                   # Production deployment guide
├── SETUP.md                        # Detailed setup instructions
└── README.md                       # You are here
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- Access to the remote SQL Server (credentials in `.env`)

### 1. Clone the Repository

```bash
git clone https://github.com/EbrahimAmer207/V8-Dashboard.git
cd V8-Dashboard
```

### 2. Start the Backend

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Start development server
npm run start:dev
# → API running at http://localhost:3001
```

### 3. Start the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# → App running at http://localhost:3000
```

### 4. Login

```
URL:      http://localhost:3000/auth/login
Email:    admin@example.com
Password: admin123
```

---

## 🔑 Environment Variables

### `backend/.env`

```env
# App
NODE_ENV=development
PORT=3001

# Database — SQL Server (Remote)
DATABASE_URL="sqlserver://host:1433;database=db;user=usr;password=pwd;encrypt=false;trustServerCertificate=true;"

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Media (External .NET API)
DOTNET_API_URL=http://your-dotnet-api.com
PUBLIC_MEDIA_URL=http://your-media-server.com
```

### `frontend/.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=V8 Dashboard
```

---

## 🔒 Authentication & Authorization

The system uses a dual-token JWT strategy:

```
1. POST /auth/signin  →  { accessToken, refreshToken }
2. Every API call     →  Authorization: Bearer <accessToken>
3. Token expiry       →  POST /auth/refresh  →  new accessToken
4. Logout             →  tokens cleared from client
```

### Role System

| Role | Access Level |
|------|-------------|
| `ADMIN` | Full system control — users, doctors, settings, logs |
| `DOCTOR` | Own profile, sessions, patient records |
| `PATIENT` | Own data, chat, resources |

All protected routes are guarded by `JwtAuthGuard` + `RolesGuard` on the backend, and `ProtectedRoute` middleware on the frontend.

---

## 📊 Database Schema (Key Models)

```
AspNetUsers ──────────┬── Doctors        (1:1  user → doctor profile)
                      ├── Patients       (1:1  user → patient profile)
                      ├── ChatSessions   (1:N  user → chat sessions)
                      ├── BotMessages    (1:N  via session)
                      ├── Posts          (1:N  social posts)
                      ├── Comments       (1:N  on posts)
                      ├── Likes          (1:N  on posts)
                      ├── SupportTickets (1:N  help tickets)
                      ├── FavoriteChats  (1:N  bookmarked chats)
                      └── Notifications  (by userId, unstructured)

Doctors ──────────────── DoctorSessions  (1:N  scheduled sessions)
Patients ─────────────── DoctorSessions  (1:N  as patient)
                      └── PatientRecords (1:N  medical records)

PodcastEpisodes           (standalone — CMS managed)
Resources                 (Videos, PDFs, Articles)
AssessmentResults         (Mental health assessments)
MoodEntries               (Daily mood tracking)
Faqs                      (Knowledge base)
```

---

## 🤖 AI Assistant

The built-in AI module (`/components/ai/ai-assistant.tsx`) integrates with an external Emotion API:

- Sends user messages as `multipart/form-data`
- Receives structured responses: **recommendations**, **closing messages**, **video suggestions**
- Emotion labels are stored per bot message (`BotMessages.Emotion`)
- Checklist-style UX for recommended actions

---

## 📡 Core API Endpoints

```
Auth
  POST   /api/v1/auth/signin           Login
  POST   /api/v1/auth/signup           Register
  POST   /api/v1/auth/refresh          Refresh token

Users
  GET    /api/v1/users                 List all users
  POST   /api/v1/users                 Create user
  PATCH  /api/v1/users/:id             Update user
  DELETE /api/v1/users/:id             Delete user

Doctors
  GET    /api/v1/doctors               List doctors
  POST   /api/v1/doctors               Add doctor
  PATCH  /api/v1/doctors/:id           Update doctor

Sessions
  GET    /api/v1/sessions              All sessions
  POST   /api/v1/sessions              Schedule session

Chat
  GET    /api/v1/chat/sessions         All chat sessions
  GET    /api/v1/chat/sessions/:id     Session messages
  POST   /api/v1/chat/predict          AI emotion prediction

Social
  GET    /api/v1/social/posts          Feed posts
  POST   /api/v1/social/posts          Create post
  POST   /api/v1/social/posts/:id/like Toggle like

Podcasts
  GET    /api/v1/podcasts              Episode list
  POST   /api/v1/podcasts              Upload episode

Dashboard
  GET    /api/v1/dashboard/stats       KPI summary
  GET    /api/v1/dashboard/analytics   Trend data
```

> See [`API_REFERENCE.md`](./API_REFERENCE.md) for the complete reference.

---

## 🎨 Frontend Design System

- **Dark-first** UI with consistent color tokens
- **Glassmorphism** cards and modals
- **Framer Motion** page transitions and micro-animations
- **Radix UI** primitives for accessible dialogs, dropdowns, and menus
- **Responsive** — mobile, tablet, and desktop layouts
- **DnD Kit** for drag-and-drop dashboard widgets

---

## 🔐 Security Features

- ✅ Password hashing with `bcryptjs` (salt rounds: 10)
- ✅ Short-lived JWT access tokens (15 min) + refresh tokens (7 days)
- ✅ CORS restricted to allowed origins
- ✅ HTTP security headers via `Helmet`
- ✅ Input validation via `class-validator` DTOs
- ✅ SQL injection prevention via Prisma parameterized queries
- ✅ XSS protection by React's DOM sanitization
- ✅ Role-based route guards on every protected endpoint

---

## 📦 Available Scripts

### Backend

```bash
npm run start:dev       # Development mode with hot-reload
npm run start:prod      # Production mode
npm run build           # Compile TypeScript
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run pending migrations
npm run test            # Run unit tests
```

### Frontend

```bash
npm run dev             # Development server (localhost:3000)
npm run build           # Production build
npm run start           # Start production server
npm run type-check      # TypeScript type checking
npm run lint            # ESLint
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — free to use for personal and commercial projects.

---

<div align="center">

**Built with ❤️ for mental health professionals**

*Full-Stack · Production-Ready · Enterprise-Grade*

</div>
