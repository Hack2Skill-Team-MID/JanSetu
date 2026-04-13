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

  // AI Chatbot
  async chatbot(message: string, context: string, role: string): Promise<{ response: string; suggestions: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context, role }),
      });
      if (!response.ok) throw new Error(`AI ${response.status}`);
      const data = await response.json();
      return data.data || { response: 'AI service unavailable', suggestions: [] };
    } catch (error: any) {
      console.error('❌ AI chatbot error:', error.message);
      return { response: 'AI assistant is currently unavailable. Please try again later.', suggestions: [] };
    }
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
      const data = await response.json();
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
      const result = await response.json();
      return result.data;
    } catch (error: any) {
      console.error('❌ AI fraud detection error:', error.message);
      return { risk_score: 0, risk_level: 'low', flags: [], recommendation: 'approve' };
    }
  }
}

export const aiBridgeService = new AiBridgeService();

