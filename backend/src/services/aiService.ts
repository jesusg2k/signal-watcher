import OpenAI from 'openai';
import { AIAnalysis, EventData } from '../types';
import logger from '../utils/logger';
import { getCache, setCache } from '../utils/redis';

class AIService {
  private openai: OpenAI | null = null;
  private mockMode: boolean;

  constructor() {
    this.mockMode = !process.env.OPENAI_API_KEY;
    
    if (!this.mockMode) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    
    logger.info('AI Service initialized', { mockMode: this.mockMode });
  }

  async analyzeEvent(eventData: EventData, watchTerms: string[], correlationId: string): Promise<AIAnalysis> {
    const cacheKey = `ai_analysis:${JSON.stringify(eventData)}:${watchTerms.join(',')}`;
    
    // Check cache first
    const cached = await getCache(cacheKey);
    if (cached) {
      logger.info('AI analysis cache hit', { correlationId });
      return cached;
    }

    let analysis: AIAnalysis;

    if (this.mockMode) {
      analysis = this.mockAnalysis(eventData, watchTerms);
    } else {
      analysis = await this.openaiAnalysis(eventData, watchTerms, correlationId);
    }

    // Cache result for 1 hour
    await setCache(cacheKey, analysis, 3600);
    
    return analysis;
  }

  private mockAnalysis(eventData: EventData, watchTerms: string[]): AIAnalysis {
    const matchedTerms = watchTerms.filter(term => 
      JSON.stringify(eventData).toLowerCase().includes(term.toLowerCase())
    );

    // Detect critical events by keywords
    const criticalKeywords = ['ransomware', 'breach', 'compromise', 'attack', 'critical', 'wannacry', 'encrypted'];
    const highKeywords = ['malware', 'trojan', 'virus', 'exploit', 'high'];
    const medKeywords = ['phishing', 'suspicious', 'medium', 'med'];
    
    const eventText = JSON.stringify(eventData).toLowerCase();
    
    let severity: AIAnalysis['severity'] = 'LOW';
    
    if (criticalKeywords.some(keyword => eventText.includes(keyword))) {
      severity = 'CRITICAL';
    } else if (highKeywords.some(keyword => eventText.includes(keyword))) {
      severity = 'HIGH';
    } else if (medKeywords.some(keyword => eventText.includes(keyword))) {
      severity = 'MED';
    } else if (matchedTerms.length > 2) {
      severity = 'HIGH';
    } else if (matchedTerms.length > 0) {
      severity = 'MED';
    }

    return {
      summary: `Mock analysis: Detected event of type "${eventData.type}" ${matchedTerms.length > 0 ? `matching terms: ${matchedTerms.join(', ')}` : 'with no term matches'}. ${eventData.description}`,
      severity,
      suggestedAction: this.getSuggestedAction(severity, eventData.type)
    };
  }

  private async openaiAnalysis(eventData: EventData, watchTerms: string[], correlationId: string): Promise<AIAnalysis> {
    try {
      const prompt = `
Analyze this security event and provide:
1. A concise summary in natural language
2. Severity level (LOW/MED/HIGH/CRITICAL)
3. Suggested next action for the analyst

Event Data: ${JSON.stringify(eventData)}
Watch Terms: ${watchTerms.join(', ')}

Respond in JSON format:
{
  "summary": "Brief description of the event",
  "severity": "LOW|MED|HIGH|CRITICAL",
  "suggestedAction": "Specific action recommendation"
}`;

      const response = await this.openai!.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 300
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from OpenAI');

      const analysis = JSON.parse(content) as AIAnalysis;
      
      logger.info('OpenAI analysis completed', { correlationId, severity: analysis.severity });
      
      return analysis;
    } catch (error) {
      logger.error('OpenAI analysis failed, falling back to mock', { correlationId, error });
      return this.mockAnalysis(eventData, watchTerms);
    }
  }

  private getSuggestedAction(severity: AIAnalysis['severity'], eventType: string): string {
    const actions = {
      LOW: ['Monitor for patterns', 'Log for future reference', 'Schedule routine review'],
      MED: ['Investigate within 24h', 'Check related systems', 'Notify team lead'],
      HIGH: ['Immediate investigation required', 'Escalate to security team', 'Block suspicious activity'],
      CRITICAL: ['URGENT: Immediate response required', 'Activate incident response', 'Contact security operations center']
    };

    const severityActions = actions[severity];
    return severityActions[Math.floor(Math.random() * severityActions.length)];
  }
}

export default new AIService();