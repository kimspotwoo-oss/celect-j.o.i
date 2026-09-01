import { getSecret } from '../secrets/secretStore'
import { getLlmProvider } from '../settings/settingsStore'
import { AnthropicLlmAdapter } from './anthropicAdapter'
import { OpenAiLlmAdapter } from './openaiAdapter'
import type { LlmAdapter } from './types'

export function resolveLlmAdapter(): LlmAdapter | null {
  const apiKey = getSecret('llm_api_key')
  if (!apiKey) return null
  return getLlmProvider() === 'openai'
    ? new OpenAiLlmAdapter(apiKey)
    : new AnthropicLlmAdapter(apiKey)
}
