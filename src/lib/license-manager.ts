/**
 * License Management System
 *
 * Handles license expiration, renewal, and automated enforcement
 * Integrates with Story Protocol for on-chain license management
 */

import { prisma } from './db'
import { LicenseStatus } from '@prisma/client'

export interface LicenseInfo {
  id: string
  trackTitle: string
  trackId: string
  buyerId: string
  status: LicenseStatus
  expiresAt: Date | null
  daysRemaining: number | null
  isExpired: boolean
  canRenew: boolean
  renewalPrice: number
}

/**
 * Calculate days remaining until license expires
 */
export function calculateDaysRemaining(expiresAt: Date | null): number | null {
  if (!expiresAt) return null // Perpetual license

  const now = new Date()
  const diffTime = expiresAt.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Check if license is expired
 */
export function isLicenseExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false // Perpetual licenses never expire
  return new Date() > expiresAt
}

/**
 * Check if license is expiring soon (within 30 days)
 */
export function isExpiringSoon(expiresAt: Date | null, daysThreshold: number = 30): boolean {
  if (!expiresAt) return false
  const daysRemaining = calculateDaysRemaining(expiresAt)
  return daysRemaining !== null && daysRemaining > 0 && daysRemaining <= daysThreshold
}

/**
 * Get all licenses for a user with expiration status
 */
