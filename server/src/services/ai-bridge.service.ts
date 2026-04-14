import { config } from '../config/env';

/**
 * AI Bridge Service
 * Calls the Python FastAPI AI service endpoints.
 * Backend is the BRIDGE between Frontend and AI.
 */
class AiBridgeService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.aiServiceUrl;
  }

  // Process uploaded survey with NLP/OCR
  async processSurvey(
    fileUrl: string,
    fileType: string
  ): Promise<{
    extractedNeeds: Array<{
      title: string;
      description: string;
      category: string;
      urgency: string;
      location: string;
    }>;
    summary: string;
    confidence: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/process-survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_url: fileUrl, file_type: fileType }),
      });

      if (!response.ok) {
        throw new Error(`AI service responded with ${response.status}`);
      }

      return response.json() as Promise<{
        extractedNeeds: Array<{
          title: string;
          description: string;
          category: string;
          urgency: string;
          location: string;
        }>;
        summary: string;
        confidence: number;
      }>;
    } catch (error: any) {
      console.error('❌ AI Service error (process-survey):', error.message);
      // Fallback: return empty result if AI service is down
      return {
        extractedNeeds: [],
        summary: 'AI service unavailable — manual processing required',
        confidence: 0,
      };
    }
  }

  // Match volunteers to a task
  async matchVolunteers(
    task: {
      title: string;
      description: string;
      required_skills: string[];
      location: string;
      coordinates: [number, number];
    },
    volunteers: Array<{
      id: string;
      name: string;
      skills: string[];
      location: string;
      coordinates: [number, number];
      availability: string;
    }>
  ): Promise<{
    matches: Array<{
      volunteer_id: string;
      score: number;
      reasons: string[];
    }>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/match-volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, volunteers }),
      });

      if (!response.ok) {
        throw new Error(`AI service responded with ${response.status}`);
      }

      return response.json() as Promise<{
        matches: Array<{
          volunteer_id: string;
          score: number;
          reasons: string[];
        }>;
      }>;
    } catch (error: any) {
      console.error('❌ AI Service error (match-volunteers):', error.message);
      // Fallback: return basic matching
      return {
        matches: volunteers.map((v) => ({
          volunteer_id: v.id,
          score: 50,
          reasons: ['Basic match — AI service unavailable'],
        })),
      };
    }
  }

  // Prioritize needs
  async prioritizeNeeds(
    needs: Array<{
      id: string;
      title: string;
      description: string;
      category: string;
      affected_population?: number;
      reported_at: string;
    }>
  ): Promise<{
    ranked_needs: Array<{
      need_id: string;
      priority_score: number;
      factors: string[];
    }>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/prioritize-needs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ needs }),
      });

      if (!response.ok) {
        throw new Error(`AI service responded with ${response.status}`);
      }

      return response.json() as Promise<{
        ranked_needs: Array<{
          need_id: string;
          priority_score: number;
          factors: string[];
        }>;
      }>;
    } catch (error: any) {
      console.error('❌ AI Service error (prioritize-needs):', error.message);
      return {
        ranked_needs: needs.map((n) => ({
          need_id: n.id,
          priority_score: 50,
          factors: ['Default score — AI service unavailable'],
        })),
      };
    }
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
  // Extract insights from text (for impact reports, analysis)
  async extractInsights(data: { text: string }): Promise<{
    summary: string;
    categories: string[];
    urgency: string;
    keyIssues: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/extract-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`AI service responded with ${response.status}`);
      }

      return response.json() as Promise<{
        summary: string;
        categories: string[];
        urgency: string;
        keyIssues: string[];
      }>;
    } catch (error: any) {
      console.error('❌ AI Service error (extract-insights):', error.message);
      return {
        summary: 'Analysis pending — AI service unavailable',
        categories: [],
        urgency: 'medium',
        keyIssues: [],
      };
    }
  }

  // AI Chatbot — calls Gemini REST API directly (no Python dependency)
  async chatbot(message: string, context: string, role: string): Promise<{ response: string; suggestions: string[] }> {
    const apiKey = process.env.GEMINI_API_KEY;

    // If no API key, return a helpful static response
    if (!apiKey) {
      return this.fallbackChatbot(message, role);
    }

    try {
      const systemPrompt = `You are JanSetu AI Assistant — a helpful, concise assistant for an NGO ecosystem management platform called JanSetu.
      
The platform helps NGOs manage campaigns, track donations, coordinate volunteers, manage community needs, and respond to emergencies.

The user's context: ${context}
The user's role: ${role}

Guidelines:
- Be concise but informative (2-4 paragraphs max)
- Give actionable advice specific to their role
- Reference JanSetu features when relevant (campaigns, donations, leaderboard, emergency mode, etc.)
- Use bullet points for lists
- Be encouraging and professional`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser message: ${message}` }] }
            ],
            generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
          }),
        }
      );

      if (!response.ok) {
        console.error('Gemini API error:', response.status);
        return this.fallbackChatbot(message, role);
      }

      const data = await response.json() as any;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response. Please try again.';
      
      return { response: text, suggestions: [] };
    } catch (error: any) {
      console.error('❌ AI chatbot error:', error.message);
      return this.fallbackChatbot(message, role);
    }
  }

  // Fallback chatbot when Gemini API key is not available
  private fallbackChatbot(message: string, role: string): { response: string; suggestions: string[] } {
    const msg = message.toLowerCase();
    
    if (msg.includes('campaign')) {
      return { response: "**Creating a Campaign:**\n\n1. Go to **Dashboard → Campaigns**\n2. Click **Create Campaign**\n3. Fill in title, description, category, funding goal, and location\n4. Add milestones to track progress\n5. Set visibility to **Public** to receive donations\n\n💡 **Tip:** Campaigns with clear milestones and photos receive 3x more donations!", suggestions: ['How to add milestones?', 'How to promote my campaign?'] };
    }
    if (msg.includes('trust') || msg.includes('score')) {
      return { response: "**Improving Your Trust Score:**\n\n• ✅ Complete your organization profile (10 pts)\n• 📊 Maintain campaign milestones on schedule (15 pts)\n• 💰 Show transparent donation usage (20 pts)\n• 🤝 Get verified by platform admin (25 pts)\n• 📋 Keep audit trail clean — no fraud flags (30 pts)\n\nYour trust tier upgrades: **Bronze → Silver → Gold → Platinum** as your score increases.", suggestions: ['What is my current score?', 'How to get verified?'] };
    }
    if (msg.includes('volunteer') || msg.includes('recruit')) {
      return { response: "**Volunteer Recruitment Tips:**\n\n1. Post tasks with **clear descriptions** and expected time commitment\n2. Enable **AI matching** — volunteers get notified when their skills match your tasks\n3. Use the **Leaderboard** to highlight top contributors\n4. Award **badges** for completed tasks to boost engagement\n5. Send **broadcast messages** for urgent needs\n\n🎯 Volunteers with gamification earn 2x more engagement!", suggestions: ['How does AI matching work?', 'How to create tasks?'] };
    }
    if (msg.includes('donat') || msg.includes('fund')) {
      return { response: "**Donation Management:**\n\n• Donors can give to specific **campaigns** or **organizations**\n• Support **anonymous donations** for privacy\n• Each donation generates an **impact report**\n• View all donations under **Dashboard → Donate**\n• Recurring donations available for sustained support\n\n💡 Campaigns with progress updates receive 40% more recurring donors!", suggestions: ['How to track donations?', 'How to issue receipts?'] };
    }
    if (msg.includes('emergency') || msg.includes('disaster')) {
      return { response: "**Emergency Mode:**\n\n🚨 Activate from **Dashboard → Emergency**\n\nWhen activated:\n• Broadcasts alert to all organization members\n• Creates a **Critical** priority community need\n• Appears as a red banner across all dashboards\n• Resources get priority-locked for the emergency\n\nOnly **NGO Admins** and **Platform Admins** can declare emergencies.", suggestions: ['How to resolve an emergency?', 'How to send broadcasts?'] };
    }
    
    return { 
      response: `I'm the **JanSetu AI Assistant**! Here's what I can help you with:\n\n• 🎯 **Campaign creation** and management\n• 📊 **Trust score** improvement strategies\n• 👥 **Volunteer recruitment** and matching\n• 💰 **Donation tracking** and impact reports\n• 🚨 **Emergency mode** activation\n• 🗺️ **Resource allocation** guidance\n\nTry asking me about any of these topics!`, 
      suggestions: ['How to create a campaign?', 'How to improve trust score?', 'How to recruit volunteers?'] 
    };
  }

  // Generate Impact Report
  async generateImpactReport(campaignData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/generate-impact-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });
      if (!response.ok) throw new Error(`AI ${response.status}`);
      const data = (await response.json()) as { data?: any };
      return data.data;
    } catch (error: any) {
      console.error('❌ AI impact report error:', error.message);
      return null;
    }
  }

  // Detect Fraud
  async detectFraud(data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/detect-fraud`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`AI ${response.status}`);
      const result = (await response.json()) as { data?: any };
      return result.data;
    } catch (error: any) {
      console.error('❌ AI fraud detection error:', error.message);
      return { risk_score: 0, risk_level: 'low', flags: [], recommendation: 'approve' };
    }
  }
}

export const aiBridgeService = new AiBridgeService();

