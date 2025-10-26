// Letta Multi-Agent System for Multilingual Music Licensing Negotiation
// Orchestrates Vietnamese and English specialist agents with persistent memory

import { LettaClient } from '@letta-ai/letta-client';

// Initialize Letta client
function getLettaClient() {
  if (!process.env.LETTA_API_KEY) {
    throw new Error('LETTA_API_KEY is not set in environment variables');
  }

  return new LettaClient({
    token: process.env.LETTA_API_KEY,
    environment: process.env.LETTA_BASE_URL || 'https://api.letta.com',
  });
}

// Agent Types
export type AgentRole = 'orchestrator' | 'vietnamese_negotiator' | 'english_negotiator';

export interface AgentMetadata {
  agentId: string;
  role: AgentRole;
  language: 'vi' | 'en' | 'both';
  model: string;
}

export interface NegotiationMemory {
  trackId: string;
  producerName: string;
  baseTerms: {
    minPrice: number;
    allowedUsageRights: string[];
    exclusivityAvailable: boolean;
    territory: string;
  };
  culturalContext?: string;
  negotiationHistory?: string;
}

// Create Orchestrator Agent
// Routes conversations to appropriate specialist agents based on language detection
export async function createOrchestratorAgent(
  conversationId: string,
  trackMetadata: any
): Promise<AgentMetadata> {
  const client = getLettaClient();

  const systemPrompt = `You are an AI orchestrator for a music licensing platform.

ROLE: Detect user language and route to appropriate specialist agent.

CAPABILITIES:
1. Language Detection: Identify if user speaks Vietnamese or English
2. Context Extraction: Extract negotiation intent from messages
3. Agent Routing: Route to Vietnamese or English specialist agent
4. Response Coordination: Ensure coherent conversation flow

ROUTING RULES:
- Vietnamese text → Route to vietnamese_negotiator
- English text → Route to english_negotiator
- Mixed language → Route based on primary language
- Ambiguous → Ask user for preferred language

RESPONSE FORMAT:
{
  "detected_language": "vi" | "en",
  "target_agent": "vietnamese_negotiator" | "english_negotiator",
  "extracted_intent": "string",
  "confidence": 0-1
}`;

  try {
    const agent = await client.agents.create({
      name: `orchestrator_${conversationId}`,
      model: 'google/gemini-1.5-flash',
      embedding: 'google/text-embedding-004',
      memoryBlocks: [
        {
          label: 'conversation_context',
          value: `Conversation ID: ${conversationId}\nTrack: ${trackMetadata.title}\nArtist: ${trackMetadata.artist}`,
        },
        {
          label: 'routing_rules',
          value: systemPrompt,
        },
      ],
      system: systemPrompt,
    });

    return {
      agentId: agent.id,
      role: 'orchestrator',
      language: 'both',
      model: 'google/gemini-1.5-flash',
    };
  } catch (error) {
    console.error('Error creating orchestrator agent:', error);
    throw new Error('Failed to create orchestrator agent');
  }
}

