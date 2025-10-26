// ElevenLabs Voice Integration for Multi-Agent Negotiation
// Adds voice output to Vietnamese and English agents

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Voice IDs for different languages
// Vietnamese: Use a voice that sounds natural for Vietnamese
// English: Use a voice that sounds professional for English
const VOICES = {
  vietnamese: 'pNInz6obpgDQGcFmaJgB', // Adam (can speak Vietnamese)
  english: 'EXAVITQu4vr4xnSDxMaL', // Sarah (professional English)
} as const;

export interface VoiceOptions {
  text: string;
  language: 'vietnamese' | 'english';
  stability?: number; // 0-1, higher = more stable
  similarityBoost?: number; // 0-1, higher = more similar to original voice
}

/**
 * Convert text to speech using ElevenLabs API
 * Returns audio as base64 string for easy playback in browser
 */
export async function textToSpeech(options: VoiceOptions): Promise<string> {
  const {
    text,
    language,
    stability = 0.5,
    similarityBoost = 0.75,
  } = options;

  if (!ELEVENLABS_API_KEY) {
    console.warn('ElevenLabs API key not configured');
    return '';
  }

  const voiceId = VOICES[language];

  try {
    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2', // Supports Vietnamese
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    // Convert audio to base64
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return `data:audio/mpeg;base64,${base64Audio}`;
  } catch (error) {
    console.error('ElevenLabs text-to-speech error:', error);
    throw error;
  }
}

/**
 * Convert agent response to speech based on detected language
 */
export async function speakAgentResponse(
  agentResponse: string,
  detectedLanguage: 'vi' | 'en'
): Promise<string> {
  const language = detectedLanguage === 'vi' ? 'vietnamese' : 'english';

  return textToSpeech({
    text: agentResponse,
    language,
  });
}

/**
 * Check if ElevenLabs is configured
 */
export function isElevenLabsConfigured(): boolean {
  return !!ELEVENLABS_API_KEY;
}

/**
 * Get available voices info
 */
export function getVoiceInfo() {
  return {
    vietnamese: {
      id: VOICES.vietnamese,
      description: 'Natural Vietnamese voice for producer agent',
      language: 'Vietnamese',
    },
    english: {
      id: VOICES.english,
      description: 'Professional English voice for buyer agent',
      language: 'English',
    },
  };
}
