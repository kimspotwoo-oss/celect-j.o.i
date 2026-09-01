import { getSecret } from '../secrets/secretStore'
import { StabilityImageAdapter } from './stabilityAdapter'
import type { ImageAdapter } from './types'

export function resolveImageAdapter(): ImageAdapter | null {
  const apiKey = getSecret('image_gen_api_key')
  if (!apiKey) return null
  return new StabilityImageAdapter(apiKey)
}
