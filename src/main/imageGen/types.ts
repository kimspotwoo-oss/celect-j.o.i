export interface ImageAdapter {
  /** 생성된 이미지의 바이트를 반환한다 */
  generateImage(prompt: string): Promise<Buffer>
}
