import { NextRequest, NextResponse } from 'next/server'
import { runExpirationChecker } from '@/lib/license-manager'

/**
 * API Route: Check License Expiration (Cron Job)
 *
 * GET /api/licenses/check-expiration
 * Run automated license expiration checker
 *
 * This should be called by a cron job service like:
 * - Vercel Cron Jobs
 * - GitHub Actions
 * - External cron service (cron-job.org)
 *
 * Recommended frequency: Once per day
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Add authorization check
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Running automated license expiration checker...')
    const result = await runExpirationChecker()

    // Log results
    console.log('Expiration checker results:', {
      expiredCount: result.expiredCount,
      expiringCount: result.expiringCount,
      stats: result.stats,
    })

    // TODO: Send notifications to users with expiring licenses
    // for (const license of result.expiringLicenses) {
    //   await sendExpirationWarningEmail(license.buyer.email, license)
    // }

    return NextResponse.json({
      success: true,
      ...result,
      message: `Marked ${result.expiredCount} licenses as expired. ${result.expiringCount} licenses expiring soon.`,
    })
  } catch (error: any) {
    console.error('Expiration checker error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check expirations' },
      { status: 500 }
    )
  }
}

/**
 * Manual trigger (for testing)
 * POST /api/licenses/check-expiration
 */
export async function POST(request: NextRequest) {
  // Same as GET but allows manual triggering from admin panel
  return GET(request)
}
