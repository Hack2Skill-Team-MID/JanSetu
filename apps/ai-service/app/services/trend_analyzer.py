"""
Trend Analyzer Service
=======================
Analyzes regional trends, predicts crisis patterns, and provides what-if simulations.
"""

from app.utils.gemini_client import gemini_client


class TrendAnalyzer:
    """Analyzes community data for trends and predictions."""

    async def analyze_regional_trends(self, region_data: dict) -> dict:
        """Analyze trends for a specific region."""
        prompt = f"""You are a social impact analyst. Analyze the following community data and identify trends.

Region: {region_data.get('region', 'Unknown')}
Active Needs by Category:
{self._format_categories(region_data.get('needs_by_category', {}))}
Total Needs: {region_data.get('total_needs', 0)}
Resolved Rate: {region_data.get('resolved_rate', 0)}%
Active Campaigns: {region_data.get('active_campaigns', 0)}
Volunteer Density: {region_data.get('volunteer_density', 'unknown')}

Return JSON:
- "trend_summary": 2-3 sentence trend analysis
- "rising_categories": Array of categories that are increasing
- "declining_categories": Array of categories that are decreasing
- "predicted_needs": Array of 2-3 predicted upcoming needs
- "risk_level": "low" | "moderate" | "elevated" | "critical"
- "recommendation": 2-3 specific action recommendations"""

        result = await gemini_client.generate_json(prompt)
        return result or self._fallback_trends(region_data)

    async def predict_crisis(self, data: dict) -> dict:
        """Predict potential crises based on current patterns."""
        prompt = f"""Based on community data, predict potential crises:

Region: {data.get('region', '')}
Season: {data.get('season', 'unknown')}
Recent Needs Spike Categories: {data.get('spike_categories', [])}
Historical Disaster Patterns: {data.get('history', 'none recorded')}
Current Water Level: {data.get('water_level', 'normal')}
Healthcare Access Score: {data.get('healthcare_score', 50)}/100

Return JSON:
- "crisis_probability": 0-100
- "predicted_crises": Array of objects with "type", "probability", "timeframe", "affected_population"
- "preventive_actions": Array of recommended actions
- "resource_requirements": Array of resources needed"""

        result = await gemini_client.generate_json(prompt)
        return result or {
            "crisis_probability": 30,
            "predicted_crises": [],
            "preventive_actions": ["Monitor water levels", "Pre-position medical supplies"],
            "resource_requirements": ["Emergency shelters", "Clean water supply"]
        }

    async def what_if_simulation(self, scenario: dict) -> dict:
        """Run a what-if simulation for resource allocation decisions."""
        prompt = f"""Run a what-if analysis for this NGO scenario:

Scenario: {scenario.get('description', '')}
Current Resources: {scenario.get('current_resources', {})}
Proposed Change: {scenario.get('proposed_change', '')}
Region: {scenario.get('region', '')}
Affected Population: {scenario.get('affected_population', 0)}

Return JSON:
- "baseline_outcome": What happens without change (2 sentences)
- "proposed_outcome": What happens with the change (2 sentences)
- "impact_improvement": Percentage improvement estimate
- "risks": Array of potential risks
- "recommendation": "proceed" | "modify" | "reconsider" """

        result = await gemini_client.generate_json(prompt)
        return result or {
            "baseline_outcome": "Current trajectory continues with existing resource allocation.",
            "proposed_outcome": "The proposed change could improve outcomes for the affected population.",
            "impact_improvement": 15,
            "risks": ["Resource reallocation may affect other programs"],
            "recommendation": "proceed"
        }

    def _format_categories(self, cats: dict) -> str:
        if not cats:
            return "  No data available"
        return "\n".join([f"  - {k}: {v}" for k, v in cats.items()])

    def _fallback_trends(self, data: dict) -> dict:
        return {
            "trend_summary": f"Region {data.get('region', 'Unknown')} has {data.get('total_needs', 0)} active needs with a {data.get('resolved_rate', 0)}% resolution rate.",
            "rising_categories": ["water", "healthcare"],
            "declining_categories": ["education"],
            "predicted_needs": ["Seasonal health issues may increase", "Water scarcity during summer months"],
            "risk_level": "moderate",
            "recommendation": "Focus resources on water and healthcare for the upcoming season."
        }


trend_analyzer = TrendAnalyzer()
