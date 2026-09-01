import { app, dialog, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { IPC_CHANNELS, type SecretKeyName } from '@shared/ipc'
import type { SaveData } from '@shared/types/save'
import type { StoryCard } from '@shared/types/card'
import type {
  CharacterReplyRequest,
  DraftSuggestRequest,
  GenerateStoryGraphRequest,
  LlmProviderName
} from '@shared/types/llm'
import { loadSave, writeSave } from './saves/saveStore'
import { hasSecret, setSecret } from './secrets/secretStore'
import { getLlmProvider, setLlmProvider } from './settings/settingsStore'
import { resolveLlmAdapter } from './llm'
import { generateCharacterReply, suggestDraft, generateStoryGraph } from './llm/tasks'
import { resolveImageAdapter } from './imageGen'
import { listCards, loadCard, saveCard, deleteCard, createBlankCard } from './cards/cardStore'
import { saveUploadedAsset, saveGeneratedAsset, readAssetAsDataUrl } from './cards/assetStore'

// 리눅스에서 gnome-keyring/kwallet 같은 키링 서비스가 없으면 safeStorage가 멈추거나
// 실패할 수 있어, OS 키체인 대신 앱 고유 키로 암호화하는 기본 저장 방식을 강제한다.
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('password-store', 'basic')
}

function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SAVE_LOAD, (_event, cardId: string) => loadSave(cardId))
  ipcMain.handle(IPC_CHANNELS.SAVE_WRITE, (_event, saveData: SaveData) => writeSave(saveData))
  ipcMain.handle(IPC_CHANNELS.SECRET_HAS, (_event, keyName: SecretKeyName) => hasSecret(keyName))
  ipcMain.handle(IPC_CHANNELS.SECRET_SET, (_event, keyName: SecretKeyName, value: string) =>
    setSecret(keyName, value)
  )
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET_LLM_PROVIDER, () => getLlmProvider())
  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET_LLM_PROVIDER, (_event, provider: LlmProviderName) =>
    setLlmProvider(provider)
  )
  const requireLlmAdapter = (): NonNullable<ReturnType<typeof resolveLlmAdapter>> => {
    const adapter = resolveLlmAdapter()
    if (!adapter) throw new Error('LLM API 키가 설정되지 않았습니다. 설정 화면에서 입력해주세요.')
    return adapter
  }

  ipcMain.handle(IPC_CHANNELS.LLM_GENERATE_REPLY, (_event, req: CharacterReplyRequest) =>
    generateCharacterReply(requireLlmAdapter(), req)
  )
  ipcMain.handle(IPC_CHANNELS.LLM_SUGGEST_DRAFT, (_event, req: DraftSuggestRequest) =>
    suggestDraft(requireLlmAdapter(), req)
  )
  ipcMain.handle(IPC_CHANNELS.LLM_GENERATE_STORY_GRAPH, (_event, req: GenerateStoryGraphRequest) =>
    generateStoryGraph(requireLlmAdapter(), req)
  )
  ipcMain.handle(IPC_CHANNELS.IMAGE_GENERATE, async (_event, prompt: string) => {
    const adapter = resolveImageAdapter()
    if (!adapter)
      throw new Error('이미지 생성 API 키가 설정되지 않았습니다. 설정 화면에서 입력해주세요.')
    const bytes = await adapter.generateImage(prompt)
    return `data:image/png;base64,${bytes.toString('base64')}`
  })

  ipcMain.handle(IPC_CHANNELS.CARD_LIST, () => listCards())
  ipcMain.handle(IPC_CHANNELS.CARD_LOAD, (_event, cardId: string) => loadCard(cardId))
  ipcMain.handle(IPC_CHANNELS.CARD_SAVE, (_event, card: StoryCard) => saveCard(card))
  ipcMain.handle(IPC_CHANNELS.CARD_DELETE, (_event, cardId: string) => deleteCard(cardId))
  ipcMain.handle(IPC_CHANNELS.CARD_CREATE_BLANK, (_event, cardId: string, name: string) =>
    createBlankCard(cardId, name)
  )

  ipcMain.handle(IPC_CHANNELS.ASSET_PICK_FILE, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: '이미지', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] }]
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })
  ipcMain.handle(IPC_CHANNELS.ASSET_UPLOAD, (_event, cardId: string, sourcePath: string) =>
    saveUploadedAsset(cardId, sourcePath)
  )
  ipcMain.handle(IPC_CHANNELS.ASSET_GENERATE, async (_event, cardId: string, prompt: string) => {
    const adapter = resolveImageAdapter()
    if (!adapter)
      throw new Error('이미지 생성 API 키가 설정되지 않았습니다. 설정 화면에서 입력해주세요.')
    const bytes = await adapter.generateImage(prompt)
    return saveGeneratedAsset(cardId, bytes)
  })
  ipcMain.handle(IPC_CHANNELS.ASSET_READ, (_event, cardId: string, filename: string) =>
    readAssetAsDataUrl(cardId, filename)
  )
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.celect-joi')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerIpcHandlers()

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
