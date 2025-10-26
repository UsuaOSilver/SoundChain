'use client'

import { ConnectButton as SuiConnectButton } from '@mysten/dapp-kit'
import { ConnectKitButton } from 'connectkit'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { useState } from 'react'

export function MultiChainConnectButton() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Connect Wallet</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Multi-Chain Wallet</DialogTitle>
          <DialogDescription>
            Choose which blockchain to connect your wallet for
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="evm" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="evm">EVM Chains</TabsTrigger>
            <TabsTrigger value="sui">Sui</TabsTrigger>
          </TabsList>

          <TabsContent value="evm" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Connect to Ethereum, Story Protocol, Base, or Optimism
              </p>
              <ConnectKitButton.Custom>
                {({ show }) => (
                  <Button onClick={show} className="w-full" size="lg">
                    Connect EVM Wallet
                  </Button>
                )}
              </ConnectKitButton.Custom>
              <div className="text-xs text-center text-muted-foreground">
                Supports MetaMask, WalletConnect, Coinbase Wallet, etc.
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sui" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Connect to Sui blockchain for low-fee NFT trading
              </p>
              <div className="flex justify-center">
                <SuiConnectButton />
              </div>
              <div className="text-xs text-center text-muted-foreground">
                Supports Sui Wallet, Suiet, Ethos, etc.
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 bg-violet-50 dark:bg-violet-950 rounded-lg">
          <p className="text-xs text-violet-900 dark:text-violet-100">
            💡 <strong>Tip:</strong> You can connect both wallet types simultaneously to access all features across chains!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Compact button for navbar
export function CompactMultiChainButton() {
  return (
    <div className="flex items-center gap-2">
      {/* EVM Wallet */}
      <ConnectKitButton.Custom>
        {({ isConnected, show, truncatedAddress }) => (
          <Button
            onClick={show}
            variant={isConnected ? 'outline' : 'ghost'}
            size="sm"
          >
            {isConnected ? `⟠ ${truncatedAddress}` : 'EVM'}
          </Button>
        )}
      </ConnectKitButton.Custom>

      {/* Sui Wallet */}
      <SuiConnectButton />
    </div>
  )
}
