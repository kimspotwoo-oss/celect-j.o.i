import { app } from 'electron'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { basename, extname, join } from 'path'

function safeId(cardId: string): string {
  return cardId.replace(/[^a-zA-Z0-9_-]/g, '_')
}

function assetsDir(cardId: string): string {
  const dir = join(app.getPath('userData'), 'cards', safeId(cardId), 'assets')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

function mimeTypeFor(filename: string): string {
  switch (extname(filename).toLowerCase()) {
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    case '.gif':
      return 'image/gif'
    default:
      return 'application/octet-stream'
  }
}

function uniqueFilename(dir: string, wantedName: string): string {
  const ext = extname(wantedName)
  const base = basename(wantedName, ext)
  let candidate = wantedName
  let i = 1
  while (existsSync(join(dir, candidate))) {
    candidate = `${base}_${i}${ext}`
    i++
  }
  return candidate
}

export function saveUploadedAsset(cardId: string, sourcePath: string): string {
  const dir = assetsDir(cardId)
  const filename = uniqueFilename(dir, basename(sourcePath))
  copyFileSync(sourcePath, join(dir, filename))
  return filename
}

export function saveGeneratedAsset(cardId: string, imageBytes: Buffer): string {
  const dir = assetsDir(cardId)
  const filename = uniqueFilename(dir, `generated_${Date.now()}.png`)
  writeFileSync(join(dir, filename), imageBytes)
  return filename
}

export function readAssetAsDataUrl(cardId: string, filename: string): string {
  const path = join(assetsDir(cardId), filename)
  const bytes = readFileSync(path)
  return `data:${mimeTypeFor(filename)};base64,${bytes.toString('base64')}`
}
