'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { User, LogOut, Wallet, Mail } from 'lucide-react'

export function ConnectWalletButton() {
  const { ready, authenticated, user, login, logout } = usePrivy()

  // Show loading state while Privy initializes
  if (!ready) {
    return <Button disabled>Loading...</Button>
  }

  // If not authenticated, show login button
  if (!authenticated) {
    return (
      <Button onClick={login}>
        <Mail className="mr-2 h-4 w-4" />
        Sign In
      </Button>
    )
  }

  // Get wallet address (supports both embedded and external wallets)
  const walletAddress = user?.wallet?.address || user?.linkedAccounts?.find(
    (account: any) => account.type === 'wallet'
  )?.address

  // Get user display name (email or wallet address)
  const displayName = user?.email?.address ||
                      (walletAddress ? walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4) : 'Account')

  // If authenticated, show user dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <User className="mr-2 h-4 w-4" />
          {displayName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {user?.email && (
          <DropdownMenuItem disabled>
            <Mail className="mr-2 h-4 w-4" />
            {user.email.address}
          </DropdownMenuItem>
        )}

        {walletAddress && (
          <DropdownMenuItem disabled>
            <Wallet className="mr-2 h-4 w-4" />
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={logout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
