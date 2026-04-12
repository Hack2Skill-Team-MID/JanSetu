"""
Volunteer Matching Engine
=========================
Matches volunteers to tasks based on skills, location, and availability.
Uses a weighted scoring algorithm with configurable weights.
"""

import math
from app.models.schemas import (
    MatchVolunteersRequest,
    MatchVolunteersResponse,
    VolunteerMatchResult,
    TaskForMatching,
    VolunteerForMatching,
)


class MatchingEngine:
    """Smart volunteer-task matching using multi-factor scoring."""

    # Scoring weights (must sum to 1.0)
    SKILL_WEIGHT = 0.45
    LOCATION_WEIGHT = 0.30
    AVAILABILITY_WEIGHT = 0.25

    # Availability scoring (higher = better for task completion)
    AVAILABILITY_SCORES = {
        "full-time": 1.0,
        "part-time": 0.7,
        "weekends": 0.5,
        "evenings": 0.4,
    }

    async def match(self, request: MatchVolunteersRequest) -> MatchVolunteersResponse:
        """Match volunteers to a task using multi-factor scoring."""
        matches = []

        for volunteer in request.volunteers:
            score, reasons = self._calculate_match_score(request.task, volunteer)
            matches.append(
                VolunteerMatchResult(
                    volunteer_id=volunteer.id,
                    score=round(score, 1),
                    reasons=reasons,
                )
            )

        # Sort by score descending
        matches.sort(key=lambda m: m.score, reverse=True)

        return MatchVolunteersResponse(matches=matches)

    def _calculate_match_score(
        self, task: TaskForMatching, volunteer: VolunteerForMatching
    ) -> tuple[float, list[str]]:
        """Calculate a 0-100 match score with explanations."""
        reasons = []

        # 1. Skill match (0-100)
        skill_score = self._skill_score(task.required_skills, volunteer.skills)
        if skill_score > 80:
            reasons.append(f"Strong skill match ({skill_score:.0f}%)")
        elif skill_score > 50:
            reasons.append(f"Partial skill match ({skill_score:.0f}%)")
        elif skill_score > 0:
            reasons.append(f"Some relevant skills ({skill_score:.0f}%)")
        else:
            reasons.append("No specific skill match — general volunteer")

        # 2. Location proximity (0-100)
        location_score = self._location_score(
            task.coordinates, volunteer.coordinates, task.location, volunteer.location
        )
        if location_score > 80:
            reasons.append(f"Located nearby ({location_score:.0f}% proximity)")
        elif location_score > 50:
            reasons.append(f"Moderate distance ({location_score:.0f}% proximity)")
        elif location_score > 0:
            reasons.append(f"Far from task location ({location_score:.0f}% proximity)")

        # 3. Availability (0-100)
        avail_score = self.AVAILABILITY_SCORES.get(volunteer.availability, 0.3) * 100
        reasons.append(f"Availability: {volunteer.availability} ({avail_score:.0f}%)")

        # Weighted total
        total = (
            skill_score * self.SKILL_WEIGHT
            + location_score * self.LOCATION_WEIGHT
            + avail_score * self.AVAILABILITY_WEIGHT
        )

        return total, reasons

    def _skill_score(self, required: list[str], volunteer_skills: list[str]) -> float:
        """Calculate skill overlap score."""
        if not required:
            # No specific skills required = everyone matches at 60%
            return 60.0

        if not volunteer_skills:
            return 10.0  # Base score for willingness to help

        # Case-insensitive matching
        required_lower = {s.lower() for s in required}
        volunteer_lower = {s.lower() for s in volunteer_skills}

        overlap = required_lower & volunteer_lower
        if not overlap:
            # Check for partial matches (e.g., "First Aid" matches "medical")
            partial_matches = 0
            skill_synonyms = {
                "medical": {"first aid", "health", "nursing", "doctor"},
                "teaching": {"education", "tutoring", "training"},
                "construction": {"building", "engineering", "infrastructure"},
                "it support": {"computer", "tech", "software"},
                "cooking": {"food", "nutrition", "catering"},
            }
            for req in required_lower:
                for group_key, synonyms in skill_synonyms.items():
                    if req in synonyms or req == group_key:
                        if volunteer_lower & (synonyms | {group_key}):
                            partial_matches += 1
                            break

            if partial_matches > 0:
                return min(40.0 + (partial_matches / len(required)) * 30, 60.0)
            return 10.0

        return min((len(overlap) / len(required_lower)) * 100, 100.0)

    def _location_score(
        self,
        task_coords: tuple[float, float],
        vol_coords: tuple[float, float],
        task_location: str,
        vol_location: str,
    ) -> float:
        """Calculate location proximity score based on distance."""
        # If no valid coordinates, try text match
        if task_coords == (0.0, 0.0) or vol_coords == (0.0, 0.0):
            # Fallback: text-based location match
            if task_location.lower() == vol_location.lower():
                return 90.0
            elif vol_location.lower() in task_location.lower():
                return 70.0
            return 40.0  # Unknown distance

        # Calculate haversine distance (km)
        distance_km = self._haversine(task_coords, vol_coords)

        # Score based on distance (closer = better)
        if distance_km < 5:
            return 100.0
        elif distance_km < 10:
            return 90.0
        elif distance_km < 25:
            return 75.0
        elif distance_km < 50:
            return 60.0
        elif distance_km < 100:
            return 40.0
        elif distance_km < 250:
            return 20.0
        else:
            return 10.0

    def _haversine(
        self, coord1: tuple[float, float], coord2: tuple[float, float]
    ) -> float:
        """Calculate distance between two [lng, lat] coordinates in km."""
        R = 6371  # Earth's radius in km

        lng1, lat1 = math.radians(coord1[0]), math.radians(coord1[1])
        lng2, lat2 = math.radians(coord2[0]), math.radians(coord2[1])

        dlat = lat2 - lat1
        dlng = lng2 - lng1

        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
        )
        c = 2 * math.asin(math.sqrt(a))

        return R * c


# Singleton
matching_engine = MatchingEngine()
