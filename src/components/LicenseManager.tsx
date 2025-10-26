'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface LicenseInfo {
  id: string
  trackTitle: string
  trackId: string
  status: string
  expiresAt: string | null
  daysRemaining: number | null
  isExpired: boolean
  canRenew: boolean
  renewalPrice: number
}

interface LicenseStats {
  total: number
  active: number
  expired: number
  pending: number
  expiringSoon: number
}

interface LicenseManagerProps {
  userId: string
}

export function LicenseManager({ userId }: LicenseManagerProps) {
  const [licenses, setLicenses] = useState<LicenseInfo[]>([])
  const [renewalRecs, setRenewalRecs] = useState<LicenseInfo[]>([])
  const [stats, setStats] = useState<LicenseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [renewingId, setRenewingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (userId) {
      fetchLicenses()
    }
  }, [userId])

  const fetchLicenses = async () => {
    try {
      const response = await fetch(`/api/licenses/status?userId=${userId}`)
      const data = await response.json()

      setLicenses(data.licenses || [])
      setRenewalRecs(data.renewalRecommendations || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error('Error fetching licenses:', error)
      toast({
        title: 'Error',
        description: 'Failed to load licenses',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRenew = async (licenseId: string, durationMonths: number = 12) => {
    setRenewingId(licenseId)

    try {
      const response = await fetch('/api/licenses/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseId,
          durationMonths,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to renew license')
      }

      const result = await response.json()

      toast({
        title: 'License Renewed!',
        description: `Extended for ${durationMonths} months`,
      })

      // Refresh licenses
      await fetchLicenses()
    } catch (error: any) {
      toast({
        title: 'Renewal Failed',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setRenewingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Licenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Expired
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Renewal Recommendations */}
      {renewalRecs.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Action Required: {renewalRecs.length} License{renewalRecs.length > 1 ? 's' : ''} Need
              Renewal
            </CardTitle>
            <CardDescription>Renew these licenses to maintain access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {renewalRecs.slice(0, 3).map((license) => (
              <div
                key={license.id}
                className="flex items-center justify-between p-3 bg-background rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{license.trackTitle}</div>
                  <div className="text-sm text-muted-foreground">
                    {license.isExpired ? (
                      <span className="text-red-600">Expired</span>
                    ) : (
                      <span className="text-yellow-600">
                        Expires in {license.daysRemaining} days
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Renewal</div>
                    <div className="font-bold">${license.renewalPrice.toFixed(2)}</div>
                    <div className="text-xs text-green-600">20% off</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleRenew(license.id)}
                    disabled={renewingId === license.id}
                  >
                    {renewingId === license.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      'Renew'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Licenses */}
      <Card>
        <CardHeader>
          <CardTitle>Your Licenses</CardTitle>
          <CardDescription>Manage your music licensing agreements</CardDescription>
        </CardHeader>
        <CardContent>
          {licenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Music2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No licenses yet</p>
              <p className="text-sm">Browse tracks to purchase licenses</p>
            </div>
          ) : (
            <div className="space-y-4">
              {licenses.map((license) => (
                <LicenseCard
                  key={license.id}
                  license={license}
                  onRenew={handleRenew}
                  isRenewing={renewingId === license.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function LicenseCard({
  license,
  onRenew,
  isRenewing,
}: {
  license: LicenseInfo
  onRenew: (id: string, months: number) => void
  isRenewing: boolean
}) {
  const getStatusBadge = () => {
    switch (license.status) {
      case 'ACTIVE':
        return license.isExpired ? (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Expired
          </Badge>
        ) : license.daysRemaining && license.daysRemaining <= 30 ? (
          <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
            <Clock className="h-3 w-3" />
            Expiring Soon
          </Badge>
        ) : (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        )
      case 'EXPIRED':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Expired
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case 'REVOKED':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Revoked
          </Badge>
        )
      default:
        return <Badge variant="outline">{license.status}</Badge>
    }
  }

  return (
    <div className="flex items-start justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <h4 className="font-semibold">{license.trackTitle}</h4>
          {getStatusBadge()}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {license.expiresAt ? (
            <>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Expires: {new Date(license.expiresAt).toLocaleDateString()}
                </span>
              </div>
              {license.daysRemaining !== null && license.daysRemaining > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{license.daysRemaining} days remaining</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>Perpetual License</span>
            </div>
          )}
        </div>
      </div>

      {license.canRenew && (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Renew for</div>
            <div className="font-bold">${license.renewalPrice.toFixed(2)}</div>
            <div className="text-xs text-green-600">20% discount</div>
          </div>
          <Button
            size="sm"
            onClick={() => onRenew(license.id, 12)}
            disabled={isRenewing}
          >
            {isRenewing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              'Renew 1 Year'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

function Music2({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="18" r="4" />
      <path d="M12 18V2l7 4" />
    </svg>
  )
}
