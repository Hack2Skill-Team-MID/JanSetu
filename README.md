# 🌉 JanSetu (जन सेतु) — People's Bridge

> **Smart Resource Allocation Platform** — Connecting community needs with volunteers through AI-powered matching.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://mongodb.com/)

---

## 🎯 Problem Statement

Local social groups and NGOs collect important information about community needs through paper surveys and field reports. However, this valuable data is often scattered across different places, making it hard to see the biggest problems clearly. Even when needs are identified, connecting the right volunteers to the right tasks remains manual and inefficient.

## 💡 Solution

**JanSetu** is a data-driven platform that:
1. **Aggregates & Digitizes** scattered community data using AI/OCR
2. **Visualizes** urgent community needs on interactive maps and dashboards
3. **Smart-Matches** volunteers to tasks based on skills, location, and availability
4. **Tracks** impact from need identification to task completion

---

## 🏗️ Architecture

```
jansetu/
├── apps/
│   ├── web/              → Next.js 14 Frontend (Dashboard + Volunteer Portal)
│   └── ai-service/       → Python FastAPI (NLP, OCR, Matching Engine)
├── server/               → Node.js Express Backend (REST API, Auth, DB)
├── packages/
│   └── shared/           → Shared TypeScript types & constants
└── docs/                 → Documentation
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Leaflet.js, Recharts |
| Backend | Node.js, Express.js, TypeScript, Mongoose, JWT |
| AI/ML | Python, FastAPI, Google Gemini API, Scikit-learn, Tesseract OCR |
| Database | MongoDB Atlas, Redis |
| Deployment | Vercel (Frontend), Railway (Backend + AI) |

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- Python >= 3.11
- MongoDB Atlas account
- Google Gemini API key

### Setup

```bash
# Clone the repo
git clone https://github.com/Hack2Skill-Team-MID/jansetu.git
cd jansetu

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your API keys in .env

# Start development servers
npm run dev
```

### AI Service Setup
```bash
cd apps/ai-service
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## 👥 Team — Hack2Skill Team MID

| Role | Responsibility |
|------|---------------|
| 🔧 Full-Stack Lead | Backend, Database, Auth, DevOps, Integration |
| 🎨 Frontend Dev | Next.js UI/UX, Dashboard, Volunteer Portal |
| 🤖 AI/ML Dev | NLP Processing, Smart Matching, OCR Pipeline |

## 📝 Branch Strategy

```
main          ← Production
└── develop   ← Integration
    ├── dev/backend    ← Backend development
    ├── dev/frontend   ← Frontend development
    └── dev/ai-service ← AI/ML development
```

---

## 📄 License

This project is licensed under the MIT License.
