# ============================================
# 🤖 JanSetu AI Service
# ============================================
# This is the AI/ML microservice for JanSetu.
# Built with FastAPI + Google Gemini API
#
# Owned by: AI/ML Dev (Divyansh Parihar)
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
| GET | `/ai/health` | Health check + capability status |
| POST | `/ai/process-survey` | Process uploaded survey file (PDF / image / text) via real OCR + NLP |
| POST | `/ai/extract-insights` | Extract insights, categories & urgency from raw text |
| POST | `/ai/match-volunteers` | Smart volunteer-task matching (skill + location + availability) |
| POST | `/ai/prioritize-needs` | Rank community needs by priority score |
| POST | `/ai/allocate-resources` | Intelligently allocate resources to prioritized needs |
| POST | `/ai/analyze-shortage` | Predict resource shortages over next 30 days |
| POST | `/ai/suggest-redistribution` | Suggest cross-NGO resource redistribution |
| POST | `/ai/analyze-sentiment` | Analyze sentiment of a single community text |
| POST | `/ai/analyze-sentiment-batch` | Batch sentiment analysis (up to 100 texts) |
| POST | `/ai/community-pulse` | Aggregate community sentiment dashboard widget |
| POST | `/ai/analyze-need-tone` | Detect emotional distress & tone in a need report |
| POST | `/ai/generate-impact-report` | AI-generated campaign impact narrative |
| POST | `/ai/generate-ngo-report` | AI-generated NGO annual report |
| POST | `/ai/generate-donor-impact` | Personalized donor impact story |
| POST | `/ai/detect-fraud` | Detect fraud indicators in a campaign |
| POST | `/ai/detect-donation-fraud` | Detect suspicious donation patterns |
| POST | `/ai/analyze-user-behavior` | Detect bot / sybil attack behavior |
| POST | `/ai/analyze-trends` | Analyze regional community need trends |
| POST | `/ai/predict-crisis` | Predict potential crises from current patterns |
| POST | `/ai/what-if-simulation` | Run what-if scenario simulation for resource decisions |
| POST | `/ai/suggest-collaborations` | Suggest NGO collaboration opportunities |
| POST | `/ai/partnership-fit` | Analyze partnership compatibility between two NGOs |
| POST | `/ai/chatbot` | JanSetu AI assistant for NGO staff |



## API Contract

See `packages/shared/src/types/api.types.ts` for the exact request/response types.
