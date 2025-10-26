// API route for text-to-speech conversion
// Used by demo page to add voice to agent responses

import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech, isElevenLabsConfigured } from '@/lib/elevenlabs';

export async function POST(request: NextRequest) {
  try {
    // Check if ElevenLabs is configured
    if (!isElevenLabsConfigured()) {
      return NextResponse.json(
        { error: 'ElevenLabs not configured. Add ELEVENLABS_API_KEY to .env' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { text, language } = body;

    // Validate inputs
    if (!text || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: text, language' },
        { status: 400 }
      );
    }

    if (language !== 'vietnamese' && language !== 'english') {
      return NextResponse.json(
        { error: 'Language must be "vietnamese" or "english"' },
        { status: 400 }
      );
    }

    // Convert text to speech
    const audioBase64 = await textToSpeech({
      text,
      language: language as 'vietnamese' | 'english',
    });

    return NextResponse.json({
      success: true,
      audio: audioBase64,
      language,
    });
  } catch (error) {
    console.error('Text-to-speech API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to convert text to speech',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if service is available
export async function GET() {
  return NextResponse.json({
    available: isElevenLabsConfigured(),
    message: isElevenLabsConfigured()
      ? 'ElevenLabs text-to-speech is available'
      : 'ElevenLabs not configured. Add ELEVENLABS_API_KEY to .env',
  });
}
