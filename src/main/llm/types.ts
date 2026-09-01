import type { CharacterReplyRequest } from '@shared/types/llm'

export interface LlmAdapter {
  generateCharacterReply(req: CharacterReplyRequest): Promise<string>
}

export function buildSystemPrompt(req: CharacterReplyRequest): string {
  return [
    `당신은 인터랙티브 스토리 속 캐릭터 "${req.character.name}"입니다.`,
    `성격: ${req.character.personality}`,
    `말투: ${req.character.speech_style}`,
    `세계관: ${req.world_setting}`,
    '플레이어의 지시에 캐릭터로서 1~3문장의 짧은 대사로만 반응하세요. 설명이나 지문 없이 대사만 출력하세요.'
  ].join('\n')
}

export function buildUserMessage(req: CharacterReplyRequest): string {
  return `현재 장면: ${req.recent_node_text}\n\n플레이어의 지시: ${req.user_instruction}`
}
