"""
Fraud Detector Service
=======================
Detects anomalies in campaigns, donations, and user behavior using Gemini.
"""

from app.utils.gemini_client import gemini_client


class FraudDetector:
    """Detects fraud patterns and suspicious activity across the platform."""

    async def analyze_campaign(self, campaign_data: dict) -> dict:
        """Check a campaign for fraud indicators."""
        prompt = f"""You are a fraud detection AI for an NGO platform. Analyze this campaign for 
suspicious patterns. Score from 0 (clean) to 100 (definitely fraud).

Campaign: {campaign_data.get('title', '')}
Description: {campaign_data.get('description', '')}
Organization Trust Score: {campaign_data.get('org_trust_score', 50)}/100
Funding Goal: ₹{campaign_data.get('funding_goal', 0)}
Funding Raised: ₹{campaign_data.get('funding_raised', 0)}
Volunteers Needed: {campaign_data.get('volunteers_needed', 0)}
Days Active: {campaign_data.get('days_active', 0)}
Milestones Completed: {campaign_data.get('milestones_completed', 0)}

Red flags to check:
- Unrealistically high funding goals
- Vague descriptions with emotional manipulation
- No milestones completed despite significant funding
- Mismatched category and description
- Very new org with very high goals

Return JSON:
- "risk_score": 0-100 integer
- "risk_level": "low" | "medium" | "high" | "critical"  
- "flags": Array of specific red flags found (strings)
- "recommendation": "approve" | "review" | "suspend"
- "explanation": 1-2 sentence explanation"""

        result = await gemini_client.generate_json(prompt)
        return result or self._rule_based_check(campaign_data)

    async def analyze_donation_pattern(self, donation_data: dict) -> dict:
        """Detect suspicious donation patterns (money laundering, structuring)."""
        prompt = f"""Analyze this donation pattern for anomalies:

Donor Total Donations: {donation_data.get('total_donations', 0)}
Average Amount: ₹{donation_data.get('avg_amount', 0)}
Largest Single: ₹{donation_data.get('max_amount', 0)}
Frequency: {donation_data.get('frequency', 'unknown')}
Anonymous Percentage: {donation_data.get('anonymous_pct', 0)}%
Same-day Donations: {donation_data.get('same_day_count', 0)}

Return JSON:
- "risk_score": 0-100
- "flags": Array of concerns
- "recommendation": "normal" | "monitor" | "freeze"
"""
        result = await gemini_client.generate_json(prompt)
        return result or {"risk_score": 0, "flags": [], "recommendation": "normal"}

    async def analyze_user_behavior(self, user_data: dict) -> dict:
        """Check user behavior for bot/sybil attacks."""
        account_age_days = user_data.get('account_age_days', 0)
        tasks_applied = user_data.get('tasks_applied', 0)
        tasks_completed = user_data.get('tasks_completed', 0)
        
        flags = []
        risk = 0
        
        if account_age_days < 1 and tasks_applied > 5:
            flags.append("New account applying to many tasks rapidly")
            risk += 40
        
        if tasks_applied > 10 and tasks_completed == 0:
            flags.append("Many applications but zero completions — possible bot")
            risk += 30
        
        if user_data.get('duplicate_emails', 0) > 1:
            flags.append("Multiple accounts with similar email patterns")
            risk += 50
        
        return {
            "risk_score": min(risk, 100),
            "risk_level": "critical" if risk >= 70 else "high" if risk >= 50 else "medium" if risk >= 30 else "low",
            "flags": flags,
            "recommendation": "suspend" if risk >= 70 else "review" if risk >= 40 else "normal"
        }

    def _rule_based_check(self, data: dict) -> dict:
        """Fallback rule-based fraud check when AI is unavailable."""
        flags = []
        risk = 0
        
        goal = data.get('funding_goal', 0)
        raised = data.get('funding_raised', 0)
        trust = data.get('org_trust_score', 50)
        milestones = data.get('milestones_completed', 0)
        
        if goal > 1000000 and trust < 40:
            flags.append("Very high funding goal from low-trust organization")
            risk += 35
        
        if raised > goal * 0.5 and milestones == 0:
            flags.append("Significant funding received but no milestones completed")
            risk += 25
        
        if trust < 20:
            flags.append("Organization has very low trust score")
            risk += 20
        
        level = "critical" if risk >= 70 else "high" if risk >= 50 else "medium" if risk >= 30 else "low"
        
        return {
            "risk_score": min(risk, 100),
            "risk_level": level,
            "flags": flags if flags else ["No obvious red flags detected"],
            "recommendation": "suspend" if risk >= 70 else "review" if risk >= 40 else "approve",
            "explanation": f"Rule-based analysis found {len(flags)} potential concerns."
        }


fraud_detector = FraudDetector()
