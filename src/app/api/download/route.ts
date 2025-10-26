// Download API - Freemium model
// Free tier: Watermarked audio
// Paid tier: Clean audio

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trackId, userId } = body

    // Validate inputs
    if (!trackId || !userId) {
      return NextResponse.json(
        { error: 'Missing trackId or userId' },
        { status: 400 }
      )
    }

    // Get track
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: { producer: true }
    })

    if (!track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      )
    }

    // Check if user has paid license
    const existingLicense = await prisma.license.findFirst({
      where: {
        trackId,
        buyerId: userId,
        status: 'ACTIVE',
        tier: {
          not: 'FREE'  // Has paid license
        }
      }
    })

    // Determine download tier and quality
    let tier: 'FREE' | 'COMMERCIAL' | 'EXCLUSIVE'
    let hasWatermark: boolean
    let audioQuality: 'STANDARD' | 'HIGH' | 'LOSSLESS'
    let downloadUrl: string

    if (existingLicense) {
      // User has paid license - give clean audio
      tier = existingLicense.tier as any
      hasWatermark = false
      audioQuality = existingLicense.audioQuality as any
      downloadUrl = track.audioUrl // Clean audio
    } else {
      // Free download with watermark
      tier = 'FREE'
      hasWatermark = true
      audioQuality = 'STANDARD'

      // Add watermark indicator to URL (MVP approach)
      // In production: Process audio file and add actual watermark
      downloadUrl = `${track.audioUrl}?watermark=true&quality=standard`
    }

    // Create or update free license
    if (!existingLicense) {
      await prisma.license.create({
        data: {
          trackId,
          buyerId: userId,
          primaryChain: track.primaryChain,
          tier: 'FREE',
          hasWatermark: true,
          audioQuality: 'STANDARD',
          status: 'ACTIVE',
          price: 0,
          currency: 'USD',
          usdPrice: 0,
          usageRights: ['PERSONAL_USE'], // Limited rights
          exclusivity: false,
          attribution: true,
          terms: {
            tier: 'FREE',
            restrictions: [
              'Personal use only',
              'No commercial use',
              'No monetization',
              'Attribution required'
            ]
          },
          paidAt: new Date(), // Free = instant "payment"
        }
      })
    }

    // Log download
    await prisma.download.create({
      data: {
        trackId,
        userId,
        tier,
        hasWatermark,
        quality: audioQuality,
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined,
      }
    })

    // Increment download counter
    await prisma.track.update({
      where: { id: trackId },
      data: {
        downloads: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      downloadUrl,
      tier,
      hasWatermark,
      quality: audioQuality,
      message: hasWatermark
        ? 'Free download with watermark. For commercial use, purchase a license.'
        : 'Commercial license - clean audio included.',
      watermarkInfo: hasWatermark ? {
        message: 'This audio contains a watermark for personal use only.',
        restrictions: [
          'Personal projects only',
          'No YouTube/TikTok monetization',
          'No commercial use',
          'Attribution required'
        ],
        upgradeUrl: `/beat/${trackId}/purchase`
      } : null,
    })

  } catch (error) {
    console.error('Download API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process download',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check download status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const trackId = searchParams.get('trackId')
  const userId = searchParams.get('userId')

  if (!trackId || !userId) {
    return NextResponse.json(
      { error: 'Missing trackId or userId' },
      { status: 400 }
    )
  }

  try {
    // Check if user has any license (free or paid)
    const license = await prisma.license.findFirst({
      where: {
        trackId,
        buyerId: userId,
        status: 'ACTIVE'
      }
    })

    // Check download history
    const downloadCount = await prisma.download.count({
      where: {
        trackId,
        userId
      }
    })

    return NextResponse.json({
      hasLicense: !!license,
      licenseTier: license?.tier || null,
      hasWatermark: license?.hasWatermark ?? true,
      downloadCount,
      canDownload: true, // Always can download (free or paid)
    })

  } catch (error) {
    console.error('Download status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check download status' },
      { status: 500 }
    )
  }
}
