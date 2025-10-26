'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ARCHITECTURE_LAYERS, getChainById, getEnabledChains } from '@/lib/chains'
import { Shield, DollarSign, TrendingUp, ArrowRight, Layers } from 'lucide-react'

export function ChainArchitecture() {
  const layers = Object.entries(ARCHITECTURE_LAYERS)

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Multi-Chain Architecture
        </CardTitle>
        <CardDescription>
          Specialized blockchains for different use cases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {layers.map(([key, layer], index) => {
          const isLast = index === layers.length - 1
          const Icon = key === 'ip' ? Shield : key === 'payment' ? DollarSign : TrendingUp

          return (
            <div key={key}>
              <div className="space-y-3">
                {/* Layer Header */}
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-${layer.color}-500/10 rounded-lg`}>
                    <Icon className={`h-5 w-5 text-${layer.color}-500`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{layer.name}</h4>
                    <p className="text-sm text-muted-foreground">{layer.description}</p>
                  </div>
                </div>

                {/* Chains in this layer */}
                <div className="flex flex-wrap gap-2 ml-12">
                  {layer.chains.map((chainId) => {
                    const chain = getChainById(chainId)
                    if (!chain) return null

                    return (
                      <Badge
                        key={chainId}
                        variant={chain.enabled ? 'default' : 'outline'}
                        className={`${chain.enabled ? '' : 'opacity-50'}`}
                      >
                        <span className="mr-1">{chain.logo}</span>
                        {chain.name}
                        {!chain.enabled && ' (Coming Soon)'}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              {/* Arrow to next layer */}
              {!isLast && (
                <div className="flex justify-center my-3">
                  <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90" />
                </div>
              )}
            </div>
          )
        })}

        {/* Summary */}
        <div className="pt-4 border-t space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>Why Multi-Chain?</strong>
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>✅ <strong>Story Protocol L2</strong>: Best for IP registration & licensing</li>
            <li>✅ <strong>Base/Optimism L2</strong>: Best for low-cost payments</li>
            <li>✅ <strong>Sui Network</strong>: Best for high-speed trading</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Compact version for sidebars
 */
export function ChainArchitectureCompact() {
  const enabledChains = getEnabledChains()
  const ethL2s = enabledChains.filter((c) => c.type === 'ethereum-l2')
  const otherChains = enabledChains.filter((c) => c.type !== 'ethereum-l2')

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <span className="text-blue-500">⚡</span>
          Ethereum L2s ({ethL2s.length})
        </h4>
        <div className="flex flex-wrap gap-1">
          {ethL2s.map((chain) => (
            <Badge key={chain.id} variant="outline" className="text-xs">
              {chain.logo} {chain.name}
            </Badge>
          ))}
        </div>
      </div>

      {otherChains.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <span className="text-cyan-500">💧</span>
            Other Chains ({otherChains.length})
          </h4>
          <div className="flex flex-wrap gap-1">
            {otherChains.map((chain) => (
              <Badge key={chain.id} variant="outline" className="text-xs">
                {chain.logo} {chain.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
