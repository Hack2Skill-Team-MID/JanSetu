"""
Intelligence Router
====================
AI-powered endpoints for fraud detection, impact storytelling, 
trend analysis, and NGO collaboration suggestions.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict

from app.services.impact_storyteller import impact_storyteller
from app.services.fraud_detector import fraud_detector
from app.services.trend_analyzer import trend_analyzer
from app.services.ngo_collaborator import ngo_collaborator

router = APIRouter()


# ─── Request Models ─────────────────────────────

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


# ─── Impact Storytelling ─────────────────────────

@router.post("/generate-impact-report")
async def generate_impact_report(request: CampaignImpactRequest):
    """Generate an AI-powered impact report for a campaign."""
    result = await impact_storyteller.generate_campaign_report(request.dict())
    return {"success": True, "data": result}


@router.post("/generate-ngo-report")
async def generate_ngo_report(request: NgoReportRequest):
    """Generate an annual report for an NGO."""
    result = await impact_storyteller.generate_ngo_annual_report(request.dict())
    return {"success": True, "data": result}


@router.post("/generate-donor-impact")
async def generate_donor_impact(request: DonorImpactRequest):
    """Generate a personalized donor impact report."""
    result = await impact_storyteller.generate_donor_impact(request.dict())
    return {"success": True, "data": result}


# ─── Fraud Detection ─────────────────────────

@router.post("/detect-fraud")
async def detect_fraud(request: FraudCheckRequest):
    """Analyze a campaign for fraud indicators."""
    result = await fraud_detector.analyze_campaign(request.dict())
    return {"success": True, "data": result}


@router.post("/detect-donation-fraud")
async def detect_donation_fraud(request: DonationPatternRequest):
    """Detect suspicious donation patterns."""
    result = await fraud_detector.analyze_donation_pattern(request.dict())
    return {"success": True, "data": result}


# ─── Trend Analysis ─────────────────────────

@router.post("/analyze-trends")
async def analyze_trends(request: RegionTrendRequest):
    """Analyze regional trends for community needs."""
    result = await trend_analyzer.analyze_regional_trends(request.dict())
    return {"success": True, "data": result}


@router.post("/predict-crisis")
async def predict_crisis(request: CrisisPredictionRequest):
    """Predict potential crises based on current patterns."""
    result = await trend_analyzer.predict_crisis(request.dict())
    return {"success": True, "data": result}


# ─── NGO Collaboration ─────────────────────────

@router.post("/suggest-collaborations")
async def suggest_collaborations(request: CollaborationRequest):
    """Suggest collaboration opportunities between NGOs."""
    result = await ngo_collaborator.suggest_collaborations(request.dict())
    return {"success": True, "data": result}


@router.post("/partnership-fit")
async def partnership_fit(request: PartnershipFitRequest):
    """Analyze partnership compatibility between two NGOs."""
    result = await ngo_collaborator.analyze_partnership_fit(
        request.org_a, request.org_b
    )
    return {"success": True, "data": result}


# ─── AI Chatbot ─────────────────────────

@router.post("/chatbot")
async def chatbot(request: ChatbotRequest):
    """AI assistant for NGO staff — answers questions about the platform."""
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
            ]
        }
    }