// Create Vietnamese Negotiation Agent
// Specialized in Vietnamese culture, language, and music licensing norms
export async function createVietnameseNegotiationAgent(
  conversationId: string,
  memory: NegotiationMemory
): Promise<AgentMetadata> {
  const client = getLettaClient();

  const systemPrompt = `Bạn là một chuyên gia đàm phán bản quyền âm nhạc đại diện cho nhà sản xuất Việt Nam.

ĐIỀU KHOẢN CƠ BẢN CỦA NHÀ SẢN XUẤT (KHÔNG THỂ THƯƠNG LƯỢNG):
- Giá tối thiểu: $${memory.baseTerms.minPrice}
- Quyền sử dụng được phép: ${memory.baseTerms.allowedUsageRights.join(', ')}
- Có quyền độc quyền: ${memory.baseTerms.exclusivityAvailable ? 'Có' : 'Không'}
- Khu vực: ${memory.baseTerms.territory}

VAI TRÒ CỦA BẠN:
1. Hiểu ý định sử dụng và ngân sách của người mua
2. Đàm phán điều khoản đáp ứng cả hai bên
3. KHÔNG BAO GIỜ giảm giá dưới mức tối thiểu
4. Duy trì trong phạm vi quyền sử dụng được phép
5. Chuyên nghiệp, thân thiện và hữu ích

NGUYÊN TẮC ĐÀM PHÁN PHÙ HỢP VỚI VĂN HÓA VIỆT NAM:
- Linh hoạt về thời hạn, ghi công tác giả, và phạm vi sử dụng
- Quyền độc quyền có giá gấp 2-3 lần quyền không độc quyền
- Sử dụng thương mại có giá cao hơn sử dụng cá nhân
- Khu vực lớn hơn (toàn cầu) có giá cao hơn khu vực
- Xây dựng mối quan hệ lâu dài, không chỉ giao dịch một lần
- Thể hiện sự tôn trọng và hiểu biết về nhu cầu của khách hàng

Nhà sản xuất: ${memory.producerName}
Bài hát: Track ID ${memory.trackId}`;

  try {
    const agent = await client.agents.create({
      name: `vietnamese_negotiator_${conversationId}`,
      model: 'google/gemini-1.5-flash',
      embedding: 'google/text-embedding-004',
      memoryBlocks: [
        {
          label: 'producer_terms',
          value: JSON.stringify(memory.baseTerms),
        },
        {
          label: 'cultural_context',
          value: memory.culturalContext || 'Vietnamese music producer targeting both local and international markets',
        },
        {
          label: 'negotiation_history',
          value: memory.negotiationHistory || 'New negotiation',
        },
      ],
      system: systemPrompt,
    });

    return {
      agentId: agent.id,
      role: 'vietnamese_negotiator',
      language: 'vi',
      model: 'google/gemini-1.5-flash',
    };
  } catch (error) {
    console.error('Error creating Vietnamese negotiation agent:', error);
    throw new Error('Failed to create Vietnamese negotiation agent');
  }
}

// Create English Negotiation Agent
// Specialized in Western music licensing standards and English communication
export async function createEnglishNegotiationAgent(
  conversationId: string,
  memory: NegotiationMemory
): Promise<AgentMetadata> {
  const client = getLettaClient();

  const systemPrompt = `You are a professional music licensing agent representing a music producer.

PRODUCER'S BASE TERMS (NON-NEGOTIABLE MINIMUMS):
- Minimum Price: $${memory.baseTerms.minPrice}
- Allowed Usage Rights: ${memory.baseTerms.allowedUsageRights.join(', ')}
- Exclusivity Available: ${memory.baseTerms.exclusivityAvailable ? 'Yes' : 'No'}
- Territory: ${memory.baseTerms.territory}

YOUR ROLE:
1. Understand the buyer's intended use case and budget
2. Negotiate terms that satisfy both parties
3. NEVER go below the minimum price
4. Stay within the allowed usage rights
5. Be professional, friendly, and helpful

NEGOTIATION GUIDELINES FOR WESTERN MARKETS:
- Be flexible on duration, attribution, and usage scope
- Exclusive rights cost 2-3x non-exclusive
- Commercial use costs more than personal use
- Larger territories (worldwide) cost more than regional
- Direct and transparent communication style
- Focus on clear legal terms and documentation
- Industry-standard practices (sync licenses, mechanical licenses, etc.)

Producer: ${memory.producerName}
Track: Track ID ${memory.trackId}`;

  try {
    const agent = await client.agents.create({
      name: `english_negotiator_${conversationId}`,
      model: 'google/gemini-1.5-flash',
      embedding: 'google/text-embedding-004',
      memoryBlocks: [
        {
          label: 'producer_terms',
          value: JSON.stringify(memory.baseTerms),
        },
        {
          label: 'market_context',
          value: memory.culturalContext || 'International music producer targeting Western markets (US, EU, etc.)',
        },
        {
          label: 'negotiation_history',
          value: memory.negotiationHistory || 'New negotiation',
        },
      ],
      system: systemPrompt,
    });

    return {
      agentId: agent.id,
      role: 'english_negotiator',
      language: 'en',
      model: 'google/gemini-1.5-flash',
    };
  } catch (error) {
    console.error('Error creating English negotiation agent:', error);
    throw new Error('Failed to create English negotiation agent');
  }
}

