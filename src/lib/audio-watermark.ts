// Audio watermarking for freemium model
// MVP: Simple metadata approach
// Production: Use ffmpeg for actual audio processing

export interface WatermarkOptions {
  message: string
  trackId: string
  interval?: number // seconds between watermark tags
  quality?: 'standard' | 'high' | 'lossless'
}

/**
 * Add watermark to audio (MVP version)
 * Returns URL with watermark parameters
 *
 * For Cal Hacks demo: Just add query params
 * For production: Process audio file with ffmpeg
 */
export function addWatermarkToUrl(
  audioUrl: string,
  options: WatermarkOptions
): string {
  const params = new URLSearchParams({
    watermark: 'true',
    msg: options.message,
    trackId: options.trackId,
    quality: options.quality || 'standard',
  })

  return `${audioUrl}?${params.toString()}`
}

/**
 * Check if URL has watermark
 */
export function hasWatermark(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get('watermark') === 'true'
  } catch {
    return false
  }
}

/**
 * Get watermark info from URL
 */
export function getWatermarkInfo(url: string): {
  hasWatermark: boolean
  message?: string
  trackId?: string
  quality?: string
} {
  try {
    const urlObj = new URL(url)
    const hasWatermark = urlObj.searchParams.get('watermark') === 'true'

    if (!hasWatermark) {
      return { hasWatermark: false }
    }

    return {
      hasWatermark: true,
      message: urlObj.searchParams.get('msg') || undefined,
      trackId: urlObj.searchParams.get('trackId') || undefined,
      quality: urlObj.searchParams.get('quality') || undefined,
    }
  } catch {
    return { hasWatermark: false }
  }
}

/**
 * TODO: Production implementation with ffmpeg
 *
 * This would actually process the audio file:
 * 1. Download original audio
 * 2. Generate TTS for watermark message
 * 3. Insert watermark every X seconds
 * 4. Reduce quality if needed
 * 5. Upload watermarked version
 * 6. Return new URL
 */
export async function addWatermarkWithFFmpeg(
  audioBuffer: Buffer,
  options: WatermarkOptions
): Promise<Buffer> {
  // Pseudo-code for production:
  /*
  import ffmpeg from 'fluent-ffmpeg'
  import { textToSpeech } from './elevenlabs'

  // 1. Generate watermark audio
  const watermarkAudio = await textToSpeech(options.message, {
    voice: 'professional',
    language: 'en'
  })

  // 2. Calculate duration and repetitions
  const audioDuration = await getAudioDuration(audioBuffer)
  const interval = options.interval || 30
  const repetitions = Math.floor(audioDuration / interval)

  // 3. Apply watermark using ffmpeg
  return new Promise((resolve, reject) => {
    ffmpeg(audioBuffer)
      .input(watermarkAudio)
      .complexFilter([
        // Lower quality for free tier
        'aresample=44100',
        'aformat=sample_fmts=s16:channel_layouts=stereo',

        // Insert watermark at intervals
        `[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=0,
         volume=1.5[watermarked]`,

        // Repeat watermark
        `[1:a]aloop=${repetitions}:size=2e+09[looped]`,
        `[0:a][looped]amix=inputs=2:duration=first[out]`
      ])
      .outputOptions([
        '-ar', '44100',        // Sample rate
        '-ab', '128k',         // Bitrate (standard quality)
        '-ac', '2',            // Stereo
      ])
      .toFormat('mp3')
      .on('end', () => resolve(outputBuffer))
      .on('error', reject)
      .run()
  })
  */

  throw new Error('Production watermarking not implemented - use URL approach for MVP')
}

/**
 * Get download restrictions based on tier
 */
export function getDownloadRestrictions(tier: 'FREE' | 'COMMERCIAL' | 'EXCLUSIVE'): {
  hasWatermark: boolean
  quality: 'STANDARD' | 'HIGH' | 'LOSSLESS'
  usageRights: string[]
  restrictions: string[]
} {
  switch (tier) {
    case 'FREE':
      return {
        hasWatermark: true,
        quality: 'STANDARD',
        usageRights: ['PERSONAL_USE'],
        restrictions: [
          'Personal projects only',
          'No commercial use',
          'No YouTube/TikTok monetization',
          'No broadcast or streaming platforms',
          'Attribution required',
          'Watermark cannot be removed'
        ]
      }

    case 'COMMERCIAL':
      return {
        hasWatermark: false,
        quality: 'HIGH',
        usageRights: [
          'YOUTUBE',
          'TIKTOK',
          'PODCAST',
          'COMMERCIAL',
          'STREAMING',
          'SOCIAL_MEDIA'
        ],
        restrictions: [
          'Non-exclusive (others can license too)',
          'Producer keeps publishing rights',
          'Attribution recommended'
        ]
      }

    case 'EXCLUSIVE':
      return {
        hasWatermark: false,
        quality: 'LOSSLESS',
        usageRights: [
          'YOUTUBE',
          'TIKTOK',
          'PODCAST',
          'COMMERCIAL',
          'STREAMING',
          'BROADCAST',
          'FILM',
          'TV',
          'ADVERTISING',
          'ALL_RIGHTS'
        ],
        restrictions: [
          'Exclusive rights (producer removes from store)',
          'Full ownership',
          'Can sublicense to others'
        ]
      }
  }
}

/**
 * Calculate tier upgrade price
 */
export function calculateUpgradePrice(
  fromTier: 'FREE' | 'COMMERCIAL',
  toTier: 'COMMERCIAL' | 'EXCLUSIVE',
  basePrice: number
): number {
  if (fromTier === 'FREE' && toTier === 'COMMERCIAL') {
    return basePrice // Full commercial price
  }

  if (fromTier === 'FREE' && toTier === 'EXCLUSIVE') {
    return basePrice * 2.5 // 2.5x for exclusive
  }

  if (fromTier === 'COMMERCIAL' && toTier === 'EXCLUSIVE') {
    // Upgrade from commercial to exclusive
    // Pay difference (2.5x - 1x = 1.5x more)
    return basePrice * 1.5
  }

  return basePrice
}
