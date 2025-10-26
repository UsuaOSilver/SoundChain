import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      claude: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not configured',
      story: process.env.STORY_PRIVATE_KEY ? 'configured' : 'not configured',
    }
  });
}