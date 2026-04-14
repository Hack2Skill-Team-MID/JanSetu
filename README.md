<div align="center">

<h1>🌉 JanSetu</h1>
<h3>AI-Powered Smart NGO Ecosystem Platform</h3>

<p>
  <img src="https://img.shields.io/badge/Hack2Skill-Submission-6366f1?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/Express.js-4-000000?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/MongoDB-8.0-47A248?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/PWA-Offline%20First-5A0FC8?style=for-the-badge" />
</p>

<p><strong>JanSetu</strong> ("Jan" = People, "Setu" = Bridge) is a production-grade platform that unifies NGOs, volunteers, donors, and communities into one intelligent ecosystem — powered by AI to maximize every rupee and every volunteer hour.</p>

</div>

---

## 🎯 Problem Statement

In India, community welfare operations face critical challenges:
- **Fragmented ecosystem** — NGOs, volunteers, donors, and communities operate in silos
- **Unstructured data** — needs arrive as handwritten surveys, phone calls, and field reports
- **No trust verification** — donors can't verify NGO legitimacy; fraud goes undetected
- **Zero coordination** — during emergencies, there's no unified command and response system

**JanSetu solves all four** with AI, real-time collaboration, and production-grade infrastructure.

---

## ✨ Platform Features

### Core Ecosystem (Phase 1)
| Feature | Description |
|---|---|
| 🏢 **Multi-Tenant Architecture** | Each NGO gets an isolated workspace with private campaigns, resources, and volunteers |
| 🎯 **Campaign Builder** | Rich campaign creation with milestones, funding goals, and public/private visibility |
| 💰 **Donation Portal** | Razorpay-integrated giving with anonymous donations, impact tracking, and tax receipts |
| 📦 **Resource Manager** | Inventory tracking with allocation, expiry alerts, and supply-demand matching |
| 🏆 **Gamification Engine** | Points, badges, streaks, and leaderboards (weekly/monthly/all-time) |
| 💬 **Messaging Center** | In-app conversations with broadcast capability and emergency alerts |
| 🗺️ **Interactive Map** | Leaflet-powered crisis heatmap with NGO locations and campaign markers |
| 🤝 **NGO Network** | Cross-organization discovery feed with trust scores and collaboration |

### Intelligence Layer (Phase 2)
| Feature | Description |
|---|---|
| 🤖 **AI Survey Processing** | Upload handwritten forms → Gemini NLP extracts structured needs |
| 🧠 **Smart Volunteer Matching** | Multi-factor algorithm: skill overlap (45%) + proximity (30%) + availability (25%) |
| 📊 **Dynamic Prioritization** | Needs ranked by urgency, population, category severity & report age |
| 🎤 **Voice Input** | Web Speech API for voice-based need reporting |
| 💬 **AI Chatbot** | Gemini-powered assistant for platform navigation and queries |
| 📈 **AI Impact Reports** | Auto-generated narrative reports for campaigns |

