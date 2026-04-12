# JanSetu — Local Development Setup

## Prerequisites
- Node.js >= 20 ([download](https://nodejs.org/))
- Python >= 3.11 ([download](https://python.org/))
- Git ([download](https://git-scm.com/))
- MongoDB Atlas account ([signup](https://mongodb.com/atlas))
- Google Gemini API key ([get key](https://aistudio.google.com/apikey))

---

## Step 1: Clone & Install

```bash
git clone https://github.com/Hack2Skill-Team-MID/jansetu.git
cd jansetu

# Install all Node.js dependencies (monorepo workspaces)
npm install
```

## Step 2: Environment Variables

```bash
cp .env.example .env
# Edit .env and fill in your actual values
```

## Step 3: Run Backend

```bash
npm run dev:server
# Server starts at http://localhost:5000
```

## Step 4: Run Frontend

```bash
npm run dev:web
# Frontend starts at http://localhost:3000
```

## Step 5: Run AI Service

```bash
cd apps/ai-service
python -m venv venv
venv\Scripts\activate         # Windows
# source venv/bin/activate    # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Step 6: Run Everything Together

```bash
# From root directory (runs frontend + backend)
npm run dev

# In a separate terminal, run AI service
cd apps/ai-service && uvicorn app.main:app --reload --port 8000
```

---

## Git Branch Workflow

```bash
# Backend dev (Ishan)
git checkout dev/backend
git pull origin develop
# ... work ...
git push origin dev/backend

# Frontend dev
git checkout dev/frontend
git pull origin develop
# ... work ...
git push origin dev/frontend

# AI dev
git checkout dev/ai-service
git pull origin develop
# ... work ...
git push origin dev/ai-service
```

## Troubleshooting

- **Port already in use**: Kill the process using `npx kill-port 5000`
- **MongoDB connection error**: Check your `MONGODB_URI` in `.env`
- **Python venv issues**: Delete `venv` folder and recreate