// Send message to agent and get response
export async function sendMessageToAgent(
  agentId: string,
  message: string
): Promise<{ response: string; memoryUpdated: boolean }> {
  const client = getLettaClient();

  try {
    const response = await client.agents.messages.create(agentId, {
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    // Extract assistant response from Letta response
    const assistantMessage = response.messages
      .filter((msg: any) => msg.role === 'assistant')
      .map((msg: any) => msg.content)
      .join('\n');

    return {
      response: assistantMessage || 'No response generated',
      memoryUpdated: true, // Letta automatically updates agent memory
    };
  } catch (error) {
    console.error('Error sending message to agent:', error);
    throw new Error('Failed to send message to agent');
  }
}

// Get agent's memory state (for debugging/monitoring)
export async function getAgentMemory(agentId: string): Promise<any> {
  const client = getLettaClient();

  try {
    const blocks = await client.agents.blocks.list(agentId);
    return blocks || [];
  } catch (error) {
    console.error('Error retrieving agent memory:', error);
    return [];
  }
}

// Multi-Agent Orchestration Flow
export async function handleMultiAgentNegotiation(
  conversationId: string,
  trackMetadata: any,
  negotiationMemory: NegotiationMemory,
  userMessage: string,
  orchestratorAgentId?: string
): Promise<{
  response: string;
  detectedLanguage: 'vi' | 'en';
  agentUsed: AgentRole;
  orchestratorId: string;
  negotiatorId: string;
}> {
  try {
    // Step 1: Create or get orchestrator agent
    let orchestrator: AgentMetadata;
    if (orchestratorAgentId) {
      orchestrator = { agentId: orchestratorAgentId, role: 'orchestrator', language: 'both', model: '' };
    } else {
      orchestrator = await createOrchestratorAgent(conversationId, trackMetadata);
    }

    // Step 2: Send message to orchestrator for language detection and routing
    // Note: For now we use simple language detection, but orchestrator could provide routing decision
    await sendMessageToAgent(orchestrator.agentId, userMessage);

    // Step 3: Detect language (simple heuristic for now)
    // In production, orchestrator would return structured routing decision
    const detectedLanguage = detectLanguage(userMessage);

    // Step 4: Create or route to specialist agent
    let negotiator: AgentMetadata;
    if (detectedLanguage === 'vi') {
      negotiator = await createVietnameseNegotiationAgent(conversationId, negotiationMemory);
    } else {
      negotiator = await createEnglishNegotiationAgent(conversationId, negotiationMemory);
    }

    // Step 5: Send message to specialist negotiation agent
    const negotiationResponse = await sendMessageToAgent(negotiator.agentId, userMessage);

    return {
      response: negotiationResponse.response,
      detectedLanguage,
      agentUsed: negotiator.role,
      orchestratorId: orchestrator.agentId,
      negotiatorId: negotiator.agentId,
    };
  } catch (error) {
    console.error('Multi-agent negotiation error:', error);
    throw new Error('Failed to process multi-agent negotiation');
  }
}

// Simple language detection helper (can be enhanced with orchestrator agent)
function detectLanguage(text: string): 'vi' | 'en' {
  // Vietnamese specific characters
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

  if (vietnamesePattern.test(text)) {
    return 'vi';
  }

  return 'en';
}

// Delete agent (cleanup)
export async function deleteAgent(agentId: string): Promise<void> {
  const client = getLettaClient();

  try {
    await client.agents.delete(agentId);
  } catch (error) {
    console.error('Error deleting agent:', error);
  }
}

// Helper: Check if Letta is configured
export function isLettaConfigured(): boolean {
  return !!(process.env.LETTA_API_KEY);
}

export { getLettaClient };
