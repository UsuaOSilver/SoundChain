import { NextRequest, NextResponse } from 'next/server'
import { createMusicNFT } from '@/lib/story'
import fs from 'fs'
import path from 'path'

/**
 * API Route: Register Music IP on Story Protocol
 *
 * Story Protocol = Legal layer for IP registration
 * Sui Network = Trading layer (handled separately when licenses are traded)
 */

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  const tracksFile = path.join(dataDir, 'tracks.json')
  if (!fs.existsSync(tracksFile)) {
    fs.writeFileSync(tracksFile, JSON.stringify([]))
  }
  return tracksFile
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { metadata, address, licenseTerms } = body

    console.log('Register IP API called:', {
      address,
      title: metadata.title,
      licenseType: licenseTerms?.type || 'commercial-remix (default)',
    })

    // Validate required fields
    if (!metadata || !address) {
      return NextResponse.json(
        { error: 'Missing required fields: metadata and address' },
        { status: 400 }
      )
    }

    // Register IP Asset on Story Protocol with license terms
    // This creates the NFT, registers it as IP, and attaches license terms in one transaction
    // Following: https://docs.story.foundation/developers/tutorials/register-monetize-stability-images
    console.log('Registering IP on Story Protocol with license terms...')
    const result = await createMusicNFT(
      {
        title: metadata.title,
        description: metadata.description || '',
        artist: metadata.artist,
        genre: metadata.genre || [],
        bpm: metadata.bpm,
        audioUrl: metadata.audioUrl,
        coverArtUrl: metadata.coverArtUrl,
      },
      licenseTerms // Pass license terms (will use default if undefined)
    )

    console.log('IP Asset registered:', result.ipAssetId)
    console.log('License Terms ID:', result.licenseTermsId)

    // Save track to local storage
    try {
      const tracksFile = ensureDataDir()
      const data = fs.readFileSync(tracksFile, 'utf-8')
      const tracks = JSON.parse(data)

      const newTrack = {
        id: Date.now().toString(),
        title: metadata.title,
        artist: metadata.artist,
        description: metadata.description || '',
        genre: metadata.genre || [],
        bpm: metadata.bpm,
        price: metadata.price || 0,
        audioUrl: metadata.audioUrl,
        coverArtUrl: metadata.coverArtUrl || '',
        ownerAddress: address,
        storyIpId: result.ipAssetId,
        tokenId: result.tokenId,
        nftContract: result.nftContractAddress,
        txHash: result.transactionHash,
        licenseTermsId: result.licenseTermsId, // Store license terms ID
        licenseType: licenseTerms?.type || 'commercial-remix',
        mintingFee: licenseTerms?.mintingFee || '5',
        commercialRevShare: licenseTerms?.commercialRevShare || 5,
        status: 'published',
        sales: 0,
        revenue: 0,
        suiTrades: 0,
        hasSuiTrading: false, // Can be enabled later
        createdAt: new Date().toISOString(),
      }

      tracks.push(newTrack)
      fs.writeFileSync(tracksFile, JSON.stringify(tracks, null, 2))
      console.log('Track saved to local storage:', newTrack.id)
    } catch (saveError) {
      console.error('Error saving track to storage:', saveError)
      // Don't fail the request if storage fails
    }

    return NextResponse.json({
      success: true,
      ipAssetId: result.ipAssetId,
      tokenId: result.tokenId,
      nftContract: result.nftContractAddress,
      txHash: result.transactionHash,
      licenseTermsId: result.licenseTermsId,
      explorerUrl: `https://aeneid.storyscan.io/tx/${result.transactionHash}`,
      message: 'IP registered on Story Protocol with license terms. Buyers can now mint licenses with your specified terms.',
    })
  } catch (error: any) {
    console.error('Register IP API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to register IP' },
      { status: 500 }
    )
  }
}
