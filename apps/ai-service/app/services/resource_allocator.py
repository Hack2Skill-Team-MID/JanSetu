"""
Resource Allocator Service
===========================
Intelligently allocates available resources to prioritized community needs.

Algorithm:
  1. Score each resource-need pair using compatibility matrix
  2. Apply greedy matching (highest score first) respecting quantity constraints
  3. Generate shortage report for unmet needs
  4. Use Gemini for allocation narrative and recommendations

Keeps structure consistent with matching_engine.py and priority_scorer.py.
"""

from app.utils.gemini_client import gemini_client


# Category → resource type affinity matrix
# Higher = better match between resource type and need category
CATEGORY_RESOURCE_AFFINITY: dict[str, dict[str, float]] = {
    "healthcare": {
        "medical_supplies": 1.0, "personnel": 0.9, "medicines": 1.0,
        "ambulance": 0.8, "equipment": 0.7, "food": 0.3, "shelter": 0.2,
        "water": 0.2, "funds": 0.6,
    },
    "water": {
        "water_tanker": 1.0, "water_purifier": 1.0, "pipes": 0.9,
        "equipment": 0.7, "funds": 0.5, "personnel": 0.4,
    },
    "food_security": {
        "food": 1.0, "rations": 1.0, "funds": 0.6,
        "personnel": 0.5, "transport": 0.6,
    },
    "shelter": {
        "shelter": 1.0, "tents": 1.0, "blankets": 0.9,
        "construction_materials": 0.8, "funds": 0.6, "personnel": 0.5,
    },
    "education": {
        "books": 1.0, "tablets": 0.9, "personnel": 0.8,
        "funds": 0.6, "stationery": 0.9,
    },
    "sanitation": {
        "sanitation_kits": 1.0, "equipment": 0.8, "personnel": 0.7,
        "construction_materials": 0.7, "funds": 0.5,
    },
    "infrastructure": {
        "construction_materials": 1.0, "equipment": 0.9,
        "personnel": 0.7, "funds": 0.6,
    },
    "employment": {
        "training_materials": 1.0, "funds": 0.8, "personnel": 0.7,
    },
    "environment": {
        "equipment": 0.8, "personnel": 0.7, "funds": 0.6,
    },
}

# Urgency level → priority multiplier
URGENCY_PRIORITY = {
    "critical": 1.0,
    "high": 0.75,
    "medium": 0.5,
    "low": 0.25,
}


