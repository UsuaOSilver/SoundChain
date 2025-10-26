'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  openTransakWidget,
  estimateFiatCost,
  isTransakConfigured,
  getTransakSignUpUrl,
} from '@/lib/transak'

interface TransakCheckoutButtonProps {
  /** Amount of $WIP tokens to purchase (e.g., "5" for 5 $WIP) */
  wipAmount: string
  /** User's wallet address to receive tokens */
  walletAddress?: string
  /** Callback when purchase is complete */
  onSuccess?: () => void
  /** Callback if error occurs */
  onError?: (error: Error) => void
  /** Use testnet or mainnet */
  isTestnet?: boolean
  /** Button text override */
  buttonText?: string
  /** Button variant */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  /** Disabled state */
  disabled?: boolean
  /** Full width button */
  fullWidth?: boolean
}

/**
 * TransakCheckoutButton Component
 *
 * A button that opens Transak's fiat onramp widget to purchase crypto
 * Users can buy ETH with credit cards on Story Protocol L2
 *
 * Usage:
 * ```tsx
 * <TransakCheckoutButton
 *   wipAmount="5"
 *   walletAddress={user.wallet.address}
 *   onSuccess={() => console.log('Purchase complete!')}
 * />
 * ```
 */
export function TransakCheckoutButton({
  wipAmount,
  walletAddress,
  onSuccess,
  onError,
  isTestnet = true,
  buttonText,
  variant = 'default',
  disabled = false,
  fullWidth = false,
}: TransakCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Check if Transak is configured
  const transakConfigured = isTransakConfigured()

  // Calculate estimated fiat cost
  const estimatedCostUSD = estimateFiatCost(wipAmount)

  const handlePurchase = async () => {
    if (!transakConfigured) {
      toast({
        title: 'Transak Not Configured',
        description: (
          <div className="space-y-2">
            <p>Fiat onramp is not available.</p>
            <a
              href={getTransakSignUpUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-xs"
            >
              Get API key →
            </a>
          </div>
        ),
        variant: 'destructive',
      })
      return
    }

    if (!walletAddress) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to purchase with fiat',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      toast({
        title: 'Opening Transak Checkout',
        description: `Purchase ~${wipAmount} $WIP (~$${estimatedCostUSD} USD)`,
      })

      const transak = openTransakWidget({
        walletAddress,
        fiatAmount: estimatedCostUSD,
        isTestnet,
        onSuccess: (orderData) => {
          toast({
            title: 'Purchase Successful!',
            description: (
              <div className="space-y-1">
                <p>Your crypto has been purchased</p>
                <p className="text-xs text-muted-foreground">
                  Order ID: {orderData.status?.id || 'Processing'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Tokens will arrive in 5-10 minutes
                </p>
              </div>
            ),
          })
          onSuccess?.()
          setIsLoading(false)
        },
        onOrderCreated: (orderData) => {
          console.log('Transak order created:', orderData)
          toast({
            title: 'Order Created',
            description: 'Complete payment in the Transak widget',
          })
        },
        onClose: () => {
          setIsLoading(false)
        },
        onError: (error) => {
          toast({
            title: 'Purchase Failed',
            description: error.message || 'Failed to complete fiat purchase',
            variant: 'destructive',
          })
          onError?.(error)
          setIsLoading(false)
        },
      })

      if (!transak) {
        setIsLoading(false)
      }
    } catch (error: any) {
      console.error('Transak checkout error:', error)
      toast({
        title: 'Checkout Error',
        description: error.message || 'Failed to open checkout',
        variant: 'destructive',
      })
      onError?.(error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePurchase}
      disabled={disabled || isLoading || !transakConfigured}
      variant={variant}
      className={`gap-2 ${fullWidth ? 'w-full' : ''}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4" />
          {buttonText || `Pay with Card (~$${estimatedCostUSD})`}
        </>
      )}
    </Button>
  )
}

/**
 * Compact version for use in dialogs or cards
 */
export function TransakCheckoutButtonCompact(
  props: Omit<TransakCheckoutButtonProps, 'variant' | 'fullWidth'>
) {
  return (
    <TransakCheckoutButton
      {...props}
      variant="outline"
      fullWidth
      buttonText={`Pay with Credit Card (~$${estimateFiatCost(props.wipAmount)} USD)`}
    />
  )
}
