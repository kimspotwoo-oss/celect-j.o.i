/** 카드 스키마 타입 정의 (project_spec2.md §5 기준) */

export interface Character {
  name: string
  personality: string
  speech_style: string
}

export interface Outline {
  world_setting: string
  target_depth: number
}

export interface RequiredNode {
  node_id: string
  approx_stage: number
  text: string
  fixed: true
  /** 이 노드 다음에 이어질 노드. AI 노드 생성 파이프라인이 채워 넣는다 (기획서 스키마에는 없던 연결 필드). */
  next_node?: string
  /** 이 노드에서 자유 텍스트 입력창을 활성화할지 여부 */
  allow_free_text?: boolean
  /** 이 노드에서 슬라이드쇼로 순환 표시할 이미지 id 목록 (기획서 §2, §3의 '자동 전환 슬라이드쇼' 반영, 스키마 원안엔 없던 연결 필드) */
  image_ids?: string[]
}

export interface EndingNode {
  ending_id: string
  text: string
  requirements: string
  path_count: number
  image_ids?: string[]
}

export interface StoryChoice {
  label: string
  next_node: string
}

interface StoryNodeBase {
  node_id: string
  text: string
  allow_free_text?: boolean
  image_ids?: string[]
}

export interface LinearStoryNode extends StoryNodeBase {
  type: 'linear'
  next_node: string
}

export interface BranchStoryNode extends StoryNodeBase {
  type: 'branch'
  choices: StoryChoice[]
}

export type StoryNode = LinearStoryNode | BranchStoryNode

export type MediaSource = 'uploaded' | 'generated'
export type MediaType = 'image' | 'video'

export interface MediaGeneration {
  provider: string
  prompt: string
}

export interface MediaAsset {
  id: string
  type: MediaType
  source: MediaSource
  file: string
  generation?: MediaGeneration
}

export type AnimationStyle = 'subtle_zoom' | 'sway' | 'fade' | 'none'

export interface CardAssets {
  media_set: MediaAsset[]
  default_transition_seconds: number
  animation_style: AnimationStyle
}

export interface StoryCard {
  card_id: string
  character: Character
  outline: Outline
  required_nodes: RequiredNode[]
  ending_nodes: EndingNode[]
  story_nodes: StoryNode[]
  assets: CardAssets
}
