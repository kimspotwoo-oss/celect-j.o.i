import type { ImageAdapter } from './types'

// AUTOMATIC1111 stable-diffusion-webui(및 호환 서버)의 REST API를 사용한다.
// 서버를 `--api` 옵션과 함께 실행해야 이 엔드포인트가 열린다.
// https://github.com/AUTOMATIC1111/stable-diffusion-webui

export class LocalSdAdapter implements ImageAdapter {
  constructor(private readonly baseUrl: string) {}

  async generateImage(prompt: string): Promise<Buffer> {
    const endpoint = `${this.baseUrl.replace(/\/+$/, '')}/sdapi/v1/txt2img`

    let response: Response
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, steps: 20, width: 512, height: 512 })
      })
    } catch {
      throw new Error(
        `로컬 Stable Diffusion 서버(${this.baseUrl})에 연결할 수 없습니다. AUTOMATIC1111 WebUI 등을 --api 옵션으로 실행 중인지 확인해주세요.`
      )
    }

    if (!response.ok) {
      const detail = await response.text()
      throw new Error(`로컬 Stable Diffusion 오류 (${response.status}): ${detail.slice(0, 300)}`)
    }

    const data = (await response.json()) as { images?: string[] }
    const image = data.images?.[0]
    if (!image) throw new Error('로컬 Stable Diffusion 서버가 이미지를 반환하지 않았습니다.')
    return Buffer.from(image, 'base64')
  }
}
