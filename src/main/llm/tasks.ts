import type { StoryNode } from '@shared/types/card'
import type {
  CharacterReplyRequest,
  DraftSuggestRequest,
  GenerateStoryGraphRequest,
  GenerateStoryGraphResult
} from '@shared/types/llm'
import type { LlmAdapter } from './types'

function characterBrief(character: {
  name: string
  personality: string
  speech_style: string
}): string {
  return `캐릭터: ${character.name} (성격: ${character.personality} / 말투: ${character.speech_style})`
}

export async function generateCharacterReply(
  adapter: LlmAdapter,
  req: CharacterReplyRequest
): Promise<string> {
  const system = [
    `당신은 인터랙티브 스토리 속 캐릭터 "${req.character.name}"입니다.`,
    `성격: ${req.character.personality}`,
    `말투: ${req.character.speech_style}`,
    `세계관: ${req.world_setting}`,
    '플레이어의 지시에 캐릭터로서 1~3문장의 짧은 대사로만 반응하세요. 설명이나 지문 없이 대사만 출력하세요.'
  ].join('\n')
  const userMessage = `현재 장면: ${req.recent_node_text}\n\n플레이어의 지시: ${req.user_instruction}`
  return adapter.complete(system, userMessage, 512)
}

export async function suggestDraft(adapter: LlmAdapter, req: DraftSuggestRequest): Promise<string> {
  const targetLabel = req.target === 'required_node' ? '스토리의 필수 경유 노드' : '스토리의 엔딩'
  const system = [
    '당신은 인터랙티브 캐릭터 스토리 작가를 돕는 보조 작가입니다.',
    characterBrief(req.character),
    `세계관: ${req.world_setting}`,
    `아래 조건에 맞는 ${targetLabel} 내용을 1~3문장으로 제안하세요. 캐릭터의 말투를 살린 대사나 상황 묘사를 포함하세요.`,
    '다른 설명 없이 제안 내용만 출력하세요.'
  ].join('\n')
  const userMessage = `조건: ${req.context_hint}`
  return adapter.complete(system, userMessage, 300)
}

function extractJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const jsonText = (fenced ? fenced[1] : raw).trim()
  return JSON.parse(jsonText)
}

function isChoice(value: unknown): value is { label: string; next_node: string } {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.label === 'string' && typeof v.next_node === 'string'
}

function toStoryNode(value: unknown): StoryNode | null {
  if (typeof value !== 'object' || value === null) return null
  const v = value as Record<string, unknown>
  if (typeof v.node_id !== 'string' || typeof v.text !== 'string') return null

  if (v.type === 'linear' && typeof v.next_node === 'string') {
    return { node_id: v.node_id, type: 'linear', text: v.text, next_node: v.next_node }
  }
  if (v.type === 'branch' && Array.isArray(v.choices) && v.choices.every(isChoice)) {
    return {
      node_id: v.node_id,
      type: 'branch',
      text: v.text,
      choices: v.choices as { label: string; next_node: string }[]
    }
  }
  return null
}

export async function generateStoryGraph(
  adapter: LlmAdapter,
  req: GenerateStoryGraphRequest
): Promise<GenerateStoryGraphResult> {
  const orderedRequired = [...req.required_nodes].sort((a, b) => a.approx_stage - b.approx_stage)
  const entryIdFor = (requiredNodeId: string): string => `entry_after_${requiredNodeId}`

  const system = [
    '당신은 인터랙티브 캐릭터 스토리의 노드 그래프를 설계하는 작가입니다.',
    characterBrief(req.character),
    `세계관: ${req.world_setting}`,
    '',
    '규칙:',
    '- required_nodes는 approx_stage 순서대로 반드시 순서대로 등장해야 합니다. 그 사이를 자연스러운 선형(linear) 노드로 연결하세요.',
    '- 마지막 required_node 이후에는 각 ending_node까지 도달하는 경로를 만드세요.',
    '- 각 ending_node는 그 ending_node의 path_count에 지정된 만큼 서로 다른 경로로 도달 가능해야 합니다 (branch 노드로 경로를 나누세요).',
    `- 전체 새로 생성하는 노드 수는 target_depth(${req.target_depth})와 비슷하게 맞추세요.`,
    '- 각 ending_node로 끝나는 경로의 마지막 노드는 next_node 또는 choices의 next_node로 그 ending_node의 ending_id를 가리켜야 합니다.',
    '- 아래 "필수 진입 노드 id" 목록에 있는 id는 반드시 정확히 그 이름으로, 해당 required_node 바로 다음에 오는 노드로 만들어야 합니다 (다른 노드가 그 노드를 가리키게 하지 말고, 그 id 자체를 가진 노드를 생성하세요).',
    '- node_id는 필수 진입 노드 id를 제외하고는 다른 노드와 겹치지 않는 새 id를 만드세요 (예: gen_1, gen_2 ...).',
    '',
    '필수 진입 노드 id 목록:',
    ...orderedRequired.map(
      (r, i) =>
        `- "${entryIdFor(r.node_id)}": ${r.node_id} (${i === orderedRequired.length - 1 ? '마지막 필수 노드' : `다음 필수 노드 "${orderedRequired[i + 1].node_id}" 이전`}) 바로 다음`
    ),
    '',
    '반드시 아래 JSON 배열 형식으로만 응답하세요. 마크다운이나 설명 문구 없이 순수 JSON 배열만 출력하세요:',
    '[',
    '  { "node_id": "entry_after_req_1", "type": "linear", "text": "...", "next_node": "다음노드id" },',
    '  { "node_id": "gen_2", "type": "branch", "text": "...", "choices": [{ "label": "...", "next_node": "..." }] }',
    ']'
  ].join('\n')

  const userMessage = JSON.stringify(
    {
      required_nodes: req.required_nodes,
      ending_nodes: req.ending_nodes
    },
    null,
    2
  )

  const raw = await adapter.complete(system, userMessage, 4000)

  let parsed: unknown
  try {
    parsed = extractJson(raw)
  } catch {
    throw new Error(
      `AI가 올바른 JSON 형식으로 응답하지 않았습니다. 다시 시도해주세요.\n\n원본 응답: ${raw.slice(0, 300)}`
    )
  }

  if (!Array.isArray(parsed)) {
    throw new Error('AI 응답이 노드 배열 형식이 아닙니다. 다시 시도해주세요.')
  }

  const nodes = parsed.map(toStoryNode).filter((n): n is StoryNode => n !== null)
  if (nodes.length === 0) {
    throw new Error('AI가 생성한 노드가 없습니다. 다시 시도해주세요.')
  }

  const generatedIds = new Set(nodes.map((n) => n.node_id))
  const warnings: string[] = []
  const required_nodes = req.required_nodes.map((r) => {
    const entryId = entryIdFor(r.node_id)
    if (!generatedIds.has(entryId)) {
      warnings.push(
        `"${r.node_id}" 다음에 이어질 노드("${entryId}")를 AI가 생성하지 않았습니다. 스토리 노드 목록에서 직접 연결을 확인/수정해주세요.`
      )
    }
    return { ...r, next_node: entryId }
  })

  return { required_nodes, story_nodes: nodes, warnings }
}
