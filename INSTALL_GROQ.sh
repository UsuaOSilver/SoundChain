#!/bin/bash

# Quick installation script for Groq integration
# Run: chmod +x INSTALL_GROQ.sh && ./INSTALL_GROQ.sh

echo "🚀 Installing Groq SDK..."
npm install groq-sdk

echo ""
echo "✅ Groq SDK installed!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Get your Groq API key:"
echo "   → Visit: https://console.groq.com/keys"
echo "   → Create new API key"
echo ""
echo "2. Add to .env:"
echo "   echo 'GROQ_API_KEY=your-key-here' >> .env"
echo ""
echo "3. Test the speed:"
echo "   curl -X POST http://localhost:3000/api/negotiate \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{"
echo "       \"conversationId\": \"test-groq-001\","
echo "       \"trackId\": \"track-123\","
echo "       \"trackMetadata\": {\"title\": \"Test Beat\", \"artist\": \"Producer\"},"
echo "       \"baseTerms\": {\"minPrice\": 50, \"allowedUsageRights\": [\"YOUTUBE\", \"COMMERCIAL\"]},"
echo "       \"userMessage\": \"I want to use this for YouTube\","
echo "       \"useGroq\": true"
echo "     }'"
echo ""
echo "4. Check response time:"
echo "   → Groq: ~500-800ms ⚡"
echo "   → Claude: ~2000-3000ms"
echo "   → 4x faster!"
echo ""
echo "🎯 For Cal Hacks demo, use: \"useGroq\": true"
echo ""
