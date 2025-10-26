-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PRODUCER', 'BUYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Chain" AS ENUM ('SUI', 'BASE', 'STORY', 'OPTIMISM');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "LicenseTier" AS ENUM ('FREE', 'COMMERCIAL', 'EXCLUSIVE');

-- CreateEnum
CREATE TYPE "AudioQuality" AS ENUM ('STANDARD', 'HIGH', 'LOSSLESS');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'ETH', 'SUI');

-- CreateEnum
CREATE TYPE "ViolationStatus" AS ENUM ('DETECTED', 'VERIFIED', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ViolationAction" AS ENUM ('PENDING', 'TAKEDOWN', 'MONETIZE', 'LICENSE_OFFERED', 'PAID');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PRODUCER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "audioUrl" TEXT NOT NULL,
    "coverArtUrl" TEXT,
    "duration" INTEGER NOT NULL,
    "genre" TEXT[],
    "bpm" INTEGER,
    "key" TEXT,
    "mood" TEXT[],
    "instruments" TEXT[],
    "primaryChain" "Chain" NOT NULL,
    "chainTxHash" TEXT NOT NULL,
    "suiObjectId" TEXT,
    "baseTokenId" TEXT,
    "storyIpAssetId" TEXT,
    "optimismTokenId" TEXT,
    "ipProtected" BOOLEAN NOT NULL DEFAULT false,
    "evmCompatible" BOOLEAN NOT NULL DEFAULT false,
    "nativePrice" DECIMAL(10,9) NOT NULL,
    "usdPrice" DECIMAL(10,2) NOT NULL,
    "nativeCurrency" TEXT NOT NULL,
    "baseTerms" JSONB NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "sales" INTEGER NOT NULL DEFAULT 0,
    "producerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "agreedTerms" JSONB,
    "claudeContext" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licenses" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "conversationId" TEXT,
    "primaryChain" "Chain" NOT NULL,
    "suiLicenseId" TEXT,
    "baseLicenseId" TEXT,
    "storyLicenseId" TEXT,
    "optimismLicenseId" TEXT,
    "transactionHash" TEXT,
    "terms" JSONB NOT NULL,
    "price" DECIMAL(10,9) NOT NULL,
    "currency" "Currency" NOT NULL,
    "usdPrice" DECIMAL(10,2) NOT NULL,
    "usageRights" TEXT[],
    "exclusivity" BOOLEAN NOT NULL DEFAULT false,
    "territory" TEXT,
    "duration" INTEGER,
    "attribution" BOOLEAN NOT NULL DEFAULT true,
    "customTerms" TEXT,
    "tier" "LicenseTier" NOT NULL DEFAULT 'FREE',
    "hasWatermark" BOOLEAN NOT NULL DEFAULT true,
    "audioQuality" "AudioQuality" NOT NULL DEFAULT 'STANDARD',
    "contentIdRegistered" BOOLEAN NOT NULL DEFAULT false,
    "violationClaims" INTEGER NOT NULL DEFAULT 0,
    "claimedRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "LicenseStatus" NOT NULL DEFAULT 'PENDING',
    "paymentIntentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "royalty_payments" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" "Currency" NOT NULL,
    "transactionHash" TEXT,
    "recipientAddress" TEXT NOT NULL,
    "description" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "royalty_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track_views" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "viewerId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "track_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "downloads" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "LicenseTier" NOT NULL,
    "hasWatermark" BOOLEAN NOT NULL,
    "quality" "AudioQuality" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "violations" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "detectedBy" TEXT,
    "status" "ViolationStatus" NOT NULL DEFAULT 'DETECTED',
    "action" "ViolationAction" NOT NULL DEFAULT 'PENDING',
    "estimatedViews" INTEGER,
    "estimatedRevenue" DECIMAL(10,2),
    "claimedRevenue" DECIMAL(10,2),
    "bountyPaid" DECIMAL(10,2),
    "notes" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "violations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_walletAddress_idx" ON "users"("walletAddress");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tracks_suiObjectId_key" ON "tracks"("suiObjectId");

-- CreateIndex
CREATE UNIQUE INDEX "tracks_baseTokenId_key" ON "tracks"("baseTokenId");

-- CreateIndex
CREATE UNIQUE INDEX "tracks_storyIpAssetId_key" ON "tracks"("storyIpAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "tracks_optimismTokenId_key" ON "tracks"("optimismTokenId");

-- CreateIndex
CREATE INDEX "tracks_producerId_idx" ON "tracks"("producerId");

-- CreateIndex
CREATE INDEX "tracks_primaryChain_idx" ON "tracks"("primaryChain");

-- CreateIndex
CREATE INDEX "tracks_ipProtected_idx" ON "tracks"("ipProtected");

-- CreateIndex
CREATE INDEX "tracks_isPublished_idx" ON "tracks"("isPublished");

-- CreateIndex
CREATE INDEX "tracks_createdAt_idx" ON "tracks"("createdAt");

-- CreateIndex
CREATE INDEX "tracks_usdPrice_idx" ON "tracks"("usdPrice");

-- CreateIndex
CREATE INDEX "conversations_trackId_idx" ON "conversations"("trackId");

-- CreateIndex
CREATE INDEX "conversations_buyerId_idx" ON "conversations"("buyerId");

-- CreateIndex
CREATE INDEX "conversations_status_idx" ON "conversations"("status");

-- CreateIndex
CREATE INDEX "conversations_createdAt_idx" ON "conversations"("createdAt");

-- CreateIndex
CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId");

-- CreateIndex
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "licenses_conversationId_key" ON "licenses"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "licenses_suiLicenseId_key" ON "licenses"("suiLicenseId");

-- CreateIndex
CREATE UNIQUE INDEX "licenses_baseLicenseId_key" ON "licenses"("baseLicenseId");

-- CreateIndex
CREATE UNIQUE INDEX "licenses_storyLicenseId_key" ON "licenses"("storyLicenseId");

-- CreateIndex
CREATE UNIQUE INDEX "licenses_optimismLicenseId_key" ON "licenses"("optimismLicenseId");

-- CreateIndex
CREATE INDEX "licenses_trackId_idx" ON "licenses"("trackId");

-- CreateIndex
CREATE INDEX "licenses_buyerId_idx" ON "licenses"("buyerId");

-- CreateIndex
CREATE INDEX "licenses_primaryChain_idx" ON "licenses"("primaryChain");

-- CreateIndex
CREATE INDEX "licenses_status_idx" ON "licenses"("status");

-- CreateIndex
CREATE INDEX "licenses_storyLicenseId_idx" ON "licenses"("storyLicenseId");

-- CreateIndex
CREATE INDEX "licenses_createdAt_idx" ON "licenses"("createdAt");

-- CreateIndex
CREATE INDEX "royalty_payments_licenseId_idx" ON "royalty_payments"("licenseId");

-- CreateIndex
CREATE INDEX "royalty_payments_recipientAddress_idx" ON "royalty_payments"("recipientAddress");

-- CreateIndex
CREATE INDEX "royalty_payments_paidAt_idx" ON "royalty_payments"("paidAt");

-- CreateIndex
CREATE INDEX "track_views_trackId_idx" ON "track_views"("trackId");

-- CreateIndex
CREATE INDEX "track_views_viewedAt_idx" ON "track_views"("viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- CreateIndex
CREATE INDEX "downloads_trackId_idx" ON "downloads"("trackId");

-- CreateIndex
CREATE INDEX "downloads_userId_idx" ON "downloads"("userId");

-- CreateIndex
CREATE INDEX "downloads_downloadedAt_idx" ON "downloads"("downloadedAt");

-- CreateIndex
CREATE INDEX "violations_trackId_idx" ON "violations"("trackId");

-- CreateIndex
CREATE INDEX "violations_producerId_idx" ON "violations"("producerId");

-- CreateIndex
CREATE INDEX "violations_status_idx" ON "violations"("status");

-- CreateIndex
CREATE INDEX "violations_platform_idx" ON "violations"("platform");

-- AddForeignKey
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "royalty_payments" ADD CONSTRAINT "royalty_payments_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "licenses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_views" ADD CONSTRAINT "track_views_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "violations" ADD CONSTRAINT "violations_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "violations" ADD CONSTRAINT "violations_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
