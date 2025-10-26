'use client'

import { usePrivy } from '@privy-io/react-auth'
import { LicenseManager } from '@/components/LicenseManager'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Music2, ShieldCheck } from 'lucide-react'

export default function LicensesPage() {
  const { ready, authenticated, user } = usePrivy()

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
        <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-4">My Licenses</h1>
        <p className="text-muted-foreground mb-8">
          Connect your wallet to view your music licenses
        </p>
        <Button size="lg">Connect Wallet</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">My Licenses</h1>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-sm font-medium rounded-full border border-blue-500/20">
                On Ethereum L2
              </span>
            </div>
            <p className="text-muted-foreground">
              Manage your music licensing agreements registered on Story Protocol L2
            </p>
          </div>
          <Link href="/browse">
            <Button>
              <Music2 className="mr-2 h-4 w-4" />
              Browse Tracks
            </Button>
          </Link>
        </div>
      </div>

      {/* License Manager Component */}
      <LicenseManager userId={user?.id || ''} />
    </div>
  )
}
