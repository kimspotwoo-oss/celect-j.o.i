import type { StoryCard, StoryChoice } from '@shared/types/card'

export type PlayableNodeKind = 'required' | 'story' | 'ending'

/** required_nodes / story_nodes / ending_nodes를 하나의 재생 가능한 형태로 통일한 뷰 */
export interface PlayableNode {
  kind: PlayableNodeKind
  node_id: string
  text: string
  image_ids: string[]
  allow_free_text: boolean
  /** 분기 선택지. 없으면 다음 노드로 자동 진행하거나(선형) 엔딩(끝)이다. */
  choices?: StoryChoice[]
  /** 선형 노드의 다음 노드 id. undefined면 엔딩(끝). */
  next_node?: string
  isEnding: boolean
}

export function findPlayableNode(card: StoryCard, nodeId: string): PlayableNode | undefined {
  const required = card.required_nodes.find((n) => n.node_id === nodeId)
  if (required) {
    return {
      kind: 'required',
      node_id: required.node_id,
      text: required.text,
      image_ids: required.image_ids ?? [],
      allow_free_text: Boolean(required.allow_free_text),
      next_node: required.next_node,
      isEnding: false
    }
  }

  const story = card.story_nodes.find((n) => n.node_id === nodeId)
  if (story) {
    return {
      kind: 'story',
      node_id: story.node_id,
      text: story.text,
      image_ids: story.image_ids ?? [],
      allow_free_text: Boolean(story.allow_free_text),
      choices: story.type === 'branch' ? story.choices : undefined,
      next_node: story.type === 'linear' ? story.next_node : undefined,
      isEnding: false
    }
  }

  const ending = card.ending_nodes.find((n) => n.ending_id === nodeId)
  if (ending) {
    return {
      kind: 'ending',
      node_id: ending.ending_id,
      text: ending.text,
      image_ids: ending.image_ids ?? [],
      allow_free_text: false,
      isEnding: true
    }
  }

  return undefined
}

export function getOpeningNodeId(card: StoryCard): string | undefined {
  const opening = [...card.required_nodes].sort((a, b) => a.approx_stage - b.approx_stage)[0]
  return opening?.node_id
}
