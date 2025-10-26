'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getEnabledChains, getChainById, ChainInfo } from '@/lib/chains'
import { ChevronDown, Check, ExternalLink } from 'lucide-react'

interface NetworkSwitcherProps {
  currentChainId?: string;
  onNetworkChange?: (chainId: string) => void;
  compact?: boolean;
}

export function NetworkSwitcher({
  currentChainId = 'story',
  onNetworkChange,
  compact = false,
}: NetworkSwitcherProps) {
  const [selectedChainId, setSelectedChainId] = useState(currentChainId)
  const enabledChains = getEnabledChains()
  const selectedChain = getChainById(selectedChainId)

  const handleNetworkChange = (chainId: string) => {
    setSelectedChainId(chainId)
    onNetworkChange?.(chainId)
  }

  // Group chains by type
  const ethL2Chains = enabledChains.filter((c) => c.type === 'ethereum-l2')
  const otherChains = enabledChains.filter((c) => c.type !== 'ethereum-l2')

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <span className="mr-2">{selectedChain?.logo}</span>
            <span className="max-w-[100px] truncate">{selectedChain?.name}</span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Switch Network</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {enabledChains.map((chain) => (
            <DropdownMenuItem
              key={chain.id}
              onClick={() => handleNetworkChange(chain.id)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span>{chain.logo}</span>
                  <span>{chain.name}</span>
                </div>
                {chain.id === selectedChainId && <Check className="h-4 w-4" />}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <span className="text-xl">{selectedChain?.logo}</span>
          <div className="text-left">
            <div className="text-sm font-semibold">{selectedChain?.name}</div>
            <div className="text-xs text-muted-foreground">
              {selectedChain?.type === 'ethereum-l2' ? 'Ethereum L2' : 'Trading Layer'}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Select Network</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Ethereum L2s */}
        {ethL2Chains.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Ethereum Layer 2s
            </DropdownMenuLabel>
            {ethL2Chains.map((chain) => (
              <NetworkMenuItem
                key={chain.id}
                chain={chain}
                isSelected={chain.id === selectedChainId}
                onSelect={() => handleNetworkChange(chain.id)}
              />
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {/* Other Chains */}
        {otherChains.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Other Networks
            </DropdownMenuLabel>
            {otherChains.map((chain) => (
              <NetworkMenuItem
                key={chain.id}
                chain={chain}
                isSelected={chain.id === selectedChainId}
                onSelect={() => handleNetworkChange(chain.id)}
              />
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NetworkMenuItem({
  chain,
  isSelected,
  onSelect,
}: {
  chain: ChainInfo
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <DropdownMenuItem onClick={onSelect} className="cursor-pointer py-3">
      <div className="flex items-start justify-between w-full gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl">{chain.logo}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{chain.displayName}</span>
              {isSelected && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              {chain.purpose}
            </div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                {chain.gasEstimate}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {chain.speed}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </DropdownMenuItem>
  )
}

/**
 * Chain info display (for current network)
 */
export function CurrentNetworkInfo({ chainId }: { chainId: string }) {
  const chain = getChainById(chainId)

  if (!chain) return null

  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
      <span className="text-2xl">{chain.logo}</span>
      <div className="flex-1">
        <div className="font-semibold text-sm">{chain.displayName}</div>
        <div className="text-xs text-muted-foreground">{chain.purpose}</div>
      </div>
      <div className="flex flex-col gap-1 text-right">
        <Badge variant="outline" className="text-xs">
          {chain.gasEstimate}
        </Badge>
        <a
          href={chain.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Explorer
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}

/**
 * Simple chain badge
 */
export function ChainBadge({ chainId, showType = true }: { chainId: string; showType?: boolean }) {
  const chain = getChainById(chainId)

  if (!chain) return null

  return (
    <Badge variant="outline" className="gap-1">
      <span>{chain.logo}</span>
      <span>{chain.name}</span>
      {showType && chain.type === 'ethereum-l2' && (
        <span className="text-xs text-blue-500">L2</span>
      )}
    </Badge>
  )
}
