"""
Pydantic Schemas — AI Service Request/Response Models
=====================================================
These match the contracts defined in packages/shared/src/types/api.types.ts
"""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


# === Enums ===
class FileType(str, Enum):
    IMAGE = "image"
    PDF = "pdf"
    TEXT = "text"


class NeedCategory(str, Enum):
    EDUCATION = "education"
    HEALTHCARE = "healthcare"
    SANITATION = "sanitation"
    INFRASTRUCTURE = "infrastructure"
    FOOD_SECURITY = "food_security"
    WATER = "water"
    EMPLOYMENT = "employment"
    SAFETY = "safety"
    ENVIRONMENT = "environment"
    OTHER = "other"


class UrgencyLevel(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class AllocationStrategy(str, Enum):
    GREEDY = "greedy"
    BALANCED = "balanced"
    EQUITY = "equity"


# === Survey Processing ===
class ProcessSurveyRequest(BaseModel):
    file_url: str = Field(..., description="URL or path to the survey file")
    file_type: FileType = Field(..., description="Type of the uploaded file")


class ExtractedNeed(BaseModel):
    title: str
    description: str
    category: str = "other"
    urgency: str = "medium"
    location: str = "Unknown"


class ProcessSurveyResponse(BaseModel):
    extractedNeeds: list[ExtractedNeed] = Field(default_factory=list)
    summary: str = ""
    confidence: float = Field(0.0, ge=0.0, le=1.0)


# === Text Insights ===
class ExtractInsightsRequest(BaseModel):
    text: str = Field(..., description="Raw text to analyze")


class ExtractInsightsResponse(BaseModel):
    summary: str
    categories: list[str] = Field(default_factory=list)
    urgency_score: float = Field(0.5, ge=0.0, le=1.0)
    key_issues: list[str] = Field(default_factory=list)


# === Volunteer Matching ===
class TaskForMatching(BaseModel):
    title: str
    description: str
    required_skills: list[str] = Field(default_factory=list)
    location: str = ""
    coordinates: tuple[float, float] = (0.0, 0.0)


class VolunteerForMatching(BaseModel):
    id: str
    name: str
    skills: list[str] = Field(default_factory=list)
    location: str = ""
    coordinates: tuple[float, float] = (0.0, 0.0)
    availability: str = "weekends"


class MatchVolunteersRequest(BaseModel):
    task: TaskForMatching
    volunteers: list[VolunteerForMatching]


class VolunteerMatchResult(BaseModel):
    volunteer_id: str
    score: float = Field(0.0, ge=0.0, le=100.0)
    reasons: list[str] = Field(default_factory=list)


class MatchVolunteersResponse(BaseModel):
    matches: list[VolunteerMatchResult] = Field(default_factory=list)


# === Need Prioritization ===
class NeedForPrioritization(BaseModel):
    id: str
    title: str
    description: str
    category: str = "other"
    affected_population: Optional[int] = None
    reported_at: str = ""


class PrioritizeNeedsRequest(BaseModel):
    needs: list[NeedForPrioritization]


class RankedNeed(BaseModel):
    need_id: str
    priority_score: float = Field(50.0, ge=0.0, le=100.0)
    factors: list[str] = Field(default_factory=list)


class PrioritizeNeedsResponse(BaseModel):
    ranked_needs: list[RankedNeed] = Field(default_factory=list)


# === Resource Allocation ===
class ResourceItem(BaseModel):
    id: str
    type: str = Field(..., description="Resource type e.g. medical_supplies, water_purifier")
    quantity: int = Field(..., gt=0)
    unit: str = "units"
    location: str = ""
    org_id: str = ""


class NeedForAllocation(BaseModel):
    id: str
    title: str
    category: str = "other"
    urgency: str = "medium"
    affected_population: int = 0
    location: str = ""


class AllocateResourcesRequest(BaseModel):
    resources: list[ResourceItem]
    needs: list[NeedForAllocation]
    strategy: AllocationStrategy = AllocationStrategy.GREEDY


class AllocationResult(BaseModel):
    need_id: str
    need_title: str
    resource_id: str
    resource_type: str
    quantity_allocated: int
    unit: str = "units"
    match_score: float
    rationale: str


class ShortageItem(BaseModel):
    need_id: str
    need_title: str
    category: str
    urgency: str
    ideal_resource_type: str
    affected_population: int


class AllocateResourcesResponse(BaseModel):
    allocations: list[AllocationResult] = Field(default_factory=list)
    shortages: list[ShortageItem] = Field(default_factory=list)
    total_needs: int = 0
    met_needs: int = 0
    unmet_needs: int = 0
    utilization_rate: float = 0.0
    summary: str = ""
    recommendations: list[str] = Field(default_factory=list)
    strategy_used: str = "greedy"


# === Shortage Analysis ===
class ShortageAnalysisRequest(BaseModel):
    region: str
    current_resources: dict = Field(default_factory=dict)
    active_needs_count: int = 0
    historical_consumption_rate: str = "unknown"


# === Redistribution ===
class OrgResourceProfile(BaseModel):
    org_name: str
    org_id: str
    region: str = ""
    surplus_resources: list[str] = Field(default_factory=list)
    deficit_resources: list[str] = Field(default_factory=list)


class RedistributionRequest(BaseModel):
    org_profiles: list[OrgResourceProfile]


# === Sentiment Analysis ===
class SentimentRequest(BaseModel):
    text: str = Field(..., description="Text to analyze for sentiment")
    context: str = Field(
        "community_feedback",
        description="One of: community_feedback, ngo_report, volunteer_review, donor_message"
    )


class SentimentResponse(BaseModel):
    sentiment: str = "neutral"
    score: float = Field(0.5, ge=0.0, le=1.0)
    tone: str = "informational"
    confidence: float = Field(0.6, ge=0.0, le=1.0)
    key_drivers: list[str] = Field(default_factory=list)
    language_detected: str = "en"
    summary: str = ""


class BatchSentimentRequest(BaseModel):
    texts: list[str] = Field(..., description="List of texts to analyze")
    context: str = "community_feedback"


class CommunityPulseRequest(BaseModel):
    feedback_texts: list[str]
    region: str = ""


class NeedToneRequest(BaseModel):
    title: str
    description: str


# === User Behavior (Fraud) ===
class UserBehaviorRequest(BaseModel):
    account_age_days: int = 0
    tasks_applied: int = 0
    tasks_completed: int = 0
    duplicate_emails: int = 0
    login_locations: list[str] = Field(default_factory=list)
    reported_count: int = 0


# === What-If Simulation ===
class WhatIfRequest(BaseModel):
    description: str
    current_resources: dict = Field(default_factory=dict)
    proposed_change: str
    region: str = ""
    affected_population: int = 0


# === Health ===
class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "jansetu-ai"
    message: str = "🤖 JanSetu AI Service is running"
