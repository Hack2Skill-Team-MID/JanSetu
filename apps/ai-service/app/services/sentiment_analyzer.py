"""
Sentiment Analyzer Service
===========================
Analyzes community feedback, survey responses, and field reports for:
  - Sentiment classification (positive / negative / neutral)
  - Emotional tone (frustration, hope, urgency, despair)
  - Key sentiment drivers
  - Multi-language awareness (English + Hindi keywords)

Uses Gemini when available, falls back to rule-based scoring.
"""

from app.utils.gemini_client import gemini_client


# Hindi / Hinglish keywords for offline fallback
HINDI_NEGATIVE = [
    "bahut bura", "pareshaan", "takleef", "mushkil", "bura", "problem",
    "nahi mila", "koi madad nahi", "bahut takleef", "dard",
]
HINDI_POSITIVE = [
    "shukriya", "dhanyawad", "bahut acha", "behtar", "madad mili",
    "khushi", "sundar", "theek hai",
]


class SentimentAnalyzer:
    """
    Analyzes text sentiment for community feedback and NGO reports.
    Returns structured sentiment scores suitable for dashboard display.
    """

    async def analyze(self, text: str, context: str = "community_feedback") -> dict:
        """
        Primary sentiment analysis entry point.

        Args:
            text: Raw text to analyze
            context: One of 'community_feedback', 'ngo_report', 'volunteer_review', 'donor_message'

        Returns:
            dict with sentiment, score, tone, drivers, language_hint
        """
        # Try Gemini first
        result = await self._gemini_analysis(text, context)
        if result:
            return result

        # Rule-based fallback
        return self._rule_based_analysis(text, context)

    async def batch_analyze(self, texts: list[str], context: str = "community_feedback") -> list[dict]:
        """Analyze a list of texts. Returns results in same order."""
        results = []
        for text in texts:
            result = await self.analyze(text, context)
            results.append(result)
        return results

    async def analyze_need_urgency_tone(self, title: str, description: str) -> dict:
        """
        Specialized analysis for community needs — detects emotional tone
        of a reported need to help prioritize counselor/responder attention.
        """
        combined = f"{title}. {description}"
        prompt = f"""Analyze the emotional urgency and tone of this community need report.

Text: {combined}

Return JSON:
- "sentiment": "positive" | "negative" | "neutral"
- "tone": "desperate" | "urgent" | "concerned" | "hopeful" | "informational" | "frustrated"
- "distress_level": 0-10 (10 = extreme distress)
- "key_emotion": primary emotion in one word
- "requires_immediate_attention": true | false
- "suggested_response_tone": "empathetic" | "reassuring" | "informational" | "urgent_escalation"
"""
        result = await gemini_client.generate_json(prompt)
        if result:
            return result

        # Fallback
        score = self._score_text(combined)
        distress = max(0, min(10, int((1 - score) * 10)))
        return {
            "sentiment": "negative" if score < 0.4 else "neutral" if score < 0.65 else "positive",
            "tone": "urgent" if distress > 7 else "concerned" if distress > 4 else "informational",
            "distress_level": distress,
            "key_emotion": "distress" if distress > 7 else "concern",
            "requires_immediate_attention": distress >= 8,
            "suggested_response_tone": "urgent_escalation" if distress >= 8 else "empathetic",
        }

    async def get_community_pulse(self, feedback_texts: list[str], region: str = "") -> dict:
        """
        Aggregate sentiment analysis across multiple community feedback texts.
        Returns a 'community pulse' dashboard widget payload.
        """
        if not feedback_texts:
            return {
                "overall_sentiment": "neutral",
                "sentiment_score": 0.5,
                "positive_pct": 33,
                "negative_pct": 33,
                "neutral_pct": 34,
                "top_concerns": [],
                "top_positives": [],
                "pulse_summary": "No feedback data available.",
                "region": region,
                "sample_size": 0,
            }

        # Analyze each text
        scores = []
        sentiments = {"positive": 0, "negative": 0, "neutral": 0}

        for text in feedback_texts[:50]:  # Cap at 50 for performance
            result = self._rule_based_analysis(text, "community_feedback")
            score = result.get("score", 0.5)
            sentiment = result.get("sentiment", "neutral")
            scores.append(score)
            sentiments[sentiment] = sentiments.get(sentiment, 0) + 1

        total = len(scores)
        avg_score = sum(scores) / total if scores else 0.5
        overall = "positive" if avg_score >= 0.65 else "negative" if avg_score < 0.4 else "neutral"

        # Try Gemini for richer summary
        sample_text = " | ".join(feedback_texts[:5])
        summary_prompt = f"""Summarize the community sentiment from these {total} feedback samples:
Sample: {sample_text}

Return JSON:
- "pulse_summary": 2-sentence community mood summary
- "top_concerns": Array of 3 main concerns mentioned
- "top_positives": Array of 2 positive aspects
"""
        gemini_result = await gemini_client.generate_json(summary_prompt)

        return {
            "overall_sentiment": overall,
            "sentiment_score": round(avg_score, 2),
            "positive_pct": round((sentiments["positive"] / total) * 100),
            "negative_pct": round((sentiments["negative"] / total) * 100),
            "neutral_pct": round((sentiments["neutral"] / total) * 100),
            "top_concerns": gemini_result.get("top_concerns", ["Infrastructure", "Healthcare", "Water supply"]) if gemini_result else ["Infrastructure", "Healthcare", "Water supply"],
            "top_positives": gemini_result.get("top_positives", ["Community engagement"]) if gemini_result else ["Community engagement"],
            "pulse_summary": gemini_result.get("pulse_summary", f"Community sentiment is {overall} based on {total} feedback samples.") if gemini_result else f"Community sentiment is {overall} based on {total} feedback samples.",
            "region": region,
            "sample_size": total,
        }

    # ─────────────────────────────────────────────────────────────────────────
    # Internal Methods
    # ─────────────────────────────────────────────────────────────────────────

    async def _gemini_analysis(self, text: str, context: str) -> dict | None:
        """Use Gemini for nuanced sentiment analysis."""
        prompt = f"""Perform sentiment analysis on community feedback text for an NGO platform.

Context: {context}
Text: {text[:2000]}

Return JSON (no markdown):
- "sentiment": "positive" | "negative" | "neutral"
- "score": 0.0-1.0 (0=very negative, 0.5=neutral, 1=very positive)
- "tone": "frustrated" | "hopeful" | "urgent" | "appreciative" | "informational" | "desperate" | "satisfied"
- "confidence": 0.0-1.0
- "key_drivers": Array of 2-3 phrases that most influenced the sentiment
- "language_detected": "en" | "hi" | "mixed" | "other"
- "summary": One sentence description of the emotional state
"""
        return await gemini_client.generate_json(prompt)

    def _rule_based_analysis(self, text: str, context: str) -> dict:
        """Rule-based sentiment fallback using keyword matching."""
        score = self._score_text(text)
        sentiment = "positive" if score >= 0.65 else "negative" if score < 0.4 else "neutral"

        # Tone detection
        text_lower = text.lower()
        if any(w in text_lower for w in ["emergency", "dying", "no water", "no food", "collapsed", "critical"]):
            tone = "desperate"
        elif any(w in text_lower for w in ["urgent", "immediately", "asap", "please help"]):
            tone = "urgent"
        elif any(w in text_lower for w in ["thank", "grateful", "appreciate", "happy", "better"]):
            tone = "appreciative"
        elif any(w in text_lower for w in ["hopeful", "improving", "progress", "soon"]):
            tone = "hopeful"
        elif any(w in text_lower for w in ["frustrat", "angry", "not working", "still waiting", "ignored"]):
            tone = "frustrated"
        else:
            tone = "informational"

        # Language detection (simple)
        hindi_word_count = sum(1 for w in HINDI_NEGATIVE + HINDI_POSITIVE if w in text_lower)
        language = "hi" if hindi_word_count >= 2 else "mixed" if hindi_word_count >= 1 else "en"

        key_drivers = self._extract_key_phrases(text_lower)

        return {
            "sentiment": sentiment,
            "score": round(score, 2),
            "tone": tone,
            "confidence": 0.6,
            "key_drivers": key_drivers,
            "language_detected": language,
            "summary": f"Text shows {tone} {sentiment} sentiment regarding community conditions.",
        }

    def _score_text(self, text: str) -> float:
        """Calculate a 0.0–1.0 sentiment score from keyword presence."""
        text_lower = text.lower()

        positive_words = [
            "thank", "great", "excellent", "improved", "helped", "better", "good",
            "happy", "grateful", "appreciate", "success", "resolved", "fixed",
            "progress", "support", "wonderful", *HINDI_POSITIVE,
        ]
        negative_words = [
            "problem", "issue", "broken", "failed", "bad", "terrible", "urgent",
            "critical", "emergency", "suffering", "dying", "worst", "no water",
            "no food", "ignored", "neglected", "corrupt", "fraud", *HINDI_NEGATIVE,
        ]

        pos_count = sum(1 for w in positive_words if w in text_lower)
        neg_count = sum(1 for w in negative_words if w in text_lower)
        total = pos_count + neg_count

        if total == 0:
            return 0.5  # Neutral baseline

        raw_score = pos_count / total
        # Slightly compress toward center (0.5)
        return 0.5 + (raw_score - 0.5) * 0.8

    def _extract_key_phrases(self, text_lower: str) -> list[str]:
        """Extract 2-3 most impactful phrases as sentiment drivers."""
        driver_keywords = {
            "water supply issues": ["no water", "water shortage", "water crisis", "contaminated water"],
            "healthcare access": ["no hospital", "no doctor", "no medicine", "clinic closed"],
            "food insecurity": ["no food", "hungry", "malnutrition", "starving"],
            "infrastructure damage": ["road broken", "bridge damaged", "building collapsed"],
            "volunteer appreciation": ["volunteers helped", "team came", "support received"],
            "campaign success": ["goal achieved", "target met", "campaign successful"],
            "urgent assistance needed": ["urgent", "immediately", "emergency", "asap"],
        }

        found = []
        for phrase, keywords in driver_keywords.items():
            if any(kw in text_lower for kw in keywords):
                found.append(phrase)
            if len(found) >= 3:
                break

        return found or ["general community feedback"]


# Singleton
sentiment_analyzer = SentimentAnalyzer()
