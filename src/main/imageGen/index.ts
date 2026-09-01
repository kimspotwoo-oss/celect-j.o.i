import { getSecret } from '../secrets/secretStore'
import { getImageProvider, getLocalSdUrl } from '../settings/settingsStore'
import { StabilityImageAdapter } from './stabilityAdapter'
import { LocalSdAdapter } from './localSdAdapter'
import type { ImageAdapter } from './types'

export function resolveImageAdapter(): ImageAdapter | null {
  if (getImageProvider() === 'local_sd') {
    return new LocalSdAdapter(getLocalSdUrl())
  }
  const apiKey = getSecret('image_gen_api_key')
  if (!apiKey) return null
  return new StabilityImageAdapter(apiKey)
}
