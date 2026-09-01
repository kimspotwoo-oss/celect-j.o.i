import OpenAI from 'openai'
import type { LlmAdapter } from './types'

export class OpenAiLlmAdapter implements LlmAdapter {
  constructor(private readonly apiKey: string) {}

  async complete(system: string, userMessage: string, maxTokens: number): Promise<string> {
    const client = new OpenAI({ apiKey: this.apiKey })

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userMessage }
        ]
      })
      return response.choices[0]?.message?.content?.trim() ?? ''
    } catch (error) {
      if (error instanceof OpenAI.AuthenticationError) {
        throw new Error('OpenAI API 키가 올바르지 않습니다.')
      }
      if (error instanceof OpenAI.RateLimitError) {
        throw new Error('OpenAI API 요청이 너무 많습니다. 잠시 후 다시 시도하세요.')
      }
      if (error instanceof OpenAI.APIError) {
        throw new Error(`OpenAI API 오류: ${error.message}`)
      }
      throw error
    }
  }
}
