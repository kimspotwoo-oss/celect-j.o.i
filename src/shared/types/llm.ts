import type { Character } from './card'

export type LlmProviderName = 'anthropic' | 'openai'

/** 지정된 노드에서 플레이어가 자유 텍스트로 지시했을 때 캐릭터 반응을 생성하기 위한 요청 (기획서 §2) */
export interface CharacterReplyRequest {
  character: Character
  world_setting: string
  recent_node_text: string
  user_instruction: string
}
