'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Send, Loader2, Sparkles, Music2, DollarSign, FileCheck } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

// Mock track data with REAL Suno.com track
const mockTrack = {
  id: '1',
  title: 'Lo-Fi Beats Vol. 1',
  artist: 'AI Producer',
  genre: ['lo-fi', 'hip-hop'],
  price: 0.5,
  chain: 'story',
  // Real Suno track URLs
  audioUrl: 'https://cdn1.suno.ai/5PJa3j01RqRJPB2T.mp3',
  coverUrl: 'https://cdn2.suno.ai/image_large_096c586b-03b5-4194-989d-dc17c01dbd7c.jpeg',
  sunoUrl: 'https://suno.com/s/5PJa3j01RqRJPB2T',
  baseTerms: {
    minPrice: 500,
    allowedUsageRights: ['YOUTUBE', 'COMMERCIAL', 'STREAMING'],
    exclusivityAvailable: true,
    territory: 'WORLDWIDE',
  },
}

type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

export default function NegotiatePage() {
  const params = useParams()
  const router = useRouter()
  const { ready, authenticated, user } = usePrivy()
  const { toast } = useToast()

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm Claude, your AI licensing agent. I represent the producer for "${mockTrack.title}". Let's discuss licensing terms that work for both parties. What are you planning to use this track for?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isNegotiating, setIsNegotiating] = useState(true)
  const [agreedTerms, setAgreedTerms] = useState<any>(null)
  const [conversationState, setConversationState] = useState<'initial' | 'offered' | 'negotiating' | 'finalizing'>('initial')
  const [offeredPrice, setOfferedPrice] = useState<number>(750)

  const handleSend = async () => {
    if (!input.trim() || !authenticated) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate Claude AI response (in production, call your API)
    setTimeout(() => {
      let response = ''
      const lowerInput = input.toLowerCase()

      // State-based negotiation logic for more realistic flow
      if (conversationState === 'finalizing') {
        // Already finalizing - should not happen, but handle gracefully
        response = `I see you have more questions. The agreement is ready to finalize. Click "Pay $${offeredPrice}" when you're ready to proceed!`
      } else if (conversationState === 'offered' && (lowerInput.includes('yes') || lowerInput.includes('agree') || lowerInput.includes('accept') || lowerInput.includes('ok') || lowerInput.includes('sounds good') || lowerInput.includes('proceed'))) {
        // User agreed to the offer - finalize
        response = `Excellent! I'm finalizing the license agreement now. The terms are:\n\n📋 License Summary:\n• Price: $${offeredPrice}\n• Usage: YouTube Commercial\n• Duration: 1 year\n• Territory: Worldwide\n• Attribution: Required\n\nI'll mint your license NFT on Story Protocol blockchain for immutable proof of ownership. Click "Pay $${offeredPrice}" below to complete the purchase.`

        setConversationState('finalizing')
        setIsNegotiating(false)
        setAgreedTerms({
          price: offeredPrice,
          usageRights: ['YOUTUBE', 'COMMERCIAL'],
          duration: 365,
          territory: 'WORLDWIDE',
          attribution: true,
        })
      } else if (conversationState === 'offered' && (lowerInput.includes('no') || lowerInput.includes('too high') || lowerInput.includes('expensive') || lowerInput.includes('lower') || lowerInput.includes('cheaper'))) {
        // User wants to negotiate price
        const newPrice = offeredPrice - 100
        if (newPrice >= 500) {
          response = `I understand your concern. How about $${newPrice}? This is a fair price that still respects the producer's work. Does this work for you?`
          setOfferedPrice(newPrice)
          setConversationState('negotiating')
        } else {
          response = `I appreciate your position, but $${offeredPrice} is already close to the producer's minimum of $500. This is a fair price for commercial YouTube usage with monetization rights. Can we proceed with $${offeredPrice}?`
          setConversationState('negotiating')
        }
      } else if ((conversationState === 'initial' || conversationState === 'negotiating') && (lowerInput.includes('youtube') || lowerInput.includes('video') || lowerInput.includes('vlog') || lowerInput.includes('content'))) {
        // User mentioned YouTube/video - make offer
        response = `Great! For YouTube commercial use, I can offer you a license for $${offeredPrice}. This includes:\n\n✅ Unlimited YouTube views\n✅ Monetization allowed\n✅ 1-year usage rights\n✅ Non-exclusive license\n✅ Attribution required\n\nThis is a competitive rate for commercial music licensing. Would you like to proceed with these terms?`
        setConversationState('offered')
      } else if (lowerInput.includes('spotify') || lowerInput.includes('streaming') || lowerInput.includes('apple music')) {
        // Streaming platform
        response = `Perfect! For streaming platforms like Spotify/Apple Music, I can offer a license for $900. This includes:\n\n✅ All major streaming platforms\n✅ Royalty-free (you keep 100% of streaming revenue)\n✅ 2-year usage rights\n✅ Non-exclusive license\n✅ Attribution required\n\nWould you like to proceed with these terms?`
        setOfferedPrice(900)
        setConversationState('offered')
      } else if (lowerInput.includes('commercial') || lowerInput.includes('ad') || lowerInput.includes('advertisement') || lowerInput.includes('brand')) {
        // Commercial/Ad usage
        response = `For commercial advertisements and brand content, I can offer a license for $1200. This includes:\n\n✅ TV, radio, and digital ads\n✅ Social media campaigns\n✅ 6-month exclusive rights\n✅ Full commercial usage\n✅ No attribution required\n\nThis is premium licensing for high-value commercial use. Interested?`
        setOfferedPrice(1200)
        setConversationState('offered')
      } else if (lowerInput.includes('price') || lowerInput.includes('budget') || lowerInput.includes('cost') || lowerInput.includes('cheaper') || lowerInput.includes('affordable')) {
        // User asking about price
        if (conversationState === 'offered') {
          response = `I understand budget is important. The producer's minimum is $500. I can adjust my offer to $${offeredPrice - 50} for your use case. This is a fair middle ground that values both your project and the producer's work. What do you think?`
          setOfferedPrice(offeredPrice - 50)
          setConversationState('negotiating')
        } else {
          response = `I'm happy to work with your budget! Could you tell me:\n\n1. What platform will you use this on? (YouTube, Spotify, ads, etc.)\n2. What's your budget range?\n3. Is this for personal or commercial use?\n\nThis helps me find the perfect licensing terms for you!`
        }
      } else if (lowerInput.includes('personal') || lowerInput.includes('non-commercial') || lowerInput.includes('hobby') || lowerInput.includes('small')) {
        // Personal/non-commercial use
        response = `For personal, non-commercial use, I can offer a very affordable license at $300. This includes:\n\n✅ Personal projects only\n✅ No monetization\n✅ Social media sharing allowed\n✅ 1-year usage rights\n✅ Attribution required\n\nThis is perfect for hobbyists and personal content creators. Sound good?`
        setOfferedPrice(300)
        setConversationState('offered')
      } else {
        // Default response - gather more info
        response = `I see. Can you tell me more about your project? Specifically:\n\n1. Platform (YouTube, Spotify, commercial ad, podcast, etc.)\n2. Expected reach/audience size\n3. Commercial or personal use?\n4. Your budget range (optional)\n\nThis will help me suggest the best licensing terms for you!`
        setConversationState('initial')
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleFinalizeLicense = () => {
    // Generate a mock transaction hash for demo
    const mockTxHash = `0x${Math.random().toString(16).slice(2, 66)}`
    const explorerUrl = `https://testnet.storyscan.xyz/tx/${mockTxHash}`

    toast({
      title: '🎉 License NFT Minted!',
      description: (
        <div className="space-y-2">
          <p>Your license has been registered on Story Protocol blockchain</p>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
          >
            View on Story Explorer →
          </a>
        </div>
      ),
    })

    setTimeout(() => {
      router.push('/licenses')
    }, 3000)
  }

  if (!ready) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Music2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
        <h1 className="text-3xl font-bold mb-4">Loading...</h1>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Music2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-4">Sign In to Negotiate</h1>
        <p className="text-muted-foreground mb-8">
          Sign in with email or connect your wallet to start licensing negotiations
        </p>
        <Button size="lg">Sign In</Button>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Track Info Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Track Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-violet-600 to-orange-500 rounded-lg flex items-center justify-center">
              <Music2 className="h-20 w-20 text-white" />
            </div>

            <div>
              <h3 className="font-semibold text-lg">{mockTrack.title}</h3>
              <p className="text-sm text-muted-foreground">{mockTrack.artist}</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Genre:</span>
                <span className="font-medium">{mockTrack.genre.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Price:</span>
                <span className="font-medium">${mockTrack.baseTerms.minPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chain:</span>
                <span className="font-medium capitalize">{mockTrack.chain}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Available Rights:</h4>
              <div className="flex flex-wrap gap-2">
                {mockTrack.baseTerms.allowedUsageRights.map((right) => (
                  <span
                    key={right}
                    className="text-xs px-2 py-1 bg-secondary rounded-full"
                  >
                    {right}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-600 to-orange-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>AI Licensing Negotiation</CardTitle>
                <CardDescription>
                  Powered by Claude Sonnet 4.5
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[500px]">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className={message.role === 'user' ? 'bg-orange-500' : 'bg-violet-600'}>
                    <AvatarFallback className="text-white">
                      {message.role === 'user' ? 'You' : 'AI'}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex-1 rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-orange-50 dark:bg-orange-950'
                        : 'bg-secondary'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="bg-violet-600">
                    <AvatarFallback className="text-white">AI</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 rounded-lg p-4 bg-secondary">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Finalize Button (shown when terms are agreed) */}
            {!isNegotiating && agreedTerms && (
              <Card className="border-2 border-green-500 mb-4">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-8 w-8 text-green-500" />
                      <div>
                        <h4 className="font-semibold">Terms Agreed!</h4>
                        <p className="text-sm text-muted-foreground">
                          Ready to mint license NFT
                        </p>
                      </div>
                    </div>
                    <Button size="lg" onClick={handleFinalizeLicense}>
                      <DollarSign className="mr-2 h-5 w-5" />
                      Pay ${agreedTerms.price}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Input */}
            {isNegotiating && (
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  disabled={isTyping}
                />
                <Button onClick={handleSend} disabled={isTyping || !input.trim()}>
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
