'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Music2, Play, Pause, Clock, TrendingUp, Shield, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

// Mock track data - in production, fetch from API
const trackData: Record<string, any> = {
  '1': {
    id: '1',
    title: 'Lo-Fi Beats Vol. 1',
    artist: 'AI Producer',
    description: 'Chill lo-fi hip-hop beats perfect for studying, working, or relaxing. Features smooth jazz chords, vinyl crackle, and laid-back drum patterns.',
    genre: ['lo-fi', 'hip-hop'],
    bpm: 85,
    key: 'C minor',
    price: 0.5,
    chain: 'sui',
    plays: 1234,
    licenses: 12,
    revenue: 6.0,
    audioUrl: 'https://cdn1.suno.ai/5PJa3j01RqRJPB2T.mp3',
    coverArtUrl: 'https://cdn2.suno.ai/image_large_096c586b-03b5-4194-989d-dc17c01dbd7c.jpeg',
    duration: '2:45',
    releaseDate: '2024-01-15',
    ipAssetId: '0x1234...',
    baseTerms: {
      minPrice: 500,
      allowedUsageRights: ['YOUTUBE', 'COMMERCIAL', 'STREAMING'],
      exclusivityAvailable: true,
      territory: 'WORLDWIDE',
    },
  },
  '2': {
    id: '2',
    title: 'Tropical House Mix',
    artist: 'AI Producer',
    description: 'Upbeat tropical house track with summer vibes, featuring steel drums, deep bass, and uplifting melodies.',
    genre: ['house', 'electronic'],
    bpm: 120,
    key: 'G major',
    price: 1.2,
    chain: 'story',
    plays: 892,
    licenses: 8,
    revenue: 9.6,
    audioUrl: 'https://cdn1.suno.ai/sUSSHon8eiP0tjZL.mp3',
    coverArtUrl: 'https://cdn2.suno.ai/image_large_a2b4a5a2-a720-4d55-a374-7c72c12eceeb.jpeg',
    duration: '3:12',
    releaseDate: '2024-02-10',
    ipAssetId: '0x5678...',
    baseTerms: {
      minPrice: 800,
      allowedUsageRights: ['YOUTUBE', 'COMMERCIAL', 'STREAMING', 'TV'],
      exclusivityAvailable: true,
      territory: 'WORLDWIDE',
    },
  },
  '3': {
    id: '3',
    title: 'Electronic Dance',
    artist: 'AI Producer',
    description: 'High-energy electronic dance music with powerful drops, synth leads, and driving beats.',
    genre: ['electronic', 'dance'],
    bpm: 128,
    key: 'A minor',
    price: 0.8,
    chain: 'ethereum',
    plays: 2341,
    licenses: 15,
    revenue: 12.0,
    audioUrl: 'https://cdn1.suno.ai/k7Wlc1XwHKhCpeW5.mp3',
    coverArtUrl: 'https://cdn2.suno.ai/image_large_59f9d49c-0b8e-4618-9423-c9cc97a48341.jpeg',
    duration: '2:58',
    releaseDate: '2024-01-28',
    ipAssetId: '0x9abc...',
    baseTerms: {
      minPrice: 600,
      allowedUsageRights: ['YOUTUBE', 'COMMERCIAL', 'STREAMING'],
      exclusivityAvailable: false,
      territory: 'WORLDWIDE',
    },
  },
  '4': {
    id: '4',
    title: 'Ambient Vibes',
    artist: 'AI Producer',
    description: 'Atmospheric ambient soundscape with ethereal pads, subtle melodies, and evolving textures.',
    genre: ['ambient', 'chill'],
    bpm: 72,
    key: 'D major',
    price: 0.6,
    chain: 'base',
    plays: 567,
    licenses: 3,
    revenue: 1.8,
    audioUrl: 'https://cdn1.suno.ai/So7MisQdo5aOCc9T.mp3',
    coverArtUrl: 'https://cdn2.suno.ai/image_large_311c0093-87fd-4fc4-962f-d08e99089d50.jpeg',
    duration: '3:24',
    releaseDate: '2024-03-01',
    ipAssetId: '0xdef0...',
    baseTerms: {
      minPrice: 400,
      allowedUsageRights: ['YOUTUBE', 'STREAMING'],
      exclusivityAvailable: false,
      territory: 'WORLDWIDE',
    },
  },
}

export default function TrackDetailPage() {
  const params = useParams()
  const router = useRouter()
  const trackId = params.id as string
  const track = trackData[trackId]

  const [isPlaying, setIsPlaying] = useState(false)
  const [audio] = useState(typeof Audio !== 'undefined' ? new Audio(track?.audioUrl) : null)

  if (!track) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Music2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-4">Track Not Found</h1>
        <Link href="/browse">
          <Button>Back to Browse</Button>
        </Link>
      </div>
    )
  }

  const togglePlay = () => {
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/browse">
        <Button variant="ghost" size="sm" className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Cover Art & Player */}
        <div>
          <div
            className="aspect-square rounded-lg mb-6 relative overflow-hidden"
            style={{
              backgroundImage: `url(${track.coverArtUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="lg"
                className="h-20 w-20 rounded-full"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </Button>
            </div>
          </div>

          {/* Track Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Play className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-2xl font-bold">{track.plays.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total Plays</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-2xl font-bold">{track.licenses}</div>
                  <div className="text-xs text-muted-foreground">Licenses Sold</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Track Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="capitalize">
                {track.chain}
              </Badge>
              {track.genre.map((g: string) => (
                <Badge key={g} variant="outline">
                  {g}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl font-bold mb-2">{track.title}</h1>
            <p className="text-xl text-muted-foreground mb-4">{track.artist}</p>
            <p className="text-muted-foreground mb-6">{track.description}</p>
          </div>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Track Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{track.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">BPM</span>
                <span className="font-medium">{track.bpm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Key</span>
                <span className="font-medium">{track.key}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Release Date</span>
                <span className="font-medium">
                  {new Date(track.releaseDate).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Base License Price</CardTitle>
              <CardDescription>
                Negotiate custom terms with our AI agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="text-4xl font-bold">
                    ${track.price} {track.chain === 'sui' ? 'SUI' : 'ETH'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Starting from ${track.baseTerms.minPrice}
                  </div>
                </div>
                <Badge variant="secondary">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  ${track.revenue} earned
                </Badge>
              </div>

              <Link href={`/negotiate/${track.id}`}>
                <Button size="lg" className="w-full">
                  Start Negotiation
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Available Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Available Usage Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {track.baseTerms.allowedUsageRights.map((right: string) => (
                  <div key={right} className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>{right}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Exclusivity Available</span>
                  <span className="font-medium">
                    {track.baseTerms.exclusivityAvailable ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Territory</span>
                  <span className="font-medium">{track.baseTerms.territory}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Story Protocol Info */}
      <Card>
        <CardHeader>
          <CardTitle>IP Asset Information</CardTitle>
          <CardDescription>
            This track is registered on Story Protocol as an IP Asset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">IP Asset ID</div>
              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {track.ipAssetId}
              </code>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Blockchain</div>
              <Badge variant="secondary" className="capitalize">
                {track.chain}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
