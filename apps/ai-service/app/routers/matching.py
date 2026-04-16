"""
Matching Router — Volunteer Matching & Need Prioritization
==========================================================
POST /ai/match-volunteers   → Match volunteers to a task
POST /ai/prioritize-needs   → Rank needs by priority score
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    MatchVolunteersRequest,
    MatchVolunteersResponse,
    PrioritizeNeedsRequest,
    PrioritizeNeedsResponse,
)
from app.services.matching_engine import matching_engine
from app.services.priority_scorer import priority_scorer

router = APIRouter()


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
