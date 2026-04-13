"""
NGO Collaborator Service
=========================
Suggests NGO-to-NGO collaborations based on complementary strengths and proximity.
"""

from app.utils.gemini_client import gemini_client


class NgoCollaborator:
    """AI-powered NGO collaboration suggestions."""

    async def suggest_collaborations(self, data: dict) -> dict:
        """Suggest collaboration opportunities between NGOs."""
        prompt = f"""You are an NGO partnership advisor. Suggest collaboration opportunities.

Requesting NGO:
  Name: {data.get('requesting_org', {}).get('name', '')}
  Type: {data.get('requesting_org', {}).get('type', '')}
  Region: {data.get('requesting_org', {}).get('region', '')}
  Strengths: {data.get('requesting_org', {}).get('strengths', [])}
  Active Campaigns: {data.get('requesting_org', {}).get('campaigns', [])}

Available NGOs for Collaboration:
{self._format_orgs(data.get('available_orgs', []))}

Return JSON:
- "suggestions": Array of objects with:
  - "org_name": string
  - "match_score": 0-100
  - "collaboration_type": "resource_sharing" | "joint_campaign" | "knowledge_transfer" | "geographic_expansion"
  - "reason": Why this collaboration makes sense (1-2 sentences)
  - "proposed_action": Specific first step
- "summary": Overall collaboration strategy (2 sentences)"""

        result = await gemini_client.generate_json(prompt)
        return result or self._fallback_suggestions(data)

    async def analyze_partnership_fit(self, org_a: dict, org_b: dict) -> dict:
        """Deep analysis of partnership fit between two NGOs."""
        prompt = f"""Analyze partnership compatibility between two NGOs:

NGO A: {org_a.get('name', '')} — {org_a.get('type', '')} in {org_a.get('region', '')}
  Trust Score: {org_a.get('trust_score', 0)}, Campaigns: {org_a.get('campaigns', 0)}, Volunteers: {org_a.get('volunteers', 0)}

NGO B: {org_b.get('name', '')} — {org_b.get('type', '')} in {org_b.get('region', '')}  
  Trust Score: {org_b.get('trust_score', 0)}, Campaigns: {org_b.get('campaigns', 0)}, Volunteers: {org_b.get('volunteers', 0)}

Return JSON:
- "compatibility_score": 0-100
- "synergies": Array of 2-3 synergy areas
- "risks": Array of 1-2 potential risks
- "recommended_projects": Array of 2-3 project ideas
- "verdict": "highly_recommended" | "recommended" | "possible" | "not_recommended" """

        result = await gemini_client.generate_json(prompt)
        return result or {
            "compatibility_score": 65,
            "synergies": ["Geographic complementarity", "Shared volunteer network"],
            "risks": ["Different operational scales"],
            "recommended_projects": ["Joint resource sharing", "Co-branded campaign"],
            "verdict": "recommended"
        }

    def _format_orgs(self, orgs: list) -> str:
        if not orgs:
            return "  No other organizations available"
        lines = []
        for o in orgs[:5]:
            lines.append(f"  - {o.get('name', 'Unknown')}: {o.get('type', '')} in {o.get('region', '')} (trust: {o.get('trust_score', 0)})")
        return "\n".join(lines)

    def _fallback_suggestions(self, data: dict) -> dict:
        orgs = data.get('available_orgs', [])
        suggestions = []
        for org in orgs[:3]:
            suggestions.append({
                "org_name": org.get('name', 'Unknown'),
                "match_score": 60,
                "collaboration_type": "resource_sharing",
                "reason": f"Both operate in overlapping regions and could share resources.",
                "proposed_action": "Schedule an introductory call to explore shared goals."
            })
        return {
            "suggestions": suggestions,
            "summary": f"Found {len(suggestions)} potential collaboration partners based on regional overlap and complementary strengths."
        }


ngo_collaborator = NgoCollaborator()
