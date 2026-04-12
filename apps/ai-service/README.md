# ============================================
# 🤖 JanSetu AI Service
# ============================================
# This is the AI/ML microservice for JanSetu.
# Built with FastAPI + Google Gemini API
#
# Owned by: AI/ML Dev (Teammate 3)
# ============================================

## Setup

```bash
cd apps/ai-service
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ai/health` | Health check |
| POST | `/ai/process-survey` | Process uploaded survey (OCR + NLP) |
| POST | `/ai/extract-insights` | Extract insights from text |
| POST | `/ai/match-volunteers` | Smart volunteer-task matching |
| POST | `/ai/prioritize-needs` | Rank needs by priority |

## API Contract

See `packages/shared/src/types/api.types.ts` for the exact request/response types.
