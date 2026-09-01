import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { LlmProviderName } from '@shared/types/llm'

/** API 키가 아닌 일반 환경설정(민감정보 아님, 암호화 불필요) */
interface Settings {
  llm_provider?: LlmProviderName
}

function settingsFilePath(): string {
  return join(app.getPath('userData'), 'app-settings.json')
}

function readSettings(): Settings {
  const path = settingsFilePath()
  if (!existsSync(path)) return {}
  return JSON.parse(readFileSync(path, 'utf-8')) as Settings
}

export function getLlmProvider(): LlmProviderName {
  return readSettings().llm_provider ?? 'anthropic'
}

export function setLlmProvider(provider: LlmProviderName): void {
  const settings = readSettings()
  settings.llm_provider = provider
  writeFileSync(settingsFilePath(), JSON.stringify(settings, null, 2), 'utf-8')
}
