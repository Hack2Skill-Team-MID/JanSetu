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


# === Health ===
class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "jansetu-ai"
    message: str = "🤖 JanSetu AI Service is running"
