'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Check, ExternalLink, Zap, CreditCard } from 'lucide-react'
import { SUPPORTED_SOURCE_CHAINS, isSolanaChain } from '@/lib/debridge'
import { TransakCheckoutButtonCompact } from '@/components/TransakCheckoutButton'
import { isTransakConfigured } from '@/lib/transak'
import { useWalletClient, useSwitchChain, useChainId } from 'wagmi'
import { useCurrentAccount as useSuiWallet, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import type { Address } from 'viem'

interface CrossChainPurchaseButtonProps {
  ipId: Address
  licenseTermsId: string
  mintingFee: string // in $WIP (e.g., "5")
  trackTitle: string
  disabled?: boolean
}

export function CrossChainPurchaseButton({
  ipId,
  licenseTermsId,
  mintingFee,
  trackTitle,
  disabled,
}: CrossChainPurchaseButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedChain, setSelectedChain] = useState<number | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const { toast } = useToast()

  // EVM wallet hooks
  const { data: walletClient } = useWalletClient()
  const { switchChainAsync } = useSwitchChain()
  const currentChainId = useChainId()

  // Sui wallet hooks
  const suiWallet = useSuiWallet()
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction()

  const handlePurchase = async (srcChainId: number) => {
    const isSui = isSolanaChain(srcChainId)

    // Check wallet connection
    if (isSui && !suiWallet) {
      toast({
        title: 'Sui Wallet Not Connected',
        description: 'Please connect your Sui wallet first',
        variant: 'destructive',
      })
      return
    }

    if (!isSui && !walletClient) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to purchase licenses',
        variant: 'destructive',
      })
      return
    }

    setIsPurchasing(true)
    setSelectedChain(srcChainId)

    try {
      // Step 1: Switch to source chain if needed (EVM only)
      if (!isSui && currentChainId !== srcChainId) {
        toast({
          title: 'Switch Network',
          description: `Please switch to ${SUPPORTED_SOURCE_CHAINS[Object.keys(SUPPORTED_SOURCE_CHAINS).find(k => SUPPORTED_SOURCE_CHAINS[k as keyof typeof SUPPORTED_SOURCE_CHAINS].id === srcChainId) as keyof typeof SUPPORTED_SOURCE_CHAINS]?.name}`,
        })
        await switchChainAsync?.({ chainId: srcChainId })
      }

      // Step 2: Get cross-chain transaction data from API
      const senderAddress = isSui ? suiWallet?.address : walletClient?.account.address
      const receiverAddress = isSui ? suiWallet?.address : walletClient?.account.address

      if (!senderAddress || !receiverAddress) {
        throw new Error('Could not get wallet address')
      }

      const apiResponse = await fetch('/api/licenses/cross-chain-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          srcChainId,
          ipId,
          licenseTermsId,
          mintingFee,
          receiverAddress,
          senderAddress,
          isTestnet: true, // Change to false for mainnet
        }),
      })

      if (!apiResponse.ok) {
        const error = await apiResponse.json()
        throw new Error(error.error || 'Failed to prepare transaction')
      }

      const data = await apiResponse.json()

      toast({
        title: 'Transaction Prepared',
        description: `Cost: ${data.estimation.totalCostFormatted} ${data.sourceChain.nativeToken}`,
      })

      // Step 3: Execute transaction
      let hash: string

      if (data.chainType === 'evm' && walletClient) {
        // EVM transaction
        hash = await walletClient.sendTransaction({
          to: data.transaction.to as Address,
          data: data.transaction.data as `0x${string}`,
          value: BigInt(data.transaction.value),
          chain: walletClient.chain,
        })
      } else if (data.chainType === 'solana') {
        // Sui transaction
        const result = await signAndExecuteTransaction({
          transaction: data.transaction, // Base64-encoded transaction
        })

        hash = result.digest
      } else {
        throw new Error('Unknown transaction type')
      }

      setTxHash(hash)

      toast({
        title: 'Transaction Sent!',
        description: (
          <div className="space-y-2">
            <p>Your license will be minted on Story Protocol L2</p>
            <p className="text-xs">Transaction: {hash.slice(0, 20)}...</p>
            <p className="text-xs text-muted-foreground">
              deBridge Order: {data.orderId.slice(0, 20)}...
            </p>
          </div>
        ),
      })

      // Wait a few seconds then close dialog
      setTimeout(() => {
        setIsOpen(false)
        setIsPurchasing(false)
        setTxHash(null)
        setSelectedChain(null)
      }, 3000)
    } catch (error: any) {
      console.error('Cross-chain purchase error:', error)
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Transaction was rejected or failed',
        variant: 'destructive',
      })
      setIsPurchasing(false)
      setSelectedChain(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="gap-2">
          <Zap className="h-4 w-4" />
          Purchase from Any Chain
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Purchase License</DialogTitle>
          <DialogDescription>
            Purchase "{trackTitle}" license with credit card or crypto from any chain.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* License Details */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">License Fee:</span>
                <span className="font-medium">{mintingFee} $WIP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Destination:</span>
                <span className="font-medium">Story Protocol L2</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">License ID:</span>
                <span className="font-mono text-xs">{licenseTermsId}</span>
              </div>
            </CardContent>
          </Card>

          {/* Fiat Payment Option (Transak) */}
          {isTransakConfigured() && (
            <div>
              <h4 className="text-sm font-medium mb-3">Pay with Credit Card</h4>
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="font-medium">Fiat Onramp</span>
                    <Badge variant="secondary" className="text-xs">
                      Easiest
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Purchase directly with credit/debit card. No crypto knowledge needed.
                  </p>
                  <TransakCheckoutButtonCompact
                    wipAmount={mintingFee}
                    walletAddress={walletClient?.account.address || suiWallet?.address}
                    onSuccess={() => {
                      toast({
                        title: 'Purchase Complete!',
                        description: 'Your crypto will arrive in 5-10 minutes.',
                      })
                      setTimeout(() => setIsOpen(false), 2000)
                    }}
                    isTestnet={true}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chain Selection */}
          <div>
            <h4 className="text-sm font-medium mb-3">
              {isTransakConfigured() ? 'Or Pay with Crypto' : 'Select Payment Chain'}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(SUPPORTED_SOURCE_CHAINS).map(([key, chain]) => {
                const isSelected = selectedChain === chain.id
                const isProcessing = isPurchasing && isSelected
                const isSui = chain.type === 'solana'

                return (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      isSelected ? 'border-primary ring-2 ring-primary ring-offset-2' : ''
                    } ${isProcessing ? 'opacity-50' : ''}`}
                    onClick={() => !isPurchasing && handlePurchase(chain.id)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{chain.name}</span>
                        {isSelected && !isProcessing && <Check className="h-4 w-4 text-primary" />}
                        {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Pay with {chain.nativeToken}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        ~$0.01 gas fee
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Transaction Hash */}
          {txHash && (
            <Card className="border-green-500/50 bg-green-500/5">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-green-500">Transaction Sent!</p>
                    <p className="text-xs text-muted-foreground">
                      Your license will be minted on Story Protocol L2 shortly.
                    </p>
                    <a
                      href={`https://etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      View Transaction <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            {isTransakConfigured() && (
              <p>• Pay with credit card via Transak (1% fee)</p>
            )}
            <p>• {isTransakConfigured() ? 'Or p' : 'P'}ay with crypto via deBridge cross-chain swap</p>
            <p>• License NFT minted to your wallet on Story Protocol L2</p>
            <p>• Estimated time: 2-10 minutes for settlement</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
