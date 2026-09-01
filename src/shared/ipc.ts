export const IPC_CHANNELS = {
  SAVE_LOAD: 'save:load',
  SAVE_WRITE: 'save:write',
  SECRET_HAS: 'secret:has',
  SECRET_SET: 'secret:set',
  LLM_GENERATE_REPLY: 'llm:generateReply',
  LLM_SUGGEST_DRAFT: 'llm:suggestDraft',
  LLM_GENERATE_STORY_GRAPH: 'llm:generateStoryGraph',
  IMAGE_GENERATE: 'image:generate',
  SETTINGS_GET_LLM_PROVIDER: 'settings:getLlmProvider',
  SETTINGS_SET_LLM_PROVIDER: 'settings:setLlmProvider',
  CARD_LIST: 'card:list',
  CARD_LOAD: 'card:load',
  CARD_SAVE: 'card:save',
  CARD_DELETE: 'card:delete',
  CARD_CREATE_BLANK: 'card:createBlank',
  ASSET_PICK_FILE: 'asset:pickFile',
  ASSET_UPLOAD: 'asset:upload',
  ASSET_GENERATE: 'asset:generate',
  ASSET_READ: 'asset:read'
} as const

/** BYOK로 사용자가 직접 입력하는 API 키의 종류 (기획서 §4) */
export type SecretKeyName = 'llm_api_key' | 'image_gen_api_key'
