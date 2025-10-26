import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

/**
 * API Route: Track Storage
 *
 * Simple JSON file-based storage for tracks
 * In production, use a real database (Prisma + PostgreSQL)
 */

const TRACKS_FILE = path.join(process.cwd(), 'data', 'tracks.json')

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (!fs.existsSync(TRACKS_FILE)) {
    fs.writeFileSync(TRACKS_FILE, JSON.stringify([]))
  }
}

// Get all tracks
export async function GET(request: NextRequest) {
  try {
    ensureDataDir()
    const data = fs.readFileSync(TRACKS_FILE, 'utf-8')
    const tracks = JSON.parse(data)

    // Filter by user address if provided
    const url = new URL(request.url)
    const userAddress = url.searchParams.get('address')

    if (userAddress) {
      const userTracks = tracks.filter((t: any) =>
        t.ownerAddress?.toLowerCase() === userAddress.toLowerCase()
      )
      return NextResponse.json({ tracks: userTracks })
    }

    return NextResponse.json({ tracks })
  } catch (error: any) {
    console.error('Error reading tracks:', error)
    return NextResponse.json({ tracks: [] })
  }
}

// Save a new track
export async function POST(request: NextRequest) {
  try {
    ensureDataDir()
    const body = await request.json()

    // Read existing tracks
    const data = fs.readFileSync(TRACKS_FILE, 'utf-8')
    const tracks = JSON.parse(data)

    // Add new track with timestamp
    const newTrack = {
      ...body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'published',
      sales: 0,
      revenue: 0,
      suiTrades: 0,
    }

    tracks.push(newTrack)

    // Save back to file
    fs.writeFileSync(TRACKS_FILE, JSON.stringify(tracks, null, 2))

    return NextResponse.json({
      success: true,
      track: newTrack
    })
  } catch (error: any) {
    console.error('Error saving track:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save track' },
      { status: 500 }
    )
  }
}
