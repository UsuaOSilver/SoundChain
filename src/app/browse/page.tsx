'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Music2, Search, Play, TrendingUp, Clock, Layers, Filter } from 'lucide-react'
import Link from 'next/link'
import { getChainById } from '@/lib/chains'
import { GasSavingsWidget } from '@/components/GasSavingsWidget'
import { ChainArchitecture } from '@/components/ChainArchitecture'
import { AudioPlayer, PlayButton } from '@/components/AudioPlayer'

// Demo tracks - All registered on Ethereum L2s
const tracks = [
  {
    id: '1',
    title: 'Lo-Fi Beats Vol. 1',
    artist: 'AI Producer',
    genre: ['lo-fi', 'hip-hop'],
    price: 0.5,
    chain: 'story', // Story Protocol L2
    plays: 1234,
    licenses: 12,
    audioUrl: 'https://cdn1.suno.ai/5PJa3j01RqRJPB2T.mp3',
    coverArtUrl: 'https://cdn2.suno.ai/image_large_096c586b-03b5-4194-989d-dc17c01dbd7c.jpeg',
    duration: '2:45',
  },
  {
    id: '2',
    title: 'Tropical House Mix',
    artist: 'AI Producer',
    genre: ['house', 'electronic'],
    price: 1.2,
    chain: 'base', // Base L2
    plays: 892,
    licenses: 8,
    audioUrl: 'https://cdn1.suno.ai/sUSSHon8eiP0tjZL.mp3',
    coverArtUrl: 'https://cdn2.suno.ai/image_large_a2b4a5a2-a720-4d55-a374-7c72c12eceeb.jpeg',
    duration: '3:12',
  },
  {
    id: '3',
    title: 'Electronic Dance',
    artist: 'AI Producer',
    genre: ['electronic', 'dance'],
    price: 0.8,
    chain: 'story', // Story Protocol L2
    plays: 2341,
    licenses: 15,
    audioUrl: 'https://cdn1.suno.ai/k7Wlc1XwHKhCpeW5.mp3',
    coverArtUrl: 'https://cdn2.suno.ai/image_large_59f9d49c-0b8e-4618-9423-c9cc97a48341.jpeg',
    duration: '2:58',
  },
  {
    id: '4',
    title: 'Ambient Vibes',
    artist: 'AI Producer',
    genre: ['ambient', 'chill'],
    price: 0.6,
    chain: 'base', // Base L2
    plays: 567,
    licenses: 3,
    audioUrl: 'https://cdn1.suno.ai/So7MisQdo5aOCc9T.mp3',
    coverArtUrl: 'https://cdn2.suno.ai/image_large_311c0093-87fd-4fc4-962f-d08e99089d50.jpeg',
    duration: '3:24',
  },
]

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [selectedChain, setSelectedChain] = useState<string | null>(null)
  const [showArchitecture, setShowArchitecture] = useState(false)

  const filteredTracks = tracks.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = !selectedGenre || track.genre.includes(selectedGenre)
    const matchesChain = !selectedChain || track.chain === selectedChain
    return matchesSearch && matchesGenre && matchesChain
  })

  const allGenres = Array.from(new Set(tracks.flatMap((t) => t.genre)))
  const allChains = Array.from(new Set(tracks.map((t) => t.chain)))

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">Browse Tracks</h1>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-sm font-medium rounded-full border border-blue-500/20">
                Ethereum L2
              </span>
            </div>
            <p className="text-muted-foreground">
              Discover AI-generated music registered on Ethereum Layer 2 networks - Story Protocol & Base
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArchitecture(!showArchitecture)}
          >
            <Layers className="h-4 w-4 mr-2" />
            {showArchitecture ? 'Hide' : 'Show'} Architecture
          </Button>
        </div>

        {/* Chain Architecture Card */}
        {showArchitecture && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChainArchitecture />
            <GasSavingsWidget txCount={10} />
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tracks by title or artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {/* Genre Filters */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Music2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Genre:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedGenre === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedGenre(null)}
              >
                All Genres
              </Button>
              {allGenres.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGenre(genre)}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>

          {/* Chain Filters */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Blockchain:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedChain === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedChain(null)}
              >
                All Chains
              </Button>
              {allChains.map((chainId) => {
                const chain = getChainById(chainId)
                return (
                  <Button
                    key={chainId}
                    variant={selectedChain === chainId ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedChain(chainId)}
                  >
                    <span className="mr-1">{chain?.logo || '🔗'}</span>
                    {chain?.name || chainId}
                    {chain?.type === 'ethereum-l2' && ' L2'}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
            <Music2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tracks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tracks.reduce((sum, t) => sum + t.plays, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licenses Sold</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tracks.reduce((sum, t) => sum + t.licenses, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Track Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTracks.map((track) => (
          <Card key={track.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div
              className="h-48 bg-gradient-to-br from-violet-600 to-orange-500 relative group cursor-pointer"
              style={{
                backgroundImage: `url(${track.coverArtUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

              {/* Play Button - Center */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayButton audioUrl={track.audioUrl} size="lg" />
              </div>

              {/* Chain Badge - Top Right */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {(() => {
                  const chain = getChainById(track.chain)
                  return (
                    <Badge
                      variant="secondary"
                      className="backdrop-blur-sm bg-background/80"
                    >
                      <span className="mr-1">{chain?.logo || '🔗'}</span>
                      {chain?.name || track.chain}
                      {chain?.type === 'ethereum-l2' && ' L2'}
                    </Badge>
                  )
                })()}
              </div>
            </div>

            <CardHeader>
              <CardTitle className="text-lg">{track.title}</CardTitle>
              <CardDescription>{track.artist}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {track.genre.map((g) => (
                  <Badge key={g} variant="outline" className="text-xs">
                    {g}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  <span>{track.plays.toLocaleString()} plays</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{track.duration}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">
                      {(() => {
                        const chain = getChainById(track.chain)
                        return `${track.price} ${chain?.nativeCurrency.symbol || 'ETH'}`
                      })()}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {track.licenses} licenses sold
                  </div>
                  {(() => {
                    const chain = getChainById(track.chain)
                    if (chain?.type === 'ethereum-l2') {
                      return (
                        <div className="text-xs text-green-600 mt-1">
                          ⚡ {chain.gasEstimate} gas
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
                <Link href={`/browse/${track.id}`}>
                  <Button>View Details</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTracks.length === 0 && (
        <div className="text-center py-12">
          <Music2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No tracks found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  )
}
