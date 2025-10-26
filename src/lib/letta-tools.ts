// Negotiation tools that Letta agents can call
// These provide structured calculation and validation

export interface PriceCalculationParams {
  basePrice: number
  usageRights: string[]
  exclusivity: boolean
  territory: 'regional' | 'national' | 'worldwide'
  duration?: number // months, null = perpetual
}

export interface PriceCalculationResult {
  finalPrice: number
  breakdown: {
    basePrice: number
    usageMultiplier: number
    exclusivityMultiplier: number
    territoryMultiplier: number
    durationDiscount: number
  }
  reasoning: string
}

/**
 * Calculate license price based on usage terms
 * Industry-standard multipliers
 */
export function calculateLicensePrice(
  params: PriceCalculationParams
): PriceCalculationResult {
  const {
    basePrice,
    usageRights,
    exclusivity,
    territory,
    duration,
  } = params

  let finalPrice = basePrice

  // Usage rights multiplier
  let usageMultiplier = 1.0
  const rights = usageRights.map(r => r.toUpperCase())

  if (rights.includes('COMMERCIAL')) {
    usageMultiplier += 0.5 // +50% for commercial
  }
  if (rights.includes('BROADCAST') || rights.includes('TV')) {
    usageMultiplier += 0.3 // +30% for broadcast
  }
  if (rights.includes('FILM') || rights.includes('MOVIE')) {
    usageMultiplier += 0.4 // +40% for film
  }
  if (rights.includes('STREAMING')) {
    usageMultiplier += 0.1 // +10% for streaming
  }
  if (rights.includes('YOUTUBE') || rights.includes('TIKTOK')) {
    usageMultiplier += 0.2 // +20% for social media
  }

  finalPrice *= usageMultiplier

  // Exclusivity multiplier
  const exclusivityMultiplier = exclusivity ? 2.5 : 1.0
  finalPrice *= exclusivityMultiplier

  // Territory multiplier
  const territoryMultiplier =
    territory === 'worldwide' ? 1.5 :
    territory === 'national' ? 1.2 : 1.0

  finalPrice *= territoryMultiplier

  // Duration discount (shorter = cheaper)
  let durationDiscount = 1.0
  if (duration && duration <= 12) {
    durationDiscount = 0.7 // 30% discount for ≤ 1 year
  } else if (duration && duration <= 36) {
    durationDiscount = 0.85 // 15% discount for ≤ 3 years
  }

  finalPrice *= durationDiscount

  // Round to 2 decimals
  finalPrice = Math.round(finalPrice * 100) / 100

  return {
    finalPrice,
    breakdown: {
      basePrice,
      usageMultiplier,
      exclusivityMultiplier,
      territoryMultiplier,
      durationDiscount,
    },
    reasoning: buildPriceReasoning(params, finalPrice, {
      usageMultiplier,
      exclusivityMultiplier,
      territoryMultiplier,
      durationDiscount,
    }),
  }
}

function buildPriceReasoning(
  params: PriceCalculationParams,
  finalPrice: number,
  multipliers: any
): string {
  const parts: string[] = []

  parts.push(`Base price: $${params.basePrice}`)

  if (params.usageRights.some(r => r.toUpperCase().includes('COMMERCIAL'))) {
    parts.push('Commercial use: +50%')
  }
  if (params.usageRights.some(r => ['FILM', 'MOVIE'].includes(r.toUpperCase()))) {
    parts.push('Film/movie rights: +40%')
  }
  if (params.usageRights.some(r => ['BROADCAST', 'TV'].includes(r.toUpperCase()))) {
    parts.push('Broadcast rights: +30%')
  }
  if (params.usageRights.some(r => ['YOUTUBE', 'TIKTOK'].includes(r.toUpperCase()))) {
    parts.push('Social media rights: +20%')
  }
  if (params.exclusivity) {
    parts.push('Exclusive license: 2.5x multiplier')
  }
  if (params.territory === 'worldwide') {
    parts.push('Worldwide territory: +50%')
  } else if (params.territory === 'national') {
    parts.push('National territory: +20%')
  }
  if (params.duration && params.duration <= 12) {
    parts.push('1-year duration: 30% discount')
  } else if (params.duration && params.duration <= 36) {
    parts.push('3-year duration: 15% discount')
  }

  parts.push(`Final price: $${finalPrice}`)

  return parts.join(' • ')
}

