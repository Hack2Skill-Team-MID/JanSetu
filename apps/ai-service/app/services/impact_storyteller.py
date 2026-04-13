"""
Impact Storyteller Service
===========================
Generates AI-powered impact reports for campaigns and NGOs using Gemini.
"""

from app.utils.gemini_client import gemini_client


class ImpactStoryteller:
    """Generates human-readable impact narratives from campaign data."""

    async def generate_campaign_report(self, campaign_data: dict) -> dict:
        """Generate an impact report for a specific campaign."""
        prompt = f"""You are an impact report writer for an NGO platform. Generate a compelling, 
data-driven impact report based on this campaign data. Be specific with numbers. Write in a warm, 
professional tone that would inspire donors.

Campaign: {campaign_data.get('title', 'Untitled')}
Description: {campaign_data.get('description', '')}
Category: {campaign_data.get('category', '')}
Location: {campaign_data.get('location', '')}
Volunteers Joined: {campaign_data.get('volunteers_joined', 0)}/{campaign_data.get('volunteers_needed', 0)}
Funding Raised: ₹{campaign_data.get('funding_raised', 0)}/{campaign_data.get('funding_goal', 0)}
People Helped: {campaign_data.get('people_helped', 0)}/{campaign_data.get('people_to_help', 0)}
Milestones Completed: {campaign_data.get('milestones_completed', 0)}/{campaign_data.get('milestones_total', 0)}

Return a JSON object with:
- "summary": A 2-3 sentence impact summary
- "story": A 150-word narrative impact story
- "highlights": Array of 3-4 key achievements (strings)
- "next_steps": What needs to happen next (1-2 sentences)
- "donor_message": A personalized thank you message for donors (1-2 sentences)"""

        result = await gemini_client.generate_json(prompt)
        
        if not result:
            return self._fallback_report(campaign_data)
        
        return result

    async def generate_ngo_annual_report(self, org_data: dict) -> dict:
        """Generate an annual summary for an NGO."""
        prompt = f"""Generate a brief NGO annual impact summary from this data.

Organization: {org_data.get('name', '')}
Total Campaigns: {org_data.get('total_campaigns', 0)}
Active Campaigns: {org_data.get('active_campaigns', 0)}
Total Volunteers: {org_data.get('total_volunteers', 0)}
Donations Received: ₹{org_data.get('total_donations', 0)}
People Helped: {org_data.get('people_helped', 0)}
Trust Score: {org_data.get('trust_score', 0)}/100
Region: {org_data.get('region', '')}

Return JSON:
- "annual_summary": 3-4 sentence overview
- "key_metrics": Array of objects with "label" and "value" 
- "impact_story": 100-word narrative
- "growth_areas": Array of 2-3 improvement suggestions"""

        result = await gemini_client.generate_json(prompt)
        return result or self._fallback_ngo_report(org_data)

    async def generate_donor_impact(self, donor_data: dict) -> dict:
        """Generate personalized impact report for a donor."""
        prompt = f"""Create a personalized donor impact report.

Donor: {donor_data.get('name', 'Anonymous')}
Total Donated: ₹{donor_data.get('total_donated', 0)}
Organizations Supported: {donor_data.get('orgs_supported', 0)}
Campaigns Funded: {donor_data.get('campaigns_funded', 0)}

Return JSON:
- "thank_you": Personalized thank you (2 sentences)
- "impact_summary": What their money achieved (2-3 sentences)
- "lives_touched": Estimated number
- "equivalence": A relatable comparison (e.g., "enough to provide clean water for 50 families for a month")"""

        result = await gemini_client.generate_json(prompt)
        return result or {
            "thank_you": f"Thank you for your generous contribution of ₹{donor_data.get('total_donated', 0)}.",
            "impact_summary": f"Your donations have supported {donor_data.get('campaigns_funded', 0)} campaigns across {donor_data.get('orgs_supported', 0)} organizations.",
            "lives_touched": donor_data.get('total_donated', 0) // 100,
            "equivalence": "Your contribution makes a meaningful difference in communities across India."
        }

    def _fallback_report(self, data: dict) -> dict:
        funded = data.get('funding_raised', 0)
        helped = data.get('people_helped', 0)
        return {
            "summary": f"Campaign '{data.get('title')}' has raised ₹{funded:,} and helped {helped} people so far.",
            "story": f"Through the dedicated efforts of {data.get('volunteers_joined', 0)} volunteers, this campaign has made significant progress in {data.get('location', 'the community')}.",
            "highlights": [
                f"₹{funded:,} raised toward goal",
                f"{helped} people directly helped",
                f"{data.get('volunteers_joined', 0)} volunteers mobilized",
                f"{data.get('milestones_completed', 0)} milestones achieved"
            ],
            "next_steps": "Continue fundraising and volunteer recruitment to reach full impact goals.",
            "donor_message": "Every rupee you contribute directly reaches communities in need. Thank you."
        }

    def _fallback_ngo_report(self, data: dict) -> dict:
        return {
            "annual_summary": f"{data.get('name')} has run {data.get('total_campaigns', 0)} campaigns, mobilized {data.get('total_volunteers', 0)} volunteers, and helped {data.get('people_helped', 0)} people.",
            "key_metrics": [
                {"label": "Campaigns", "value": str(data.get('total_campaigns', 0))},
                {"label": "Volunteers", "value": str(data.get('total_volunteers', 0))},
                {"label": "People Helped", "value": str(data.get('people_helped', 0))},
                {"label": "Trust Score", "value": f"{data.get('trust_score', 0)}/100"},
            ],
            "impact_story": f"Operating in {data.get('region', 'India')}, {data.get('name')} continues to make a difference.",
            "growth_areas": ["Expand volunteer base", "Increase campaign frequency", "Improve donor engagement"]
        }


impact_storyteller = ImpactStoryteller()
