<div align="center">

# 🌉 JanSetu — Smart NGO Ecosystem Platform

**Connect. Collaborate. Create Impact.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://prisma.io)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.0%20Flash-4285F4?logo=google)](https://ai.google.dev)

> Built for **Hack2Skill Hackathon 2026** · Team MID

</div>

---

## 📖 What is JanSetu?

JanSetu (*"Bridge of People"*) is an AI-powered NGO ecosystem management platform that connects **NGO Admins**, **Volunteers**, **Donors**, and **Community Members** into one unified, intelligent platform.

It addresses the core problem in India's social sector: **fragmented resource allocation**. NGOs work in silos, volunteers are under-utilized, donors lack transparency, and community needs go unmet.

JanSetu solves this with:
- 🤖 **Gemini AI** for smart matching, chatbot assistance, and fraud detection
- 💳 **Razorpay** payment gateway for real donation processing
- 🗺️ **Live impact map** to visualize needs and campaigns geographically
- 🔐 **Trust scoring & fraud detection** for accountable NGO operations
- 🚨 **Emergency mode** for rapid disaster response
- 🏆 **Gamification** to keep volunteers engaged

---

## 🎭 4 Role-Based Portals

| Role | Access | Key Features |
|------|--------|--------------|
| 🏢 **NGO Admin** | `/login?role=ngo_coordinator` | Campaigns, Volunteers, Resources, Analytics, Fraud Detection, Emergency Mode |
| 🤝 **Volunteer** | `/login?role=volunteer` | My Tasks, AI Matching, Leaderboard, Badges, Messages |
| 🌍 **Community Member** | `/login?role=community` | Discover NGOs, Report Needs, Browse Tasks, Live Map |
| ❤️ **Donor** | `/login?role=donor` | Donate, My Impact, Campaign Browser, Donation History |

---

## 🔑 Demo Credentials

> All passwords: **`password123`**

| Role | Email |
|------|-------|
| Platform Admin | `admin@jansetu.org` |
| NGO Admin | `priya@helpindia.org` |
| NGO Admin 2 | `kavitha@sahayatrust.org` |
| Volunteer | `rohit@gmail.com` |
| Community Member | `sneha@gmail.com` |
| Donor | `vikram@gmail.com` |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router, Turbopack)
- **TypeScript** with Zustand state management
- **Vanilla CSS** + glassmorphism design system
- **Leaflet** for interactive maps
- **Lucide React** icons

### Backend
- **Express.js v5** with TypeScript
- **Prisma ORM v7** with `PrismaPg` adapter
- **PostgreSQL 16** (connection pooling via `pg`)
- **JWT** authentication with `bcryptjs`
- **Razorpay SDK** (dual mode: live + demo)
- **@google/generative-ai** (Gemini 2.0 Flash)

### Infrastructure
- **Turborepo** monorepo
- **GitHub Actions** CI pipeline
- Offline-first with **IndexedDB** request queuing
- Multi-language: **English, Hindi, Tamil**

---

## 🗂️ Project Structure

```
jansetu/
├── apps/
│   ├── web/              # Next.js 16 frontend
│   └── ai-service/       # Python FastAPI AI service (optional)
├── server/               # Express.js backend API
│   ├── src/
│   │   ├── routes/       # 17 API route modules
│   │   ├── middleware/   # Auth, error handling
│   │   ├── services/     # AI bridge, Razorpay
│   │   └── scripts/      # Database seed
│   └── prisma/           # Prisma schema (16 models)
└── packages/
    └── shared/           # Shared TypeScript types
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16
- npm 9+

### 1. Clone & Install
```bash
git clone https://github.com/Hack2Skill-Team-MID/JanSetu.git
cd JanSetu
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/jansetu

# Auth
JWT_SECRET=your-super-secret-jwt-key-here

# Razorpay (optional — runs in demo mode without keys)
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx

# Gemini AI (optional — falls back to smart static responses)
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Setup Database
```bash
# Create database
createdb jansetu

# Run migrations
cd server && npx prisma migrate deploy

# Seed with demo data
npm run seed
```

### 4. Start Development Servers

