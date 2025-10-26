#!/bin/bash

# SoundChain - Foundry Deployment Script
# Deploy SoundChainLicense.sol to Base Sepolia testnet

echo "🚀 Deploying SoundChainLicense to Base Sepolia..."

# Check if Foundry is installed
if ! command -v forge &> /dev/null; then
    echo "❌ Foundry not installed. Installing..."
    curl -L https://foundry.paradigm.xyz | bash
    foundryup
fi

# Load environment variables
if [ ! -f ../.env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

source ../.env

# Check required variables
if [ -z "$PRIVATE_KEY" ] || [ -z "$PLATFORM_WALLET" ]; then
    echo "❌ Missing required environment variables:"
    echo "   PRIVATE_KEY (your deployment wallet)"
    echo "   PLATFORM_WALLET (platform fee recipient)"
    exit 1
fi

# Deploy to Base Sepolia
echo "📝 Deploying contract..."
forge create SoundChainLicense \
    --rpc-url https://sepolia.base.org \
    --private-key $PRIVATE_KEY \
    --constructor-args $PLATFORM_WALLET \
    --verify \
    --etherscan-api-key $BASESCAN_API_KEY

echo "✅ Deployment complete!"
echo "📋 Next steps:"
echo "   1. Copy the contract address from above"
echo "   2. Add to .env: BASE_LICENSE_CONTRACT=0x..."
echo "   3. Update src/lib/base.ts with the contract address"
