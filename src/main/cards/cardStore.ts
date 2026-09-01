import { app } from 'electron'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { CardSummary, StoryCard } from '@shared/types/card'

function cardsDir(): string {
  const dir = join(app.getPath('userData'), 'cards')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

function safeId(cardId: string): string {
  return cardId.replace(/[^a-zA-Z0-9_-]/g, '_')
}

function cardFilePath(cardId: string): string {
  return join(cardsDir(), safeId(cardId), 'card.json')
}

export function listCards(): CardSummary[] {
  const dir = cardsDir()
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const path = join(dir, entry.name, 'card.json')
      if (!existsSync(path)) return null
      const card = JSON.parse(readFileSync(path, 'utf-8')) as StoryCard
      return { card_id: card.card_id, name: card.character.name }
    })
    .filter((summary): summary is CardSummary => summary !== null)
}

export function loadCard(cardId: string): StoryCard | null {
  const path = cardFilePath(cardId)
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, 'utf-8')) as StoryCard
}

export function saveCard(card: StoryCard): void {
  const path = cardFilePath(card.card_id)
  mkdirSync(join(cardsDir(), safeId(card.card_id)), { recursive: true })
  writeFileSync(path, JSON.stringify(card, null, 2), 'utf-8')
}

export function deleteCard(cardId: string): void {
  const dir = join(cardsDir(), safeId(cardId))
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true })
}

export function createBlankCard(cardId: string, name: string): StoryCard {
  return {
    card_id: cardId,
    character: { name, personality: '', speech_style: '' },
    outline: { world_setting: '', target_depth: 12 },
    required_nodes: [
      { node_id: 'req_1', approx_stage: 1, text: '', fixed: true, allow_free_text: false }
    ],
    ending_nodes: [{ ending_id: 'end_neutral', text: '', requirements: '기본값', path_count: 1 }],
    story_nodes: [],
    assets: { media_set: [], default_transition_seconds: 4, animation_style: 'subtle_zoom' }
  }
}
