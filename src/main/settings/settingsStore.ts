import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { LlmProviderName } from '@shared/types/llm'
import type { ImageProviderName } from '@shared/types/imageGen'

const DEFAULT_LOCAL_SD_URL = 'http://127.0.0.1:7860'

/** API 키가 아닌 일반 환경설정(민감정보 아님, 암호화 불필요) */
interface Settings {
  llm_provider?: LlmProviderName
  image_provider?: ImageProviderName
  local_sd_url?: string
}

function settingsFilePath(): string {
  return join(app.getPath('userData'), 'app-settings.json')
}

function readSettings(): Settings {
  const path = settingsFilePath()
  if (!existsSync(path)) return {}
  return JSON.parse(readFileSync(path, 'utf-8')) as Settings
}

function writeSettings(patch: Partial<Settings>): void {
  const settings = { ...readSettings(), ...patch }
  writeFileSync(settingsFilePath(), JSON.stringify(settings, null, 2), 'utf-8')
}

export function getLlmProvider(): LlmProviderName {
  return readSettings().llm_provider ?? 'anthropic'
}

export function setLlmProvider(provider: LlmProviderName): void {
  writeSettings({ llm_provider: provider })
}

export function getImageProvider(): ImageProviderName {
  return readSettings().image_provider ?? 'stability'
}

export function setImageProvider(provider: ImageProviderName): void {
  writeSettings({ image_provider: provider })
}

export function getLocalSdUrl(): string {
  return readSettings().local_sd_url ?? DEFAULT_LOCAL_SD_URL
}

export function setLocalSdUrl(url: string): void {
  writeSettings({ local_sd_url: url })
}
