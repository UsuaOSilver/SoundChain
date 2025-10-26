'use client'

import Link from 'next/link'
import { ConnectWalletButton } from './connect-wallet-button'
import { Button } from './ui/button'
import { Music2 } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'

export function Navbar() {
  const { authenticated } = usePrivy()

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Music2 className="h-6 w-6 text-purple-600" />
          <span>SoundChain</span>
        </Link>

        <div className="flex items-center gap-6">
          {authenticated ? (
            <>
              <Link href="/browse">
                <Button variant="ghost">Browse Tracks</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/licenses">
                <Button variant="ghost">My Licenses</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/browse">
                <Button variant="ghost">Browse</Button>
              </Link>
              <Link href="/#features">
                <Button variant="ghost">Features</Button>
              </Link>
            </>
          )}

          <ConnectWalletButton />
        </div>
      </div>
    </nav>
  )
}
