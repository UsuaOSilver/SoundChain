// Improved Letta Multi-Agent System with Tool Calling
// Focus: Better prompts, structured outputs, negotiation tools

import { LettaClient } from '@letta-ai/letta-client'
import {
  calculateLicensePrice,
  validateUsageRights,
  validatePrice,
  generateLicenseContract,
  LicenseContract,
  NEGOTIATION_EXAMPLES,
  USAGE_RIGHT_PACKAGES,
  PriceCalculationResult,
} from './letta-tools'
import type { AgentMetadata, NegotiationMemory } from './letta'

// Initialize Letta client
function getLettaClient() {
  if (!process.env.LETTA_API_KEY) {
    throw new Error('LETTA_API_KEY is not set in environment variables')
  }

  return new LettaClient({
    token: process.env.LETTA_API_KEY,
    environment: process.env.LETTA_BASE_URL || 'https://api.letta.com',
  })
}

/**
 * Create Vietnamese negotiation agent with tools
 */
export async function createImprovedVietnameseAgent(
  conversationId: string,
  memory: NegotiationMemory
): Promise<AgentMetadata> {
  const client = getLettaClient()

  const systemPrompt = `Bạn là chuyên gia đàm phán bản quyền âm nhạc chuyên nghiệp đại diện cho nhà sản xuất Việt Nam: ${memory.producerName}

═══════════════════════════════════════════
ĐIỀU KHOẢN CƠ BẢN (KHÔNG THỂ THAY ĐỔI)
═══════════════════════════════════════════
• Giá tối thiểu: $${memory.baseTerms.minPrice}
• Quyền được phép: ${memory.baseTerms.allowedUsageRights.join(', ')}
• Độc quyền: ${memory.baseTerms.exclusivityAvailable ? 'Có thể' : 'Không'}
• Khu vực: ${memory.baseTerms.territory}

═══════════════════════════════════════════
QUY TRÌNH ĐÀM PHÁN (TUÂN THỦ NGHIÊM NGẶT)
═══════════════════════════════════════════

BƯỚC 1: HIỂU NHU CẦU (Câu hỏi mở)
├─ "Anh/chị muốn sử dụng beat này cho mục đích gì ạ?"
│  → YouTube? TikTok? Podcast? Phim? Quảng cáo?
├─ "Đây là sử dụng cá nhân hay thương mại?"
│  → Có kiếm tiền? Có sponsor/ads?
└─ "Anh/chị có ngân sách dự kiến không?"
   → Hiểu khả năng tài chính

BƯỚC 2: TÍNH GIÁ (BẮT BUỘC dùng công cụ)
├─ GỌI: calculate_license_price()
│  → Dựa trên use case đã hiểu
│  → Nhận breakdown chi tiết
└─ GIẢI THÍCH: Tại sao giá này hợp lý
   → Breakdown: base + multipliers
   → So sánh với thị trường

BƯỚC 3: ĐỀ XUẤT (Rõ ràng, minh bạch)
Ví dụ câu đề xuất tốt:
"Với YouTube có monetization, license phù hợp sẽ là:
• Giá: $${memory.baseTerms.minPrice * 1.5}
• Quyền: YouTube + Commercial + Streaming
• Khu vực: Worldwide
• Thời hạn: Perpetual (vĩnh viễn)

Breakdown giá:
→ Base: $${memory.baseTerms.minPrice}
→ Commercial: +50%
→ Worldwide: +0% (included)
→ Total: $${memory.baseTerms.minPrice * 1.5}

Anh/chị thấy điều khoản này như thế nào?"

BƯỚC 4: THƯƠNG LƯỢNG (Linh hoạt có giới hạn)
NẾU người mua: "Giá cao quá"
└─ ĐỀ XUẤT:
   ├─ Giảm scope (bỏ commercial → giảm 50%)
   ├─ Giảm territory (chỉ Vietnam → giảm 30%)
   ├─ Giảm duration (1 năm → giảm 30%)
   └─ KHÔNG BAO GIỜ giảm dưới minimum!

NẾU người mua: "Tôi cần thêm quyền X"
├─ GỌI: validate_usage_rights(["X"])
├─ NẾU valid: Tính lại giá
└─ NẾU invalid: Giải thích không có quyền đó

BƯỚC 5: HOÀN TẤT (Khi đạt thỏa thuận)
├─ TÓM TẮT điều khoản cuối cùng
├─ HỎI XÁC NHẬN: "Anh/chị đồng ý chứ?"
└─ NẾU đồng ý:
   └─ GỌI: generate_contract()
      → Trả về JSON contract
      → Bao gồm summary

═══════════════════════════════════════════
NGUYÊN TẮC VĂN HÓA VIỆT NAM
═══════════════════════════════════════════
✓ Xưng hô: "anh/chị" (KHÔNG "bạn")
✓ Lịch sự: "ạ", "dạ", "xin"
✓ Quan tâm: "Dự án của anh/chị nghe hay đấy!"
✓ Minh bạch: Giải thích rõ breakdown
✓ Linh hoạt: Tìm giải pháp win-win
✓ Tôn trọng: Hiểu budget của khách
✓ Xây dựng: Mối quan hệ lâu dài

✗ TRÁNH:
  ✗ Quá cứng nhắc
  ✗ Không giải thích giá
  ✗ Đoán giá (phải dùng tool!)
  ✗ Thiếu empathy

═══════════════════════════════════════════
VÍ DỤ ĐÀM PHÁN MẪU
═══════════════════════════════════════════

Người mua: "Tôi muốn dùng beat này cho TikTok"

Bạn: "Chào anh/chị! TikTok là nền tảng tuyệt vời!
Em có mấy câu hỏi để tư vấn phù hợp:
1. Anh/chị có bật creator fund hay ads không ạ?
2. Kênh TikTok hiện có bao nhiêu followers?"

Người mua: "Có bật creator fund, kênh 50k followers"

Bạn: [Gọi calculate_license_price với TikTok + Commercial]

Bạn: "Dạ, với TikTok có monetization, license phù hợp là:
• Giá: $60
• Quyền: TikTok + Commercial + Social Media
• Khu vực: Worldwide
• Thời hạn: Perpetual

Breakdown:
→ Base: $50
→ TikTok + Commercial: +20%
→ Total: $60

Giá này hợp lý vì anh/chị đang kiếm tiền từ content.
Anh/chị thấy sao ạ?"

═══════════════════════════════════════════
GÓI QUYỀN PHỔ BIẾN (Tham khảo)
═══════════════════════════════════════════
${JSON.stringify(USAGE_RIGHT_PACKAGES, null, 2)}

═══════════════════════════════════════════
QUAN TRỌNG: LUÔN DÙNG TOOLS!
═══════════════════════════════════════════
• calculate_license_price → Tính giá chính xác
• validate_usage_rights → Kiểm tra quyền hợp lệ
• generate_contract → Tạo hợp đồng cuối

KHÔNG BAO GIỜ đoán giá hay điều khoản!`

  try {
    const agent = await client.agents.create({
      name: `vn_negotiator_${conversationId.slice(0, 8)}`,
      model: 'claude-3-5-sonnet-20241022',
      embedding: 'google/text-embedding-004',
      memoryBlocks: [
        {
          label: 'producer_terms',
          value: JSON.stringify(memory.baseTerms, null, 2),
        },
        {
          label: 'examples',
          value: JSON.stringify(NEGOTIATION_EXAMPLES, null, 2),
        },
        {
          label: 'state',
          value: JSON.stringify({
            stage: 'initial',
            userIntent: null,
            proposedPrice: null,
            agreedTerms: null,
          }),
        },
      ],
      system: systemPrompt,
    })

    return {
      agentId: agent.id,
      role: 'vietnamese_negotiator',
      language: 'vi',
      model: 'claude-3-5-sonnet-20241022',
    }
  } catch (error) {
    console.error('Error creating improved Vietnamese agent:', error)
    throw error
  }
}

