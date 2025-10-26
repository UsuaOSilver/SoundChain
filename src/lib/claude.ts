import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface NegotiationContext {
  conversationId: string;
  trackId: string;
  baseTerms: {
    minPrice: number;
    allowedUsageRights: string[];
    exclusivityAvailable: boolean;
    territory: string;
  };
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  currentStatus: 'active' | 'completed' | 'abandoned';
}

export async function negotiateLicense(
  context: NegotiationContext,
  userMessage: string
) {
  const systemPrompt =  `You are a professional music licensing agent negotiating on behalf of a music producer.

PRODUCER'S BASE TERMS (NON-NEGOTIABLE MINIMUMS):
- Minimum Price:  $ ${context.baseTerms.minPrice}
- Allowed Usage Rights:  ${context.baseTerms.allowedUsageRights.join(', ')}
- Exclusivity Available:  ${context.baseTerms.exclusivityAvailable ? 'Yes' : 'No'}
- Territory:  ${context.baseTerms.territory}

YOUR ROLE:
1. Understand the buyer's intended use case and budget
2. Negotiate terms that satisfy both parties
3. NEVER go below the minimum price
4. Stay within the allowed usage rights
5. Be professional, friendly, and helpful
6. When terms are agreed, summarize clearly

NEGOTIATION GUIDELINES:
- Be flexible on duration, attribution, and usage scope
- Exclusive rights cost 2-3x non-exclusive
- Commercial use costs more than personal use
- Larger territories (worldwide) cost more than regional

Current Status:  ${context.currentStatus}
Previous Messages:  ${context.history.length} `;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...context.history.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: userMessage }
      ],
    });

    const assistantMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    return {
      message: assistantMessage,
      conversationId: context.conversationId,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  } catch (error) {
    console.error('Claude API Error:', error);
    throw new Error('Failed to negotiate with AI agent');
  }
}

export async function extractFinalTerms(conversationHistory: string): Promise<any> {
  const extractPrompt =  `Review this licensing negotiation and extract the final agreed terms as JSON.

Conversation:
 ${conversationHistory}

Extract and return ONLY a JSON object with these fields:
{
  "price": number,
  "usageRights": string[],
  "exclusivity": boolean,
  "territory": string,
  "duration": string or null,
  "attribution": boolean,
  "agreedTerms": string
}

Return ONLY the JSON, no other text. `;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    messages: [{ role: 'user', content: extractPrompt }],
  });

  const content = response.content[0].type === 'text' 
    ? response.content[0].text 
    : '{}';
  
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}