/**
 * Validate if requested rights are allowed
 */
export function validateUsageRights(
  requestedRights: string[],
  allowedRights: string[]
): { valid: boolean; invalidRights: string[]; message: string } {
  const normalizedRequested = requestedRights.map(r => r.toUpperCase())
  const normalizedAllowed = allowedRights.map(r => r.toUpperCase())

  const invalidRights = normalizedRequested.filter(
    (right) => !normalizedAllowed.includes(right)
  )

  if (invalidRights.length > 0) {
    return {
      valid: false,
      invalidRights,
      message: `These rights are not available: ${invalidRights.join(', ')}. Available rights: ${allowedRights.join(', ')}`,
    }
  }

  return {
    valid: true,
    invalidRights: [],
    message: 'All requested rights are available',
  }
}

/**
 * Check if price meets producer's minimum
 */
export function validatePrice(
  offeredPrice: number,
  minimumPrice: number
): { valid: boolean; message: string } {
  if (offeredPrice < minimumPrice) {
    return {
      valid: false,
      message: `Price $${offeredPrice} is below minimum of $${minimumPrice}`,
    }
  }

  return {
    valid: true,
    message: `Price $${offeredPrice} meets minimum requirement`,
  }
}

/**
 * Generate structured license contract from negotiated terms
 */
export interface LicenseContract {
  price: number
  currency: string
  usageRights: string[]
  exclusivity: boolean
  territory: string
  duration: number | null // null = perpetual
  attribution: boolean
  customTerms?: string
  summary: string
  breakdown?: PriceCalculationResult
}

export function generateLicenseContract(
  negotiatedTerms: any,
  basePrice?: number
): LicenseContract {
  const contract: LicenseContract = {
    price: negotiatedTerms.price || 0,
    currency: negotiatedTerms.currency || 'USD',
    usageRights: negotiatedTerms.usageRights || [],
    exclusivity: negotiatedTerms.exclusivity || false,
    territory: negotiatedTerms.territory || 'worldwide',
    duration: negotiatedTerms.duration || null,
    attribution: negotiatedTerms.attribution !== false,
    customTerms: negotiatedTerms.customTerms,
    summary: '',
  }

  // Calculate breakdown if basePrice provided
  if (basePrice) {
    contract.breakdown = calculateLicensePrice({
      basePrice,
      usageRights: contract.usageRights,
      exclusivity: contract.exclusivity,
      territory: contract.territory as any,
      duration: contract.duration || undefined,
    })
  }

  // Generate human-readable summary
  contract.summary = buildContractSummary(contract)

  return contract
}

function buildContractSummary(contract: LicenseContract): string {
  const parts: string[] = []

  // Price & exclusivity
  const exclusivityText = contract.exclusivity ? 'Exclusive' : 'Non-exclusive'
  parts.push(`${exclusivityText} license for $${contract.price}`)

  // Usage rights
  parts.push(`Rights: ${contract.usageRights.join(', ')}`)

  // Territory
  parts.push(`Territory: ${contract.territory}`)

  // Duration
  if (contract.duration) {
    const years = Math.floor(contract.duration / 12)
    const months = contract.duration % 12
    const durationText = years > 0
      ? `${years} year${years > 1 ? 's' : ''}`
      : `${months} month${months > 1 ? 's' : ''}`
    parts.push(`Duration: ${durationText}`)
  } else {
    parts.push('Duration: Perpetual')
  }

  // Attribution
  if (contract.attribution) {
    parts.push('Attribution required')
  }

  return parts.join(' • ')
}

/**
 * Example negotiation scenarios for agent training
 */
