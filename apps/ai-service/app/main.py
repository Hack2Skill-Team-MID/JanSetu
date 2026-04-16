"""
JanSetu AI Service — FastAPI Entry Point
=========================================
Smart Resource Allocation — NLP, OCR, and Volunteer Matching Engine

Owned by: AI/ML Dev (Teammate 3)

Endpoints:
  POST /ai/process-survey    → Process uploaded survey file
  POST /ai/extract-insights  → Extract insights from raw text
  POST /ai/match-volunteers  → Match volunteers to tasks
  POST /ai/prioritize-needs  → Rank needs by priority
  GET  /ai/health            → Health check
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from app.routers import ingestion, matching, intelligence

app = FastAPI(
    title="JanSetu AI Service",
    description="AI-powered data processing and volunteer matching for JanSetu",
    version="2.0.0",
    docs_url="/ai/docs",
    redoc_url="/ai/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ingestion.router, prefix="/ai", tags=["Data Ingestion"])
app.include_router(matching.router, prefix="/ai", tags=["Matching & Prioritization"])
app.include_router(intelligence.router, prefix="/ai", tags=["Intelligence & Analytics"])


@app.get("/ai/health")
async def health_check():
    """Health check endpoint — called by the backend to verify AI service is running."""
    from app.utils.gemini_client import gemini_client

    return {
        "status": "ok",
        "service": "jansetu-ai",
        "message": "🤖 JanSetu AI Service is running",
        "gemini_configured": gemini_client.is_configured,
    }
