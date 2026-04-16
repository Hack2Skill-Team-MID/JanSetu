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

  // AI Chatbot — uses @google/generative-ai SDK with rich fallback
  async chatbot(message: string, context: string, role: string): Promise<{ response: string; suggestions: string[] }> {
    const apiKey = process.env.GEMINI_API_KEY;

    // Detect missing or placeholder key
    const hasRealKey = apiKey && !apiKey.startsWith('your-') && apiKey.length > 20;

    if (!hasRealKey) {
      console.log('ℹ️  No real Gemini key — using offline AI fallback');
      return this.fallbackChatbot(message, role);
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey!);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const systemPrompt = `You are JanSetu AI Assistant — a helpful, concise assistant for an NGO ecosystem management platform called JanSetu built for Indian NGOs.

The platform connects NGO Admins, Volunteers, Community Members, and Donors.
Key features: campaigns, donations (Razorpay), volunteer tasks, community needs, emergency mode, leaderboard, fraud detection, impact map, AI matching.

User context: ${context}
User role: ${role}

Guidelines:
- Be concise but actionable (2-4 short paragraphs)
- Reference JanSetu features specifically when relevant
- Use emojis and bullet points for readability
- If asked about specific data, tell them where to find it in the dashboard
- Be warm, encouraging, and professional
- Always respond in English unless user writes in another language`;

      const result = await model.generateContent(`${systemPrompt}\n\nUser: ${message}`);
      const text = result.response.text();

      return { response: text, suggestions: [] };
    } catch (error: any) {
      console.error('❌ Gemini SDK error:', error.message);
      return this.fallbackChatbot(message, role);
    }
  }

  // Comprehensive offline fallback — covers 15+ topics
  private fallbackChatbot(message: string, role: string): { response: string; suggestions: string[] } {
    const msg = message.toLowerCase();

    if (msg.includes('campaign') && (msg.includes('create') || msg.includes('new') || msg.includes('start'))) {
      return { response: "🎯 **Creating a Campaign:**\n\n1. Go to **Dashboard → Campaigns** and click **Create Campaign**\n2. Fill in: title, description, category, funding goal, and location\n3. Add milestones to show progress to donors\n4. Set visibility to **Public** to receive donations\n5. Share the campaign link on social media\n\n💡 **Pro Tip:** Campaigns with photos and clear milestones receive **3× more donations** on average!", suggestions: ['How to add milestones?', 'How to promote my campaign?', 'How to accept donations?'] };
    }
    if (msg.includes('campaign')) {
      return { response: "📊 **Campaign Management on JanSetu:**\n\nYour campaigns dashboard shows:\n• **Funding progress** — real-time Razorpay donation tracking\n• **Volunteer count** — who joined vs. who's needed\n• **Milestone completion** — show donors impact\n• **People helped** — your ground truth impact\n\nGo to **Dashboard → Campaigns** to view all active campaigns. Each campaign card shows a donate button directly!", suggestions: ['How to create a campaign?', 'How to add volunteers?', 'How do donations work?'] };
    }
    if (msg.includes('trust') || msg.includes('score') || msg.includes('verified') || msg.includes('verification')) {
      return { response: "⭐ **Improving Your Trust Score:**\n\n• ✅ Complete organization profile → **+10 pts**\n• 📋 Maintain campaign milestones on schedule → **+15 pts**\n• 💰 Show transparent donation usage → **+20 pts**\n• 🤝 Get verified by platform admin → **+25 pts**\n• 📊 Zero fraud flags on audit trail → **+30 pts**\n\n**Trust Tiers:** Bronze ↗ Silver ↗ Gold ↗ Platinum\n\nHigher tiers unlock: featured placement, increased donation limits, and direct NGO partnerships.", suggestions: ['How to get verified?', 'What is fraud detection?', 'How to view audit logs?'] };
    }
    if (msg.includes('volunteer') && (msg.includes('recruit') || msg.includes('find') || msg.includes('match'))) {
      return { response: "👥 **Volunteer Recruitment & AI Matching:**\n\n1. **Post Tasks** with clear descriptions, required skills, deadline, and time commitment\n2. **AI Matching** automatically notifies volunteers whose skills match your task requirements\n3. **Broadcast Messages** for urgent needs reach your entire volunteer base\n4. Use the **Leaderboard** to showcase top contributors — it drives 2× more applications\n5. Award **Badges** on task completion to boost long-term retention\n\n🎯 Go to **Dashboard → Tasks** to create and manage tasks.", suggestions: ['How to create a task?', 'How does the leaderboard work?', 'How to award badges?'] };
    }
    if (msg.includes('volunteer')) {
      return { response: "🤝 **Volunteer Portal on JanSetu:**\n\nAs a volunteer you can:\n• View **open tasks** and apply with one click\n• Track your **impact hours** and points earned\n• Earn **badges** (First Task, Crisis Responder, Team Player, etc.)\n• See your **rank on the leaderboard**\n• Message your NGO team directly\n\nGo to **Dashboard → My Tasks** to see tasks assigned to you. New tasks matching your skills appear automatically!", suggestions: ['How to apply for a task?', 'How to earn more points?', 'What badges can I earn?'] };
    }
    if (msg.includes('donat') || msg.includes('fund') || msg.includes('payment') || msg.includes('razorpay')) {
      return { response: "💰 **Donation System — Powered by Razorpay:**\n\n• Donors visit **Dashboard → Donate** or click **Donate** on any campaign\n• Choose campaign, enter amount, add a message\n• **Live mode**: real Razorpay UPI/card payment\n• **Demo mode**: instant auto-verified (no card needed)\n• Every donation creates an **audit log entry**\n• Donors can view their history at **My Donations**\n\n📊 NGO Admins see all incoming donations in **Dashboard → Analytics**.", suggestions: ['How to set up Razorpay?', 'How to view donation history?', 'Can donors remain anonymous?'] };
    }
    if (msg.includes('emergency') || msg.includes('disaster') || msg.includes('crisis') || msg.includes('flood') || msg.includes('cyclone')) {
      return { response: "🚨 **Emergency Mode — JanSetu:**\n\nActivate from **Dashboard → Emergency** → Click **Declare Emergency**\n\n**What happens automatically:**\n• 🔴 Red emergency banner appears on ALL user dashboards\n• 📣 Broadcast message sent to all org members\n• 📋 Critical-priority community need created\n• 🔒 Relevant resources priority-locked\n• 📍 Emergency pinned on the Impact Map\n\n**Who can declare:** NGO Admins and Platform Admins only.\n**To resolve:** Click 'Mark as Resolved' and add an action summary.", suggestions: ['How to resolve an emergency?', 'How to lock resources?', 'How to send broadcasts?'] };
    }
    if (msg.includes('resource') || msg.includes('inventory') || msg.includes('stock') || msg.includes('allocat')) {
      return { response: "📦 **Resource Management:**\n\nTrack your NGO's physical resources at **Dashboard → Resources**:\n• Add items (medicines, food, equipment, vehicles)\n• Monitor **stock levels** — low stock alerts auto-trigger\n• Set **expiry dates** — get alerts 7 days before expiry\n• **Allocate** resources to specific campaigns or tasks\n• View **allocation history** in the audit trail\n\n⚠️ During emergencies, resources can be **priority-locked** to prevent accidental use.", suggestions: ['How to add resources?', 'How to allocate to a campaign?', 'What are low stock alerts?'] };
    }
    if (msg.includes('leaderboard') || msg.includes('badge') || msg.includes('point') || msg.includes('gamif') || msg.includes('rank')) {
      return { response: "🏆 **Gamification System:**\n\n**Points** are earned for:\n• ✅ Completing tasks (+10 to +50 pts based on complexity)\n• 💰 Donating (+5 pts per donation)\n• 🚨 Responding to emergencies (+25 pts)\n• 📣 Recruiting volunteers (+15 pts)\n\n**Badges available:**\n🎯 First Task · ⭐ Five Tasks · 🏆 Ten Tasks · 🚨 Crisis Responder · 🤝 Team Player · 📚 Mentor · 💎 Top Donor · 🌟 Weekly Star\n\nView the **Leaderboard** at **Dashboard → Leaderboard**.", suggestions: ['How to earn the Crisis Responder badge?', 'How are weekly stars picked?'] };
    }
    if (msg.includes('map') || msg.includes('location') || msg.includes('geographic')) {
      return { response: "🗺️ **Impact Map — JanSetu:**\n\nThe **Live Impact Map** (Dashboard → Impact Map) shows:\n• 🔴 **Critical needs** — reported community needs by location\n• 🟡 **Active campaigns** — geographic coverage\n• 🟢 **Completed tasks** — areas already served\n• 🔵 **NGO locations** — partner organizations nearby\n\nClick any pin to see details. During emergencies, the affected area is highlighted automatically.\n\n📍 Needs are automatically plotted when community members or field volunteers report them.", suggestions: ['How to report a community need?', 'How to filter the map?'] };
    }
    if (msg.includes('fraud') || msg.includes('detect') || msg.includes('flag') || msg.includes('suspicious')) {
      return { response: "🔍 **AI Fraud Detection:**\n\nJanSetu monitors for suspicious patterns automatically:\n• 💸 Unusual donation velocity (3× normal rate)\n• 🔄 Multiple donations from same IP\n• 👤 Burst account creation\n• 📊 Campaign milestone dishonesty\n\nFlagged cases appear at **Dashboard → Fraud Detection** (Platform Admin only).\n\nEach case has:\n• AI risk score (0-100)\n• Specific flag reasons\n• Recommend action (approve / investigate / reject)\n• Case notes and resolution trail", suggestions: ['What risk score means investigate?', 'How to dismiss a false flag?'] };
    }
    if (msg.includes('message') || msg.includes('chat') || msg.includes('communicate') || msg.includes('broadcast')) {
      return { response: "💬 **Messaging on JanSetu:**\n\n**Direct Messages** (Dashboard → Messages):\n• Chat with any team member in your organization\n• Real-time delivery\n• Message history preserved\n\n**Broadcasts:**\n• NGO Admins can send to ALL volunteers at once\n• Used for urgent task announcements or emergency alerts\n\n**AI Assistant** (you're here!):\n• Available 24/7 for platform guidance\n• Powered by Google Gemini\n• Remembers your role context", suggestions: ['How to send a broadcast?', 'Can I message across NGOs?'] };
    }
    if (msg.includes('analytics') || msg.includes('report') || msg.includes('insight') || msg.includes('stats') || msg.includes('metric')) {
      return { response: "📊 **Analytics Dashboard:**\n\nAt **Dashboard → Analytics** you'll find:\n• 📈 **Donation trends** — weekly/monthly/yearly charts\n• 👥 **Volunteer engagement** — active vs. inactive\n• 🎯 **Campaign performance** — raised vs. goal\n• 🗺️ **Geographic impact** — which regions you've served\n• 📋 **Audit trail** — complete action log\n\n**AI Impact Report** — click Generate on any campaign to get an AI-written narrative impact summary powered by Gemini.", suggestions: ['How to generate an impact report?', 'Can I export analytics?'] };
    }
    if (msg.includes('profile') || msg.includes('account') || msg.includes('setting') || msg.includes('password')) {
      return { response: "⚙️ **Your Profile & Settings:**\n\nVisit **Dashboard → My Profile** to:\n• Update your name and contact info\n• Change your password\n• Set your preferred language (English / Hindi / Tamil)\n• View your badges and points\n• Update your skills (for volunteer matching)\n• Link your volunteer availability calendar\n\nOrganization admins can also update org details, logo, and social links from the profile page.", suggestions: ['How to change language?', 'How to update skills?'] };
    }

    // Generic helpful response
    return {
      response: `👋 Hi! I'm the **JanSetu AI Assistant** — your guide to India's smartest NGO platform.\n\nHere's what I can help you with:\n\n• 🎯 **Campaigns** — create, manage, and fund campaigns\n• 👥 **Volunteers** — recruit, match, and manage your team  \n• 💰 **Donations** — Razorpay payment flow and tracking\n• 🚨 **Emergency Mode** — rapid disaster response\n• 📦 **Resources** — inventory and smart allocation\n• 🏆 **Gamification** — points, badges, and leaderboard\n• 🗺️ **Impact Map** — live geographic need visualization\n• 🔍 **Fraud Detection** — AI-powered trust scoring\n• 📊 **Analytics** — impact reports and dashboards\n\nJust ask me anything! 😊`,
      suggestions: ['How to create a campaign?', 'How does donation work?', 'How to recruit volunteers?', 'What is emergency mode?']
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