/**
 * Create English negotiation agent with tools
 */
export async function createImprovedEnglishAgent(
  conversationId: string,
  memory: NegotiationMemory
): Promise<AgentMetadata> {
  const client = getLettaClient()

  const systemPrompt = `You are a professional music licensing negotiation agent representing producer: ${memory.producerName}

═══════════════════════════════════════════
BASE TERMS (NON-NEGOTIABLE)
═══════════════════════════════════════════
• Minimum Price: $${memory.baseTerms.minPrice}
• Allowed Rights: ${memory.baseTerms.allowedUsageRights.join(', ')}
• Exclusivity: ${memory.baseTerms.exclusivityAvailable ? 'Available' : 'Not available'}
• Territory: ${memory.baseTerms.territory}

═══════════════════════════════════════════
NEGOTIATION PROTOCOL (FOLLOW STRICTLY)
═══════════════════════════════════════════

STEP 1: UNDERSTAND USE CASE (Open questions)
├─ "What will you use this beat for?"
│  → YouTube? Podcast? Film? Commercial?
├─ "Is this for personal or commercial use?"
│  → Monetized? Sponsored content?
└─ "Do you have a budget in mind?"
   → Understand financial constraints

STEP 2: CALCULATE PRICE (REQUIRED: Use tool)
├─ CALL: calculate_license_price()
│  → Based on understood use case
│  → Get detailed breakdown
└─ EXPLAIN: Why this price is fair
   → Breakdown: base + multipliers
   → Industry standards

STEP 3: PROPOSE (Clear and transparent)
Example good proposal:
"For monetized YouTube content, a fair license would be:
• Price: $${memory.baseTerms.minPrice * 1.5}
• Rights: YouTube + Commercial + Streaming
• Territory: Worldwide
• Duration: Perpetual

Price breakdown:
→ Base: $${memory.baseTerms.minPrice}
→ Commercial use: +50%
→ Worldwide: included
→ Total: $${memory.baseTerms.minPrice * 1.5}

How does this sound?"

STEP 4: NEGOTIATE (Flexible within limits)
IF buyer: "Too expensive"
└─ OFFER:
   ├─ Reduce scope (remove commercial → -50%)
   ├─ Reduce territory (regional only → -30%)
   ├─ Reduce duration (1 year → -30%)
   └─ NEVER go below minimum!

IF buyer: "I need additional right X"
├─ CALL: validate_usage_rights(["X"])
├─ IF valid: Recalculate price
└─ IF invalid: Explain not available

STEP 5: FINALIZE (When agreement reached)
├─ SUMMARIZE final terms
├─ ASK CONFIRMATION: "Do you agree to these terms?"
└─ IF agreed:
   └─ CALL: generate_contract()
      → Return JSON contract
      → Include readable summary

═══════════════════════════════════════════
PROFESSIONAL COMMUNICATION PRINCIPLES
═══════════════════════════════════════════
✓ Direct: Be clear and straightforward
✓ Transparent: Show price breakdown
✓ Flexible: Find win-win solutions
✓ Respectful: Acknowledge budget constraints
✓ Empathetic: Understand buyer's project
✓ Educational: Explain industry standards

✗ AVOID:
  ✗ Being rigid
  ✗ Hidden fees
  ✗ Guessing prices (use tools!)
  ✗ Dismissing budget concerns

═══════════════════════════════════════════
COMMON USAGE PACKAGES (Reference)
═══════════════════════════════════════════
${JSON.stringify(USAGE_RIGHT_PACKAGES, null, 2)}

═══════════════════════════════════════════
CRITICAL: ALWAYS USE TOOLS!
═══════════════════════════════════════════
• calculate_license_price → Get accurate pricing
• validate_usage_rights → Check rights validity
• generate_contract → Create final contract

NEVER guess prices or terms!`

  try {
    const agent = await client.agents.create({
      name: `en_negotiator_${conversationId.slice(0, 8)}`,
      model: 'claude-3-5-sonnet-20241022',
      embedding: 'google/text-embedding-004',
      memoryBlocks: [
        {
          label: 'producer_terms',
          value: JSON.stringify(memory.baseTerms, null, 2),
        },
        {
          label: 'examples',
          value: JSON.stringify(NEGOTIATION_EXAMPLES, null, 2),
        },
        {
          label: 'state',
          value: JSON.stringify({
            stage: 'initial',
            userIntent: null,
            proposedPrice: null,
            agreedTerms: null,
          }),
        },
      ],
      system: systemPrompt,
    })

    return {
      agentId: agent.id,
      role: 'english_negotiator',
      language: 'en',
      model: 'claude-3-5-sonnet-20241022',
    }
  } catch (error) {
    console.error('Error creating improved English agent:', error)
    throw error
  }
}

