"""
Intelligence Router
====================
AI-powered endpoints for fraud detection, impact storytelling,
trend analysis, NGO collaboration suggestions, sentiment analysis,
resource allocation, and chatbot.

All previously-stubbed methods (what-if simulation, user behavior)
are now wired up. New endpoints: sentiment, community pulse, need tone.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict

from app.services.impact_storyteller import impact_storyteller
from app.services.fraud_detector import fraud_detector
from app.services.trend_analyzer import trend_analyzer
from app.services.ngo_collaborator import ngo_collaborator
from app.services.sentiment_analyzer import sentiment_analyzer
from app.models.schemas import (
    SentimentRequest,
    SentimentResponse,
    BatchSentimentRequest,
    CommunityPulseRequest,
    NeedToneRequest,
    UserBehaviorRequest,
    WhatIfRequest,
)

router = APIRouter()


# ─── Request Models (inline, for endpoints not using schemas.py) ──────────────

class CampaignImpactRequest(BaseModel):
    title: str
    description: str = ""
    category: str = ""
    location: str = ""
    volunteers_joined: int = 0
    volunteers_needed: int = 0
    funding_raised: float = 0
    funding_goal: float = 0
    people_helped: int = 0
    people_to_help: int = 0
    milestones_completed: int = 0
    milestones_total: int = 0


class NgoReportRequest(BaseModel):
    name: str
    total_campaigns: int = 0
    active_campaigns: int = 0
    total_volunteers: int = 0
    total_donations: float = 0
    people_helped: int = 0
    trust_score: int = 50
    region: str = ""


class DonorImpactRequest(BaseModel):
    name: str = "Anonymous"
    total_donated: float = 0
    orgs_supported: int = 0
    campaigns_funded: int = 0


class FraudCheckRequest(BaseModel):
    title: str = ""
    description: str = ""
    org_trust_score: int = 50
    funding_goal: float = 0
    funding_raised: float = 0
    volunteers_needed: int = 0
    days_active: int = 0
    milestones_completed: int = 0


class DonationPatternRequest(BaseModel):
    total_donations: int = 0
    avg_amount: float = 0
    max_amount: float = 0
    frequency: str = "unknown"
    anonymous_pct: float = 0
    same_day_count: int = 0


class RegionTrendRequest(BaseModel):
    region: str
    needs_by_category: Dict[str, int] = {}
    total_needs: int = 0
    resolved_rate: float = 0
    active_campaigns: int = 0
    volunteer_density: str = "unknown"


class CrisisPredictionRequest(BaseModel):
    region: str
    season: str = "unknown"
    spike_categories: List[str] = []
    history: str = "none recorded"
    water_level: str = "normal"
    healthcare_score: int = 50


class CollaborationRequest(BaseModel):
    requesting_org: Dict = {}
    available_orgs: List[Dict] = []


class PartnershipFitRequest(BaseModel):
    org_a: Dict = {}
    org_b: Dict = {}


class ChatbotRequest(BaseModel):
    message: str
    context: str = ""
    role: str = "ngo_admin"


# ─── Impact Storytelling ──────────────────────────────────────────────────────

@router.post("/generate-impact-report")
async def generate_impact_report(request: CampaignImpactRequest):
    """Generate an AI-powered impact report for a campaign."""
    try:
        result = await impact_storyteller.generate_campaign_report(request.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Impact report generation failed: {str(e)}")


@router.post("/generate-ngo-report")
async def generate_ngo_report(request: NgoReportRequest):
    """Generate an annual report for an NGO."""
    try:
        result = await impact_storyteller.generate_ngo_annual_report(request.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NGO report generation failed: {str(e)}")


@router.post("/generate-donor-impact")
async def generate_donor_impact(request: DonorImpactRequest):
    """Generate a personalized donor impact report."""
    try:
        result = await impact_storyteller.generate_donor_impact(request.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Donor impact generation failed: {str(e)}")


# ─── Fraud Detection ──────────────────────────────────────────────────────────

@router.post("/detect-fraud")
async def detect_fraud(request: FraudCheckRequest):
    """Analyze a campaign for fraud indicators."""
    try:
        result = await fraud_detector.analyze_campaign(request.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fraud detection failed: {str(e)}")


@router.post("/detect-donation-fraud")
async def detect_donation_fraud(request: DonationPatternRequest):
    """Detect suspicious donation patterns."""
    try:
        result = await fraud_detector.analyze_donation_pattern(request.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Donation fraud detection failed: {str(e)}")


@router.post("/analyze-user-behavior")
async def analyze_user_behavior(request: UserBehaviorRequest):
    """
    Check user behavior for bot/sybil attacks.
    Previously had a service method but no route — now wired up.
    """
    try:
        result = await fraud_detector.analyze_user_behavior(request.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"User behavior analysis failed: {str(e)}")


# ─── Trend Analysis ───────────────────────────────────────────────────────────

@router.post("/analyze-trends")
async def analyze_trends(request: RegionTrendRequest):
    """Analyze regional trends for community needs."""
    try:
        result = await trend_analyzer.analyze_regional_trends(request.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trend analysis failed: {str(e)}")


@router.post("/predict-crisis")
async def predict_crisis(request: CrisisPredictionRequest):
    """Predict potential crises based on current patterns."""
    try:
        result = await trend_analyzer.predict_crisis(request.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crisis prediction failed: {str(e)}")


@router.post("/what-if-simulation")
async def what_if_simulation(request: WhatIfRequest):
    """
    Run a what-if simulation for resource allocation decisions.
    Previously had a service method but no route — now wired up.
    """
    try:
        result = await trend_analyzer.what_if_simulation(request.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"What-if simulation failed: {str(e)}")


# ─── NGO Collaboration ────────────────────────────────────────────────────────

@router.post("/suggest-collaborations")
async def suggest_collaborations(request: CollaborationRequest):
    """Suggest collaboration opportunities between NGOs."""
    try:
        result = await ngo_collaborator.suggest_collaborations(request.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Collaboration suggestion failed: {str(e)}")


@router.post("/partnership-fit")
async def partnership_fit(request: PartnershipFitRequest):
    """Analyze partnership compatibility between two NGOs."""
    try:
        result = await ngo_collaborator.analyze_partnership_fit(
            request.org_a, request.org_b
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Partnership analysis failed: {str(e)}")


# ─── Sentiment Analysis ───────────────────────────────────────────────────────

@router.post("/analyze-sentiment", response_model=None)
async def analyze_sentiment(request: SentimentRequest):
    """
    Analyze the sentiment of a single piece of community text.
    Supports: community_feedback, ngo_report, volunteer_review, donor_message
    """
    try:
        result = await sentiment_analyzer.analyze(request.text, request.context)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")


@router.post("/analyze-sentiment-batch")
async def analyze_sentiment_batch(request: BatchSentimentRequest):
    """
    Batch sentiment analysis — analyze multiple texts at once.
    Returns results in the same order as input texts.
    """
    try:
        if len(request.texts) > 100:
            raise HTTPException(status_code=400, detail="Maximum 100 texts per batch")
        results = await sentiment_analyzer.batch_analyze(request.texts, request.context)
        return {"success": True, "data": results, "count": len(results)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch sentiment analysis failed: {str(e)}")


@router.post("/community-pulse")
async def community_pulse(request: CommunityPulseRequest):
    """
    Aggregate community sentiment across multiple feedback texts.
    Returns a dashboard-ready 'community pulse' payload.
    """
    try:
        result = await sentiment_analyzer.get_community_pulse(
            request.feedback_texts, request.region
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Community pulse analysis failed: {str(e)}")


@router.post("/analyze-need-tone")
async def analyze_need_tone(request: NeedToneRequest):
    """
    Detect the emotional tone and distress level of a community need report.
    Helps responders prioritize attention and calibrate their communication style.
    """
    try:
        result = await sentiment_analyzer.analyze_need_urgency_tone(
            request.title, request.description
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Need tone analysis failed: {str(e)}")


# ─── AI Chatbot ───────────────────────────────────────────────────────────────

@router.post("/chatbot")
async def chatbot(request: ChatbotRequest):
    """AI assistant for NGO staff — answers questions about the platform."""
    try:
        from app.utils.gemini_client import gemini_client

        prompt = f"""You are JanSetu AI Assistant, helping NGO staff manage their operations on the JanSetu platform.

User Role: {request.role}
Context: {request.context}
User Message: {request.message}

Provide a helpful, concise response. If the question is about platform features, explain how to use them.
If it's about data analysis, provide insights. Keep responses under 200 words.
Be warm, professional, and action-oriented."""

        response = await gemini_client.generate(prompt)

        return {
            "success": True,
            "data": {
                "response": response or "I'm sorry, I'm having trouble processing that right now. Please try again in a moment.",
                "suggestions": [
                    "How do I create a campaign?",
                    "Show me my resource alerts",
                    "What's the best way to recruit volunteers?",
                    "Analyze my campaign's impact",
                ],
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot error: {str(e)}")
