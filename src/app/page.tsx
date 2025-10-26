import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Music2,
  Sparkles,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  TrendingUp,
  Layers,
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/20 pt-20 pb-16 sm:pt-32 sm:pb-24">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:75px_75px]" />
        <div className="container relative mx-auto px-4">
          <div className="flex flex-col items-center text-center space-y-8">
            <Badge variant="secondary" className="px-4 py-2">
              <Music2 className="h-4 w-4 mr-2" />
              AI-Powered Music Licensing Platform
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
              Music Licensing for the{' '}
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
                AI Era
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl">
              Claude AI negotiates deals in minutes. Story Protocol ensures legal IP protection.
              Cross-chain payments from any blockchain. Fiat onramp for credit card purchases.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/browse">
                <Button size="lg" className="text-lg px-8 py-6">
                  Browse Tracks
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard/upload">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Music2 className="mr-2 h-5 w-5" />
                  Upload Music
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>2 minute licensing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>40% fees eliminated</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Pay with any chain</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Credit card accepted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                $43B
              </div>
              <div className="text-sm text-muted-foreground mt-2">Music Licensing Market</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                200+
              </div>
              <div className="text-sm text-muted-foreground mt-2">Producers Ready</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                40%
              </div>
              <div className="text-sm text-muted-foreground mt-2">Fees Eliminated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                10,000x
              </div>
              <div className="text-sm text-muted-foreground mt-2">Cheaper Gas Fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">The Problem</h2>
            <p className="text-lg text-muted-foreground">
              Music producers lose <strong>40% to middlemen</strong>, negotiations take weeks,
              and <strong>$50 gas fees</strong> on Ethereum prevent small transactions.
              Language barriers block global licensing deals.
            </p>
          </div>

          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Solution</h2>
            <p className="text-lg text-muted-foreground mb-12">
              Dual-layer blockchain architecture + AI negotiation + Cross-chain payments
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-violet-500 rounded-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Story Protocol Layer</CardTitle>
                </div>
                <Badge variant="outline" className="w-fit">IP Rights & Licensing</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Registers music as <strong>programmable IP</strong> with legal licensing terms.
                  Automated royalty distribution, derivative tracking, and immutable proof of ownership.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Layers className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Multi-Chain Payments</CardTitle>
                </div>
                <Badge variant="outline" className="w-fit">Ethereum, Base, Arbitrum, Sui</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Purchase licenses from <strong>any blockchain</strong> via deBridge cross-chain swaps.
                  Or use <strong>credit card</strong> via Transak fiat onramp. Ultra-low fees, maximum flexibility.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need for modern music licensing
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Sparkles className="h-10 w-10 text-purple-500 mb-3" />
                <CardTitle>AI Negotiation</CardTitle>
                <CardDescription>Claude Sonnet 4.5 powered</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Natural language licensing in any language. From inquiry to signed license in 2 minutes.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-10 w-10 text-blue-500 mb-3" />
                <CardTitle>Legal IP Protection</CardTitle>
                <CardDescription>Story Protocol blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Immutable proof of ownership, programmable licensing terms, automated royalties.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="h-10 w-10 text-green-500 mb-3" />
                <CardTitle>Cross-Chain Payments</CardTitle>
                <CardDescription>deBridge integration</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pay from Ethereum, Base, Arbitrum, Optimism, or Sui. Seamless cross-chain swaps.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CreditCard className="h-10 w-10 text-orange-500 mb-3" />
                <CardTitle>Fiat Onramp</CardTitle>
                <CardDescription>Transak integration</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Buy licenses with credit/debit cards. No crypto knowledge needed. 1% fee.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-10 w-10 text-yellow-500 mb-3" />
                <CardTitle>Ultra-Low Fees</CardTitle>
                <CardDescription>Layer 2 networks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  $0.01 gas fees on L2s vs $50 on Ethereum. 10,000x cheaper transactions.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-red-500 mb-3" />
                <CardTitle>Automated Royalties</CardTitle>
                <CardDescription>Smart contracts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Transparent revenue tracking. Instant payments. No middlemen taking 40% cuts.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              From discovery to licensed track in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-violet-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Browse Tracks</h3>
              <p className="text-sm text-muted-foreground">
                Discover AI-generated music registered on Story Protocol
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">AI Negotiation</h3>
              <p className="text-sm text-muted-foreground">
                Claude AI negotiates licensing terms in natural language
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Pay Any Way</h3>
              <p className="text-sm text-muted-foreground">
                Use crypto from any chain or credit card via Transak
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">Get License NFT</h3>
              <p className="text-sm text-muted-foreground">
                Receive license NFT on Story Protocol L2 instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-violet-600 via-purple-600 to-orange-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
            Ready to revolutionize music licensing?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join 200+ producers already using SoundChain for instant, fair, and transparent licensing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Browse Tracks
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard/upload">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 hover:bg-white/20 text-white border-white">
                <Music2 className="mr-2 h-5 w-5" />
                Start Selling Music
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/50 border-t">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-6">
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/browse" className="hover:text-foreground transition-colors">
              Browse
            </Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Built at Cal Hacks 12.0 | Powered by Claude Sonnet 4.5, Story Protocol, and Multi-Chain Support
          </p>
        </div>
      </footer>
    </div>
  )
}