// Groq-powered negotiation (4x faster than Claude)
// Perfect for real-time sales-like interactions

import { groqNegotiate, GroqMessage } from './groq-client'
import {
  calculateLicensePrice,
  validateUsageRights,
  generateLicenseContract,
  LicenseContract,
} from './letta-tools'
import type { NegotiationMemory } from './letta'

/**
 * Fast negotiation using Groq instead of Claude/Letta
 * Use this for speed-critical scenarios (live demos, high traffic)
 */
export async function groqMultiAgentNegotiation(
  conversationId: string,
  negotiationMemory: NegotiationMemory,
  userMessage: string,
  conversationHistory: GroqMessage[] = []
): Promise<{
  response: string
  contract?: LicenseContract
  detectedLanguage: 'vi' | 'en'
  toolCalls: any[]
  needsMoreInfo: boolean
  stage: 'understanding' | 'proposing' | 'negotiating' | 'finalizing'
  responseTime: number // Track speed for demos
}> {
  const startTime = Date.now()

  // Detect language
  const detectedLanguage = detectLanguage(userMessage)

  // Build system prompt based on language
  const systemPrompt = detectedLanguage === 'vi'
    ? buildVietnameseSystemPrompt(negotiationMemory)
    : buildEnglishSystemPrompt(negotiationMemory)

  // Build messages
  const messages: GroqMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ]

  // Get response from Groq (FAST!)
  const responseText = await groqNegotiate(messages, 0.7)

  // Parse tool calls from response (if any)
  const { toolCalls, extractedData } = parseResponseForTools(
    responseText,
    userMessage,
    negotiationMemory.baseTerms
  )

  // Generate contract if user agreed
  let contract: LicenseContract | undefined
  if (extractedData.userAgreed && extractedData.proposedTerms) {
    contract = generateLicenseContract(
      extractedData.proposedTerms,
      negotiationMemory.baseTerms.minPrice
    )
  }

  // Determine negotiation stage
  let stage: 'understanding' | 'proposing' | 'negotiating' | 'finalizing' = 'understanding'
  if (contract) {
    stage = 'finalizing'
  } else if (toolCalls.length > 0 && toolCalls.some(tc => tc.tool.includes('calculate'))) {
    stage = 'proposing'
  } else if (responseText.match(/\$\d+/) || responseText.includes('giá')) {
    stage = 'negotiating'
  }

  const needsMoreInfo = responseText.includes('?')

  const responseTime = Date.now() - startTime

  return {
    response: responseText,
    contract,
    detectedLanguage,
    toolCalls,
    needsMoreInfo,
    stage,
    responseTime,
  }
}

/**
 * Vietnamese system prompt (optimized for Groq speed)
 */
function buildVietnameseSystemPrompt(memory: NegotiationMemory): string {
  return `Bạn là chuyên gia đàm phán bản quyền âm nhạc đại diện cho ${memory.producerName}.

ĐIỀU KHOẢN CƠ BẢN:
• Giá tối thiểu: $${memory.baseTerms.minPrice}
• Quyền được phép: ${memory.baseTerms.allowedUsageRights.join(', ')}
• Độc quyền: ${memory.baseTerms.exclusivityAvailable ? 'Có thể' : 'Không'}

QUY TRÌNH NHANH (3 BƯỚC):
1. HỎI mục đích: "Anh/chị dùng cho gì?" (YouTube? TikTok? Podcast?)
2. TÍNH + ĐỀ XUẤT: "Với [use case], giá $X (base $${memory.baseTerms.minPrice} + Y% [reason])"
3. KẾT THÚC: Khi đồng ý → "Tuyệt vời! Hợp đồng đã sẵn sàng"

CÔNG THỨC GIÁ:
• YouTube có ads: base * 1.5 (+50% commercial)
• TikTok có ads: base * 1.4 (+40%)
• Podcast có ads: base * 1.5 (+50%)
• Film/phim: base * 1.8 (+80%)
• Độc quyền: base * 2.5 (2.5x)

NGUYÊN TẮC:
✓ Xưng "anh/chị" (không "bạn")
✓ Trả lời NGẮN (1-2 câu) để NHANH
✓ Giải thích giá MINH BẠCH
✓ Linh hoạt (giảm scope nếu budget thấp)
✗ KHÔNG giảm dưới $${memory.baseTerms.minPrice}

VÍ DỤ NHANH:
User: "Tôi muốn dùng cho YouTube"
Bạn: "Chào anh/chị! Anh/chị có bật kiếm tiền không ạ?"

User: "Có, kênh 50k subs"
Bạn: "Với YouTube có ads, giá $${Math.round(memory.baseTerms.minPrice * 1.5)} (base $${memory.baseTerms.minPrice} + 50% commercial, worldwide, perpetual). Anh/chị thấy sao?"

User: "Được"
Bạn: "Tuyệt vời! Hợp đồng: $${Math.round(memory.baseTerms.minPrice * 1.5)}, YouTube + Commercial, worldwide, vĩnh viễn. Xác nhận nhé!"

LƯU Ý: Trả lời NHANH CHÓNG và TẬN DỤNG!`
}

