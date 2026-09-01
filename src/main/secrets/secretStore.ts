import { app, safeStorage } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { SecretKeyName } from '@shared/ipc'

function secretsFilePath(): string {
  return join(app.getPath('userData'), 'secrets.json')
}

/** { [keyName]: base64(암호화된 값) } 형태로 저장. safeStorage가 OS 키체인(macOS Keychain,
 * Windows DPAPI, libsecret 등)으로 암호화한다. */
type SecretFile = Record<string, string>

function readSecretFile(): SecretFile {
  const path = secretsFilePath()
  if (!existsSync(path)) return {}
  return JSON.parse(readFileSync(path, 'utf-8')) as SecretFile
}

function writeSecretFile(data: SecretFile): void {
  writeFileSync(secretsFilePath(), JSON.stringify(data, null, 2), 'utf-8')
}

export function getSecret(keyName: SecretKeyName): string | null {
  const stored = readSecretFile()[keyName]
  if (!stored) return null
  if (!safeStorage.isEncryptionAvailable()) return stored
  return safeStorage.decryptString(Buffer.from(stored, 'base64'))
}

export function setSecret(keyName: SecretKeyName, value: string): void {
  const data = readSecretFile()
  data[keyName] = safeStorage.isEncryptionAvailable()
    ? safeStorage.encryptString(value).toString('base64')
    : value
  writeSecretFile(data)
}

export function hasSecret(keyName: SecretKeyName): boolean {
  return Boolean(readSecretFile()[keyName])
}