export const NEGOTIATION_EXAMPLES = {
  youtube_creator: {
    scenario: 'YouTuber wants to use beat in videos',
    baseTerms: { minPrice: 50 },
    negotiation: [
      { role: 'user', content: 'I want to use this beat in my YouTube videos' },
      { role: 'agent', content: 'Great! YouTube use is allowed. Are you planning to monetize the videos?' },
      { role: 'user', content: 'Yes, I have ads enabled' },
      { role: 'agent', content: 'For commercial YouTube use, the license would be $75 (base $50 + 50% commercial). Would you like worldwide rights or just specific regions?' },
    ],
    finalContract: {
      price: 75,
      usageRights: ['YOUTUBE', 'COMMERCIAL'],
      exclusivity: false,
      territory: 'worldwide',
    },
  },

  podcast_intro: {
    scenario: 'Podcaster wants intro music',
    baseTerms: { minPrice: 30 },
    negotiation: [
      { role: 'user', content: 'Tôi cần nhạc intro cho podcast' },
      { role: 'agent', content: 'Podcast intro là một lựa chọn tuyệt vời! Bạn có bao nhiêu listener mỗi tập?' },
      { role: 'user', content: 'Khoảng 5000 người' },
      { role: 'agent', content: 'Với quy mô đó, giá chuẩn là $45 ($30 cơ bản + 50% thương mại). Bạn muốn độc quyền không?' },
    ],
    finalContract: {
      price: 45,
      usageRights: ['PODCAST', 'COMMERCIAL'],
      exclusivity: false,
      territory: 'worldwide',
    },
  },

  film_soundtrack: {
    scenario: 'Filmmaker needs soundtrack',
    baseTerms: { minPrice: 200 },
    negotiation: [
      { role: 'user', content: 'I need this for a short film soundtrack' },
      { role: 'agent', content: 'Film soundtracks are exciting! Is this for festival distribution or commercial release?' },
      { role: 'user', content: 'Film festival circuit, maybe streaming later' },
      { role: 'agent', content: 'For festival + streaming rights, I can offer $350. If it gets picked up for wider distribution, we can extend the license.' },
    ],
    finalContract: {
      price: 350,
      usageRights: ['FILM', 'FESTIVAL', 'STREAMING'],
      exclusivity: false,
      territory: 'worldwide',
      duration: 36, // 3 years
    },
  },

  tiktok_viral: {
    scenario: 'TikToker wants viral sound',
    baseTerms: { minPrice: 25 },
    negotiation: [
      { role: 'user', content: 'Em muốn dùng beat này cho TikTok ạ' },
      { role: 'agent', content: 'TikTok là nền tảng rất phù hợp! Em có dự định kiếm tiền từ video không?' },
      { role: 'user', content: 'Có ạ, em đã có creator fund' },
      { role: 'agent', content: 'Vậy giá phù hợp là $40 (base $25 + 60% cho TikTok commercial). Giá này cho worldwide và perpetual nhé.' },
    ],
    finalContract: {
      price: 40,
      usageRights: ['TIKTOK', 'COMMERCIAL'],
      exclusivity: false,
      territory: 'worldwide',
    },
  },
}

/**
 * Common usage right combinations for quick reference
 */
export const USAGE_RIGHT_PACKAGES = {
  'youtube-basic': {
    name: 'YouTube Basic',
    rights: ['YOUTUBE', 'STREAMING'],
    multiplier: 1.3,
    description: 'Personal YouTube videos, non-monetized',
  },
  'youtube-monetized': {
    name: 'YouTube Monetized',
    rights: ['YOUTUBE', 'COMMERCIAL', 'STREAMING'],
    multiplier: 1.8,
    description: 'YouTube with ads/sponsorships',
  },
  'podcast': {
    name: 'Podcast',
    rights: ['PODCAST', 'STREAMING'],
    multiplier: 1.2,
    description: 'Podcast intro/outro music',
  },
  'tiktok-instagram': {
    name: 'TikTok/Instagram',
    rights: ['TIKTOK', 'INSTAGRAM', 'SOCIAL_MEDIA'],
    multiplier: 1.3,
    description: 'Social media content',
  },
  'film-festival': {
    name: 'Film Festival',
    rights: ['FILM', 'FESTIVAL'],
    multiplier: 2.0,
    description: 'Film festival screenings',
  },
  'commercial-full': {
    name: 'Full Commercial',
    rights: ['COMMERCIAL', 'BROADCAST', 'STREAMING', 'FILM'],
    multiplier: 3.0,
    description: 'Full commercial rights',
  },
}
