"""
Ingestion Router — Survey Processing & Text Analysis
=====================================================
POST /ai/process-survey    → Process uploaded survey file
POST /ai/extract-insights  → Extract insights from raw text
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    ProcessSurveyRequest,
    ProcessSurveyResponse,
    ExtractInsightsRequest,
    ExtractInsightsResponse,
)
from app.services.nlp_processor import nlp_processor

router = APIRouter()


@router.post("/process-survey", response_model=ProcessSurveyResponse)
async def process_survey(request: ProcessSurveyRequest):
    """
    Process an uploaded survey file and extract community needs.

    The backend calls this endpoint after an NGO coordinator uploads a survey.
    Returns extracted needs that get auto-created in the database.
    """
    try:
        result = await nlp_processor.process_survey(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Survey processing failed: {str(e)}")


@router.post("/extract-insights", response_model=ExtractInsightsResponse)
async def extract_insights(request: ExtractInsightsRequest):
    """
    Extract insights from raw text data.

    Analyzes text to identify categories, urgency, and key issues.
    Useful for processing field reports and community feedback.
    """
    try:
        result = await nlp_processor.extract_insights(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insight extraction failed: {str(e)}")
