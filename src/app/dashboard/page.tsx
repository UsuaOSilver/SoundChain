'use client'

import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Music2, Upload, DollarSign, TrendingUp, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { ready, authenticated, user } = usePrivy()
  const [activeTab, setActiveTab] = useState('overview')
  const [tracks, setTracks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Get wallet address
  const address = user?.wallet?.address ||
                  (user?.linkedAccounts?.find((account: any) => account.type === 'wallet') as any)?.address ||
                  (user?.linkedAccounts?.[0] as any)?.address

  // Fetch tracks from API
  useEffect(() => {
    if (!authenticated || !address) {
      setIsLoading(false)
      return
    }

    const fetchTracks = async () => {
      try {
        const response = await fetch(`/api/tracks?address=${address}`)
        const data = await response.json()
        setTracks(data.tracks || [])
      } catch (error) {
        console.error('Error fetching tracks:', error)
        setTracks([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTracks()
  }, [authenticated, address])

  if (!ready || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Music2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Music2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-4">Producer Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Connect your wallet to access your producer dashboard
        </p>
        <Button size="lg">Connect Wallet</Button>
      </div>
    )
  }

  const totalRevenue = tracks.reduce((sum, track) => sum + (track.revenue || 0), 0)
  const totalSales = tracks.reduce((sum, track) => sum + (track.sales || 0), 0)
  const publishedTracks = tracks.filter(t => t.status === 'published').length
  const tracksWithSui = tracks.filter(t => t.hasSuiTrading).length
  const totalSuiTrades = tracks.reduce((sum, track) => sum + (track.suiTrades || 0), 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Producer Dashboard</h1>
          <p className="text-muted-foreground">
            Story Protocol IP rights + Sui Network trading
          </p>
        </div>
        <Link href="/dashboard/upload">
          <Button size="lg">
            <Upload className="mr-2 h-5 w-5" />
            Upload Track
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">
              +8 new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Story IP Assets</CardTitle>
            <span className="text-2xl">📜</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tracks.length}</div>
            <p className="text-xs text-muted-foreground">
              {publishedTracks} published • Legal protection
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sui Trades</CardTitle>
            <span className="text-2xl">🔷</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuiTrades}</div>
            <p className="text-xs text-muted-foreground">
              {tracksWithSui} tracks • $0.001/tx saved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tracks Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">All Tracks</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {tracks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Music2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No tracks yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your first track to get started
                </p>
                <Link href="/dashboard/upload">
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Track
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            tracks.map((track) => (
              <Card key={track.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {track.title}
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                          {track.status}
                        </span>
                      </CardTitle>
                      <CardDescription className="space-y-1">
                        <div>{Array.isArray(track.genre) ? track.genre.join(', ') : track.genre}</div>
                        <div className="flex gap-3 text-xs">
                          <span className="flex items-center gap-1">
                            📜 Story IP: {track.storyIpId?.slice(0, 10)}...
                          </span>
                          {track.hasSuiTrading && (
                            <span className="flex items-center gap-1 text-blue-500">
                              🔷 Sui Trading Enabled
                            </span>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{track.price} ETH</div>
                      <div className="text-sm text-muted-foreground">
                        {track.sales || 0} licenses • ${(track.revenue || 0).toFixed(2)}
                      </div>
                      {track.hasSuiTrading && (
                        <div className="text-xs text-blue-500">
                          {track.suiTrades || 0} Sui trades
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                    <Link href={`/negotiate/${track.id}`}>
                      <Button variant="default" size="sm">View Offers</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="published">
          <div className="space-y-4">
            {tracks
              .filter(t => t.status === 'published')
              .map((track) => (
                <Card key={track.id}>
                  <CardHeader>
                    <CardTitle>{track.title}</CardTitle>
                    <CardDescription>
                      {track.sales || 0} licenses sold • Story IP: {track.storyIpId?.slice(0, 10)}...
                      {track.hasSuiTrading && ` • ${track.suiTrades || 0} Sui trades`}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="drafts">
          <div className="space-y-4">
            {tracks
              .filter(t => t.status === 'draft')
              .map((track) => (
                <Card key={track.id}>
                  <CardHeader>
                    <CardTitle>{track.title}</CardTitle>
                    <CardDescription>Draft - Not published yet</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button>Publish Track</Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
