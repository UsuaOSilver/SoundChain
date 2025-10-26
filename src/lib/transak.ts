// Transak Fiat Onramp Integration for SoundChain
// Enables users to purchase music licenses with credit cards (fiat → crypto → license)
// Based on: https://docs.transak.com/

import { Transak, TransakConfig } from '@transak/transak-sdk'

// Story Protocol Chain IDs
export const STORY_MAINNET_CHAIN_ID = 100000013
export const STORY_TESTNET_CHAIN_ID = 1315

// Transak Environment
export const TRANSAK_ENVIRONMENTS = {
  STAGING: 'STAGING',
  PRODUCTION: 'PRODUCTION',
} as const

/**
 * Get Transak API Key from environment
 */
export const getTransakApiKey = () => {
  const apiKey = process.env.NEXT_PUBLIC_TRANSAK_API_KEY
  if (!apiKey || apiKey === 'your_transak_api_key_here') {
    console.warn('Transak API key not configured. Please add NEXT_PUBLIC_TRANSAK_API_KEY to .env')
    return null
  }
  return apiKey
}

/**
 * Get Transak environment (staging or production)
 */
export const getTransakEnvironment = (): string => {
  const env = process.env.NEXT_PUBLIC_TRANSAK_ENVIRONMENT || 'STAGING'
  return env.toUpperCase()
}

/**
 * Get Story Protocol network name for Transak
 * Transak uses network names like "ethereum", "arbitrum", etc.
 */
export const getStoryNetworkName = (isTestnet: boolean = true): string => {
  // Story Protocol L2 is an EVM chain
  // For Transak, we might need to use "ethereum" as the network
  // and specify Story's chain ID separately if supported
  return isTestnet ? 'ethereum' : 'ethereum' // Story Protocol network identifier
}

/**
 * Get cryptocurrency symbol for $WIP tokens
 * Since $WIP is wrapped IP and might not be directly supported by Transak,
 * we'll purchase ETH which can be wrapped/swapped for $WIP
 */
export const getDefaultCryptoCurrency = (): string => {
  // Transak may not directly support $WIP tokens
  // Users will buy ETH on Story Protocol L2, then swap to $WIP
  return 'ETH'
}

/**
 * Calculate estimated fiat cost for $WIP tokens
 * Note: This is a rough estimate. Actual rates come from Transak
 *
 * @param wipAmount Amount of $WIP tokens needed (e.g., "5" for 5 $WIP)
 * @returns Estimated cost in USD
 */
export const estimateFiatCost = (wipAmount: string): string => {
  // Rough estimate: 1 $WIP ≈ 1 $IP ≈ $0.10 USD (this varies)
  // In production, fetch real-time pricing
  const wipAmountNum = parseFloat(wipAmount)
  const estimatedUSD = wipAmountNum * 0.1 // $0.10 per WIP
  return estimatedUSD.toFixed(2)
}

/**
 * Open Transak fiat onramp widget to purchase crypto
 * Users can buy ETH with credit card on Story Protocol L2
 *
 * @param params Configuration for the onramp flow
 * @returns Transak instance
 */
export const openTransakWidget = (params: {
  /** User's wallet address to receive tokens */
  walletAddress: string
  /** Amount of crypto to purchase (optional) */
  cryptoAmount?: string
  /** Fiat amount to spend (optional) */
  fiatAmount?: string
  /** Use testnet or mainnet */
  isTestnet?: boolean
  /** Callback when order is successful */
  onSuccess?: (orderData: any) => void
  /** Callback when order is created */
  onOrderCreated?: (orderData: any) => void
  /** Callback when widget is closed */
  onClose?: () => void
  /** Callback if error occurs */
  onError?: (error: Error) => void
}): Transak | null => {
  const apiKey = getTransakApiKey()

  if (!apiKey) {
    const error = new Error('Transak API key not configured')
    params.onError?.(error)
    return null
  }

  try {
    const transakConfig: TransakConfig = {
      apiKey,
      environment: getTransakEnvironment() as any,
      // Pre-fill user's wallet address
      walletAddress: params.walletAddress,
      // Default cryptocurrency (ETH on Story Protocol L2)
      defaultCryptoCurrency: getDefaultCryptoCurrency(),
      // Network specification (if Transak supports Story Protocol)
      // network: getStoryNetworkName(params.isTestnet ?? true),
      // Optional: Pre-fill amount
      ...(params.cryptoAmount && { cryptoCurrencyCode: getDefaultCryptoCurrency() }),
      ...(params.fiatAmount && { defaultFiatAmount: parseFloat(params.fiatAmount) }),
      // UI customization
      themeColor: '000000', // Black theme to match SoundChain
      widgetHeight: '600px',
      widgetWidth: '100%',
    }

    const transak = new Transak(transakConfig)

    // Event listeners
    Transak.on(Transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
      console.log('Transak order successful:', orderData)
      params.onSuccess?.(orderData)
    })

    Transak.on(Transak.EVENTS.TRANSAK_ORDER_CREATED, (orderData) => {
      console.log('Transak order created:', orderData)
      params.onOrderCreated?.(orderData)
    })

    Transak.on(Transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
      console.log('Transak widget closed')
      params.onClose?.()
      // Note: cleanup() removed in newer Transak SDK
    })

    // Initialize widget
    transak.init()

    return transak
  } catch (error: any) {
    console.error('Transak widget error:', error)
    params.onError?.(error)
    return null
  }
}

/**
 * Check if Transak is properly configured
 */
export const isTransakConfigured = (): boolean => {
  const apiKey = getTransakApiKey()
  return apiKey !== null
}

/**
 * Get Transak sign-up URL for obtaining API key
 */
export const getTransakSignUpUrl = (): string => {
  return 'https://transak.com/business'
}

/**
 * Get Transak documentation URL
 */
export const getTransakDocsUrl = (): string => {
  return 'https://docs.transak.com/'
}
