<div align="center">

<h1>🌉 JanSetu</h1>
<h3>Smart Resource Allocation Platform for Community Needs & Volunteer Matching</h3>

<p>
  <img src="https://img.shields.io/badge/Hack2Skill-Submission-6366f1?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/MongoDB-8.0-47A248?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google" />
</p>

<p><strong>JanSetu</strong> ("Jan" = People, "Setu" = Bridge) bridges communities with resources through AI-powered survey processing, intelligent volunteer-task matching, and real-time need prioritization.</p>

</div>

---

## 🎯 Problem Statement

In India, community needs are often:
- **Unstructured** — filed as handwritten surveys or field reports
- **Unprioritized** — NGOs don't know which need to act on first
- **Mismatched** — volunteers with the right skills are never connected to the right tasks

**JanSetu solves all three** using AI.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📄 **AI Survey Processing** | Upload handwritten forms → Gemini NLP extracts structured needs automatically |
| 🤖 **Smart Volunteer Matching** | Multi-factor algorithm: skill overlap (45%) + GPS proximity (30%) + availability (25%) |
| 📊 **Dynamic Prioritization** | Needs ranked by urgency, affected population, category severity & report age |
| 🗺️ **Community Dashboard** | Real-time stats, critical alerts, category breakdown |
| 🙋 **Volunteer Portal** | AI-recommended tasks with match scores and reasons |
| 🔐 **Role-Based Auth** | NGO Coordinators, Volunteers, and Admins — each with tailored flows |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         MONOREPO                                │
│                                                                 │
│  ┌──────────────┐    REST API     ┌──────────────────────────┐  │
│  │  Next.js 16  │ ─────────────► │   Express.js + MongoDB   │  │
│  │  (Port 3000) │                │      (Port 5000)         │  │
│  │  Tailwind 4  │                │                          │  │
│  │  Zustand     │                │  ┌────────────────────┐  │  │
│  └──────────────┘                │  │  AI Bridge Service │  │  │
│                                  │  └────────────────────┘  │  │
│                                  └────────────┬─────────────┘  │
│                                               │ HTTP           │
│                                  ┌────────────▼─────────────┐  │
│                                  │   FastAPI + Gemini AI    │  │
│                                  │      (Port 8000)         │  │
│                                  │  • NLP Processor         │  │
│                                  │  • Matching Engine       │  │
│                                  │  • Priority Scorer       │  │
│                                  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

> **Key design principle:** The Frontend **never** calls the AI service directly. All AI functionality is accessed through the Backend, which acts as a secure bridge.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB (local or Atlas)
- Gemini API Key ([Get free key here](https://aistudio.google.com))

### 1. Clone & Install

```bash
git clone https://github.com/Hack2Skill-Team-MID/jansetu.git
cd jansetu
```

### 2. Configure Environment Variables

```bash
# Backend
cp server/.env.example server/.env
# Edit server/.env — add your MONGODB_URI and JWT_SECRET

# AI Service
cp apps/ai-service/.env.example apps/ai-service/.env
# Edit apps/ai-service/.env — add your GEMINI_API_KEY

# Frontend
cp apps/web/.env.example apps/web/.env.local
# No changes needed for local dev
```

### 3. Start All Services

**Terminal 1 — Backend:**
```bash
cd server
npm install
npm run dev
# ✅ Running on http://localhost:5000
```

**Terminal 2 — AI Service:**
```bash
cd apps/ai-service
python -m venv venv
.\venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# ✅ Running on http://localhost:8000
# 📖 Swagger docs at http://localhost:8000/ai/docs
```

**Terminal 3 — Frontend:**
```bash
cd apps/web
npm install
npm run dev
# ✅ Running on http://localhost:3000
```

### 4. Seed the Database

```bash
cd server
npx ts-node scripts/seed.ts
```

**Test Accounts (password: `Password@123`):**

| Email | Role |
|---|---|
| `ngo@helpindia.org` | NGO Coordinator |
| `ananya@volunteer.in` | Volunteer |
| `rohit@volunteer.in` | Volunteer |
| `admin@jansetu.in` | Admin |

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

All responses: `{ success: boolean, data: any, error?: string }`

### Authentication
```
POST /auth/register   { name, email, password, role }
POST /auth/login      { email, password }
GET  /auth/me         → current user (requires JWT)
```

### Community Needs
```
GET    /needs?urgency=critical&category=water&page=1
POST   /needs         (NGO only)
PATCH  /needs/:id
DELETE /needs/:id     (Admin only)
```

### Tasks & Volunteering
```
GET  /tasks?status=open
POST /tasks/:id/apply           (Volunteer only)
PATCH /tasks/:id/applications/:appId  { status: 'accepted'|'rejected' }
```

### AI-Powered
```
GET  /volunteers/matches        → AI-matched tasks for logged-in volunteer
POST /surveys/upload            → Submit survey for AI processing
GET  /surveys/:id/status        → Check AI processing progress
GET  /dashboard/stats           → Platform statistics
GET  /dashboard/heatmap         → Geographic need distribution
```

---

## 🤖 AI Service Endpoints

Base URL: `http://localhost:8000`

```
POST /ai/process-survey     → OCR + NLP need extraction from file
POST /ai/extract-insights   → Analyze raw text → categories + urgency
POST /ai/match-volunteers   → Score volunteers vs task (0-100)
POST /ai/prioritize-needs   → Rank needs by multi-factor priority score
GET  /ai/health             → Service status + Gemini config check
GET  /ai/docs               → Swagger UI
```

---

## 📁 Project Structure

```
jansetu/
├── apps/
│   ├── web/                   # Next.js Frontend (Teammate 2)
│   └── ai-service/            # FastAPI AI Service (Teammate 3)
├── server/                    # Express Backend (Teammate 1 — Ishan)
│   ├── src/routes/            # 24 API endpoints
│   ├── src/models/            # Mongoose schemas
│   ├── src/services/          # AI bridge
│   └── scripts/seed.ts        # Database seeder
└── packages/
    └── shared/                # Shared TypeScript types & constants
```

---

## 👥 Team

| Role | Responsibility | Branch |
|---|---|---|
| **Ishan Agrawal** — Backend Lead | Express API, MongoDB, AI Bridge, Integration | `dev/backend` |
| **Teammate 2** — Frontend Dev | Next.js UI, Zustand, Dashboard, UX | `dev/frontend` |
| **Teammate 3** — AI/ML Dev | FastAPI, Gemini NLP, Matching algorithms | `dev/ai-service` |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Zustand, Axios, Lucide React |
| Backend | Express.js, TypeScript, Mongoose, JWT, Zod, bcryptjs |
| AI Service | FastAPI, Pydantic v2, Google Gemini API, pytesseract, scikit-learn |
| Database | MongoDB 8.0 (local / Atlas) |
| Monorepo | npm workspaces, shared TypeScript package |

---

## 📜 License

MIT © JanSetu Team — Hack2Skill 2025
