"""
JanSetu AI Service — FastAPI Entry Point
=========================================
Smart Resource Allocation — NLP, OCR, and Volunteer Matching Engine

Owned by: AI/ML Dev (Teammate 3)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="JanSetu AI Service",
    description="AI-powered data processing and volunteer matching for JanSetu",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/ai/health")
async def health_check():
    return {
        "status": "ok",
        "service": "jansetu-ai",
        "message": "🤖 JanSetu AI Service is running",
    }


# TODO: Import and include routers
# from app.routers import ingestion, matching
# app.include_router(ingestion.router, prefix="/ai")
# app.include_router(matching.router, prefix="/ai")
