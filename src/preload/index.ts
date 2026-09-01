import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC_CHANNELS, type SecretKeyName } from '@shared/ipc'
import type { SaveData } from '@shared/types/save'

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
