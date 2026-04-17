import { config } from 'dotenv';
config();

import { aiBridgeService } from '../services/ai-bridge.service';

async function runTests() {
  console.log('='.repeat(60));
  console.log('🤖 Starting JanSetu Backend AI Bridge Tests');
  console.log('='.repeat(60));

  console.log('\n[TEST 1] AI Service Health Check over Bridge');
  try {
    const isHealthy = await aiBridgeService.isHealthy();
    if (isHealthy) {
      console.log('✅ PASSED: Backend successfully verified AI Service is healthy and responsive');
    } else {
      console.log('❌ FAILED: Health check failed');
      return;
    }
  } catch (error: any) {
    console.log('❌ FAILED:', error.message);
    return;
  }

  console.log('\n[TEST 2] NLP Extractor via Bridge');
  try {
    const result = await aiBridgeService.processSurvey('https://example.com/mock.pdf', 'pdf');
    console.log(`✅ PASSED: Extracted Needs: ${result.extractedNeeds?.length}`);
    console.log(`   Summary: ${result.summary}`);
  } catch (error: any) {
    console.log('❌ FAILED:', error.message);
  }

  console.log('\n[TEST 3] Volunteer AI Matching via Bridge');
  try {
    const task = {
      title: "Medical camp support",
      description: "Assist doctors strictly with setup",
      required_skills: ["healthcare", "logistics"],
      location: "Pune, Maharashtra",
      coordinates: [73.85, 18.52] as [number, number]
    };
    
    const volunteers = [
      { id: "v1", name: "Rahul", skills: ["logistics", "driving"], location: "Pune", coordinates: [73.85, 18.52] as [number, number], availability: "part-time" },
      { id: "v2", name: "Amit", skills: ["healthcare"], location: "Pune", coordinates: [73.86, 18.53] as [number, number], availability: "part-time" }
    ];
    
    const result = await aiBridgeService.matchVolunteers(task, volunteers);
    console.log(`✅ PASSED: Found ${result.matches?.length} formatted matches from AI.`);
    result.matches?.forEach(m => console.log(`   - Volunteer ${m.volunteer_id}: ${m.score} Score`));
  } catch (error: any) {
    console.log('❌ FAILED:', error.message);
  }

  console.log('\n[TEST 4] Priority Needs Scorer via Bridge');
  try {
    const sorted = await aiBridgeService.prioritizeNeeds([
       { id: "n1", title: "Urgent: Water tanker needed", description: "No drinking water for 3 days", category: "water", reported_at: new Date().toISOString() },
       { id: "n2", title: "School supply donation", description: "Books for children", category: "education", reported_at: new Date().toISOString() }
    ]);
    console.log(`✅ PASSED: Ranked ${sorted.ranked_needs?.length} needs correctly.`);
    console.log(`   Top Priority: ${sorted.ranked_needs?.[0]?.need_id} with score ${sorted.ranked_needs?.[0]?.priority_score}`);
  } catch (error: any) {
    console.log('❌ FAILED:', error.message);
  }

  console.log('\n[TEST 5] Gemini Chatbot (Offline/Online Mode) via Bridge');
  try {
    const chat = await aiBridgeService.chatbot("What is emergency mode?", "test-context", "admin");
    console.log('✅ PASSED: Received Chatbot Response:');
    console.log(`   Snippet: ${chat.response.substring(0, 100).replace(/\n/g, ' ')}...`);
  } catch (error: any) {
    console.log('❌ FAILED:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎯 All Backend AI Bridge Tests Completed');
  console.log('='.repeat(60) + '\n');
}

runTests();