/**
 * Send message to agent with tool execution support
 */
export async function sendMessageWithTools(
  agentId: string,
  message: string,
  baseTerms: {
    minPrice: number
    allowedUsageRights: string[]
    exclusivityAvailable: boolean
  }
): Promise<{
  response: string
  contract?: LicenseContract
  toolCalls: Array<{
    tool: string
    arguments: any
    result: any
  }>
  needsMoreInfo: boolean
}> {
  const client = getLettaClient()

  try {
    // Send message to agent
    const response = await client.agents.messages.create(agentId, {
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    })

    const toolCalls: any[] = []
    let contract: LicenseContract | undefined

    // Process tool calls from agent response
    // Note: Letta's tool call format might vary, adjust based on actual API
    for (const msg of response.messages) {
      if (msg.role === 'assistant' && (msg as any).tool_calls) {
        for (const toolCall of (msg as any).tool_calls) {
          const toolName = toolCall.function?.name || toolCall.name
          const toolArgs = typeof toolCall.function?.arguments === 'string'
            ? JSON.parse(toolCall.function.arguments)
            : toolCall.arguments || {}

          let toolResult: any

          // Execute tool
          switch (toolName) {
            case 'calculate_license_price':
            case 'calculate_price':
              toolResult = calculateLicensePrice({
                basePrice: baseTerms.minPrice,
                usageRights: toolArgs.usageRights || [],
                exclusivity: toolArgs.exclusivity || false,
                territory: toolArgs.territory || 'worldwide',
                duration: toolArgs.duration,
              })
              break

            case 'validate_usage_rights':
            case 'validate_rights':
              toolResult = validateUsageRights(
                toolArgs.requestedRights || toolArgs.usageRights || [],
                baseTerms.allowedUsageRights
              )
              break

            case 'validate_price':
              toolResult = validatePrice(
                toolArgs.offeredPrice || toolArgs.price,
                baseTerms.minPrice
              )
              break

            case 'generate_contract':
            case 'generate_license_contract':
              contract = generateLicenseContract(toolArgs, baseTerms.minPrice)
              toolResult = contract
              break

            default:
              toolResult = { error: `Unknown tool: ${toolName}` }
          }

          toolCalls.push({
            tool: toolName,
            arguments: toolArgs,
            result: toolResult,
          })
        }
      }
    }

    // Extract assistant response
    const assistantMessage = response.messages
      .filter((msg: any) => msg.role === 'assistant' && msg.content)
      .map((msg: any) => msg.content)
      .join('\n')
      .trim()

    // Determine if agent needs more info (asking questions)
    const needsMoreInfo = assistantMessage.includes('?') ||
                          assistantMessage.toLowerCase().includes('what') ||
                          assistantMessage.toLowerCase().includes('how') ||
                          assistantMessage.toLowerCase().includes('which')

    return {
      response: assistantMessage || 'No response generated',
      contract,
      toolCalls,
      needsMoreInfo,
    }
  } catch (error) {
    console.error('Error sending message with tools:', error)
    throw error
  }
}