export async function getUserLicenses(userId: string): Promise<LicenseInfo[]> {
  const licenses = await prisma.license.findMany({
    where: { buyerId: userId },
    include: {
      track: {
        select: {
          id: true,
          title: true,
          price: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return licenses.map((license) => {
    const daysRemaining = calculateDaysRemaining(license.expiresAt)
    const expired = isLicenseExpired(license.expiresAt)

    return {
      id: license.id,
      trackTitle: license.track.title,
      trackId: license.trackId,
      buyerId: license.buyerId,
      status: license.status,
      expiresAt: license.expiresAt,
      daysRemaining,
      isExpired: expired,
      canRenew: expired || isExpiringSoon(license.expiresAt),
      renewalPrice: parseFloat(license.price.toString()) * 0.8, // 20% discount on renewal
    }
  })
}

/**
 * Get all expiring licenses (expiring within X days)
 */
export async function getExpiringLicenses(daysThreshold: number = 30) {
  const thresholdDate = new Date()
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold)

  return await prisma.license.findMany({
    where: {
      expiresAt: {
        lte: thresholdDate,
        gte: new Date(), // Not already expired
      },
      status: LicenseStatus.ACTIVE,
    },
    include: {
      buyer: {
        select: {
          id: true,
          email: true,
          name: true,
          walletAddress: true,
        },
      },
      track: {
        select: {
          id: true,
          title: true,
          producer: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })
}

/**
 * Get all expired licenses that need status update
 */
export async function getExpiredLicenses() {
  return await prisma.license.findMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
      status: LicenseStatus.ACTIVE, // Still marked as active but expired
    },
    include: {
      buyer: {
        select: {
          id: true,
          email: true,
          walletAddress: true,
        },
      },
      track: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })
}

/**
 * Mark expired licenses as EXPIRED
 */
export async function markExpiredLicenses() {
  const result = await prisma.license.updateMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
      status: LicenseStatus.ACTIVE,
    },
    data: {
      status: LicenseStatus.EXPIRED,
    },
  })

  console.log(`Marked ${result.count} licenses as expired`)
  return result.count
}

/**
 * Calculate renewal expiration date
 */
export function calculateRenewalExpiration(
  currentExpiresAt: Date | null,
  durationMonths: number
): Date {
  // If already expired, start from now
  // If not expired yet, extend from current expiration
  const baseDate = currentExpiresAt && currentExpiresAt > new Date()
    ? currentExpiresAt
    : new Date()

  const newExpiration = new Date(baseDate)
  newExpiration.setMonth(newExpiration.getMonth() + durationMonths)

  return newExpiration
}

/**
 * Renew a license (extend expiration)
 */
export async function renewLicense(
  licenseId: string,
  durationMonths: number,
  paymentIntentId?: string
) {
  const license = await prisma.license.findUnique({
    where: { id: licenseId },
    include: { track: true },
  })

  if (!license) {
    throw new Error('License not found')
  }

  // Calculate new expiration date
  const newExpiresAt = calculateRenewalExpiration(license.expiresAt, durationMonths)

  // Update license
  const renewed = await prisma.license.update({
    where: { id: licenseId },
    data: {
      expiresAt: newExpiresAt,
      status: LicenseStatus.ACTIVE,
      paymentIntentId: paymentIntentId || license.paymentIntentId,
      paidAt: new Date(),
      updatedAt: new Date(),
    },
  })

  return {
    license: renewed,
    newExpiresAt,
    durationMonths,
  }
}

/**
 * Check if user can still use a license
 */
export async function canUseLicense(licenseId: string): Promise<{
  canUse: boolean
  reason?: string
}> {
  const license = await prisma.license.findUnique({
    where: { id: licenseId },
  })

  if (!license) {
    return { canUse: false, reason: 'License not found' }
  }

  // Check status
  if (license.status === LicenseStatus.REVOKED) {
    return { canUse: false, reason: 'License has been revoked' }
  }

  if (license.status === LicenseStatus.EXPIRED) {
    return { canUse: false, reason: 'License has expired' }
  }

  if (license.status === LicenseStatus.PENDING) {
    return { canUse: false, reason: 'Payment pending' }
  }

  // Check expiration
  if (isLicenseExpired(license.expiresAt)) {
    // Auto-mark as expired
    await prisma.license.update({
      where: { id: licenseId },
      data: { status: LicenseStatus.EXPIRED },
    })
    return { canUse: false, reason: 'License has expired' }
  }

  return { canUse: true }
}

/**
 * Get license usage statistics
 */
export async function getLicenseStats(userId?: string) {
  const where = userId ? { buyerId: userId } : {}

  const [total, active, expired, pending, expiringSoon] = await Promise.all([
    prisma.license.count({ where }),
    prisma.license.count({ where: { ...where, status: LicenseStatus.ACTIVE } }),
    prisma.license.count({ where: { ...where, status: LicenseStatus.EXPIRED } }),
    prisma.license.count({ where: { ...where, status: LicenseStatus.PENDING } }),
    prisma.license.count({
      where: {
        ...where,
        status: LicenseStatus.ACTIVE,
        expiresAt: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          gte: new Date(),
        },
      },
    }),
  ])

  return {
    total,
    active,
    expired,
    pending,
    expiringSoon,
  }
}

/**
 * Get renewal recommendations for user
 */
export async function getRenewalRecommendations(userId: string) {
  const licenses = await getUserLicenses(userId)

  return licenses
    .filter((license) => license.canRenew)
    .sort((a, b) => {
      // Sort by: expired first, then by days remaining
      if (a.isExpired && !b.isExpired) return -1
      if (!a.isExpired && b.isExpired) return 1
      if (a.daysRemaining === null) return 1
      if (b.daysRemaining === null) return -1
      return a.daysRemaining - b.daysRemaining
    })
}

/**
 * Revoke a license (admin/producer only)
 */
export async function revokeLicense(
  licenseId: string,
  reason: string,
  revokedBy: string
) {
  const license = await prisma.license.update({
    where: { id: licenseId },
    data: {
      status: LicenseStatus.REVOKED,
      customTerms: reason, // Store revocation reason
      updatedAt: new Date(),
    },
    include: {
      buyer: true,
      track: true,
    },
  })

  // TODO: Log revocation event
  console.log(`License ${licenseId} revoked by ${revokedBy}: ${reason}`)

  return license
}

/**
 * Automated expiration checker (run as cron job)
 */
export async function runExpirationChecker() {
  console.log('Running license expiration checker...')

  // Mark expired licenses
  const expiredCount = await markExpiredLicenses()

  // Get expiring soon (for notifications)
  const expiring = await getExpiringLicenses(7) // 7 days warning

  // Get stats
  const stats = await getLicenseStats()

  return {
    expiredCount,
    expiringCount: expiring.length,
    stats,
    expiringLicenses: expiring,
  }
}
