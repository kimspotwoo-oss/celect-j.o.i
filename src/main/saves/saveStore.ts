import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { SaveData } from '@shared/types/save'

function savesDir(): string {
  const dir = join(app.getPath('userData'), 'saves')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

function savePath(cardId: string): string {
  const safeId = cardId.replace(/[^a-zA-Z0-9_-]/g, '_')
  return join(savesDir(), `${safeId}.json`)
}

export function loadSave(cardId: string): SaveData | null {
  const path = savePath(cardId)
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, 'utf-8')) as SaveData
}

export function writeSave(saveData: SaveData): void {
  writeFileSync(savePath(saveData.card_id), JSON.stringify(saveData, null, 2), 'utf-8')
}
