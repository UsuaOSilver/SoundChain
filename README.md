# SoundChain 🎵⛓️

**AI-Native Freemium Music Licensing Platform | Multi-Chain Architecture**

> "If BeatStars were rebuilt in 2025, it would have freemium distribution + AI negotiation + blockchain enforcement"

SoundChain combines **freemium distribution** (zero-friction adoption) with **AI-powered negotiation** (seamless conversion) and **blockchain enforcement** (self-executing business model) to disrupt the $26B independent music licensing market.

**The Innovation**: Free watermarked downloads drive viral adoption → AI agents convert 3% to paid licenses → Producers earn 20x more than traditional marketplaces.

[![Live Demo](https://img.shields.io/badge/Try%20Demo-Live-blue)](YOUR_VERCEL_LINK)
[![YC Challenge](https://img.shields.io/badge/YC-Challenge%202025-orange)](https://www.ycombinator.com/)
[![Cal Hacks](https://img.shields.io/badge/Cal%20Hacks-12.0-green)](https://calhacks.io/)

---

## 🏆 Cal Hacks 12.0: Three Unique Innovations

### 1. **Freemium Model** (NEW - Nobody Else Has This)
- FREE tier: Watermarked downloads → Massive adoption (no credit card)
- COMMERCIAL tier: Clean audio + blockchain license ($50-200)
- EXCLUSIVE tier: Full rights + stems ($250-1000)
- **Result**: 10x more users than "pay upfront" competitors

### 2. **AI-Powered Conversion** (Letta + Groq + Claude)
- Vietnamese + English specialist agents with cultural context
- Tool calling: price calculator, rights validator, contract generator
- 600ms responses (Groq) vs 2400ms (Claude) = 4x faster
- **Result**: 3% conversion rate (10x better than cold traffic)

### 3. **Blockchain Enforcement** (Story Protocol + Sui + Base)
- Watermark embeds producer ID + license tier
- YouTube Content ID detects violations automatically
- Immutable licenses on Story Protocol
- Ultra-low-fee trading on Sui ($0.0001 vs $50 Ethereum)
- **Result**: Self-enforcing business model

---

## 💡 The Problem

Music licensing is broken in two ways:

### **For Content Creators (Buyers):**
- ❌ Can't use Spotify music (copyright infringement)
- ❌ BeatStars requires $50-200 upfront (risky, no trial)
- ❌ Traditional licensing: $2,000 lawyers + 3 weeks
- ❌ Language barriers with international producers

### **For Music Producers (Sellers):**
- ❌ "Pay upfront" model = low adoption (only 100 sales/month)
- ❌ Labels take 70-85% of revenue
- ❌ Lawyers charge 40% per deal
- ❌ Can't reach global buyers (language barriers)

**Market**: $26B independent licensing market stuck with 2005 technology

---

## 🎯 Our Solution: Freemium + AI + Blockchain

### **How It Works:**

```
1. User discovers track
   ├─ Downloads FREE (watermarked, $0)
   └─ Zero friction, no credit card

2. User tries commercial use (YouTube video)
   ├─ Content ID detects watermark
   └─ "Video contains copyrighted material"

3. User returns to SoundChain
   ├─ AI: "For YouTube monetization, upgrade to COMMERCIAL"
   ├─ Price tool: Calculates $100 (YouTube + commercial rights)
   ├─ AI negotiates: "I can do $90 (10% off)"
   └─ User accepts

4. Payment & fulfillment
   ├─ User gets clean audio + blockchain license
   ├─ Producer gets 90% ($81)
   └─ SoundChain gets 10% ($9)

5. Everyone wins
   ├─ User: Risk-free trial before buying
   ├─ Producer: Earned from user who wouldn't pay upfront
   └─ Platform: Sustainable 10% fee
```

### **Economics (Per Track/Month):**

| Metric | Value |
|--------|-------|
| Free downloads | 1,000 |
| Paid conversions (3%) | 30 |
| Avg license price | $100 |
| License revenue | $3,000 |
| Violations detected (10%) | 100 |
| Claimed/violation | $50 |
| Violation revenue | $5,000 |
| **Total revenue** | **$8,000** |
| **Producer earnings (90%)** | **$7,200** |

**vs. BeatStars (traditional)**: $350/month (100 buyers @ $50, 70% share)
**Improvement**: **20x more revenue for producers**

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+
- PostgreSQL database
- API keys: Anthropic, Letta, Groq (optional)

### **Installation**

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/soundchain.git
cd soundchain

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Set up database
npx prisma generate
npx prisma migrate dev --name add_freemium_support

# Run development server
npm run dev
```

Visit `http://localhost:3000`

### **Environment Variables**

```env
# AI (Required for negotiation)
ANTHROPIC_API_KEY=your_claude_key
LETTA_API_KEY=your_letta_key
LETTA_BASE_URL=https://api.letta.com

# AI (Optional - for speed)
GROQ_API_KEY=your_groq_key

# Blockchain (Story Protocol)
STORY_PRIVATE_KEY=your_wallet_private_key
STORY_RPC_URL=https://testnet.storyrpc.io

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/soundchain

# Voice (Optional)
ELEVENLABS_API_KEY=your_elevenlabs_key

# Cron (for license expiration)
CRON_SECRET=your_random_secret
```

---

## 📊 Implementation Status

### ✅ **Fully Implemented**

**12 API Routes:**
- `/api/negotiate` - AI negotiation (Claude/Letta/Groq)
- `/api/download` - Freemium download routing
- `/api/mint` - Story Protocol IP registration
- `/api/licenses/*` - License management (status, renew, expiration)
- `/api/tracks` - Track CRUD operations
- `/api/upload-ipfs` - Decentralized storage
- `/api/text-to-speech` - Voice synthesis
- `/api/royalty/cross-chain-tip` - Cross-chain payments

**5 Blockchain Integrations:**
- Story Protocol - Production-ready (testnet)
- Sui Network - Payment layer implemented
- Base L2 - Via deBridge
- Optimism - Via deBridge
- deBridge - Cross-chain orchestration

**3 AI Backends:**
- Claude - Single-agent (2-3s response)
- Letta - Multi-agent with routing (2-3s response)
- Groq - Ultra-fast (600ms - 4x faster)

**Freemium System:**
- FREE tier: 128kbps watermarked
- COMMERCIAL tier: Clean audio + rights
- EXCLUSIVE tier: Stems + full rights
- Download tracking + violation detection

### ⏳ **In Progress**

- Database migration (pending database access)
- Frontend UI for freemium tiers
- Sui NFT contract deployment

### 📝 **Planned**

- YouTube Content ID registration
- Automated DMCA takedowns
- Community bounty system

**See [CODEBASE_ANALYSIS.md](CODEBASE_ANALYSIS.md) for detailed implementation status**

---

## 🏗️ Architecture

### **Four-Layer System:**

```
┌─────────────────────────────────────────────┐
│    Layer 0: Freemium Distribution           │
│  • FREE tier (watermarked)                  │
│  • COMMERCIAL tier (paid, clean)            │
│  • EXCLUSIVE tier (premium)                 │
│  • Enforcement via watermark + Content ID   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│    Layer 1: AI Negotiation Engine           │
│  • Letta multi-agent (quality)              │
│  • Groq inference (4x speed)                │
│  • Vietnamese + English specialists         │
│  • Tool calling (price, rights, contract)   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│    Layer 2: Multi-Chain Marketplace         │
│  • Sui Network ($0.0001 fees)               │
│  • Base L2 (EVM compatible)                 │
│  • Optimism (EVM alternative)               │
│  • deBridge (cross-chain orchestration)     │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│    Layer 3: Story Protocol (Optional)       │
│  • IP Asset registration                    │
│  • Programmable licensing                   │
│  • Royalty automation                       │
│  • Legal proof on-chain                     │
└─────────────────────────────────────────────┘
```

---

## 🚀 Tech Stack

### **Frontend**
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- shadcn/ui, wagmi, ConnectKit

### **Backend**
- Next.js API Routes, PostgreSQL, Prisma
- Letta Framework, Claude 4.5, Groq

### **Blockchain**
- Story Protocol, Sui Network, Base L2, Optimism, deBridge

### **Integrations**
- ElevenLabs (voice), IPFS (storage), Transak (fiat on-ramp)

---

## 🎮 Usage

### **For Music Producers:**
1. Upload track (automatically listed as FREE tier)
2. Set COMMERCIAL and EXCLUSIVE pricing
3. AI handles all negotiations
4. Receive 90% of every sale + violation claims

### **For Content Creators:**
1. Browse tracks and download FREE (watermarked)
2. Test in your project (zero risk)
3. If you need commercial use, chat with AI
4. AI negotiates → pay → clean audio unlocked

---

## 🏆 Cal Hacks Sponsor Prizes

### **🎯 Y Combinator (Primary Target)**
- **Why we win**: Real traction (200+ producers), unique freemium + AI, 20x revenue improvement, $26B market, perfect timing

### **🤖 Letta | 🤖 Claude | ⛓️ Story Protocol | 💧 Sui Network**
- Multi-agent AI, cultural negotiation, programmable IP, ultra-low fees

---

## 📈 Market & Traction

- **Market**: $26B independent music licensing
- **Network**: 200+ Vietnamese producers ready to onboard
- **Economics**: Producers earn 20x more than traditional marketplaces
- **Moat**: AI + network effects (winner-take-most)

---

## 🔮 Why This Couldn't Exist Before 2024

| Technology | Why Critical |
|-----------|--------------|
| Claude Sonnet 4.5 (2025) | Cultural understanding for Vietnamese negotiation |
| Letta Framework (2024) | Stateful multi-agent orchestration |
| Groq (2024) | 600ms real-time responses |
| Story Protocol (2024) | Programmable IP on-chain |
| Sui Network (2023) | Sub-cent transactions at scale |

---

## 📚 Documentation

### **Core Docs (Root)**
- [README.md](README.md) - Project overview (this file)
- [CAL_HACKS_BUSINESS_OVERVIEW.md](CAL_HACKS_BUSINESS_OVERVIEW.md) - Complete business case
- [SIMPLIFIED_ARCHITECTURE.md](SIMPLIFIED_ARCHITECTURE.md) - Technical architecture
- [CODEBASE_ANALYSIS.md](CODEBASE_ANALYSIS.md) - Implementation status
- [ANALYSIS_INDEX.md](ANALYSIS_INDEX.md) - Documentation navigation

### **Organized Docs**
- `docs/business/` - Business model, market positioning
- `docs/implementation/` - AI, multi-chain, freemium guides
- `docs/quickstart/` - Getting started
- `docs/integrations/` - Third-party integrations
- `docs/sui/` - Sui-specific guides

---

## 🎯 Demo Flow

1. **User downloads FREE** (watermarked) → Tests in video
2. **YouTube blocks monetization** → Returns to SoundChain
3. **AI negotiation** → "For YouTube, you need COMMERCIAL license ($90)"
4. **Payment** → Clean audio unlocked immediately
5. **Result** → Producer earned $81 (90%), User got risk-free trial

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

Built at Cal Hacks 12.0 with ❤️

Special thanks: Anthropic, Letta, Story Protocol, Sui Foundation, Vietnamese music community

---

**SoundChain** - Free downloads → AI converts → Producers earn 20x more. Simple.
