'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  language?: 'vi' | 'en';
  agentUsed?: string;
  audioUrl?: string; // For ElevenLabs voice
}

export default function MultiAgentDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [orchestratorId, setOrchestratorId] = useState<string | null>(null);
  const [language, setLanguage] = useState<'vi' | 'en' | 'auto'>('auto');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  // Demo track data
  const demoTrack = {
    id: 'demo-track-001',
    title: 'Saigon Nights',
    artist: 'Nguyen Minh Duc',
    culturalContext: 'Vietnamese producer targeting both local and international markets',
  };

  const demoBaseTerms = {
    minPrice: 500,
    allowedUsageRights: ['streaming', 'download', 'commercial_use', 'youtube'],
    exclusivityAvailable: true,
    territory: 'worldwide',
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: `demo-${Date.now()}`,
          trackId: demoTrack.id,
          trackMetadata: demoTrack,
          baseTerms: demoBaseTerms,
          userMessage: input,
          orchestratorAgentId: orchestratorId,
          history: messages,
          useLetta: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          language: data.detectedLanguage,
          agentUsed: data.agentUsed,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (data.orchestratorId && !orchestratorId) {
          setOrchestratorId(data.orchestratorId);
        }

        // Generate voice for assistant response if enabled
        if (voiceEnabled && data.message) {
          try {
            const voiceResponse = await fetch('/api/text-to-speech', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: data.message,
                language: data.detectedLanguage === 'vi' ? 'vietnamese' : 'english',
              }),
            });

            const voiceData = await voiceResponse.json();

            if (voiceData.success && voiceData.audio) {
              // Update message with audio
              setMessages((prev) => {
                const updated = [...prev];
                const lastMessage = updated[updated.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  lastMessage.audioUrl = voiceData.audio;
                }
                return updated;
              });

              // Auto-play the audio
              const audio = new Audio(voiceData.audio);
              audio.play();
            }
          } catch (voiceError) {
            console.error('Voice generation error:', voiceError);
            // Continue even if voice fails
          }
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your message. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickMessage = (message: string) => {
    setInput(message);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Multi-Agent Negotiation Demo
        </h1>
        <p className="text-gray-600">
          Try negotiating in Vietnamese or English - our AI agents will adapt!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Track Info */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Track Info</h2>
            <div className="space-y-2 mb-4">
              <p className="font-medium">{demoTrack.title}</p>
              <p className="text-sm text-gray-600">{demoTrack.artist}</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Base Terms:</h3>
              <div className="text-sm space-y-1">
                <p>Min Price: ${demoBaseTerms.minPrice}</p>
                <p>Territory: {demoBaseTerms.territory}</p>
                <p>Exclusivity: Available</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-sm mb-2">Quick Prompts:</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() =>
                    handleQuickMessage(
                      'I want to use this track for my YouTube video. What are the terms?'
                    )
                  }
                >
                  English: YouTube License
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() =>
                    handleQuickMessage(
                      'Tôi muốn mua bản quyền cho quảng cáo. Giá bao nhiêu?'
                    )
                  }
                >
                  Vietnamese: Commercial Ad
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() =>
                    handleQuickMessage(
                      'Can I get exclusive rights? What would that cost?'
                    )
                  }
                >
                  English: Exclusive Rights
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() =>
                    handleQuickMessage(
                      'Tôi có thể thương lượng giá được không?'
                    )
                  }
                >
                  Vietnamese: Price Negotiation
                </Button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <span>🎤</span> Voice Enabled (ElevenLabs)
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-700">
                  Agents speak in their native language
                </p>
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`px-3 py-1 text-xs rounded ${
                    voiceEnabled
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {voiceEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">How it works:</h3>
              <ol className="text-xs space-y-1 list-decimal list-inside">
                <li>Orchestrator detects your language</li>
                <li>Routes to Vietnamese or English agent</li>
                <li>Specialist agent negotiates with cultural context</li>
                <li>Maintains memory across conversation</li>
                <li>Agent speaks response (if voice enabled)</li>
              </ol>
            </div>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Negotiation Chat</h2>
              <Badge variant={orchestratorId ? 'default' : 'secondary'}>
                {orchestratorId ? 'Multi-Agent Active' : 'Ready'}
              </Badge>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <p className="mb-2">Start a conversation in any language!</p>
                  <p className="text-sm">Try Vietnamese or English</p>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'assistant' && (
                      <div className="mt-2 flex gap-2 flex-wrap items-center">
                        {message.language && (
                          <Badge variant="outline" className="text-xs">
                            {message.language === 'vi'
                              ? 'Vietnamese'
                              : 'English'}
                          </Badge>
                        )}
                        {message.agentUsed && (
                          <Badge variant="outline" className="text-xs">
                            {message.agentUsed.replace('_', ' ')}
                          </Badge>
                        )}
                        {message.audioUrl && (
                          <button
                            onClick={() => {
                              const audio = new Audio(message.audioUrl);
                              audio.play();
                              setPlayingAudio(message.audioUrl);
                              audio.onended = () => setPlayingAudio(null);
                            }}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 rounded border border-purple-300"
                            disabled={playingAudio === message.audioUrl}
                          >
                            <span>{playingAudio === message.audioUrl ? '🔊' : '🎤'}</span>
                            <span>{playingAudio === message.audioUrl ? 'Playing...' : 'Play Voice'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-gray-500">Agent is thinking...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message in Vietnamese or English..."
                className="flex-1"
                rows={3}
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="self-end"
              >
                Send
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Architecture Diagram */}
      <Card className="mt-6 p-6">
        <h2 className="text-xl font-semibold mb-4">Multi-Agent Architecture</h2>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="text-center">
            <div className="w-32 h-32 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
              <span className="text-2xl">🤖</span>
            </div>
            <p className="font-medium">User</p>
            <p className="text-xs text-gray-600">Any language</p>
          </div>

          <div className="text-2xl">→</div>

          <div className="text-center">
            <div className="w-32 h-32 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
              <span className="text-2xl">🎯</span>
            </div>
            <p className="font-medium">Orchestrator</p>
            <p className="text-xs text-gray-600">Language detection</p>
          </div>

          <div className="text-2xl">→</div>

          <div className="flex flex-col gap-4">
            <div className="text-center">
              <div className="w-32 h-32 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl">🇻🇳</span>
              </div>
              <p className="font-medium">Vietnamese Agent</p>
              <p className="text-xs text-gray-600">Cultural context</p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-2xl">🇺🇸</span>
              </div>
              <p className="font-medium">English Agent</p>
              <p className="text-xs text-gray-600">Western standards</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
