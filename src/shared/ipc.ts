export const IPC_CHANNELS = {
  SAVE_LOAD: 'save:load',
  SAVE_WRITE: 'save:write',
  SECRET_HAS: 'secret:has',
  SECRET_SET: 'secret:set',
  LLM_GENERATE_REPLY: 'llm:generateReply',
  IMAGE_GENERATE: 'image:generate',
  SETTINGS_GET_LLM_PROVIDER: 'settings:getLlmProvider',
  SETTINGS_SET_LLM_PROVIDER: 'settings:setLlmProvider'
} as const

/** BYOK로 사용자가 직접 입력하는 API 키의 종류 (기획서 §4) */
export type SecretKeyName = 'llm_api_key' | 'image_gen_api_key'
