"""
Gemini API Client Wrapper
=========================
Uses Google Generative AI SDK to call Gemini for NLP tasks.
Falls back to rule-based processing if API key is missing.
"""

import os
import json
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# Try to import google-generativeai
try:
    import google.generativeai as genai

    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


class GeminiClient:
    """Wrapper around Google Gemini API for NLP tasks."""

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        self.is_configured = False

        if self.api_key and GEMINI_AVAILABLE:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel(self.model_name)
                self.is_configured = True
                print(f"✅ Gemini configured with model: {self.model_name}")
            except Exception as e:
                print(f"⚠️ Gemini setup failed: {e}")
        else:
            reason = "no API key" if not self.api_key else "SDK not installed"
            print(f"⚠️ Gemini not configured ({reason}) — using fallback processing")

    async def generate(self, prompt: str) -> Optional[str]:
        """Generate text from a prompt. Returns None if Gemini is unavailable."""
        if not self.is_configured:
            return None

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"❌ Gemini generation error: {e}")
            return None

    async def generate_json(self, prompt: str) -> Optional[dict]:
        """Generate JSON from a prompt — auto-parses the response."""
        result = await self.generate(prompt)
        if not result:
            return None
        try:
            cleaned = result.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1]
            if cleaned.endswith("```"):
                cleaned = cleaned.rsplit("```", 1)[0]
            cleaned = cleaned.strip()
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()
            return json.loads(cleaned)
        except (json.JSONDecodeError, Exception) as e:
            print(f"⚠️ Failed to parse Gemini JSON: {e}")
            return None

    async def extract_needs_from_text(self, text: str) -> dict:
        """
        Use Gemini to extract community needs from raw survey/report text.
        Returns structured data with extracted needs.
        """
        prompt = f"""You are an AI assistant for JanSetu, a community resource allocation platform in India.

Analyze the following survey/report text and extract community needs.

For each need, provide:
- title: A short descriptive title (max 100 chars)
- description: Detailed description of the need
- category: One of: education, healthcare, sanitation, infrastructure, food_security, water, employment, safety, environment, other
- urgency: One of: critical, high, medium, low
- location: The location mentioned, or "Unknown"

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{{
  "needs": [
    {{"title": "...", "description": "...", "category": "...", "urgency": "...", "location": "..."}}
  ],
  "summary": "Brief summary of the overall situation",
  "confidence": 0.85
}}

TEXT TO ANALYZE:
{text}
"""
        result = await self.generate(prompt)

        if result:
            try:
                # Clean up response (remove markdown code blocks if present)
                cleaned = result.strip()
                if cleaned.startswith("```"):
                    cleaned = cleaned.split("\n", 1)[1]
                if cleaned.endswith("```"):
                    cleaned = cleaned.rsplit("```", 1)[0]
                cleaned = cleaned.strip()
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:].strip()

                return json.loads(cleaned)
            except json.JSONDecodeError:
                print(f"⚠️ Failed to parse Gemini response as JSON")

        # Fallback: basic keyword extraction
        return self._fallback_extract(text)

    async def analyze_insights(self, text: str) -> dict:
        """Use Gemini to extract insights from text."""
        prompt = f"""Analyze the following community report text and provide insights.

Return ONLY a valid JSON object (no markdown):
{{
  "summary": "Brief summary of key findings",
  "categories": ["category1", "category2"],
  "urgency_score": 0.7,
  "key_issues": ["issue1", "issue2", "issue3"]
}}

Categories must be from: education, healthcare, sanitation, infrastructure, food_security, water, employment, safety, environment, other
Urgency score: 0.0 (low) to 1.0 (critical)

TEXT:
{text}
"""
        result = await self.generate(prompt)

        if result:
            try:
                cleaned = result.strip()
                if cleaned.startswith("```"):
                    cleaned = cleaned.split("\n", 1)[1]
                if cleaned.endswith("```"):
                    cleaned = cleaned.rsplit("```", 1)[0]
                cleaned = cleaned.strip()
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:].strip()

                return json.loads(cleaned)
            except json.JSONDecodeError:
                pass

        return self._fallback_insights(text)

    def _fallback_extract(self, text: str) -> dict:
        """Rule-based fallback when Gemini is unavailable."""
        text_lower = text.lower()

        # Simple keyword-based category detection
        category_keywords = {
            "education": ["school", "education", "teacher", "student", "classroom", "learning"],
            "healthcare": ["hospital", "health", "doctor", "medicine", "disease", "clinic", "medical"],
            "sanitation": ["toilet", "sanitation", "sewage", "drainage", "waste", "garbage"],
            "infrastructure": ["road", "bridge", "building", "infrastructure", "construct"],
            "food_security": ["food", "hunger", "nutrition", "meal", "ration", "starving"],
            "water": ["water", "drinking", "well", "bore", "supply", "tap", "purif"],
            "employment": ["job", "employment", "work", "livelihood", "income", "skill training"],
            "safety": ["safety", "crime", "violence", "security", "police", "danger"],
            "environment": ["pollution", "environment", "forest", "air quality", "waste disposal"],
        }

        detected_category = "other"
        for cat, keywords in category_keywords.items():
            if any(kw in text_lower for kw in keywords):
                detected_category = cat
                break

        # Urgency detection
        urgency = "medium"
        if any(w in text_lower for w in ["urgent", "critical", "emergency", "immediate", "dying", "crisis"]):
            urgency = "critical"
        elif any(w in text_lower for w in ["serious", "severe", "alarming", "dangerous"]):
            urgency = "high"
        elif any(w in text_lower for w in ["minor", "small", "slight", "future"]):
            urgency = "low"

        # Create a need from the text
        title = text[:100].strip().replace("\n", " ")
        if len(text) > 100:
            title = title[:97] + "..."

        return {
            "needs": [
                {
                    "title": title,
                    "description": text[:500],
                    "category": detected_category,
                    "urgency": urgency,
                    "location": "Unknown",
                }
            ],
            "summary": f"Extracted 1 need (category: {detected_category}, urgency: {urgency}). AI service fallback mode.",
            "confidence": 0.4,
        }

    def _fallback_insights(self, text: str) -> dict:
        """Fallback insights extraction."""
        text_lower = text.lower()

        categories = []
        category_keywords = {
            "education": ["school", "education", "teacher"],
            "healthcare": ["hospital", "health", "doctor", "medicine"],
            "water": ["water", "drinking", "supply"],
            "sanitation": ["sanitation", "sewage", "waste"],
            "food_security": ["food", "hunger", "nutrition"],
        }

        for cat, keywords in category_keywords.items():
            if any(kw in text_lower for kw in keywords):
                categories.append(cat)

        urgency = 0.5
        if any(w in text_lower for w in ["urgent", "critical", "emergency"]):
            urgency = 0.9
        elif any(w in text_lower for w in ["serious", "severe"]):
            urgency = 0.7

        # Extract sentences as key issues
        sentences = [s.strip() for s in text.split(".") if len(s.strip()) > 20]
        key_issues = sentences[:5]

        return {
            "summary": f"Text analysis complete. Found {len(categories)} categories. Fallback mode.",
            "categories": categories or ["other"],
            "urgency_score": urgency,
            "key_issues": key_issues,
        }


# Singleton instance
gemini_client = GeminiClient()
