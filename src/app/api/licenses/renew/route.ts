import { NextRequest, NextResponse } from 'next/server'
import { renewLicense, canUseLicense } from '@/lib/license-manager'

/**
 * API Route: Renew License
 *
 * POST /api/licenses/renew
 * Extends license duration (on-chain + database)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { licenseId, durationMonths, paymentIntentId, walletAddress } = body

    // Validate input
    if (!licenseId || !durationMonths) {
      return NextResponse.json(
        { error: 'Missing required fields: licenseId, durationMonths' },
        { status: 400 }
      )
    }

    if (durationMonths < 1 || durationMonths > 120) {
      return NextResponse.json(
        { error: 'Duration must be between 1 and 120 months' },
        { status: 400 }
      )
    }

    // Check if license can be renewed
    const usageCheck = await canUseLicense(licenseId)
    if (!usageCheck.canUse && usageCheck.reason !== 'License has expired') {
      return NextResponse.json(
        { error: `Cannot renew: ${usageCheck.reason}` },
        { status: 400 }
      )
    }

    // Renew the license
    console.log(`Renewing license ${licenseId} for ${durationMonths} months`)
    const result = await renewLicense(licenseId, durationMonths, paymentIntentId)

    // TODO: Update on Story Protocol if needed
    // await storyClient.license.updateTerms(...)

    return NextResponse.json({
      success: true,
      license: result.license,
      newExpiresAt: result.newExpiresAt,
      durationMonths: result.durationMonths,
      message: `License renewed for ${durationMonths} months`,
    })
  } catch (error: any) {
    console.error('License renewal error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to renew license' },
      { status: 500 }
    )
  }
}
