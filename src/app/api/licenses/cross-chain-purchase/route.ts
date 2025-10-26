import { NextRequest, NextResponse } from 'next/server'
import { Address } from 'viem'
import {
  getCrossChainLicenseTxData,
  calculateEstimatedCost,
  convertWipToWei,
  isCrossChainSupported,
  getChainInfo,
  isSolanaChain,
  isEvmResponse,
  isSolanaResponse,
} from '@/lib/debridge'

/**
 * API Route: Get Cross-Chain License Purchase Transaction Data
 *
 * This endpoint returns transaction data for purchasing a SoundChain license
 * from any supported chain (Base, Ethereum, Optimism, Arbitrum, etc.)
 *
 * Flow:
 * 1. User selects track and source chain (e.g., Base)
 * 2. Frontend calls this API with license details
 * 3. API calls deBridge to get swap + mint transaction data
 * 4. Frontend executes transaction on source chain
 * 5. deBridge handles swap and license minting on Story Protocol L2
 *
 * Based on: https://docs.story.foundation/developers/tutorials/cross-chain-license-mint
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { srcChainId, ipId, licenseTermsId, mintingFee, receiverAddress, senderAddress, isTestnet } = body

    // Validate required fields
    if (!srcChainId || !ipId || !licenseTermsId || !mintingFee || !receiverAddress || !senderAddress) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['srcChainId', 'ipId', 'licenseTermsId', 'mintingFee', 'receiverAddress', 'senderAddress'],
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

    // Convert minting fee from $WIP to wei
    const paymentAmountWei = convertWipToWei(mintingFee)

    console.log('Cross-chain license purchase request:', {
      srcChain: getChainInfo(srcChainId)?.name,
      ipId,
      licenseTermsId,
      mintingFee,
      paymentAmountWei,
    })

    // Get transaction data from deBridge
    const deBridgeResponse = await getCrossChainLicenseTxData({
      srcChainId: Number(srcChainId),
      ipId: ipId as Address,
      licenseTermsId: BigInt(licenseTermsId),
      receiverAddress: receiverAddress as Address,
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
        message: `Transaction ready. Execute on ${getChainInfo(srcChainId)?.name} to mint license on Story Protocol.`,
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
        message: `Transaction ready. Execute on ${getChainInfo(srcChainId)?.name} to mint license on Story Protocol.`,
      })
    }

    throw new Error('Unknown transaction type')
  } catch (error: any) {
    console.error('Cross-chain license purchase API error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to prepare cross-chain transaction',
        details: error.toString(),
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint: Check cross-chain support for a chain
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const chainId = searchParams.get('chainId')

  if (!chainId) {
    return NextResponse.json(
      {
        error: 'Missing chainId parameter',
      },
      { status: 400 }
    )
  }

  const chainIdNum = parseInt(chainId)
  const isSupported = isCrossChainSupported(chainIdNum)
  const chainInfo = getChainInfo(chainIdNum)

  return NextResponse.json({
    chainId: chainIdNum,
    isSupported,
    chainInfo,
    supportedChains: Object.values(require('@/lib/debridge').SUPPORTED_SOURCE_CHAINS),
  })
}
