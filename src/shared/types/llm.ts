import type { Character, EndingNode, RequiredNode, StoryNode } from './card'

export type LlmProviderName = 'anthropic' | 'openai'

/** 지정된 노드에서 플레이어가 자유 텍스트로 지시했을 때 캐릭터 반응을 생성하기 위한 요청 (기획서 §2) */
export interface CharacterReplyRequest {
  character: Character
  world_setting: string
  recent_node_text: string
  user_instruction: string
}

export type DraftTarget = 'required_node' | 'ending_node'

/** 제작 단계에서 필수/엔딩 노드 내용을 AI에게 제안받기 위한 요청 (기획서 §6 1단계 "AI 초안 보조 기능") */
export interface DraftSuggestRequest {
  character: Character
  world_setting: string
  target: DraftTarget
  /** 어떤 성격의 노드인지에 대한 힌트. 예: "오프닝 장면", "해피엔딩 (호감도 높음)" */
  context_hint: string
}

/** required_nodes/ending_nodes 사이를 AI가 연결해 story_nodes를 생성하기 위한 요청 (기획서 §6 2단계) */
export interface GenerateStoryGraphRequest {
  character: Character
  world_setting: string
  target_depth: number
  required_nodes: RequiredNode[]
  ending_nodes: EndingNode[]
}

export interface GenerateStoryGraphResult {
  /** next_node이 채워진 required_nodes (각 필수 노드 다음에 이어질 생성된 노드로 연결됨) */
  required_nodes: RequiredNode[]
  story_nodes: StoryNode[]
  /** AI가 지시를 완전히 따르지 않았을 때의 경고 (예: 연결 노드 누락) */
  warnings: string[]
}
