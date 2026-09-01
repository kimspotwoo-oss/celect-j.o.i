export const IPC_CHANNELS = {
  SAVE_LOAD: 'save:load',
  SAVE_WRITE: 'save:write',
  SECRET_HAS: 'secret:has',
  SECRET_SET: 'secret:set'
} as const

/** BYOK로 사용자가 직접 입력하는 API 키의 종류 (기획서 §4) */
export type SecretKeyName = 'llm_api_key' | 'image_gen_api_key'