class ResourceAllocator:
    """
    Smart resource allocation engine for the JanSetu platform.
    Matches available resources to prioritized community needs.
    """

    async def allocate(self, allocation_request: dict) -> dict:
        """
        Main allocation method.

        Input dict keys:
          - resources: list of {id, type, quantity, unit, location, org_id}
          - needs: list of {id, title, category, urgency, affected_population, location}
          - strategy: "greedy" | "balanced" | "equity" (default: greedy)

        Returns:
          - allocations: list of {need_id, resource_id, quantity, score, rationale}
          - shortages: list of {need_id, title, missing_resource_type}
          - utilization_rate: 0.0-1.0
          - summary: narrative
          - recommendations: list of strings
        """
        resources = allocation_request.get("resources", [])
        needs = allocation_request.get("needs", [])
        strategy = allocation_request.get("strategy", "greedy")

        if not resources or not needs:
            return self._empty_allocation(resources, needs)

        # Sort needs by priority (urgency + population)
        sorted_needs = self._rank_needs(needs)

        # Clone resource quantities (we'll deplete them as we allocate)
        resource_pool = {r["id"]: dict(r) for r in resources}

        allocations = []
        shortages = []

        for need in sorted_needs:
            matched = self._find_best_resource(need, resource_pool, strategy)
            if matched:
                resource_id, qty_allocated, score = matched
                allocations.append({
                    "need_id": need["id"],
                    "need_title": need.get("title", ""),
                    "resource_id": resource_id,
                    "resource_type": resource_pool[resource_id]["type"],
                    "quantity_allocated": qty_allocated,
                    "unit": resource_pool[resource_id].get("unit", "units"),
                    "match_score": round(score * 100, 1),
                    "rationale": self._build_rationale(need, resource_pool[resource_id], score),
                })
                # Deplete resource
                resource_pool[resource_id]["quantity"] -= qty_allocated
                if resource_pool[resource_id]["quantity"] <= 0:
                    del resource_pool[resource_id]
            else:
                # Record shortage
                ideal_type = self._ideal_resource_type(need.get("category", "other"))
                shortages.append({
                    "need_id": need["id"],
                    "need_title": need.get("title", ""),
                    "category": need.get("category", "other"),
                    "urgency": need.get("urgency", "medium"),
                    "ideal_resource_type": ideal_type,
                    "affected_population": need.get("affected_population", 0),
                })

        # Utilization rate
        total_original = sum(r.get("quantity", 0) for r in resources)
        total_remaining = sum(r.get("quantity", 0) for r in resource_pool.values())
        utilization = (total_original - total_remaining) / total_original if total_original > 0 else 0.0

        # Get Gemini narrative or fallback
        narrative = await self._generate_narrative(allocations, shortages, utilization)

        return {
            "allocations": allocations,
            "shortages": shortages,
            "total_needs": len(needs),
            "met_needs": len(allocations),
            "unmet_needs": len(shortages),
            "utilization_rate": round(utilization, 2),
            "summary": narrative.get("summary", self._fallback_summary(allocations, shortages, utilization)),
            "recommendations": narrative.get("recommendations", self._fallback_recommendations(shortages)),
            "strategy_used": strategy,
        }

    async def analyze_shortage(self, resource_data: dict) -> dict:
        """
        Predict resource shortages for the next 30 days based on trends.

        Input: {region, current_resources, active_needs_count, historical_consumption_rate}
        """
        prompt = f"""Analyze resource shortage risk for an NGO platform.

Region: {resource_data.get('region', 'Unknown')}
Current Resources: {resource_data.get('current_resources', {})}
Active Needs Count: {resource_data.get('active_needs_count', 0)}
Historical Consumption Rate: {resource_data.get('historical_consumption_rate', 'unknown')}

Predict resource shortages for the next 30 days. Return JSON:
- "shortage_risk": "low" | "moderate" | "high" | "critical"
- "resources_at_risk": Array of resource types likely to run short
- "days_until_shortage": Dict of resource_type -> estimated days
- "recommended_procurement": Array of {{type, quantity, urgency}}
- "summary": 2-sentence shortage forecast
"""
        result = await gemini_client.generate_json(prompt)
        return result or {
            "shortage_risk": "moderate",
            "resources_at_risk": ["medical_supplies", "water_purifiers"],
            "days_until_shortage": {"medical_supplies": 14, "water_purifiers": 21},
            "recommended_procurement": [
                {"type": "medical_supplies", "quantity": 100, "urgency": "high"},
            ],
            "summary": "Based on current consumption rates, moderate shortages are expected within 3 weeks.",
        }

    async def suggest_redistribution(self, org_resources: list[dict]) -> dict:
        """
        Suggest resource redistribution between NGOs to reduce waste and fill gaps.

        Input: list of {org_name, org_id, surplus_resources, deficit_resources, region}
        """
        if not org_resources:
            return {"suggestions": [], "summary": "No organizations to compare."}

        formatted = "\n".join([
            f"- {o.get('org_name', 'Unknown')} ({o.get('region', '')}): "
            f"Surplus: {o.get('surplus_resources', [])}, "
            f"Deficit: {o.get('deficit_resources', [])}"
            for o in org_resources[:8]
        ])

        prompt = f"""Suggest resource redistribution between these NGOs to maximize impact:

{formatted}

Return JSON:
- "transfers": Array of {{from_org, to_org, resource_type, quantity, reason}}
- "estimated_impact": Description of impact improvement
- "summary": 2-sentence redistribution strategy
"""
        result = await gemini_client.generate_json(prompt)
        return result or {
            "transfers": [],
            "estimated_impact": "Fair redistribution could improve coverage by ~20%.",
            "summary": "Some organizations have resource surpluses that could address deficits elsewhere.",
        }

    # ─────────────────────────────────────────────────────────────────────────
    # Internal Helpers
    # ─────────────────────────────────────────────────────────────────────────

    def _rank_needs(self, needs: list[dict]) -> list[dict]:
        """Sort needs by combined urgency + population score (descending)."""
        def priority_key(n):
            urgency_val = URGENCY_PRIORITY.get(n.get("urgency", "medium"), 0.5)
            pop = n.get("affected_population", 0) or 0
            pop_score = min(pop / 10000, 1.0)
            return urgency_val * 0.6 + pop_score * 0.4

        return sorted(needs, key=priority_key, reverse=True)

    def _find_best_resource(
        self, need: dict, pool: dict, strategy: str
    ) -> tuple[str, int, float] | None:
        """
        Find the best available resource for a need.
        Returns (resource_id, quantity_to_allocate, match_score) or None.
        """
        category = need.get("category", "other")
        affinity_map = CATEGORY_RESOURCE_AFFINITY.get(category, {})

        best_id = None
        best_score = -1.0

        for rid, resource in pool.items():
            if resource.get("quantity", 0) <= 0:
                continue

            rtype = resource.get("type", "").lower()
            affinity = affinity_map.get(rtype, 0.1)

            # Location bonus
            location_match = self._location_affinity(
                need.get("location", ""), resource.get("location", "")
            )

            score = affinity * 0.7 + location_match * 0.3

            if strategy == "equity":
                # Prefer resources that haven't been used yet
                score *= (1 + (1 - resource.get("utilization_rate", 0.5)) * 0.2)

            if score > best_score:
                best_score = score
                best_id = rid

        if best_id and best_score >= 0.1:
            resource = pool[best_id]
            qty_needed = max(1, need.get("affected_population", 10) // 100)
            qty_available = resource.get("quantity", 0)
            qty_allocate = min(qty_needed, qty_available)
            return best_id, qty_allocate, best_score

        return None

    def _location_affinity(self, need_loc: str, resource_loc: str) -> float:
        """Simple text-based location proximity score."""
        if not need_loc or not resource_loc:
            return 0.5
        nl = need_loc.lower()
        rl = resource_loc.lower()
        if nl == rl:
            return 1.0
        # Check for city/state overlap
        need_parts = set(nl.split(","))
        resource_parts = set(rl.split(","))
        overlap = need_parts & resource_parts
        if overlap:
            return 0.8
        return 0.3

    def _ideal_resource_type(self, category: str) -> str:
        """Return the most important resource type for a category."""
        ideals = {
            "healthcare": "medical_supplies",
            "water": "water_purifier",
            "food_security": "food",
            "shelter": "tents",
            "education": "books",
            "sanitation": "sanitation_kits",
            "infrastructure": "construction_materials",
            "employment": "training_materials",
        }
        return ideals.get(category, "funds")

    def _build_rationale(self, need: dict, resource: dict, score: float) -> str:
        """Generate a human-readable allocation rationale."""
        return (
            f"{resource.get('type', 'Resource').replace('_', ' ').title()} allocated to "
            f"'{need.get('title', 'need')}' (match score: {score * 100:.0f}%). "
            f"Addresses {need.get('category', 'community')} need with "
            f"{need.get('urgency', 'medium')} urgency."
        )

    async def _generate_narrative(
        self, allocations: list, shortages: list, utilization: float
    ) -> dict:
        """Use Gemini to generate allocation narrative and recommendations."""
        if not allocations and not shortages:
            return {}

        prompt = f"""Summarize this resource allocation for an NGO dashboard:

Successful Allocations: {len(allocations)}
Unmet Needs (Shortages): {len(shortages)}
Resource Utilization: {utilization * 100:.0f}%
Shortage Categories: {list(set(s['category'] for s in shortages[:5]))}

Return JSON:
- "summary": 2-sentence allocation summary
- "recommendations": Array of 3 specific action items to address shortages
"""
        return await gemini_client.generate_json(prompt) or {}

    def _fallback_summary(self, allocations, shortages, utilization) -> str:
        return (
            f"Allocated resources to {len(allocations)} needs with {utilization * 100:.0f}% "
            f"utilization rate. {len(shortages)} needs remain unmet due to resource gaps."
        )

    def _fallback_recommendations(self, shortages: list) -> list[str]:
        if not shortages:
            return ["All current needs are met. Continue monitoring for new needs."]
        categories = list(set(s.get("category", "other") for s in shortages))
        return [
            f"Procure additional resources for {categories[0] if categories else 'unmet'} needs",
            "Consider inter-NGO resource sharing to bridge shortages",
            "Escalate critical unmet needs to platform administrators",
        ]

    def _empty_allocation(self, resources, needs) -> dict:
        return {
            "allocations": [],
            "shortages": [],
            "total_needs": len(needs),
            "met_needs": 0,
            "unmet_needs": len(needs),
            "utilization_rate": 0.0,
            "summary": "No resources or needs provided for allocation.",
            "recommendations": ["Add available resources and community needs to begin allocation."],
            "strategy_used": "none",
        }


# Singleton
resource_allocator = ResourceAllocator()
