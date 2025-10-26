'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { uploadToIPFS, validateAudioFile, validateImageFile } from '@/lib/ipfs'
import { Upload, Loader2, CheckCircle2, Music, Image as ImageIcon, X, Shield, TrendingUp, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { LicenseTermsSelector } from '@/components/LicenseTermsSelector'
import { LICENSE_PRESETS, LicenseTermsOptions } from '@/lib/story'

export default function UploadTrackPage() {
  const { ready, authenticated, user } = usePrivy()
  const { toast } = useToast()
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  // File states
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null)
  const [coverArtPreview, setCoverArtPreview] = useState<string>('')

  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    description: '',
    audioUrl: '',
    coverArtUrl: '',
    genre: [] as string[],
    bpm: '',
    price: '',
  })

  // License terms state
  const [licenseTerms, setLicenseTerms] = useState<LicenseTermsOptions>(
    LICENSE_PRESETS.commercialRemix // Default to commercial remix
  )

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateAudioFile(file)
    if (!validation.valid) {
      toast({
        title: 'Invalid File',
        description: validation.error,
        variant: 'destructive',
      })
      return
    }

    setAudioFile(file)
  }

  const handleCoverArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast({
        title: 'Invalid Image',
        description: validation.error,
        variant: 'destructive',
      })
      return
    }

    setCoverArtFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setCoverArtPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Debug: Log Privy user object
    console.log('Privy user:', user)
    console.log('Privy authenticated:', authenticated)
    console.log('User wallet:', user?.wallet)
    console.log('User linkedAccounts:', user?.linkedAccounts)

    // Get wallet address from Privy user (supports both embedded and external wallets)
    const address = user?.wallet?.address ||
                    user?.linkedAccounts?.find((account: any) => account.type === 'wallet')?.address ||
                    user?.linkedAccounts?.[0]?.address // Fallback to first account

    console.log('Extracted address:', address)

    if (!authenticated) {
      toast({
        title: 'Not Authenticated',
        description: 'Please sign in to upload tracks',
        variant: 'destructive',
      })
      return
    }

    if (!address) {
      toast({
        title: 'Wallet Not Found',
        description: 'Could not find wallet address. Please try reconnecting.',
        variant: 'destructive',
      })
      console.error('Failed to extract wallet address from user:', user)
      return
    }

    if (!audioFile) {
      toast({
        title: 'Missing Audio File',
        description: 'Please upload an audio file',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)

    try {
      // Step 1: Upload audio to IPFS
      setUploadProgress('Uploading audio to IPFS...')
      const audioResult = await uploadToIPFS(audioFile)

      // Step 2: Upload cover art to IPFS (if provided)
      let coverArtUrl = formData.coverArtUrl
      if (coverArtFile) {
        setUploadProgress('Uploading cover art to IPFS...')
        const coverResult = await uploadToIPFS(coverArtFile)
        coverArtUrl = coverResult.gatewayUrl
      }

      // Step 3: Register IP on Story Protocol
      setUploadProgress('Registering IP on Story Protocol...')

      const registerResponse = await fetch('/api/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {
            title: formData.title,
            artist: formData.artist,
            description: formData.description,
            audioUrl: audioResult.ipfsUrl,
            coverArtUrl,
            genre: formData.genre,
            bpm: parseInt(formData.bpm) || undefined,
            price: parseFloat(formData.price),
          },
          address: address,
          licenseTerms: licenseTerms, // Include selected license terms
        }),
      })

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json()
        throw new Error(errorData.error || 'Failed to register IP')
      }

      const registerResult = await registerResponse.json()

      // IP Asset registered on Story Protocol L2
      // Payments will happen on Base L2 when buyers purchase licenses
      console.log('IP Asset registered:', registerResult.ipAssetId)

      toast({
        title: '🎉 IP Registered on Story Protocol L2!',
        description: (
          <div className="space-y-2">
            <p>✅ IP registered on Story Protocol (Ethereum L2)</p>
            <p>🔷 Ready for licensing on Base L2</p>
            <p className="text-xs">IP Asset: {registerResult.ipAssetId.slice(0, 20)}...</p>
            <a
              href={registerResult.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline text-xs"
            >
              View on Story Explorer
            </a>
          </div>
        ),
      })

      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-4xl font-bold">Upload Track</h1>
          <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-sm font-medium rounded-full border border-blue-500/20">
            Powered by Ethereum L2
          </span>
        </div>
        <p className="text-muted-foreground">
          Register your music IP on Story Protocol L2 (Aeneid) - Ultra-low fees, instant finality
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dual-Layer Architecture Explanation */}
        <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Dual-Layer Ethereum L2 Architecture
            </CardTitle>
            <CardDescription>
              Story Protocol L2 for IP + Base L2 for Payments = Ultra-low fees & instant finality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Story Protocol - Required */}
            <div className="p-4 rounded-lg border-2 border-primary bg-primary/10">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">Story Protocol L2 (Ethereum)</h3>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Required • L2
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    <strong>Ethereum Layer 2</strong> specialized for programmable IP. Registers your music with legal licensing terms, royalty distribution, and derivative work tracking. Chain ID: 1315 (Aeneid testnet).
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-background px-2 py-1 rounded">⚡ $0.01 gas fees</span>
                    <span className="bg-background px-2 py-1 rounded">✅ IP Registration</span>
                    <span className="bg-background px-2 py-1 rounded">✅ License Terms</span>
                    <span className="bg-background px-2 py-1 rounded">✅ Royalty Splits</span>
                    <span className="bg-background px-2 py-1 rounded">🔗 EVM Compatible</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Base L2 - Payment Layer */}
            <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-500/10">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-6 w-6 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">Base L2 (Ethereum)</h3>
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                      Payment Layer
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    <strong>Ethereum Layer 2</strong> optimized for ultra-low-fee payments. When buyers purchase licenses (minted on Story Protocol), transactions settle on Base L2 at ~$0.001 per transaction (10,000x cheaper than Ethereum mainnet).
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-background px-2 py-1 rounded">⚡ $0.001 per purchase</span>
                    <span className="bg-background px-2 py-1 rounded">🚀 Instant settlement (2s)</span>
                    <span className="bg-background px-2 py-1 rounded">💰 Royalty distribution</span>
                    <span className="bg-background px-2 py-1 rounded">🔗 EVM Compatible</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Track Details */}
        <Card>
          <CardHeader>
            <CardTitle>Track Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Track Title *</Label>
              <Input
                id="title"
                placeholder="Lo-Fi Beats Vol. 1"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Artist Name *</Label>
              <Input
                id="artist"
                placeholder="Your artist name"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell potential buyers about your track..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  placeholder="lo-fi, hip-hop"
                  value={formData.genre.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      genre: e.target.value.split(',').map((g) => g.trim()),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bpm">BPM</Label>
                <Input
                  id="bpm"
                  type="number"
                  placeholder="120"
                  value={formData.bpm}
                  onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                Base License Price * (ETH)
                <span className="text-xs font-normal text-blue-500">on Ethereum L2</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.05"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Set your base price in ETH. Transactions happen on <strong>Ethereum Layer 2</strong> for ultra-low fees (~$0.01 vs $5-20 on mainnet). Claude AI will negotiate final terms from this baseline.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* License Terms Selection */}
        <Card>
          <CardHeader>
            <CardTitle>License Terms *</CardTitle>
            <CardDescription>
              Define how buyers can use your music. These terms are legally enforceable on-chain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LicenseTermsSelector
              onSelect={(terms) => setLicenseTerms(terms)}
              selectedType={licenseTerms.type}
            />
          </CardContent>
        </Card>

        {/* Audio File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Audio File *</CardTitle>
            <CardDescription>Upload your track (MP3, WAV, FLAC, OGG)</CardDescription>
          </CardHeader>
          <CardContent>
            {audioFile ? (
              <div className="flex items-center justify-between p-4 border-2 border-primary rounded-lg bg-primary/5">
                <div className="flex items-center gap-3">
                  <Music className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{audioFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setAudioFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="block">
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.flac,.ogg"
                  onChange={handleAudioFileChange}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    MP3, WAV, FLAC, or OGG (Max 50MB)
                  </p>
                </div>
              </label>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              📝 Files are stored on IPFS for permanent decentralized storage
            </p>
          </CardContent>
        </Card>

        {/* Cover Art Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Cover Art (Optional)</CardTitle>
            <CardDescription>Upload album artwork (JPG, PNG, WEBP)</CardDescription>
          </CardHeader>
          <CardContent>
            {coverArtFile ? (
              <div className="flex items-center justify-between p-4 border-2 border-primary rounded-lg bg-primary/5">
                <div className="flex items-center gap-3">
                  {coverArtPreview && (
                    <img
                      src={coverArtPreview}
                      alt="Cover art preview"
                      className="h-16 w-16 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{coverArtFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(coverArtFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setCoverArtFile(null)
                    setCoverArtPreview('')
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="block">
                <input
                  type="file"
                  accept="image/*,.jpg,.jpeg,.png,.webp"
                  onChange={handleCoverArtChange}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload cover art
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, or WEBP (Max 5MB)
                  </p>
                </div>
              </label>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isUploading || !audioFile} className="flex-1">
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadProgress || 'Processing...'}
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Register IP on Story Protocol L2
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
