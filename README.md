<div align="center">

# 🌉 JanSetu — Smart NGO Ecosystem Platform

**Connect. Collaborate. Create Impact.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://prisma.io)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.0%20Flash-4285F4?logo=google)](https://ai.google.dev)
[![CI](https://github.com/Hack2Skill-Team-MID/JanSetu/actions/workflows/ci.yml/badge.svg)](https://github.com/Hack2Skill-Team-MID/JanSetu/actions)

> Built for **Hack2Skill Hackathon 2026** · Team MID

</div>

---

## 📖 What is JanSetu?

JanSetu (*"Bridge of People"*) is an AI-powered NGO ecosystem management platform that connects **NGO Admins**, **Volunteers**, **Donors**, and **Community Members** into one unified, intelligent platform.

It addresses the core problem in India's social sector: **fragmented resource allocation**. NGOs work in silos, volunteers are under-utilized, donors lack transparency, and community needs go unmet.

JanSetu solves this with:
- 🤖 **Gemini AI** — smart task matching, chatbot assistance, and fraud detection
- 💳 **Razorpay** — real payment gateway for donation processing
- 🔔 **Real-time Notifications** — bell icon with 30s polling, mark-read, delete
- 📄 **PDF Donation Receipts** — printable receipts with transaction details & 80G note
- 🗺️ **Live Impact Map** — visualize needs and campaigns geographically
- 🔐 **Trust scoring & fraud detection** — accountable NGO operations
- 🚨 **Emergency mode** — rapid disaster response with auto-broadcasts
- 🏆 **Gamification** — leaderboard, badges, and volunteer points
- 🏛️ **NGO Discovery** — community members browse & apply to join NGOs
- 🔗 **Campaign Sharing** — copy donation links to clipboard

---

## 🎭 4 Role-Based Portals

| Role | Login URL | Key Features |
|------|-----------|--------------|
| 🏢 **NGO Admin** | `/login?role=ngo_coordinator` | Campaigns, Volunteers, Resources, Analytics, Fraud Detection, Emergency Mode |
| 🤝 **Volunteer** | `/login?role=volunteer` | My Tasks, **AI Task Matcher**, Leaderboard, Badges, Messages |
| 🌍 **Community Member** | `/login?role=community` | **Discover NGOs**, Report Needs, Browse Tasks, Live Map |
| ❤️ **Donor** | `/login?role=donor` | Donate, **My Donations + PDF Receipts**, Campaign Browser, Impact |

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

## ✨ Feature Highlights

### 🔔 Notification System
- Bell icon in dashboard header with unread count badge
- Auto-polls every 30 seconds for new notifications
- Mark individual or all as read
- Delete notifications
- Triggered by: donation completion, join requests, task assignments

### 🤖 AI Task Matcher (Volunteers)
- Select your skills from 15 predefined options
- Enter location and availability preference
- AI scores open tasks by skill match + location proximity
- One-click apply from the results

### 🏛️ NGO Discovery + Apply (Community)
- Browse all verified NGOs with trust tier badges
- View focus areas, volunteer counts, campaign stats
- Send a join request — auto-notifies NGO admins via message + notification
- Search by NGO name, location, or focus area

### 📄 PDF Donation Receipts (Donors)
- Hover any donation in "My Donations" → "Receipt" button
- Opens a beautifully formatted printable HTML receipt
- Includes: campaign, org, date, transaction ID, 80G tax note
- Works in both live Razorpay mode and demo mode

### 🔗 Campaign Sharing
- Every campaign card has a "Share" button
- Copies the direct donation link to clipboard
- Shows "Copied!" confirmation for 2 seconds

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
- **Razorpay SDK** (live + demo mode auto-detection)
- **@google/generative-ai** (Gemini 2.0 Flash)

### Infrastructure
- **Turborepo** monorepo
- **GitHub Actions** CI pipeline (4 jobs — web, server, shared, ai-service)
- Offline-first with **IndexedDB** request queuing
- Multi-language: **English, Hindi, Tamil**

---

## 🗂️ Project Structure

```
jansetu/
├── apps/
│   ├── web/                    # Next.js 16 frontend
│   │   └── src/app/dashboard/  # 15+ dashboard pages
│   └── ai-service/             # Python FastAPI AI service (optional)
├── server/                     # Express.js backend API
│   ├── src/
│   │   ├── routes/             # 18 API route modules
│   │   ├── middleware/         # Auth, error handling
│   │   ├── services/           # AI bridge, Razorpay
│   │   └── scripts/            # Database seed
│   └── prisma/                 # Prisma schema (17 models)
└── packages/
    └── shared/                 # Shared TypeScript types
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
# Database (required)
DATABASE_URL=postgresql://postgres:password@localhost:5432/jansetu

# Auth (required)
JWT_SECRET=your-super-secret-jwt-key-here

# Razorpay (optional — auto-runs in demo mode without keys)
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx

# Gemini AI (optional — uses rich offline fallback without key)
GEMINI_API_KEY=your-gemini-api-key   # Get free at aistudio.google.com
```

### 3. Setup Database
```bash
# Create the database
createdb jansetu

# Run migrations
cd server && npx prisma migrate deploy

# Seed with demo data (8 users, 2 orgs, 4 campaigns, etc.)
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

**18 REST API modules, 30+ endpoints:**

| Module | Base Path | Description |
|--------|-----------|-------------|
| Auth | `/api/auth` | Login, register, me |
| Campaigns | `/api/campaigns` | CRUD + donate + create |
| Donations | `/api/donations` | Initiate, verify (Razorpay), my donations |
| Tasks | `/api/tasks` | CRUD + apply |
| Volunteers | `/api/volunteers` | Profiles + **AI matching** |
| Needs | `/api/needs` | Community needs CRUD |
| Resources | `/api/resources` | Inventory + alerts |
| Emergency | `/api/emergency` | Declare + resolve |
| Gamification | `/api/gamification` | Points, badges, leaderboard |
| AI Bridge | `/api/ai-bridge` | Gemini chatbot + insights |
| Admin | `/api/admin` | Fraud cases, audit logs |
| Dashboard | `/api/dashboard` | Aggregated stats |
| Network | `/api/network` | NGO discovery + **join-request** |
| Messages | `/api/messages` | Inter-user messaging |
| Analytics | `/api/analytics` | Impact metrics |
| Surveys | `/api/surveys` | Upload + AI processing |
| **Notifications** | `/api/notifications` | **Bell system, mark-read, delete** |
| Audit | `/api/audit` | Audit trail logs |

---

## 💳 Payment Integration

Razorpay with **automatic mode detection**:

```
RAZORPAY_KEY_ID set → Live Mode (real UPI/card payment modal)
No key configured  → Demo Mode (instant auto-verification, no card needed)
```

Both modes complete the full flow: order → payment → verification → audit log → notification.

---

## 🤖 AI Features

| Feature | Status | Description |
|---------|--------|-------------|
| **AI Chatbot** | ✅ Live | Gemini 2.0 Flash — role-aware, 15+ topic offline fallback |
| **Task Matching** | ✅ Live | Skill + location scoring for volunteer-task fit |
| **Fraud Detection** | ✅ Live | Suspicious pattern flagging with AI risk scores |
| **Impact Reports** | ✅ Live | Auto-generated Gemini campaign narratives |

> **No Gemini key?** The chatbot covers 15+ topics (campaigns, donations, emergency, volunteers, fraud, analytics, etc.) with detailed offline responses — perfect for demo mode.

---

## 🗃️ Database Schema

**17 Prisma models:**

```
User → Organization → Campaign → Donation
                   ↓              ↓
              VolunteerProfile   AuditLog
              Task → TaskApplication
              Resource → ResourceAllocation
              CommunityNeed → SurveyUpload
              EmergencyEvent
              FraudCase → FraudCaseNote
              Message
              Notification  ← NEW
```

---

## 🔒 Security Features

- JWT authentication with 7-day expiration
- bcrypt password hashing (10 rounds)
- HMAC-SHA256 Razorpay signature verification
- Complete **audit trail** — every action logged
- AI-powered **fraud detection** with case management
- Role-based access control (RBAC) — 6 roles
- **Auto-logout on 401** — stale token protection

---

## 🌍 Internationalization

Full support for **3 languages** with instant switching in header:

- 🇬🇧 English
- 🇮🇳 Hindi (हिंदी)  
- 🇮🇳 Tamil (தமிழ்)

---

## 🚨 Emergency Mode

One-click emergency declaration from Dashboard → Emergency:
- 🔴 Red alert banner on **all** user dashboards
- 📣 Auto-broadcast to all organization volunteers
- 📋 Auto-creates critical-priority community need
- 🔒 Resource priority-lock to prevent misuse
- 📍 Pinned on live Impact Map

---

## 🏆 Gamification System

| Badge | How to Earn |
|-------|-------------|
| 🎯 First Task | Complete your first task |
| ⭐ Five Tasks | Complete 5 tasks |
| 🏆 Ten Tasks | Complete 10 tasks |
| 🚨 Crisis Responder | Respond to emergency tasks |
| 🤝 Team Player | Collaborate with 5+ volunteers |
| 📚 Mentor | Help onboard new volunteers |
| 💎 Top Donor | Consistent donation history |
| 🌟 Weekly Star | Most active volunteer of the week |

---

## 📱 Progressive Web App

- Installable on Android/iOS
- **Offline-first**: Failed requests queued in IndexedDB and auto-replayed
- Service worker caching for static assets

---

## 👥 Team MID

Built with ❤️ for **Hack2Skill Hackathon 2026**

> *"Technology in service of humanity — because every rupee, every hour, every hand matters."*

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