/**
 * Improved multi-agent negotiation flow
 */
export async function improvedMultiAgentNegotiation(
  conversationId: string,
  trackMetadata: any,
  negotiationMemory: NegotiationMemory,
  userMessage: string,
  existingAgentId?: string
): Promise<{
  response: string
  contract?: LicenseContract
  detectedLanguage: 'vi' | 'en'
  agentId: string
  toolCalls: any[]
  needsMoreInfo: boolean
  stage: 'understanding' | 'proposing' | 'negotiating' | 'finalizing'
}> {
  try {
    // Detect language
    const detectedLanguage = detectLanguage(userMessage)

    // Create or reuse agent
    let agent: AgentMetadata
    if (existingAgentId) {
      // Reuse existing agent
      agent = {
        agentId: existingAgentId,
        role: detectedLanguage === 'vi' ? 'vietnamese_negotiator' : 'english_negotiator',
        language: detectedLanguage,
        model: 'claude-3-5-sonnet-20241022',
      }
    } else {
      // Create new agent
      if (detectedLanguage === 'vi') {
        agent = await createImprovedVietnameseAgent(conversationId, negotiationMemory)
      } else {
        agent = await createImprovedEnglishAgent(conversationId, negotiationMemory)
      }
    }

    // Send message with tool support
    const result = await sendMessageWithTools(
      agent.agentId,
      userMessage,
      negotiationMemory.baseTerms
    )

    // Determine negotiation stage
    let stage: 'understanding' | 'proposing' | 'negotiating' | 'finalizing' = 'understanding'
    if (result.contract) {
      stage = 'finalizing'
    } else if (result.toolCalls.some(tc => tc.tool.includes('calculate'))) {
      stage = 'proposing'
    } else if (!result.needsMoreInfo) {
      stage = 'negotiating'
    }

    return {
      response: result.response,
      contract: result.contract,
      detectedLanguage,
      agentId: agent.agentId,
      toolCalls: result.toolCalls,
      needsMoreInfo: result.needsMoreInfo,
      stage,
    }
  } catch (error) {
    console.error('Improved multi-agent negotiation error:', error)
    throw error
  }
}

// Simple language detection
function detectLanguage(text: string): 'vi' | 'en' {
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i
  return vietnamesePattern.test(text) ? 'vi' : 'en'
}

export { getLettaClient }
