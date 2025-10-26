// deBridge Integration for Cross-Chain License Minting & Royalty Payments
// Enables purchasing SoundChain licenses from any chain (Base, Abstract, etc.)
// Based on: https://docs.story.foundation/developers/tutorials/cross-chain-license-mint

import { encodeFunctionData, parseEther, Address } from 'viem'
import { base, mainnet, optimism, arbitrum } from 'viem/chains'
import { WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk'
import { zeroAddress } from 'viem'

// Contract addresses on Story Protocol L2
const DEBRIDGE_LICENSE_MINTER = '0x6429a616f76a8958e918145d64bf7681c3936d6a' as Address // DebridgeLicenseTokenMinter.sol
const ROYALTY_MODULE = '0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086' as Address // RoyaltyModule.sol
const STORY_MAINNET_CHAIN_ID = 100000013 // Story Protocol L2 mainnet
const STORY_TESTNET_CHAIN_ID = 1315 // Story Protocol L2 testnet (Aeneid)

// Supported source chains for cross-chain operations
export const SUPPORTED_SOURCE_CHAINS = {
  base: {
    id: base.id,
    name: 'Base',
    nativeToken: 'ETH',
    type: 'evm' as const,
  },
  ethereum: {
    id: mainnet.id,
    name: 'Ethereum',
    nativeToken: 'ETH',
    type: 'evm' as const,
  },
  optimism: {
    id: optimism.id,
    name: 'Optimism',
    nativeToken: 'ETH',
    type: 'evm' as const,
  },
  arbitrum: {
    id: arbitrum.id,
    name: 'Arbitrum',
    nativeToken: 'ETH',
    type: 'evm' as const,
  },
  sui: {
    id: 10001, // Sui mainnet chain ID for deBridge
    name: 'Sui',
    nativeToken: 'SUI',
    type: 'solana' as const, // Sui uses Solana-based transaction format
  },
} as const

export type SupportedChainId = keyof typeof SUPPORTED_SOURCE_CHAINS

// deBridge API response type for EVM chains
export interface DeBridgeApiResponse {
  estimation: {
    srcChainTokenIn: {
      amount: string
      approximateOperatingExpense: string
    }
    dstChainTokenOut: {
      amount: string
      maxTheoreticalAmount: string
    }
  }
  tx: {
    to: string
    data: string
    value: string
  }
  orderId: string
}

// deBridge API response type for Solana/Sui chains
export interface DeBridgeSolanaApiResponse {
  estimation: {
    srcChainTokenIn: {
      amount: string
      approximateOperatingExpense: string
    }
    dstChainTokenOut: {
      amount: string
      maxTheoreticalAmount: string
    }
  }
  tx: string // For Solana/Sui, tx is a base64-encoded transaction string
  orderId: string
}

// Union type for all responses
export type DeBridgeResponse = DeBridgeApiResponse | DeBridgeSolanaApiResponse

/**
 * Build dlnHook for cross-chain license minting
 * This hook calls DebridgeLicenseTokenMinter which:
 * 1. Wraps $IP to $WIP
 * 2. Mints license token on Story Protocol
 */
function buildLicenseMintingHook(params: {
  ipId: Address
  licenseTermsId: bigint
  receiverAddress: Address
}): string {
  const { ipId, licenseTermsId, receiverAddress } = params

  // Encode the mintLicenseTokensCrossChain function call
  const calldata = encodeFunctionData({
    abi: [
      {
        name: 'mintLicenseTokensCrossChain',
        type: 'function',
        inputs: [
          { name: 'licensorIpId', type: 'address' },
          { name: 'licenseTermsId', type: 'uint256' },
          { name: 'tokenAmount', type: 'uint256' },
          { name: 'receiver', type: 'address' },
        ],
      },
    ],
    functionName: 'mintLicenseTokensCrossChain',
    args: [
      ipId,
      licenseTermsId,
      BigInt(1), // mint 1 license token
      receiverAddress,
    ],
  })

  // Build the dlnHook JSON
  const dlnHook = {
    type: 'evm_transaction_call',
    data: {
      to: DEBRIDGE_LICENSE_MINTER,
      calldata: calldata,
      gas: 0,
    },
  }

  return JSON.stringify(dlnHook)
}

/**
 * Build dlnHook for cross-chain royalty payments
 * This hook calls RoyaltyModule.payRoyaltyOnBehalf
 */
function buildRoyaltyPaymentHook(params: { ipId: Address; amount: bigint }): string {
  const { ipId, amount } = params

  // Encode the payRoyaltyOnBehalf function call
  const calldata = encodeFunctionData({
    abi: [
      {
        name: 'payRoyaltyOnBehalf',
        type: 'function',
        inputs: [
          { name: 'receiverIpId', type: 'address' },
          { name: 'payerIpId', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
      },
    ],
    functionName: 'payRoyaltyOnBehalf',
    args: [
      ipId,
      zeroAddress, // payer is external address, not another IP Asset
      WIP_TOKEN_ADDRESS,
      amount,
    ],
  })

  // Build the dlnHook JSON
  const dlnHook = {
    type: 'evm_transaction_call',
    data: {
      to: ROYALTY_MODULE,
      calldata: calldata,
      gas: 0,
    },
  }

  return JSON.stringify(dlnHook)
}

/**
 * Build deBridge API URL for cross-chain license minting
 *
 * User pays with native token on source chain (e.g., Base ETH)
 * → deBridge swaps to $IP on Story Protocol L2
 * → dlnHook wraps $IP to $WIP and mints license
 */
export function buildLicenseMintingApiUrl(params: {
  srcChainId: number
  ipId: Address
  licenseTermsId: bigint
  receiverAddress: Address
  senderAddress: Address
  paymentAmount: string // in wei
  isTestnet?: boolean
}): string {
  const { srcChainId, ipId, licenseTermsId, receiverAddress, senderAddress, paymentAmount, isTestnet = true } = params

  const dlnHook = buildLicenseMintingHook({ ipId, licenseTermsId, receiverAddress })
  const encodedHook = encodeURIComponent(dlnHook)

  const dstChainId = isTestnet ? STORY_TESTNET_CHAIN_ID : STORY_MAINNET_CHAIN_ID

  const url =
    `https://dln.debridge.finance/v1.0/dln/order/create-tx?` +
    `srcChainId=${srcChainId}` +
    // Native token (ETH) on source chain
    `&srcChainTokenIn=0x0000000000000000000000000000000000000000` +
    // Auto-calculate amount needed
    `&srcChainTokenInAmount=auto` +
    // Story Protocol L2 chain ID
    `&dstChainId=${dstChainId}` +
    // Native token ($IP) on Story Protocol
    `&dstChainTokenOut=0x0000000000000000000000000000000000000000` +
    // Amount of $IP needed for license
    `&dstChainTokenOutAmount=${paymentAmount}` +
    // Recipient of $IP (the minter contract)
    `&dstChainTokenOutRecipient=${DEBRIDGE_LICENSE_MINTER}` +
    // Sender initiating transaction
    `&senderAddress=${senderAddress}` +
    // Order authority addresses
    `&srcChainOrderAuthorityAddress=${senderAddress}` +
    `&dstChainOrderAuthorityAddress=${senderAddress}` +
    // Enable estimation and prepend operating expenses
    `&enableEstimate=true` +
    `&prependOperatingExpenses=true` +
    `&dlnHook=${encodedHook}`

  return url
}

/**
 * Build deBridge API URL for cross-chain royalty payments
 *
 * User tips artist with native token on source chain (e.g., Base ETH)
 * → deBridge swaps to $WIP on Story Protocol L2
 * → dlnHook pays royalty to IP Asset
 */
export function buildRoyaltyPaymentApiUrl(params: {
  srcChainId: number
  ipId: Address
  senderAddress: Address
  paymentAmount: string // in wei
  isTestnet?: boolean
}): string {
  const { srcChainId, ipId, senderAddress, paymentAmount, isTestnet = true } = params

  const dlnHook = buildRoyaltyPaymentHook({ ipId, amount: BigInt(paymentAmount) })
  const encodedHook = encodeURIComponent(dlnHook)

  const dstChainId = isTestnet ? STORY_TESTNET_CHAIN_ID : STORY_MAINNET_CHAIN_ID

  const url =
    `https://dln.debridge.finance/v1.0/dln/order/create-tx?` +
    `srcChainId=${srcChainId}` +
    // Native token (ETH) on source chain
    `&srcChainTokenIn=0x0000000000000000000000000000000000000000` +
    // Auto-calculate amount needed
    `&srcChainTokenInAmount=auto` +
    // Story Protocol L2 chain ID
    `&dstChainId=${dstChainId}` +
    // $WIP token on Story Protocol
    `&dstChainTokenOut=${WIP_TOKEN_ADDRESS}` +
    // Amount of $WIP to pay as royalty
    `&dstChainTokenOutAmount=${paymentAmount}` +
    // Recipient of $WIP (sender, but will be paid to IP)
    `&dstChainTokenOutRecipient=${senderAddress}` +
    // Sender initiating transaction
    `&senderAddress=${senderAddress}` +
    // Order authority addresses
    `&srcChainOrderAuthorityAddress=${senderAddress}` +
    `&dstChainOrderAuthorityAddress=${senderAddress}` +
    // Enable estimation and prepend operating expenses
    `&enableEstimate=true` +
    `&prependOperatingExpenses=true` +
    `&dlnHook=${encodedHook}`

  return url
}

/**
 * Get transaction data from deBridge API for cross-chain license minting
 */
export async function getCrossChainLicenseTxData(params: {
  srcChainId: number
  ipId: Address
  licenseTermsId: bigint
  receiverAddress: Address
  senderAddress: Address
  paymentAmount: string // in wei
  isTestnet?: boolean
}): Promise<DeBridgeResponse> {
  try {
    const apiUrl = buildLicenseMintingApiUrl(params)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`deBridge API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = (await response.json()) as DeBridgeResponse

    // Validate the response
    if (!data.tx || !data.estimation || !data.orderId) {
      throw new Error('Invalid deBridge API response: missing required fields')
    }

    return data
  } catch (error) {
    console.error('Error calling deBridge API for license minting:', error)
    throw error
  }
}

/**
 * Get transaction data from deBridge API for cross-chain royalty payment
 */
export async function getCrossChainRoyaltyTxData(params: {
  srcChainId: number
  ipId: Address
  senderAddress: Address
  paymentAmount: string // in wei
  isTestnet?: boolean
}): Promise<DeBridgeResponse> {
  try {
    const apiUrl = buildRoyaltyPaymentApiUrl(params)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`deBridge API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = (await response.json()) as DeBridgeResponse

    // Validate the response
    if (!data.tx || !data.estimation || !data.orderId) {
      throw new Error('Invalid deBridge API response: missing required fields')
    }

    return data
  } catch (error) {
    console.error('Error calling deBridge API for royalty payment:', error)
    throw error
  }
}

/**
 * Calculate estimated cost in source chain native token
 * Based on deBridge API response (works for both EVM and Solana/Sui)
 */
export function calculateEstimatedCost(response: DeBridgeResponse): {
  totalCost: bigint
  paymentAmount: bigint
  operatingExpense: bigint
  totalCostFormatted: string
} {
  const paymentAmount = BigInt(response.estimation.srcChainTokenIn.amount)
  const operatingExpense = BigInt(response.estimation.srcChainTokenIn.approximateOperatingExpense)
  const totalCost = paymentAmount + operatingExpense

  return {
    totalCost,
    paymentAmount,
    operatingExpense,
    totalCostFormatted: (Number(totalCost) / 1e18).toFixed(6), // Format as decimal
  }
}

/**
 * Helper: Convert license minting fee from $WIP to wei
 */
export function convertWipToWei(wipAmount: string): string {
  return parseEther(wipAmount).toString()
}

/**
 * Check if cross-chain operations are supported on a given chain
 */
export function isCrossChainSupported(chainId: number): boolean {
  return Object.values(SUPPORTED_SOURCE_CHAINS).some((chain) => chain.id === chainId)
}

/**
 * Get chain info by chain ID
 */
export function getChainInfo(chainId: number) {
  return Object.values(SUPPORTED_SOURCE_CHAINS).find((chain) => chain.id === chainId)
}

/**
 * Check if a chain is EVM-based
 */
export function isEvmChain(chainId: number): boolean {
  const chain = getChainInfo(chainId)
  return chain?.type === 'evm'
}

/**
 * Check if a chain is Solana/Sui-based
 */
export function isSolanaChain(chainId: number): boolean {
  const chain = getChainInfo(chainId)
  return chain?.type === 'solana'
}

/**
 * Check if deBridge response is for Solana/Sui chain
 * Solana/Sui chains return tx as a string (base64), not an object
 */
export function isSolanaResponse(response: DeBridgeResponse): response is DeBridgeSolanaApiResponse {
  return typeof response.tx === 'string'
}

/**
 * Check if deBridge response is for EVM chain
 */
export function isEvmResponse(response: DeBridgeResponse): response is DeBridgeApiResponse {
  return typeof response.tx === 'object'
}
