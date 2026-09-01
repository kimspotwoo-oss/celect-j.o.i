import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC_CHANNELS, type SecretKeyName } from '@shared/ipc'
import type { SaveData } from '@shared/types/save'
import type { CharacterReplyRequest, LlmProviderName } from '@shared/types/llm'

// Custom APIs for renderer
const api = {
  saves: {
    load: (cardId: string): Promise<SaveData | null> =>
      ipcRenderer.invoke(IPC_CHANNELS.SAVE_LOAD, cardId),
    write: (saveData: SaveData): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.SAVE_WRITE, saveData)
  },
  secrets: {
    has: (keyName: SecretKeyName): Promise<boolean> =>
      ipcRenderer.invoke(IPC_CHANNELS.SECRET_HAS, keyName),
    set: (keyName: SecretKeyName, value: string): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.SECRET_SET, keyName, value)
  },
  settings: {
    getLlmProvider: (): Promise<LlmProviderName> =>
      ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET_LLM_PROVIDER),
    setLlmProvider: (provider: LlmProviderName): Promise<void> =>
      ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET_LLM_PROVIDER, provider)
  },
  llm: {
    generateReply: (req: CharacterReplyRequest): Promise<string> =>
      ipcRenderer.invoke(IPC_CHANNELS.LLM_GENERATE_REPLY, req)
  },
  image: {
    /** 반환값은 <img>/배경에 바로 쓸 수 있는 data URL 문자열이다 */
    generate: (prompt: string): Promise<string> =>
      ipcRenderer.invoke(IPC_CHANNELS.IMAGE_GENERATE, prompt)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

export type Api = typeof api
