import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Music2, Sparkles, Shield, Zap, Globe, Users } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full mb-6">
          <Music2 className="h-5 w-5" />
          <span className="font-medium">SoundChain</span>
        </div>
        <h1 className="text-5xl font-bold mb-4">
          AI-Powered Music Licensing on Blockchain
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Revolutionizing music licensing with Claude AI and Story Protocol.
          Fast, fair, and transparent licensing for the modern music industry.
        </p>
      </div>

      {/* The Problem */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl">The Problem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Traditional music licensing is broken. Producers lose 40% to middlemen, negotiations
            take weeks, and Vietnamese producers face barriers entering global markets.
          </p>
          <ul className="space-y-2 ml-6 list-disc text-muted-foreground">
            <li>Manual negotiations waste time and money</li>
            <li>High gas fees on Ethereum ($50+) prevent small transactions</li>
            <li>No standardized licensing infrastructure</li>
            <li>Producers can't access global licensing markets</li>
          </ul>
        </CardContent>
      </Card>

      {/* Our Solution */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Our Solution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Sparkles className="h-8 w-8 mb-2 text-purple-500" />
              <CardTitle>Claude AI Negotiation</CardTitle>
              <CardDescription>
                Powered by Claude Sonnet 4.5
              </CardDescription>
            </CardHeader>
            <CardContent>
              Natural language licensing negotiations. Claude understands your project,
              negotiates fair terms, and generates legal agreements automatically.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 mb-2 text-blue-500" />
              <CardTitle>Story Protocol IP</CardTitle>
              <CardDescription>
                Programmable IP licensing
              </CardDescription>
            </CardHeader>
            <CardContent>
              Every license is an NFT on Story Protocol blockchain with immutable proof of
              ownership, automated royalties, and transparent revenue tracking.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 mb-2 text-yellow-500" />
              <CardTitle>Sui Blockchain</CardTitle>
              <CardDescription>
                Ultra-low gas fees
              </CardDescription>
            </CardHeader>
            <CardContent>
              10,000x cheaper than Ethereum. Pay $0.001 instead of $50 for gas fees,
              making micro-licensing affordable for everyone.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-8 w-8 mb-2 text-green-500" />
              <CardTitle>Multi-Chain Support</CardTitle>
              <CardDescription>
                Best of all chains
              </CardDescription>
            </CardHeader>
            <CardContent>
              Choose the right blockchain for your needs: Sui for low fees, Story for IP
              licensing, Ethereum for DeFi integration.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Key Features */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl">Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold">Instant Licensing</h4>
                <p className="text-sm text-muted-foreground">
                  Claude AI negotiates terms in minutes, not weeks
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold">Transparent Terms</h4>
                <p className="text-sm text-muted-foreground">
                  All license terms recorded on-chain
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold">Automated Royalties</h4>
                <p className="text-sm text-muted-foreground">
                  Smart contracts distribute payments automatically
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold">License NFTs</h4>
                <p className="text-sm text-muted-foreground">
                  Tradeable, verifiable proof of ownership
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold">Multi-Wallet Support</h4>
                <p className="text-sm text-muted-foreground">
                  Email, Google, Spotify, or Web3 wallet login
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold">Cross-Chain</h4>
                <p className="text-sm text-muted-foreground">
                  Works on Sui, Story, Ethereum, Base, Optimism
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Opportunity */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl">Market Opportunity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-500 mb-2">$43B</div>
              <div className="text-sm text-muted-foreground">
                Music licensing market
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-500 mb-2">200+</div>
              <div className="text-sm text-muted-foreground">
                Vietnamese producers ready
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">40%</div>
              <div className="text-sm text-muted-foreground">
                Fee reduction for producers
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl">Technology Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="font-semibold">Frontend</div>
              <div className="text-sm text-muted-foreground">Next.js 14, React 18</div>
            </div>
            <div>
              <div className="font-semibold">AI</div>
              <div className="text-sm text-muted-foreground">Claude Sonnet 4.5</div>
            </div>
            <div>
              <div className="font-semibold">IP Licensing</div>
              <div className="text-sm text-muted-foreground">Story Protocol</div>
            </div>
            <div>
              <div className="font-semibold">Blockchain</div>
              <div className="text-sm text-muted-foreground">Sui, Ethereum, Base</div>
            </div>
            <div>
              <div className="font-semibold">Auth</div>
              <div className="text-sm text-muted-foreground">Privy (AA)</div>
            </div>
            <div>
              <div className="font-semibold">Wallet</div>
              <div className="text-sm text-muted-foreground">ConnectKit, WalletConnect</div>
            </div>
            <div>
              <div className="font-semibold">Database</div>
              <div className="text-sm text-muted-foreground">Prisma, PostgreSQL</div>
            </div>
            <div>
              <div className="font-semibold">Styling</div>
              <div className="text-sm text-muted-foreground">Tailwind, shadcn/ui</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl">Built for Cal Hacks 12.0</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            SoundChain was built during Cal Hacks 12.0 to revolutionize music licensing
            with AI and blockchain technology. We're targeting both Sui and Ethereum/Story
            Protocol tracks.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Team SoundChain</span>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="border-2 border-primary bg-primary/5">
        <CardContent className="pt-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">
            Browse tracks and experience the future of music licensing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse">
              <Button size="lg">Browse Tracks</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">Producer Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
