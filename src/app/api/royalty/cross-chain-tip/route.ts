import { NextRequest, NextResponse } from 'next/server'
import { Address } from 'viem'
import {
  getCrossChainRoyaltyTxData,
  calculateEstimatedCost,
  convertWipToWei,
  isCrossChainSupported,
  getChainInfo,
  isSolanaChain,
  isEvmResponse,
  isSolanaResponse,
} from '@/lib/debridge'

/**
 * API Route: Get Cross-Chain Royalty Payment (Tip) Transaction Data
 *
 * This endpoint returns transaction data for tipping/paying royalties to a
 * SoundChain artist from any supported chain (Base, Ethereum, etc.)
 *
 * Flow:
 * 1. User wants to tip artist from Base (or other chain)
 * 2. Frontend calls this API with tip amount
 * 3. API calls deBridge to get swap + payment transaction data
 * 4. Frontend executes transaction on source chain
 * 5. deBridge handles swap and royalty payment on Story Protocol L2
 *
 * Based on: https://docs.story.foundation/developers/tutorials/cross-chain-royalty-payments
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { srcChainId, ipId, tipAmount, senderAddress, isTestnet } = body

    // Validate required fields
    if (!srcChainId || !ipId || !tipAmount || !senderAddress) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['srcChainId', 'ipId', 'tipAmount', 'senderAddress'],
        },
        { status: 400 }
      )
    }

    // Validate source chain is supported
    if (!isCrossChainSupported(srcChainId)) {
      return NextResponse.json(
        {
          error: `Chain ${srcChainId} is not supported for cross-chain operations`,
          supportedChains: Object.values(require('@/lib/debridge').SUPPORTED_SOURCE_CHAINS),
        },
        { status: 400 }
      )
    }

    // Convert tip amount from $WIP to wei
    const paymentAmountWei = convertWipToWei(tipAmount)

    console.log('Cross-chain royalty payment request:', {
      srcChain: getChainInfo(srcChainId)?.name,
      ipId,
      tipAmount,
      paymentAmountWei,
    })

    // Get transaction data from deBridge
    const deBridgeResponse = await getCrossChainRoyaltyTxData({
      srcChainId: Number(srcChainId),
      ipId: ipId as Address,
      senderAddress: senderAddress as Address,
      paymentAmount: paymentAmountWei,
      isTestnet: isTestnet ?? true,
    })

    // Calculate estimated costs
    const costEstimate = calculateEstimatedCost(deBridgeResponse)

    console.log('deBridge transaction data received:', {
      orderId: deBridgeResponse.orderId,
      estimatedCost: costEstimate.totalCostFormatted,
      chainType: isSolanaChain(srcChainId) ? 'Solana/Sui' : 'EVM',
    })

    // Handle EVM chains (Base, Ethereum, Optimism, Arbitrum)
    if (isEvmResponse(deBridgeResponse)) {
      return NextResponse.json({
        success: true,
        orderId: deBridgeResponse.orderId,
        chainType: 'evm',
        transaction: {
          to: deBridgeResponse.tx.to,
          data: deBridgeResponse.tx.data,
          value: deBridgeResponse.tx.value,
        },
        estimation: {
          totalCost: costEstimate.totalCost.toString(),
          paymentAmount: costEstimate.paymentAmount.toString(),
          operatingExpense: costEstimate.operatingExpense.toString(),
          totalCostFormatted: costEstimate.totalCostFormatted,
          destinationAmount: deBridgeResponse.estimation.dstChainTokenOut.amount,
        },
        sourceChain: getChainInfo(srcChainId),
        message: `Transaction ready. Execute on ${getChainInfo(srcChainId)?.name} to tip artist on Story Protocol.`,
      })
    }

    // Handle Solana/Sui chains
    if (isSolanaResponse(deBridgeResponse)) {
      return NextResponse.json({
        success: true,
        orderId: deBridgeResponse.orderId,
        chainType: 'solana',
        transaction: deBridgeResponse.tx, // Base64-encoded transaction string
        estimation: {
          totalCost: costEstimate.totalCost.toString(),
          paymentAmount: costEstimate.paymentAmount.toString(),
          operatingExpense: costEstimate.operatingExpense.toString(),
          totalCostFormatted: costEstimate.totalCostFormatted,
          destinationAmount: deBridgeResponse.estimation.dstChainTokenOut.amount,
        },
        sourceChain: getChainInfo(srcChainId),
        message: `Transaction ready. Execute on ${getChainInfo(srcChainId)?.name} to tip artist on Story Protocol.`,
      })
    }

    throw new Error('Unknown transaction type')
  } catch (error: any) {
    console.error('Cross-chain royalty payment API error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to prepare cross-chain transaction',
        details: error.toString(),
      },
      { status: 500 }
    )
  }
}
