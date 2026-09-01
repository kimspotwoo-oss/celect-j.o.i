export interface LlmAdapter {
  /** 하나의 system/user 프롬프트로 텍스트를 생성한다. 모든 LLM 작업(캐릭터 반응, 초안 제안,
   * 노드 그래프 생성)이 이 위에서 만들어진다. */
  complete(system: string, userMessage: string, maxTokens: number): Promise<string>
}
