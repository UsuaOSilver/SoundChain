// Ultra-fast AI inference using Groq
// Speed: ~500ms vs 2-3s for Claude

import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Fast negotiation response using Groq
 * Speed: ~500ms vs 2-3s for Claude
 */
export async function groqNegotiate(
  messages: GroqMessage[],
  temperature: number = 0.7
): Promise<string> {
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile', // Fast + smart balance
    messages,
    temperature,
    max_tokens: 1024,
    top_p: 1,
    stream: false,
  })

  return response.choices[0]?.message?.content || ''
}

/**
 * Streaming response for real-time feel
 * Use this for chat UIs where you want word-by-word streaming
 */
export async function* groqNegotiateStream(
  messages: GroqMessage[],
  temperature: number = 0.7
): AsyncGenerator<string> {
  const stream = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages,
    temperature,
    max_tokens: 1024,
    stream: true,
  })

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (content) {
      yield content
    }
  }
}

/**
 * Groq with JSON mode for structured outputs
 * Useful for contract generation
 */
export async function groqNegotiateJSON<T = any>(
  messages: GroqMessage[]
): Promise<T> {
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages,
    temperature: 0.3, // Lower temperature for structured output
    max_tokens: 2048,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content || '{}'
  return JSON.parse(content) as T
}

/**
 * Check if Groq is configured
 */
export function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY
}

/**
 * Get Groq client instance (for advanced usage)
 */
export function getGroqClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set')
  }
  return groq
}
