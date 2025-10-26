#!/bin/bash
# Sui Testnet Deployment Script for SoundChain

set -e  # Exit on error

echo "🎵 SoundChain - Sui Testnet Deployment"
echo "========================================"
echo ""

# Check if Sui CLI is installed
if ! command -v sui &> /dev/null; then
    echo "❌ Error: Sui CLI not found"
    echo "Install it with: cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui"
    exit 1
fi

echo "✅ Sui CLI found: $(sui --version)"
echo ""

# Check active address
ACTIVE_ADDRESS=$(sui client active-address 2>/dev/null || echo "")
if [ -z "$ACTIVE_ADDRESS" ]; then
    echo "❌ Error: No active Sui address found"
    echo "Create one with: sui client new-address ed25519"
    exit 1
fi

echo "📍 Active Address: $ACTIVE_ADDRESS"
echo ""

# Check balance
echo "💰 Checking SUI balance..."
sui client balance
echo ""

# Check if we're on testnet
CURRENT_ENV=$(sui client active-env 2>/dev/null || echo "")
if [ "$CURRENT_ENV" != "testnet" ]; then
    echo "⚠️  Warning: Not on testnet environment (current: $CURRENT_ENV)"
    echo "Switch with: sui client switch --env testnet"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🌐 Network: $CURRENT_ENV"
echo ""

# Build the Move package
echo "🔨 Building Move package..."
sui move build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Deploy to testnet
echo "🚀 Publishing to Sui testnet..."
echo "This will cost ~0.01 SUI in gas fees"
echo ""
read -p "Continue with deployment? (y/n): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# Publish and save output
echo ""
echo "📡 Publishing contract..."
OUTPUT=$(sui client publish --gas-budget 100000000 --json)

# Extract package ID from JSON output
PACKAGE_ID=$(echo $OUTPUT | grep -o '"packageId":"[^"]*' | grep -o '0x[^"]*' | head -1)

if [ -z "$PACKAGE_ID" ]; then
    echo "❌ Failed to extract package ID"
    echo "Full output:"
    echo $OUTPUT
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""
echo "================================================"
echo "📦 Package ID: $PACKAGE_ID"
echo "================================================"
echo ""

# Save to .env file
echo "💾 Saving to .env file..."

# Check if .env exists
if [ ! -f "../.env" ]; then
    echo "⚠️  Warning: .env file not found in parent directory"
    echo "Creating .env from .env.example..."
    if [ -f "../.env.example" ]; then
        cp ../.env.example ../.env
    else
        touch ../.env
    fi
fi

# Update or add SUI package ID
if grep -q "NEXT_PUBLIC_SUI_PACKAGE_ID" ../.env; then
    # Update existing line
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|NEXT_PUBLIC_SUI_PACKAGE_ID=.*|NEXT_PUBLIC_SUI_PACKAGE_ID=$PACKAGE_ID|" ../.env
    else
        # Linux
        sed -i "s|NEXT_PUBLIC_SUI_PACKAGE_ID=.*|NEXT_PUBLIC_SUI_PACKAGE_ID=$PACKAGE_ID|" ../.env
    fi
    echo "✅ Updated NEXT_PUBLIC_SUI_PACKAGE_ID in .env"
else
    # Append new line
    echo "" >> ../.env
    echo "# Sui Blockchain Configuration" >> ../.env
    echo "NEXT_PUBLIC_SUI_PACKAGE_ID=$PACKAGE_ID" >> ../.env
    echo "NEXT_PUBLIC_SUI_NETWORK=testnet" >> ../.env
    echo "✅ Added NEXT_PUBLIC_SUI_PACKAGE_ID to .env"
fi

echo ""
echo "🔗 View on Sui Explorer:"
echo "https://suiscan.xyz/testnet/object/$PACKAGE_ID"
echo ""

echo "📝 Next steps:"
echo "1. Restart your dev server: npm run dev"
echo "2. Test minting at: http://localhost:3000/dashboard/upload"
echo "3. Select 'Sui' blockchain and upload a track"
echo ""

echo "🎉 Deployment complete!"
