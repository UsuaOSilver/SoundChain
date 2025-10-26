// Multi-Agent Negotiation API Route
// Handles multilingual music licensing negotiations using Letta agents

import { NextRequest, NextResponse } from 'next/server';
import {
  handleMultiAgentNegotiation,
  isLettaConfigured,
  NegotiationMemory,
} from '@/lib/letta';
import { improvedMultiAgentNegotiation } from '@/lib/letta-improved';
import { groqMultiAgentNegotiation } from '@/lib/letta-groq';
import { isGroqConfigured } from '@/lib/groq-client';
import { negotiateLicense, NegotiationContext } from '@/lib/claude';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      conversationId,
      trackId,
      trackMetadata,
      baseTerms,
      userMessage,
      orchestratorAgentId,
      existingAgentId, // For improved system
      history,
      useLetta = true,
      useImprovedSystem = true, // Use improved Letta with tools
      useGroq = false, // NEW: Use Groq for 4x speed boost
    } = body;

    // Validate required fields
    if (!conversationId || !trackId || !userMessage || !baseTerms) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prepare negotiation memory (used by all systems)
    const negotiationMemory: NegotiationMemory = {
      trackId,
      producerName: trackMetadata?.artist || 'Unknown Producer',
      baseTerms: {
        minPrice: baseTerms.minPrice,
        allowedUsageRights: baseTerms.allowedUsageRights || ['STREAMING', 'YOUTUBE', 'PODCAST', 'COMMERCIAL'],
        exclusivityAvailable: baseTerms.exclusivityAvailable !== false,
        territory: baseTerms.territory || 'worldwide',
      },
      culturalContext: trackMetadata?.culturalContext,
      negotiationHistory: history ? JSON.stringify(history) : undefined,
    };

    // Option 1: Groq for ultra-fast responses (4x faster than Claude)
    if (useGroq && isGroqConfigured()) {
      console.log('Using Groq for ultra-fast negotiation (4x speed)')

      const result = await groqMultiAgentNegotiation(
        conversationId,
        negotiationMemory,
        userMessage,
        history || []
      )

      return NextResponse.json({
        success: true,
        message: result.response,
        contract: result.contract,
        detectedLanguage: result.detectedLanguage,
        toolCalls: result.toolCalls,
        needsMoreInfo: result.needsMoreInfo,
        stage: result.stage,
        responseTime: result.responseTime, // Show speed!
        conversationId,
        groqPowered: true,
      })
    }

    // Option 2: Improved Letta system with tools
    if (useLetta && isLettaConfigured()) {
      // Use improved system with tools if requested
      if (useImprovedSystem) {
        console.log('Using IMPROVED Letta multi-agent system with tools');

        const result = await improvedMultiAgentNegotiation(
          conversationId,
          trackMetadata || { title: 'Unknown Track', artist: 'Unknown Artist' },
          negotiationMemory,
          userMessage,
          existingAgentId
        );

        return NextResponse.json({
          success: true,
          message: result.response,
          contract: result.contract, // NEW: Structured contract
          detectedLanguage: result.detectedLanguage,
          agentId: result.agentId, // NEW: Single agent ID to reuse
          toolCalls: result.toolCalls, // NEW: Tools used
          needsMoreInfo: result.needsMoreInfo, // NEW: Does agent need more info?
          stage: result.stage, // NEW: Negotiation stage
          conversationId,
          usedMultiAgent: true,
          improvedSystem: true,
        });
      } else {
        // Use original Letta system
        console.log('Using original Letta multi-agent system');

        const result = await handleMultiAgentNegotiation(
          conversationId,
          trackMetadata || { title: 'Unknown Track', artist: 'Unknown Artist' },
          negotiationMemory,
          userMessage,
          orchestratorAgentId
        );

        return NextResponse.json({
          success: true,
          message: result.response,
          detectedLanguage: result.detectedLanguage,
          agentUsed: result.agentUsed,
          orchestratorId: result.orchestratorId,
          negotiatorId: result.negotiatorId,
          conversationId,
          usedMultiAgent: true,
          improvedSystem: false,
        });
      }
    } else {
      console.log('Using single Claude agent for negotiation (Letta not configured)');

      // Fallback to single Claude agent
      const context: NegotiationContext = {
        conversationId,
        trackId,
        baseTerms: {
          minPrice: baseTerms.minPrice,
          allowedUsageRights: baseTerms.allowedUsageRights || ['streaming', 'download'],
          exclusivityAvailable: baseTerms.exclusivityAvailable !== false,
          territory: baseTerms.territory || 'worldwide',
        },
        history: history || [],
        currentStatus: 'active',
      };

      const response = await negotiateLicense(context, userMessage);

      return NextResponse.json({
        success: true,
        message: response.message,
        conversationId: response.conversationId,
        tokensUsed: response.tokensUsed,
        usedMultiAgent: false,
      });
    }
  } catch (error) {
    console.error('Negotiation API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process negotiation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check agent status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const agentId = searchParams.get('agentId');

  if (!agentId) {
    return NextResponse.json({
      lettaConfigured: isLettaConfigured(),
      message: 'Multi-agent system status',
    });
  }

  try {
    // TODO: Implement agent status check
    return NextResponse.json({
      agentId,
      status: 'active',
      lettaConfigured: isLettaConfigured(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get agent status' },
      { status: 500 }
    );
  }
}
