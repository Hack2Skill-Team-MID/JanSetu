"""
Matching Router — Volunteer Matching, Need Prioritization & Resource Allocation
================================================================================
POST /ai/match-volunteers    → Match volunteers to a task
POST /ai/prioritize-needs    → Rank needs by priority score
POST /ai/allocate-resources  → Allocate resources to prioritized needs (NEW)
POST /ai/analyze-shortage    → Predict resource shortages (NEW)
POST /ai/suggest-redistribution → Cross-NGO resource redistribution (NEW)
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    MatchVolunteersRequest,
    MatchVolunteersResponse,
    PrioritizeNeedsRequest,
    PrioritizeNeedsResponse,
    AllocateResourcesRequest,
    AllocateResourcesResponse,
    ShortageAnalysisRequest,
    RedistributionRequest,
)
from app.services.matching_engine import matching_engine
from app.services.priority_scorer import priority_scorer
from app.services.resource_allocator import resource_allocator

router = APIRouter()


# ─── Volunteer Matching ───────────────────────────────────────────────────────

@router.post("/match-volunteers", response_model=MatchVolunteersResponse)
async def match_volunteers(request: MatchVolunteersRequest):
    """
    Match volunteers to a specific task.

    Uses multi-factor scoring:
    - Skill overlap (45%)
    - Location proximity via haversine distance (30%)
    - Availability rating (25%)

    Returns volunteers ranked by match score with explanations.
    """
    try:
        result = await matching_engine.match(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching failed: {str(e)}")


# ─── Need Prioritization ──────────────────────────────────────────────────────

@router.post("/prioritize-needs", response_model=PrioritizeNeedsResponse)
async def prioritize_needs(request: PrioritizeNeedsRequest):
    """
    Rank community needs by priority score.

    Scoring factors:
    - Category severity weight (25%)
    - Urgency level from text analysis (35%)
    - Affected population size (20%)
    - Report age / staleness (20%)

    Returns needs ranked from highest to lowest priority.
    """
    try:
        result = await priority_scorer.prioritize(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prioritization failed: {str(e)}")


# ─── Resource Allocation ──────────────────────────────────────────────────────

@router.post("/allocate-resources")
async def allocate_resources(request: AllocateResourcesRequest):
    """
    Intelligently allocate available resources to prioritized community needs.

    Strategies:
    - greedy: Allocate to highest-priority needs first
    - balanced: Spread resources across need categories
    - equity: Prefer equal distribution across affected populations

    Returns allocation plan, unmet shortages, and recommendations.
    """
    try:
        result = await resource_allocator.allocate(request.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resource allocation failed: {str(e)}")


@router.post("/analyze-shortage")
async def analyze_shortage(request: ShortageAnalysisRequest):
    """
    Predict resource shortages for the next 30 days.
    Uses historical consumption rates and active need counts to forecast.
    """
    try:
        result = await resource_allocator.analyze_shortage(request.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Shortage analysis failed: {str(e)}")


@router.post("/suggest-redistribution")
async def suggest_redistribution(request: RedistributionRequest):
    """
    Suggest resource redistribution between NGOs.
    Identifies organizations with surpluses and matches them with orgs in deficit.
    """
    try:
        result = await resource_allocator.suggest_redistribution(request.org_profiles)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Redistribution suggestion failed: {str(e)}")