/**
 * English system prompt (optimized for Groq speed)
 */
function buildEnglishSystemPrompt(memory: NegotiationMemory): string {
  return `You are a music licensing expert representing ${memory.producerName}.

BASE TERMS:
• Minimum Price: $${memory.baseTerms.minPrice}
• Allowed Rights: ${memory.baseTerms.allowedUsageRights.join(', ')}
• Exclusivity: ${memory.baseTerms.exclusivityAvailable ? 'Available' : 'Not available'}

FAST PROTOCOL (3 STEPS):
1. ASK use case: "What's this for?" (YouTube? TikTok? Podcast?)
2. CALCULATE + PROPOSE: "For [use case], $X (base $${memory.baseTerms.minPrice} + Y% [reason])"
3. CLOSE: When agreed → "Great! Contract ready"

PRICING FORMULA:
• Monetized YouTube: base * 1.5 (+50% commercial)
• Monetized TikTok: base * 1.4 (+40%)
• Commercial Podcast: base * 1.5 (+50%)
• Film/Movie: base * 1.8 (+80%)
• Exclusive: base * 2.5 (2.5x)

PRINCIPLES:
✓ Keep responses SHORT (1-2 sentences) for SPEED
✓ Show price BREAKDOWN
✓ Be flexible (reduce scope if low budget)
✗ NEVER go below $${memory.baseTerms.minPrice}

FAST EXAMPLE:
User: "I want to use this for YouTube"
You: "Great! Is your channel monetized?"

User: "Yes, 50k subscribers"
You: "For monetized YouTube: $${Math.round(memory.baseTerms.minPrice * 1.5)} (base $${memory.baseTerms.minPrice} + 50% commercial, worldwide, perpetual). Sound good?"

User: "Yes"
You: "Perfect! Contract: $${Math.round(memory.baseTerms.minPrice * 1.5)}, YouTube + Commercial rights, worldwide, perpetual. Confirmed!"

NOTE: Be FAST and TO THE POINT!`
}

/**
 * Parse response for tool usage and extracted data
 * Since Groq doesn't have native tool calling, we parse from text
 */
function parseResponseForTools(
  responseText: string,
  userMessage: string,
  baseTerms: any
): {
  toolCalls: any[]
  extractedData: any
} {
  const toolCalls: any[] = []
  const extractedData: any = {
    userAgreed: false,
    proposedTerms: null,
  }

  // Check if user agreed
  const agreementPatterns = [
    /đồng ý/i,
    /được/i,
    /ok|okay/i,
    /agree/i,
    /accept/i,
    /^yes$/i,
    /sounds good/i,
    /perfect/i,
  ]
  extractedData.userAgreed = agreementPatterns.some(pattern =>
    pattern.test(userMessage.toLowerCase())
  )

  // Extract proposed price if mentioned in response
  const priceMatch = responseText.match(/\$(\d+\.?\d*)/)
  if (priceMatch) {
    const price = parseFloat(priceMatch[1])

    // Infer usage rights from context
    const usageRights: string[] = []
    if (/youtube/i.test(responseText) || /youtube/i.test(userMessage)) {
      usageRights.push('YOUTUBE')
    }
    if (/tiktok/i.test(responseText) || /tiktok/i.test(userMessage)) {
      usageRights.push('TIKTOK')
    }
    if (/podcast/i.test(responseText) || /podcast/i.test(userMessage)) {
      usageRights.push('PODCAST')
    }
    if (/commercial|monetize|ads/i.test(responseText) || /commercial|monetize|ads/i.test(userMessage)) {
      usageRights.push('COMMERCIAL')
    }
    if (usageRights.length === 0) {
      usageRights.push('STREAMING') // Default
    }

    // Calculate actual price
    const priceCalc = calculateLicensePrice({
      basePrice: baseTerms.minPrice,
      usageRights,
      exclusivity: false,
      territory: 'worldwide',
    })

    toolCalls.push({
      tool: 'calculate_license_price',
      arguments: {
        basePrice: baseTerms.minPrice,
        usageRights,
        exclusivity: false,
        territory: 'worldwide',
      },
      result: priceCalc,
    })

    // If user agreed, prepare contract terms
    if (extractedData.userAgreed) {
      extractedData.proposedTerms = {
        price: priceCalc.finalPrice, // Use calculated price
        usageRights,
        exclusivity: false,
        territory: 'worldwide',
        duration: null,
        attribution: true,
      }

      toolCalls.push({
        tool: 'generate_contract',
        arguments: extractedData.proposedTerms,
        result: { status: 'pending' },
      })
    }
  }

  return { toolCalls, extractedData }
}

/**
 * Detect language from text
 */
function detectLanguage(text: string): 'vi' | 'en' {
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i
  return vietnamesePattern.test(text) ? 'vi' : 'en'
}
