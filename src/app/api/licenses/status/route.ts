import { NextRequest, NextResponse } from 'next/server'
import {
  getUserLicenses,
  getRenewalRecommendations,
  getLicenseStats,
  canUseLicense,
} from '@/lib/license-manager'

/**
 * API Route: License Status
 *
 * GET /api/licenses/status?userId=...&licenseId=...
 * Returns license status, expiration info, and renewal options
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const licenseId = searchParams.get('licenseId')

    // Single license status check
    if (licenseId) {
      const usageCheck = await canUseLicense(licenseId)
      return NextResponse.json(usageCheck)
    }

    // User's all licenses
    if (userId) {
      const [licenses, renewalRecs, stats] = await Promise.all([
        getUserLicenses(userId),
        getRenewalRecommendations(userId),
        getLicenseStats(userId),
      ])

      return NextResponse.json({
        licenses,
        renewalRecommendations: renewalRecs,
        stats,
      })
    }

    return NextResponse.json(
      { error: 'Missing userId or licenseId parameter' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('License status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get license status' },
      { status: 500 }
    )
  }
}
