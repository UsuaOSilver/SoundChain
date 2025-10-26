/**
 * Pimlico Paymaster Integration for Sponsored Transactions
 *
 * This module provides utilities to sponsor gas fees for users
 * using Pimlico's paymaster service on Story Protocol (Iliad testnet)
 */

import { createPublicClient, createWalletClient, custom, http } from 'viem'
import type { Chain, Transport, WalletClient } from 'viem'

// Story Protocol Testnet (Iliad) Chain
const storyTestnet = {
  id: 1513,
  name: 'Story Testnet',
  network: 'story-iliad',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.storyrpc.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Story Explorer',
      url: 'https://testnet.storyscan.xyz',
    },
  },
  testnet: true,
} as const

/**
 * Configuration for Pimlico Paymaster
 */
export interface PaymasterConfig {
  apiKey: string
  chainId: number
  rpcUrl: string
}

/**
 * Get default Pimlico configuration for Story Protocol
 */
export function getPimlicoConfig(): PaymasterConfig {
  const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY

  if (!apiKey) {
    console.warn('⚠️ Pimlico API key not found. Sponsored transactions will not work.')
  }

  return {
    apiKey: apiKey || 'demo-key',
    chainId: 1513, // Story Iliad testnet
    rpcUrl: `https://api.pimlico.io/v2/${1513}/rpc?apikey=${apiKey}`,
  }
}

/**
 * Create a paymaster client for sponsored transactions
 *
 * @param config Pimlico configuration
 * @returns Paymaster client
 */
export function createPaymasterClient(config: PaymasterConfig) {
  return createPublicClient({
    chain: storyTestnet,
    transport: http(config.rpcUrl),
  })
}

/**
 * Estimate user operation gas with paymaster sponsorship
 *
 * @param userOp User operation to estimate
 * @param paymasterClient Pimlico paymaster client
 * @returns Gas estimation with paymaster data
 */
export async function estimateSponsoredGas(
  userOp: any,
  paymasterClient: any
): Promise<{
  preVerificationGas: bigint
  verificationGasLimit: bigint
  callGasLimit: bigint
  paymasterData: string
}> {
  try {
    // Call Pimlico's pm_sponsorUserOperation to get gas estimates
    // and paymaster signature for sponsored transaction
    const result = await paymasterClient.request({
      method: 'pm_sponsorUserOperation',
      params: [userOp],
    })

    return {
      preVerificationGas: BigInt(result.preVerificationGas || 0),
      verificationGasLimit: BigInt(result.verificationGasLimit || 0),
      callGasLimit: BigInt(result.callGasLimit || 0),
      paymasterData: result.paymasterAndData || '0x',
    }
  } catch (error) {
    console.error('❌ Failed to estimate sponsored gas:', error)
    throw new Error('Paymaster gas estimation failed')
  }
}

/**
 * Send a sponsored user operation
 *
 * @param userOp User operation with paymaster data
 * @param bundlerClient Bundler client to submit the operation
 * @returns Transaction hash
 */
export async function sendSponsoredTransaction(
  userOp: any,
  bundlerClient: any
): Promise<string> {
  try {
    const userOpHash = await bundlerClient.request({
      method: 'eth_sendUserOperation',
      params: [userOp],
    })

    console.log('✅ Sponsored transaction submitted:', userOpHash)
    return userOpHash as string
  } catch (error) {
    console.error('❌ Failed to send sponsored transaction:', error)
    throw new Error('Sponsored transaction submission failed')
  }
}

/**
 * Helper to check if paymaster is available and configured
 */
export function isPaymasterAvailable(): boolean {
  const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY
  return !!apiKey && apiKey !== 'demo-key' && apiKey !== 'your-pimlico-api-key-here'
}

/**
 * Format gas cost savings message for sponsored transactions
 */
export function formatGasSavings(gasPrice: bigint, gasUsed: bigint): string {
  const costInWei = gasPrice * gasUsed
  const costInEth = Number(costInWei) / 1e18
  const costInUsd = costInEth * 2000 // Rough ETH price estimate

  return `Saved ~$${costInUsd.toFixed(2)} in gas fees (${costInEth.toFixed(6)} ETH)`
}

/**
 * Example: Mint NFT with sponsored transaction
 *
 * This demonstrates how to use the paymaster for minting music NFTs
 * without requiring users to pay gas fees
 */
export async function mintNFTSponsored(
  nftContract: string,
  tokenId: string,
  metadata: any,
  walletClient: WalletClient
): Promise<string> {
  const config = getPimlicoConfig()

  if (!isPaymasterAvailable()) {
    throw new Error('Paymaster not configured. Set NEXT_PUBLIC_PIMLICO_API_KEY.')
  }

  const paymasterClient = createPaymasterClient(config)

  // Build the user operation for minting
  const userOp = {
    sender: walletClient.account?.address,
    nonce: 0, // Get from contract
    initCode: '0x',
    callData: '0x', // Encode mint function call
    callGasLimit: 100000,
    verificationGasLimit: 100000,
    preVerificationGas: 50000,
    maxFeePerGas: 1000000000,
    maxPriorityFeePerGas: 1000000000,
    paymasterAndData: '0x',
    signature: '0x',
  }

  // Get sponsorship from Pimlico
  const sponsoredGas = await estimateSponsoredGas(userOp, paymasterClient)

  // Update user operation with sponsored gas values
  const sponsoredUserOp = {
    ...userOp,
    preVerificationGas: sponsoredGas.preVerificationGas,
    verificationGasLimit: sponsoredGas.verificationGasLimit,
    callGasLimit: sponsoredGas.callGasLimit,
    paymasterAndData: sponsoredGas.paymasterData,
  }

  // Send the sponsored transaction
  const txHash = await sendSponsoredTransaction(sponsoredUserOp, paymasterClient)

  return txHash
}

export default {
  getPimlicoConfig,
  createPaymasterClient,
  estimateSponsoredGas,
  sendSponsoredTransaction,
  isPaymasterAvailable,
  formatGasSavings,
  mintNFTSponsored,
}