**Terminal 1 — Backend:**
```bash
cd server && npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd apps/web && npm run dev
# Runs on http://localhost:3000
```

---

## 🌐 API Reference

The platform exposes **30+ REST endpoints** across 17 route modules:

| Module | Base Path | Description |
|--------|-----------|-------------|
| Auth | `/api/auth` | Login, register, me |
| Campaigns | `/api/campaigns` | CRUD + donate |
| Donations | `/api/donations` | Initiate, verify (Razorpay) |
| Tasks | `/api/tasks` | CRUD + apply |
| Volunteers | `/api/volunteers` | Profiles + AI matching |
| Needs | `/api/needs` | Community needs CRUD |
| Resources | `/api/resources` | Inventory + alerts |
| Emergency | `/api/emergency` | Declare + resolve |
| Gamification | `/api/gamification` | Points, badges, leaderboard |
| AI Bridge | `/api/ai-bridge` | Gemini chatbot + insights |
| Admin | `/api/admin` | Fraud cases, audit logs |
| Dashboard | `/api/dashboard` | Aggregated stats |
| Network | `/api/network` | NGO discovery |
| Messages | `/api/messages` | Inter-user messaging |
| Analytics | `/api/analytics` | Impact metrics |
| Surveys | `/api/surveys` | Upload + AI processing |

Full documentation available at **`/dashboard/api-docs`** after login.

---

## 💳 Payment Integration

JanSetu uses **Razorpay** with automatic mode detection:

```
RAZORPAY_KEY_ID set → Live Mode (real payment modal)
No key configured  → Demo Mode (instant auto-verification)
```

Both modes complete the full donation flow including:
- Order creation
- Payment verification (HMAC-SHA256 in live mode)
- Database update
- Audit log entry

---

## 🤖 AI Features

| Feature | Powered By | Description |
|---------|-----------|-------------|
| **AI Chatbot** | Gemini 2.0 Flash | Role-aware assistant for NGO operations |
| **Volunteer Matching** | Gemini scoring | Skill + location + availability matching |
| **Fraud Detection** | Risk scoring | Flagging suspicious donation patterns |
| **Impact Reports** | Gemini | Auto-generated campaign narratives |
| **Need Prioritization** | ML scoring | Urgency × affected population ranking |

---

## 🚨 Emergency Mode

NGO Admins can declare emergencies with one click:
- 🔔 Broadcasts to all organization members
- 🔴 Red banner appears across all user dashboards
- 📋 Auto-creates critical community needs
- 🔒 Priority-locks relevant resources

---

## 🏆 Gamification System

Volunteers earn **points**, **badges**, and **reputation scores**:

- `first_task` — Complete your first task
- `five_tasks` — Complete 5 tasks
- `crisis_responder` — Respond to emergency tasks
- `top_donor` — Donate consistently
- `team_player` — Collaborate with 5+ volunteers
- `mentor` — Help onboard new volunteers

---

## 🔒 Security Features

- JWT authentication with 7-day expiration
- bcrypt password hashing (10 rounds)
- HMAC-SHA256 Razorpay signature verification
- Complete **audit trail** — every action logged
- AI-powered **fraud detection** with case management
- Role-based access control (RBAC)
- Auto-logout on 401 (stale token protection)

---

## 🌍 Internationalization

Full support for **3 languages** with instant switching:

- 🇬🇧 English
- 🇮🇳 Hindi (हिंदी)
- 🇮🇳 Tamil (தமிழ்)

---

## 📱 Progressive Web App

- Installable on Android/iOS
- **Offline-first**: Failed requests queued in IndexedDB
- Auto-replayed when connectivity returns
- Service worker caching for static assets

---

## 🗃️ Database Schema

16 Prisma models covering:

```
User → Organization → Campaign → Donation
                   ↓              ↓
              VolunteerProfile   AuditLog
              Task → TaskApplication
              Resource → ResourceAllocation
              CommunityNeed → SurveyUpload
              EmergencyEvent
              FraudCase → FraudCaseNote
              Message | Gamification
```

---

## 👥 Team MID

Built with ❤️ for **Hack2Skill Hackathon 2026**

> *"Technology in service of humanity"*

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
