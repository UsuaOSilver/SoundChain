'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getEnabledChains, calculateSavings, CHAINS } from '@/lib/chains'
import { TrendingDown, Zap, DollarSign } from 'lucide-react'

interface GasSavingsWidgetProps {
  txCount?: number;
  compact?: boolean;
}

export function GasSavingsWidget({ txCount = 1, compact = false }: GasSavingsWidgetProps) {
  const enabledChains = getEnabledChains()
  const mainnetFee = 10 // $10 avg on Ethereum mainnet

  // Calculate total savings across all chains
  const totalSavings = enabledChains.reduce((sum, chain) => {
    const savings = calculateSavings(chain.id, txCount)
    return sum + savings.saved
  }, 0)

  const avgSavingsPercent = enabledChains.reduce((sum, chain) => {
    const savings = calculateSavings(chain.id, txCount)
    return sum + savings.percentage
  }, 0) / enabledChains.length

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-full border border-green-500/20">
        <TrendingDown className="h-4 w-4" />
        <span className="text-sm font-medium">
          Save {avgSavingsPercent.toFixed(0)}% on gas fees
        </span>
      </div>
    )
  }

  return (
    <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-green-600" />
          Gas Fee Savings (vs Ethereum Mainnet)
        </CardTitle>
        <CardDescription>
          Multi-L2 architecture saves you money on every transaction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-red-500">${mainnetFee}</div>
            <div className="text-xs text-muted-foreground">Ethereum Mainnet</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              ${(mainnetFee - (totalSavings / enabledChains.length)).toFixed(3)}
            </div>
            <div className="text-xs text-muted-foreground">Avg on L2s</div>
          </div>
          <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="text-2xl font-bold text-green-600">
              {avgSavingsPercent.toFixed(0)}%
            </div>
            <div className="text-xs text-green-600">Savings</div>
          </div>
        </div>

        {/* Chain Comparison */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold mb-3">Per-Chain Breakdown:</h4>
          {enabledChains.map((chain) => {
            const savings = calculateSavings(chain.id, txCount)
            return (
              <div
                key={chain.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{chain.logo}</span>
                  <div>
                    <div className="font-medium text-sm">{chain.displayName}</div>
                    <div className="text-xs text-muted-foreground">{chain.purpose}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    {chain.gasEstimate}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {savings.percentage.toFixed(1)}% cheaper
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Ethereum Mainnet Comparison */}
        <div className="flex items-center justify-between p-3 bg-red-500/5 rounded-lg border border-red-500/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⛽</span>
            <div>
              <div className="font-medium text-sm">Ethereum Mainnet</div>
              <div className="text-xs text-muted-foreground">Not recommended</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-red-500">~${mainnetFee}</div>
            <div className="text-xs text-red-500">Baseline cost</div>
          </div>
        </div>

        {/* Real-world Example */}
        {txCount > 1 && (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Real-World Savings</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              For {txCount} transactions:
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">On Mainnet:</div>
                <div className="font-bold text-red-500">${mainnetFee * txCount}</div>
              </div>
              <div>
                <div className="text-muted-foreground">On L2s (avg):</div>
                <div className="font-bold text-green-600">
                  ${((mainnetFee - (totalSavings / enabledChains.length)) * txCount).toFixed(2)}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">You save:</span>
                <span className="font-bold text-green-600 text-lg">
                  ${(totalSavings / enabledChains.length * txCount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Inline gas savings badge
 */
export function GasSavingsBadge({ chainId }: { chainId: string }) {
  const savings = calculateSavings(chainId, 1)

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-600 text-xs font-medium rounded border border-green-500/20">
      <Zap className="h-3 w-3" />
      Save {savings.percentage.toFixed(0)}%
    </span>
  )
}
