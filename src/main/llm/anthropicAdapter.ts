import Anthropic from '@anthropic-ai/sdk'
import type { LlmAdapter } from './types'

export class AnthropicLlmAdapter implements LlmAdapter {
  constructor(private readonly apiKey: string) {}

  async complete(system: string, userMessage: string, maxTokens: number): Promise<string> {
    const client = new Anthropic({ apiKey: this.apiKey })

    try {
      const response = await client.messages.create({
        model: 'claude-opus-5',
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: userMessage }]
      })

      const textBlock = response.content.find(
        (block): block is Anthropic.TextBlock => block.type === 'text'
      )
      return textBlock?.text.trim() ?? ''
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) {
        throw new Error('Anthropic API 키가 올바르지 않습니다.')
      }
      if (error instanceof Anthropic.RateLimitError) {
        throw new Error('Anthropic API 요청이 너무 많습니다. 잠시 후 다시 시도하세요.')
      }
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Anthropic API 오류: ${error.message}`)
      }
      throw error
    }
  }
}
