"""
JanSetu AI Service -- Full NLP Test Suite
==========================================
Tests all service components directly (no HTTP server needed).
Run: python test_nlp_full.py
"""

import asyncio
import sys


async def run_all_tests():
    results = []

    def ok(name, detail=""):
        results.append(("PASS", name, detail))
        print(f"  [PASS] {name}" + (f" -- {detail}" if detail else ""))

    def fail(name, err):
        results.append(("FAIL", name, str(err)))
        print(f"  [FAIL] {name} -- {err}")

    print("\n" + "=" * 65)
    print("  JanSetu AI -- NLP Full Test Suite")
    print("=" * 65)

    # ----------------------------------------------------------------
    # 1. NLP Processor
    # ----------------------------------------------------------------
    print("\n[1] NLP Processor -- Survey Processing & Text Extraction")
    try:
        from app.services.nlp_processor import nlp_processor, PDF_AVAILABLE, OCR_AVAILABLE
        from app.models.schemas import ProcessSurveyRequest, ExtractInsightsRequest

        for ftype in ["text", "image", "pdf"]:
            req = ProcessSurveyRequest(file_url=f"https://example.com/survey.{ftype}", file_type=ftype)
            resp = await nlp_processor.process_survey(req)
            assert len(resp.extractedNeeds) > 0, "No needs extracted"
            ok(f"process_survey ({ftype})", f"{len(resp.extractedNeeds)} needs, confidence={resp.confidence:.2f}")

        req4 = ExtractInsightsRequest(
            text="Severe water shortage affecting 500 families. Hospital 30km away. "
                 "Children missing school due to unsafe roads."
        )
        resp4 = await nlp_processor.extract_insights(req4)
        assert resp4.urgency_score > 0
        ok("extract_insights", f"categories={resp4.categories}, urgency={resp4.urgency_score:.2f}")
        print(f"  [INFO] PDF={PDF_AVAILABLE}, OCR={OCR_AVAILABLE}")

    except Exception as e:
        fail("nlp_processor", e)

    # ----------------------------------------------------------------
    # 2. Priority Scorer
    # ----------------------------------------------------------------
    print("\n[2] Priority Scorer -- Need Ranking")
    try:
        from app.services.priority_scorer import priority_scorer
        from app.models.schemas import PrioritizeNeedsRequest, NeedForPrioritization

        needs = [
            NeedForPrioritization(id="n1", title="Water contaminated -- emergency",
                description="500 families drinking contaminated water", category="water",
                affected_population=2000, reported_at="2026-03-01T00:00:00Z"),
            NeedForPrioritization(id="n2", title="School needs blackboard repairs",
                description="Minor classroom improvements", category="education",
                affected_population=80, reported_at="2026-04-15T00:00:00Z"),
            NeedForPrioritization(id="n3", title="Critical healthcare -- hospital closed",
                description="10,000 people have no emergency access", category="healthcare",
                affected_population=10000, reported_at="2026-02-01T00:00:00Z"),
        ]
        resp = await priority_scorer.prioritize(PrioritizeNeedsRequest(needs=needs))
        assert len(resp.ranked_needs) == 3
        top = resp.ranked_needs[0]
        assert top.need_id in ["n1", "n3"], f"Unexpected top need: {top.need_id}"
        scores = " > ".join(f"{r.need_id}={r.priority_score:.1f}" for r in resp.ranked_needs)
        ok("prioritize_needs", f"Ranked: {scores}")

    except Exception as e:
        fail("priority_scorer", e)

    # ----------------------------------------------------------------
    # 3. Matching Engine
    # ----------------------------------------------------------------
    print("\n[3] Matching Engine -- Volunteer Matching")
    try:
        from app.services.matching_engine import matching_engine
        from app.models.schemas import MatchVolunteersRequest, TaskForMatching, VolunteerForMatching

        task = TaskForMatching(
            title="Medical camp support", description="Assist doctors in rural health camp",
            required_skills=["healthcare", "first_aid"],
            location="Pune, Maharashtra", coordinates=(73.8567, 18.5204)
        )
        volunteers = [
            VolunteerForMatching(id="v1", name="Sneha", skills=["healthcare", "counseling"],
                location="Pune, Maharashtra", coordinates=(73.85, 18.52), availability="part-time"),
            VolunteerForMatching(id="v2", name="Arjun", skills=["technology"],
                location="Chennai", coordinates=(80.27, 13.08), availability="weekends"),
            VolunteerForMatching(id="v3", name="Rohit", skills=["first_aid", "driving"],
                location="Pune, Maharashtra", coordinates=(73.9, 18.5), availability="weekends"),
        ]
        resp = await matching_engine.match(MatchVolunteersRequest(task=task, volunteers=volunteers))
        assert len(resp.matches) == 3
        assert resp.matches[0].volunteer_id == "v1", f"Expected v1 on top, got {resp.matches[0].volunteer_id}"
        scores = " > ".join(f"{m.volunteer_id}={m.score:.1f}" for m in resp.matches)
        ok("match_volunteers", f"Ranked: {scores}")

    except Exception as e:
        fail("matching_engine", e)

    # ----------------------------------------------------------------
    # 4. Sentiment Analyzer
    # ----------------------------------------------------------------
    print("\n[4] Sentiment Analyzer -- Text Sentiment & Community Pulse")
    try:
        from app.services.sentiment_analyzer import sentiment_analyzer

        r1 = await sentiment_analyzer.analyze(
            "The water situation is critical! Emergency help needed. People are dying!",
            "community_feedback"
        )
        assert r1["sentiment"] == "negative"
        assert r1["tone"] in ["desperate", "urgent"]
        ok("analyze (negative/urgent)", f"sentiment={r1['sentiment']}, tone={r1['tone']}, score={r1['score']}")

        r2 = await sentiment_analyzer.analyze(
            "Thank you so much! The clinic is much better now. We are very grateful.",
            "community_feedback"
        )
        assert r2["sentiment"] == "positive"
        ok("analyze (positive)", f"sentiment={r2['sentiment']}, tone={r2['tone']}, score={r2['score']}")

        batch = await sentiment_analyzer.batch_analyze([
            "No food for 3 days, urgent help needed",
            "Great support from the NGO team",
            "Roads are broken but manageable",
        ])
        assert len(batch) == 3
        ok("batch_analyze", f"results={[r['sentiment'] for r in batch]}")

        pulse = await sentiment_analyzer.get_community_pulse(
            ["No water supply", "Thank you volunteers", "Hospital too far"], region="Maharashtra"
        )
        assert "overall_sentiment" in pulse
        ok("community_pulse", f"overall={pulse['overall_sentiment']}, n={pulse['sample_size']}")

        tone = await sentiment_analyzer.analyze_need_urgency_tone(
            "Hospital closure -- critical emergency",
            "The only hospital in 50km has shut. Pregnant women and elderly at extreme risk."
        )
        assert "distress_level" in tone
        ok("analyze_need_urgency_tone", f"tone={tone['tone']}, distress={tone['distress_level']}/10")

    except Exception as e:
        fail("sentiment_analyzer", e)

    # ----------------------------------------------------------------
    # 5. Resource Allocator
    # ----------------------------------------------------------------
    print("\n[5] Resource Allocator -- Smart Allocation Engine")
    try:
        from app.services.resource_allocator import resource_allocator

        alloc_req = {
            "resources": [
                {"id": "r1", "type": "medical_supplies", "quantity": 100, "unit": "kits",
                 "location": "Pune, Maharashtra", "org_id": "o1"},
                {"id": "r2", "type": "water_purifier", "quantity": 10, "unit": "units",
                 "location": "Mumbai, Maharashtra", "org_id": "o1"},
                {"id": "r3", "type": "food", "quantity": 500, "unit": "kg",
                 "location": "Chennai, Tamil Nadu", "org_id": "o2"},
            ],
            "needs": [
                {"id": "n1", "title": "Medical camp Kothrud", "category": "healthcare",
                 "urgency": "critical", "affected_population": 2000, "location": "Pune, Maharashtra"},
                {"id": "n2", "title": "Water crisis Dharavi", "category": "water",
                 "urgency": "high", "affected_population": 5000, "location": "Mumbai, Maharashtra"},
                {"id": "n3", "title": "Food for flood victims", "category": "food_security",
                 "urgency": "critical", "affected_population": 1200, "location": "Chennai, Tamil Nadu"},
                {"id": "n4", "title": "School supplies", "category": "education",
                 "urgency": "low", "affected_population": 50, "location": "Delhi"},
            ],
            "strategy": "greedy"
        }
        resp = await resource_allocator.allocate(alloc_req)
        assert resp["total_needs"] == 4
        ok("allocate (greedy)", f"met={resp['met_needs']}/{resp['total_needs']}, utilization={resp['utilization_rate']*100:.0f}%")

        shortage = await resource_allocator.analyze_shortage({
            "region": "Maharashtra",
            "current_resources": {"medical_supplies": 50, "water_purifiers": 2},
            "active_needs_count": 15,
            "historical_consumption_rate": "high"
        })
        assert "shortage_risk" in shortage
        ok("analyze_shortage", f"risk={shortage['shortage_risk']}")

        redis_resp = await resource_allocator.suggest_redistribution([
            {"org_name": "HelpIndia", "org_id": "o1", "region": "Maharashtra",
             "surplus_resources": ["medical_supplies"], "deficit_resources": ["food"]},
            {"org_name": "Sahaya Trust", "org_id": "o2", "region": "Tamil Nadu",
             "surplus_resources": ["food"], "deficit_resources": ["medical_supplies"]},
        ])
        assert "summary" in redis_resp
        ok("suggest_redistribution", f"summary='{redis_resp['summary'][:55]}...'")

    except Exception as e:
        fail("resource_allocator", e)

    # ----------------------------------------------------------------
    # 6. Fraud Detector
    # ----------------------------------------------------------------
    print("\n[6] Fraud Detector -- Campaign & User Behavior")
    try:
        from app.services.fraud_detector import fraud_detector

        r = await fraud_detector.analyze_campaign({
            "title": "Help us rebuild homes", "description": "Community houses destroyed in storm",
            "org_trust_score": 15, "funding_goal": 5000000,
            "funding_raised": 2500000, "milestones_completed": 0, "days_active": 10,
        })
        assert "risk_score" in r and "flags" in r
        ok("analyze_campaign", f"risk={r.get('risk_score')}, level={r.get('risk_level')}, flags={len(r.get('flags', []))}")

        r2 = await fraud_detector.analyze_user_behavior({
            "account_age_days": 0, "tasks_applied": 12,
            "tasks_completed": 0, "duplicate_emails": 2,
        })
        assert r2["risk_score"] >= 50
        ok("analyze_user_behavior", f"risk={r2['risk_score']}, level={r2['risk_level']}")

    except Exception as e:
        fail("fraud_detector", e)

    # ----------------------------------------------------------------
    # 7. Trend Analyzer
    # ----------------------------------------------------------------
    print("\n[7] Trend Analyzer -- Regional Trends, Crisis & What-If")
    try:
        from app.services.trend_analyzer import trend_analyzer

        trends = await trend_analyzer.analyze_regional_trends({
            "region": "Maharashtra",
            "needs_by_category": {"water": 12, "healthcare": 8, "education": 3},
            "total_needs": 23, "resolved_rate": 35,
            "active_campaigns": 4, "volunteer_density": "moderate"
        })
        assert "risk_level" in trends or "trend_summary" in trends
        ok("analyze_regional_trends", f"risk={trends.get('risk_level', 'N/A')}")

        crisis = await trend_analyzer.predict_crisis({
            "region": "Coastal Tamil Nadu", "season": "monsoon",
            "spike_categories": ["flood", "healthcare"],
            "water_level": "high", "healthcare_score": 30
        })
        assert "crisis_probability" in crisis
        ok("predict_crisis", f"probability={crisis.get('crisis_probability')}%")

        whatif = await trend_analyzer.what_if_simulation({
            "description": "Add 5 water tankers to Dharavi",
            "current_resources": {"water_tankers": 2},
            "proposed_change": "Add 5 water tankers",
            "region": "Mumbai", "affected_population": 8000
        })
        assert "recommendation" in whatif or "baseline_outcome" in whatif
        ok("what_if_simulation", f"recommendation={whatif.get('recommendation', 'N/A')}")

    except Exception as e:
        fail("trend_analyzer", e)

    # ----------------------------------------------------------------
    # 8. Impact Storyteller
    # ----------------------------------------------------------------
    print("\n[8] Impact Storyteller -- Report Generation")
    try:
        from app.services.impact_storyteller import impact_storyteller

        r = await impact_storyteller.generate_campaign_report({
            "title": "Clean Water for Dharavi 2026", "category": "water_sanitation",
            "location": "Dharavi, Mumbai", "volunteers_joined": 12, "volunteers_needed": 20,
            "funding_raised": 285000, "funding_goal": 500000,
            "people_helped": 4200, "people_to_help": 10000,
            "milestones_completed": 2, "milestones_total": 4,
        })
        assert "summary" in r or "story" in r
        ok("generate_campaign_report", f"summary='{str(r.get('summary', ''))[:55]}...'")

        r2 = await impact_storyteller.generate_donor_impact({
            "name": "Vikram Singhania", "total_donated": 90000,
            "orgs_supported": 2, "campaigns_funded": 3,
        })
        assert "thank_you" in r2
        ok("generate_donor_impact", f"lives_touched={r2.get('lives_touched', 'N/A')}")

    except Exception as e:
        fail("impact_storyteller", e)

    # ----------------------------------------------------------------
    # 9. NGO Collaborator
    # ----------------------------------------------------------------
    print("\n[9] NGO Collaborator -- Partnership Suggestions")
    try:
        from app.services.ngo_collaborator import ngo_collaborator

        r = await ngo_collaborator.suggest_collaborations({
            "requesting_org": {"name": "HelpIndia", "type": "ngo", "region": "Maharashtra",
                                "strengths": ["water", "education"]},
            "available_orgs": [
                {"name": "Sahaya Trust", "type": "ngo", "region": "Tamil Nadu", "trust_score": 92},
                {"name": "CareIndia", "type": "ngo", "region": "Maharashtra", "trust_score": 75},
            ],
        })
        assert "suggestions" in r or "summary" in r
        ok("suggest_collaborations", f"suggestions={len(r.get('suggestions', []))}")

        fit = await ngo_collaborator.analyze_partnership_fit(
            {"name": "HelpIndia", "type": "ngo", "region": "Maharashtra",
             "trust_score": 87, "campaigns": 4, "volunteers": 35},
            {"name": "Sahaya Trust", "type": "ngo", "region": "Tamil Nadu",
             "trust_score": 92, "campaigns": 3, "volunteers": 48},
        )
        assert "compatibility_score" in fit or "verdict" in fit
        ok("analyze_partnership_fit", f"score={fit.get('compatibility_score', 'N/A')}, verdict={fit.get('verdict', 'N/A')}")

    except Exception as e:
        fail("ngo_collaborator", e)

    # ----------------------------------------------------------------
    # Summary
    # ----------------------------------------------------------------
    passed = sum(1 for r in results if r[0] == "PASS")
    failed = sum(1 for r in results if r[0] == "FAIL")

    print("\n" + "=" * 65)
    print(f"  RESULTS: {passed}/{len(results)} passed  |  {failed} failed")
    print("=" * 65)

    if failed:
        print("\n  FAILED:")
        for status, name, detail in results:
            if status == "FAIL":
                print(f"    - {name}: {detail}")
        return False

    print("\n  All NLP components verified successfully!")
    return True


if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)
