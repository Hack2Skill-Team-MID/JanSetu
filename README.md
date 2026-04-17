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
- **Node.js 20+** — [download](https://nodejs.org)
- **PostgreSQL 16** — [download](https://www.postgresql.org/download/)
- **npm 9+** (comes with Node.js)

### 1. Clone & Install
```bash
git clone https://github.com/Hack2Skill-Team-MID/JanSetu.git
cd JanSetu
npm install                          # installs root + all workspace deps
cd server && npm install && cd ..    # ensure server deps are installed
cd apps/web && npm install && cd ../..
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your values (**minimum required** to run locally):
```env
# Database (required) — create DB first: createdb jansetu
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/jansetu

# Auth (required — can be any random string for local dev)
JWT_SECRET=jansetu-local-dev-secret-2026

# Frontend API URL (keep as-is for local dev)
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Razorpay (OPTIONAL — skipping enables auto Demo Mode)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

# Gemini AI (OPTIONAL — skipping uses rich offline fallback responses)
GEMINI_API_KEY=    # Free key at: https://aistudio.google.com
```

### 3. Setup Database & Seed Demo Data
```bash
# Step 1 — Create the PostgreSQL database
createdb jansetu

# Step 2 — Run Prisma migrations (creates all 17 tables)
cd server
npx prisma migrate deploy

# Step 3 — Seed with full demo dataset
npm run seed
```

**Expected seed output:**
```
🌱 Connecting to PostgreSQL...
✅ Connected
🗑️  Clearing existing data...
👤 Creating users...
🏢 Creating organizations...
🎯 Creating campaigns...
📋 Creating community needs...
💰 Creating donations...
🚨 Creating active emergency...
🔍 Creating fraud cases...
📋 Creating audit logs...

✅ SEED COMPLETE!
📊 Seeded: 8 users, 2 orgs, 4 campaigns, 5 needs, 5 donations, 1 emergency, 2 fraud cases, 8 audit logs
```

### 4. Start Development Servers

Open **two terminals**:

**Terminal 1 — Backend API (port 5000):**
```bash
cd server && npm run dev
```

**Terminal 2 — Frontend (port 3000):**
```bash
cd apps/web && npm run dev
```

Then open **http://localhost:3000** and log in with any demo credential below.

---

## 🧪 Demo Data — What Gets Seeded

Run `cd server && npm run seed` to populate the database with realistic demo data:

### 👥 Demo Accounts (all passwords: `password123`)

| Role | Email | Description |
|------|-------|-------------|
| 🔐 **Platform Admin** | `admin@jansetu.org` | Full access — fraud detection, audit logs, emergency |
| 🏢 **NGO Admin 1** | `priya@helpindia.org` | HelpIndia Foundation — Maharashtra campaigns |
| 🏢 **NGO Admin 2** | `kavitha@sahayatrust.org` | Sahaya Trust — Tamil Nadu campaigns |
| 🤝 **Volunteer 1** | `rohit@gmail.com` | Skills: teaching, first-aid, driving · Points: 450 |
| 🤝 **Volunteer 2** | `sneha@gmail.com` | Skills: healthcare, counseling · Points: 780 |
| 🤝 **Volunteer 3** | `arjun@gmail.com` | Skills: technology, web-dev · Points: 320 |
| ❤️ **Donor 1** | `vikram@gmail.com` | Has 3 completed donations |
| ❤️ **Donor 2** | `meera@gmail.com` | Has 2 completed donations |

### 🏢 Organizations

| Name | Region | Trust Score | Focus |
|------|--------|-------------|-------|
| HelpIndia Foundation | Maharashtra | 87 (Gold) | Water, Education |
| Sahaya Trust | Tamil Nadu | 92 (Platinum) | Healthcare, Disaster Relief |

### 🎯 Campaigns (4 active)

| Campaign | Category | Goal | Raised |
|----------|----------|------|--------|
| Clean Water for Dharavi 2026 | Water & Sanitation | ₹5,00,000 | ₹2,85,000 (57%) |
| Digital Literacy for Rural Schools | Education | ₹8,00,000 | ₹1,20,000 (15%) |
| Women Health Camps — Chennai | Healthcare | ₹3,00,000 | ₹2,20,000 (73%) |
| Cyclone Preparedness — Coastal TN | Disaster Relief | ₹12,00,000 | ₹3,40,000 (28%) |

### 📋 Community Needs (5 reported)

- Critical: Water supply disrupted — Kothrud, Pune (800 affected)
- Critical: Flood damage — Nagapattinam (250 affected)
- High: Elderly care — Mylapore, Chennai (15 affected)
- High: Child malnutrition — Yavatmal (3,000 affected)
- Medium: School blackboard repair — Hadapsar, Pune

### 💰 Donations (5 completed)

- ₹25,000 · Vikram → Clean Water Campaign
- ₹15,000 · Vikram → Women Health Camps
- ₹50,000 · Meera → Clean Water Campaign (CSR)
- ₹1,00,000 · Meera → Cyclone Preparedness
- ₹10,000 · Vikram → Digital Literacy (recurring)

### 🚨 Emergency Event (1 active)

- **Chennai Coastal Flooding — April 2026** (Severity: Level 2)
- 12,000 people affected · Auto-broadcast sent

### 🔍 Fraud Cases (2)

- FRAUD-2026-0001 · Medium · Suspicious donation velocity (investigating)
- FRAUD-2026-0002 · Low · Fake volunteer hours (dismissed)

### 📋 Audit Logs (8 events)

Covers: org creation, campaign creation, donations, emergency declaration, fraud flagging, admin logins.

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
