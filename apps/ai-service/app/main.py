"""
JanSetu AI Service — FastAPI Entry Point
=========================================
Smart Resource Allocation — NLP, OCR, Volunteer Matching, Sentiment & Resource Engine

Owned by: AI/ML Dev (Teammate 3)

Available Endpoints:
  ── Ingestion ────────────────────────────────────────────
  POST /ai/process-survey         → Process survey file (PDF/image/text) → extract needs
  POST /ai/extract-insights       → Extract insights from raw text

  ── Matching & Resource Allocation ───────────────────────
  POST /ai/match-volunteers       → Match volunteers to tasks (skill + location + availability)
  POST /ai/prioritize-needs       → Rank community needs by priority score
  POST /ai/allocate-resources     → Smart resource allocation to prioritized needs
  POST /ai/analyze-shortage       → Predict resource shortages (30-day forecast)
  POST /ai/suggest-redistribution → Cross-NGO resource redistribution suggestions

  ── Intelligence & Analytics ──────────────────────────────
  POST /ai/generate-impact-report → AI campaign impact narrative
  POST /ai/generate-ngo-report    → NGO annual report generation
  POST /ai/generate-donor-impact  → Personalized donor impact story
  POST /ai/detect-fraud           → Campaign fraud detection (Gemini + rules)
  POST /ai/detect-donation-fraud  → Suspicious donation pattern detection
  POST /ai/analyze-user-behavior  → Bot/sybil attack detection
  POST /ai/analyze-trends         → Regional community trend analysis
  POST /ai/predict-crisis         → Crisis prediction from current patterns
  POST /ai/what-if-simulation     → What-if scenario simulation
  POST /ai/suggest-collaborations → NGO collaboration suggestions
  POST /ai/partnership-fit        → NGO partnership compatibility analysis
  POST /ai/analyze-sentiment      → Single text sentiment analysis
  POST /ai/analyze-sentiment-batch → Batch sentiment analysis (up to 100 texts)
  POST /ai/community-pulse        → Aggregate community sentiment dashboard
  POST /ai/analyze-need-tone      → Emotional tone analysis of community need
  POST /ai/chatbot                → JanSetu AI assistant for NGO staff

  ── Health ───────────────────────────────────────────────
  GET  /ai/health                 → Service health + Gemini status
  GET  /ai/docs                   → Swagger UI (interactive API docs)
  GET  /ai/redoc                  → ReDoc (clean documentation)
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
    description=(
        "AI-powered data processing, volunteer matching, resource allocation, "
        "sentiment analysis, and fraud detection for the JanSetu Smart Resource Platform."
    ),
    version="2.1.0",
    docs_url="/ai/docs",
    redoc_url="/ai/redoc",
)

# CORS — allow frontend and backend to call AI service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ingestion.router, prefix="/ai", tags=["Data Ingestion"])
app.include_router(matching.router, prefix="/ai", tags=["Matching & Resource Allocation"])
app.include_router(intelligence.router, prefix="/ai", tags=["Intelligence & Analytics"])


@app.on_event("startup")
async def startup_event():
    """Log service info on startup."""
    from app.utils.gemini_client import gemini_client
    from app.services.nlp_processor import PDF_AVAILABLE, OCR_AVAILABLE

    print("\n" + "═" * 60)
    print("🌉 JanSetu AI Service v2.1.0 — Starting Up")
    print("═" * 60)
    print(f"  🤖 Gemini AI       : {'✅ Configured' if gemini_client.is_configured else '⚠️  Fallback mode'}")
    print(f"  📄 PDF Extraction  : {'✅ pdfplumber ready' if PDF_AVAILABLE else '⚠️  Not available'}")
    print(f"  🖼️  Image OCR       : {'✅ pytesseract ready' if OCR_AVAILABLE else '⚠️  Not available'}")
    print(f"  📡 Endpoints       : 23 routes active")
    print(f"  📚 API Docs        : http://localhost:8000/ai/docs")
    print("═" * 60 + "\n")


@app.get("/ai/health")
async def health_check():
    """Health check endpoint — called by the backend to verify AI service is running."""
    from app.utils.gemini_client import gemini_client
    from app.services.nlp_processor import PDF_AVAILABLE, OCR_AVAILABLE

    return {
        "status": "ok",
        "service": "jansetu-ai",
        "version": "2.1.0",
        "message": "🤖 JanSetu AI Service is running",
        "capabilities": {
            "gemini_configured": gemini_client.is_configured,
            "pdf_extraction": PDF_AVAILABLE,
            "image_ocr": OCR_AVAILABLE,
            "sentiment_analysis": True,
            "resource_allocation": True,
            "volunteer_matching": True,
            "fraud_detection": True,
            "trend_analysis": True,
        },
    }
