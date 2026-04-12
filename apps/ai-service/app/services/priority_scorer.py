"""
Priority Scorer Service
=======================
Scores and ranks community needs by priority using multiple factors:
- Urgency level
- Affected population
- Age of report (older = potentially more urgent)
- Category severity weights
"""

from datetime import datetime, timezone
from app.models.schemas import (
    PrioritizeNeedsRequest,
    PrioritizeNeedsResponse,
    RankedNeed,
)


class PriorityScorer:
    """Ranks community needs by calculated priority score."""

    # Category severity weights (some categories are inherently more urgent)
    CATEGORY_WEIGHTS = {
        "healthcare": 0.95,
        "water": 0.90,
        "food_security": 0.90,
        "safety": 0.85,
        "sanitation": 0.75,
        "education": 0.65,
        "infrastructure": 0.60,
        "employment": 0.55,
        "environment": 0.50,
        "other": 0.40,
    }

    # Urgency level multipliers
    URGENCY_MULTIPLIERS = {
        "critical": 1.0,
        "high": 0.75,
        "medium": 0.50,
        "low": 0.25,
    }

    async def prioritize(self, request: PrioritizeNeedsRequest) -> PrioritizeNeedsResponse:
        """Score and rank needs by priority."""
        ranked = []

        for need in request.needs:
            score, factors = self._calculate_priority(need)
            ranked.append(
                RankedNeed(
                    need_id=need.id,
                    priority_score=round(score, 1),
                    factors=factors,
                )
            )

        # Sort by priority (highest first)
        ranked.sort(key=lambda r: r.priority_score, reverse=True)

        return PrioritizeNeedsResponse(ranked_needs=ranked)

    def _calculate_priority(self, need) -> tuple[float, list[str]]:
        """Calculate priority score (0-100) with explanation."""
        factors = []
        scores = []

        # 1. Category severity (0-100, weight: 25%)
        cat_weight = self.CATEGORY_WEIGHTS.get(need.category.lower(), 0.40)
        cat_score = cat_weight * 100
        scores.append(("category", cat_score, 0.25))
        factors.append(f"Category '{need.category}': severity {cat_score:.0f}/100")

        # 2. Urgency level (0-100, weight: 35%)
        # Try to detect urgency from title/description keywords
        urgency = self._detect_urgency(need.title, need.description)
        urg_mult = self.URGENCY_MULTIPLIERS.get(urgency, 0.50)
        urg_score = urg_mult * 100
        scores.append(("urgency", urg_score, 0.35))
        factors.append(f"Urgency '{urgency}': score {urg_score:.0f}/100")

        # 3. Affected population (0-100, weight: 20%)
        pop_score = self._population_score(need.affected_population)
        scores.append(("population", pop_score, 0.20))
        if need.affected_population:
            factors.append(
                f"Affected population: {need.affected_population} → score {pop_score:.0f}/100"
            )
        else:
            factors.append(f"Population unknown → default score {pop_score:.0f}/100")

        # 4. Report age / staleness (0-100, weight: 20%)
        age_score = self._age_score(need.reported_at)
        scores.append(("age", age_score, 0.20))
        factors.append(f"Report age factor: {age_score:.0f}/100")

        # Weighted total
        total = sum(score * weight for _, score, weight in scores)
        total = min(max(total, 0), 100)

        return total, factors

    def _detect_urgency(self, title: str, description: str) -> str:
        """Detect urgency level from text content."""
        text = f"{title} {description}".lower()

        critical_keywords = [
            "emergency", "critical", "dying", "death", "life-threatening",
            "outbreak", "flood", "earthquake", "collapse", "starvation",
        ]
        high_keywords = [
            "urgent", "severe", "dangerous", "alarming", "crisis",
            "shortage", "contaminated", "broken", "failing",
        ]
        low_keywords = [
            "minor", "slight", "future", "planning", "would be nice",
            "improvement", "cosmetic",
        ]

        if any(kw in text for kw in critical_keywords):
            return "critical"
        elif any(kw in text for kw in high_keywords):
            return "high"
        elif any(kw in text for kw in low_keywords):
            return "low"
        return "medium"

    def _population_score(self, population: int | None) -> float:
        """Score based on affected population size."""
        if not population or population <= 0:
            return 40.0  # Default for unknown

        if population >= 10000:
            return 100.0
        elif population >= 5000:
            return 90.0
        elif population >= 1000:
            return 80.0
        elif population >= 500:
            return 70.0
        elif population >= 100:
            return 55.0
        elif population >= 50:
            return 40.0
        else:
            return 30.0

    def _age_score(self, reported_at: str) -> float:
        """Score based on how old the report is (older unresolved = higher priority)."""
        if not reported_at:
            return 50.0

        try:
            report_time = datetime.fromisoformat(reported_at.replace("Z", "+00:00"))
            now = datetime.now(timezone.utc)
            age_days = (now - report_time).days

            if age_days > 90:
                return 95.0  # Very old unresolved issue
            elif age_days > 30:
                return 80.0
            elif age_days > 14:
                return 65.0
            elif age_days > 7:
                return 55.0
            elif age_days > 3:
                return 45.0
            else:
                return 35.0  # Recently reported
        except (ValueError, TypeError):
            return 50.0


# Singleton
priority_scorer = PriorityScorer()