### Production Infrastructure (Phase 3)
| Feature | Description |
|---|---|
| 🚨 **Emergency Mode** | One-tap disaster activation with auto-broadcasts and resource locking |
| 🌐 **Multi-language (i18n)** | English, Hindi, Tamil with instant switching and localStorage persistence |
| 📋 **Full Audit Trail** | Every action logged with actor, IP, timestamps, and before/after snapshots |
| 🔍 **Fraud Escalation** | AI risk scoring, case management, investigation notes, resolution workflows |
| 📱 **Offline-First PWA** | Service worker, IndexedDB queue, auto-replay on reconnect |
| 📖 **API Documentation** | Interactive reference with 30+ endpoints, method badges, copy-to-clipboard |

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                           JANSETU MONOREPO                           │
│                                                                       │
│  ┌────────────────┐    REST API     ┌──────────────────────────────┐  │
│  │   Next.js 16   │ ─────────────► │    Express.js + MongoDB       │  │
│  │   (Port 3000)  │                │       (Port 5000)             │  │
│  │                │                │                                │  │
│  │  • 15+ Pages   │                │  • 17 Route Files (80+ APIs)  │  │
│  │  • PWA + SW    │                │  • 12 Mongoose Models         │  │
│  │  • i18n (3 lang)│                │  • Audit Middleware           │  │
│  │  • IndexedDB   │                │  • JWT + Role Auth            │  │
│  │  • Zustand     │                │                                │  │
│  └────────────────┘                │  ┌────────────────────────┐    │  │
│                                    │  │   AI Bridge Service    │    │  │
│                                    │  │   (Gemini API calls)   │    │  │
│                                    │  └────────────────────────┘    │  │
│                                    └───────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or [Atlas](https://cloud.mongodb.com))
- Gemini API Key ([Get free key](https://aistudio.google.com))

### 1. Clone & Install

```bash
git clone https://github.com/agrawalishan2005/jansetu.git
cd jansetu
```

### 2. Configure Environment

```bash
# Create .env in project root
cp .env.example .env
```

Required variables:
```env
MONGODB_URI=mongodb://localhost:27017/jansetu
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
PORT=5000
```

### 3. Start Backend

```bash
cd server
npm install
npm run dev
# ✅ Running on http://localhost:5000
```

### 4. Seed Demo Data

```bash
cd server
npm run seed
```

This creates **8 users, 2 NGOs, 4 campaigns, 5 needs, 5 donations, 1 emergency, 2 fraud cases, and audit logs**.

### 5. Start Frontend

```bash
cd apps/web
npm install
npm run dev
# ✅ Running on http://localhost:3000
```

### Demo Accounts (password: `password123`)

| Email | Role | Description |
|---|---|---|
| `admin@jansetu.org` | Platform Admin | Full platform oversight |
| `priya@helpindia.org` | NGO Admin | HelpIndia Foundation (Maharashtra) |
| `kavitha@sahayatrust.org` | NGO Admin | Sahaya Trust (Tamil Nadu) |
| `rohit@gmail.com` | Volunteer | Engineering student, 450 pts |
| `sneha@gmail.com` | Volunteer | Healthcare volunteer, 780 pts |
| `vikram@gmail.com` | Donor | Entrepreneur & philanthropist |
| `meera@gmail.com` | Donor | Corporate CSR coordinator |

---

## 📡 API Reference

**Base URL:** `http://localhost:5000/api`

All responses follow: `{ success: boolean, data?: any, error?: string }`

Interactive API docs available at: `/dashboard/api-docs`

### Key Endpoint Groups

| Group | Endpoints | Auth |
|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | Public / JWT |
| Campaigns | CRUD + donate, milestones, AI impact reports | JWT |
| Needs | CRUD + priority scoring, AI survey processing | JWT |
| Resources | CRUD + AI matching to needs | JWT |
| Tasks | CRUD + apply, accept/reject volunteers | JWT |
| Donations | Initiate + verify + history + impact reports | JWT |
| Emergency | Activate, resolve, broadcast, history | Admin |
| Audit | Paginated logs, entity/user tracking, stats | Admin |
| Fraud | Case CRUD, notes, assign, resolve, stats | Admin |
| Messages | Conversations, send, broadcast | JWT |
| Network | NGO discovery, trust scores, collaboration | JWT |
| Gamification | Points, badges, leaderboard | JWT |

---

## 📁 Project Structure

```
jansetu/
├── apps/
│   └── web/                          # Next.js Frontend
│       ├── src/app/                  # 15+ page routes
│       ├── src/components/           # Shared components
│       ├── src/lib/                  # API client, i18n, offline-queue
│       ├── src/locales/              # EN, Hindi, Tamil translations
│       ├── src/store/                # Zustand state management
│       └── public/                   # PWA assets (SW, manifest, icons)
├── server/                           # Express.js Backend
│   ├── src/models/                   # 12 Mongoose models
│   ├── src/routes/                   # 17 route files (80+ endpoints)
│   ├── src/middleware/               # Auth, audit logging
│   ├── src/services/                 # AI bridge service
│   └── src/scripts/                  # Database seeder
└── packages/
    └── shared/                       # Shared TypeScript types
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, Zustand, Axios, Lucide React, Recharts, Leaflet |
| **Backend** | Express.js 4, TypeScript 5, Mongoose 8, JWT, Zod, bcryptjs, Socket.io |
| **AI Engine** | Google Gemini API (via AI Bridge Service) |
| **Database** | MongoDB 8.0 (local / Atlas) |
| **PWA** | Service Worker, IndexedDB, Web App Manifest |
| **i18n** | Custom provider (EN, Hindi, Tamil) |
| **Monorepo** | npm workspaces, shared TypeScript package |

---

## 👥 Team MID

| Member | Role | Focus |
|---|---|---|
| **Ishan Agrawal** | Full-Stack Lead | Architecture, Backend, AI Integration, Phase 3 |
| **Teammate 2** | Frontend Dev | UI/UX, Dashboard, Interactive Pages |
| **Teammate 3** | AI/ML Dev | NLP Processing, Matching Algorithms |

---

## 📜 License

MIT © JanSetu Team — Hack2Skill 2026
