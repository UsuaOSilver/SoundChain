'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, Info } from 'lucide-react'
import { LICENSE_PRESETS, LicenseTermsOptions } from '@/lib/story'

interface LicenseTermsSelectorProps {
  onSelect: (terms: LicenseTermsOptions) => void
  selectedType?: string
}

export function LicenseTermsSelector({ onSelect, selectedType }: LicenseTermsSelectorProps) {
  const [selected, setSelected] = useState<string>(selectedType || 'commercial-remix')

  const handleSelect = (type: string) => {
    setSelected(type)
    onSelect(LICENSE_PRESETS[type])
  }

  const licenseCards = [
    {
      type: 'personal',
      title: 'Personal Use',
      description: 'Free for non-commercial projects',
      badge: 'FREE',
      badgeColor: 'bg-green-500',
      features: [
        'No minting fee',
        'Non-commercial use only',
        'Derivatives allowed',
        'Attribution required',
        'No royalties',
      ],
      recommended: false,
    },
    {
      type: 'commercial-remix',
      title: 'Commercial Remix',
      description: 'Best for producers & creators',
      badge: 'RECOMMENDED',
      badgeColor: 'bg-blue-500',
      features: [
        '5 $WIP minting fee',
        'Commercial use allowed',
        'Derivatives & remixes allowed',
        'Attribution required',
        '5% revenue share on derivatives',
      ],
      recommended: true,
    },
    {
      type: 'commercial',
      title: 'Commercial License',
      description: 'Full commercial rights',
      badge: 'PREMIUM',
      badgeColor: 'bg-purple-500',
      features: [
        '10 $WIP minting fee',
        'Commercial use allowed',
        'No derivatives (exclusive)',
        'Attribution required',
        '10% revenue share',
      ],
      recommended: false,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">License Terms</h3>
        <p className="text-sm text-muted-foreground">
          Choose how buyers can use your music. These terms are enforced on-chain via Story Protocol.
        </p>
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-blue-500 mb-1">Powered by Story Protocol</p>
          <p className="text-muted-foreground">
            License terms are registered on Story Protocol L2 and legally enforceable. Royalties are automatically
            distributed when derivative works generate revenue.
          </p>
        </div>
      </div>

      {/* License Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {licenseCards.map((license) => {
          const isSelected = selected === license.type

          return (
            <Card
              key={license.type}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'hover:border-primary/50'
              } ${license.recommended ? 'relative' : ''}`}
              onClick={() => handleSelect(license.type)}
            >
              {license.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-500">Recommended</Badge>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={license.badgeColor}>{license.badge}</Badge>
                  {isSelected && (
                    <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl">{license.title}</CardTitle>
                <CardDescription>{license.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2">
                  {license.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* What is $WIP? */}
      <div className="p-4 bg-muted rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">What is $WIP?</p>
            <p className="text-muted-foreground">
              $WIP is Story Protocol's native token on their L2. It's used for minting licenses and paying royalties.
              1 $WIP ≈ $0.001 USD. Buyers will need $WIP to purchase your license.{' '}
              <a
                href="https://docs.story.foundation"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Learn more
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <details className="text-sm">
        <summary className="cursor-pointer font-medium mb-2">Technical Details</summary>
        <div className="pl-4 space-y-2 text-muted-foreground">
          <p>
            <strong>Royalty Policy:</strong> RoyaltyPolicyLAP (0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E)
          </p>
          <p>
            <strong>Currency:</strong> $WIP Token ({WIP_TOKEN_ADDRESS})
          </p>
          <p>
            <strong>Enforcement:</strong> On-chain via Story Protocol's Licensing Module
          </p>
          <p>
            <strong>Revenue Share:</strong> Automatically distributed when derivatives earn revenue
          </p>
          <p>
            <strong>Attribution:</strong> Enforced via Dispute Module
          </p>
        </div>
      </details>
    </div>
  )
}

// Fallback for WIP_TOKEN_ADDRESS if not imported
const WIP_TOKEN_ADDRESS = '0xB132A6B7AE652c974EE1557A3521D53d18F6739f'
