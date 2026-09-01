import type { ImageAdapter } from './types'

// Stability AI Stable Image REST API (v2beta, 2024년 발표된 단순화된 core 엔드포인트).
// 공식 Node SDK가 없어 fetch로 직접 호출한다. Anthropic 스킬 문서에는 포함되지 않은
// 서비스이므로, API가 바뀌면 https://platform.stability.ai/docs 를 확인해서 갱신할 것.
const STABILITY_ENDPOINT = 'https://api.stability.ai/v2beta/stable-image/generate/core'

export class StabilityImageAdapter implements ImageAdapter {
  constructor(private readonly apiKey: string) {}

  async generateImage(prompt: string): Promise<Buffer> {
    const form = new FormData()
    form.append('prompt', prompt)
    form.append('output_format', 'png')

    const response = await fetch(STABILITY_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'image/*'
      },
      body: form
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Stability AI API 키가 올바르지 않습니다.')
      }
      if (response.status === 429) {
        throw new Error('Stability AI 요청이 너무 많습니다. 잠시 후 다시 시도하세요.')
      }
      const detail = await response.text()
      throw new Error(`Stability AI 오류 (${response.status}): ${detail}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }
}
