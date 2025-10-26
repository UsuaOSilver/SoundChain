'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Music2, Shield, Download, ExternalLink, Clock } from 'lucide-react'
import Link from 'next/link'

// Mock license data
const mockLicenses = [
  {
    id: '1',
    trackTitle: 'Lo-Fi Beats Vol. 1',
    artist: 'AI Producer',
    coverArtUrl: 'https://cdn2.suno.ai/image_large_096c586b-03b5-4194-989d-dc17c01dbd7c.jpeg',
    price: 750,
    usageRights: ['YOUTUBE', 'COMMERCIAL'],
    purchaseDate: '2024-03-15',
    expiryDate: '2025-03-15',
    territory: 'WORLDWIDE',
    exclusivity: false,
    licenseNftId: '0x1234...5678',
    ipAssetId: '0xabcd...ef12',
    chain: 'story',
    status: 'active',
  },
  {
    id: '2',
    trackTitle: 'Tropical House Mix',
    artist: 'AI Producer',
    coverArtUrl: 'https://cdn2.suno.ai/image_large_a2b4a5a2-a720-4d55-a374-7c72c12eceeb.jpeg',
    price: 900,
    usageRights: ['SPOTIFY', 'APPLE MUSIC', 'STREAMING'],
    purchaseDate: '2024-02-20',
    expiryDate: '2026-02-20',
    territory: 'WORLDWIDE',
    exclusivity: false,
    licenseNftId: '0x5678...9abc',
    ipAssetId: '0x1234...abcd',
    chain: 'story',
    status: 'active',
  },
  {
    id: '3',
    trackTitle: 'Electronic Dance',
    artist: 'AI Producer',
    coverArtUrl: 'https://cdn2.suno.ai/image_large_59f9d49c-0b8e-4618-9423-c9cc97a48341.jpeg',
    price: 650,
    usageRights: ['YOUTUBE'],
    purchaseDate: '2024-01-10',
    expiryDate: '2025-01-10',
    territory: 'WORLDWIDE',
    exclusivity: false,
    licenseNftId: '0x9abc...def0',
    ipAssetId: '0x5678...1234',
    chain: 'ethereum',
    status: 'expired',
  },
]

export default function LicensesPage() {
  const { ready, authenticated } = usePrivy()

  if (!ready) {
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
        <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
        <p className="text-muted-foreground mb-8">
          Sign in to view your music licenses
        </p>
        <Button size="lg">Sign In</Button>
      </div>
    )
  }

  const activeLicenses = mockLicenses.filter((l) => l.status === 'active')
  const expiredLicenses = mockLicenses.filter((l) => l.status === 'expired')

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Licenses</h1>
        <p className="text-muted-foreground">
          View and manage your music licensing NFTs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLicenses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Music2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockLicenses.reduce((sum, l) => sum + l.price, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Within 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Licenses */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Active Licenses</h2>
        <div className="space-y-4">
          {activeLicenses.map((license) => (
            <Card key={license.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Cover Art */}
                  <div
                    className="w-full md:w-32 h-32 rounded-lg flex-shrink-0"
                    style={{
                      backgroundImage: `url(${license.coverArtUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />

                  {/* License Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{license.trackTitle}</h3>
                        <Badge variant="secondary" className="capitalize">
                          {license.chain}
                        </Badge>
                        <Badge variant="default" className="bg-green-500">
                          Active
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{license.artist}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Purchase Date:</span>
                        <span className="ml-2 font-medium">
                          {new Date(license.purchaseDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expires:</span>
                        <span className="ml-2 font-medium">
                          {new Date(license.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Price:</span>
                        <span className="ml-2 font-medium">${license.price}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Territory:</span>
                        <span className="ml-2 font-medium">{license.territory}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-muted-foreground mb-2 block">
                        Usage Rights:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {license.usageRights.map((right) => (
                          <Badge key={right} variant="outline">
                            {right}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download License
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`https://testnet.storyscan.xyz/tx/${license.licenseNftId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View on Explorer
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Expired Licenses */}
      {expiredLicenses.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Expired Licenses</h2>
          <div className="space-y-4">
            {expiredLicenses.map((license) => (
              <Card key={license.id} className="opacity-60">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div
                      className="w-full md:w-32 h-32 rounded-lg flex-shrink-0"
                      style={{
                        backgroundImage: `url(${license.coverArtUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{license.trackTitle}</h3>
                        <Badge variant="destructive">Expired</Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{license.artist}</p>

                      <div className="text-sm">
                        <span className="text-muted-foreground">Expired on:</span>
                        <span className="ml-2 font-medium">
                          {new Date(license.expiryDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="mt-4">
                        <Link href={`/browse/${license.id}`}>
                          <Button size="sm">Renew License</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {mockLicenses.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No licenses yet</h3>
          <p className="text-muted-foreground mb-6">
            Browse tracks and start licensing music
          </p>
          <Link href="/browse">
            <Button>Browse Tracks</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
