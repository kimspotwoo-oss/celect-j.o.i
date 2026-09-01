import { useState } from 'react'
import PlayerLibraryScreen from './player/PlayerLibraryScreen'
import SettingsScreen from './settings/SettingsScreen'
import CardEditorScreen from './editor/CardEditorScreen'
import './App.css'

type View = 'player' | 'editor' | 'settings'

function App(): React.JSX.Element {
  const [view, setView] = useState<View>('player')

  return (
    <div className="app-shell">
      <div className="app-nav">
        <button className={view === 'player' ? 'active' : ''} onClick={() => setView('player')}>
          플레이어
        </button>
        <button className={view === 'editor' ? 'active' : ''} onClick={() => setView('editor')}>
          카드 에디터
        </button>
        <button className={view === 'settings' ? 'active' : ''} onClick={() => setView('settings')}>
          설정
        </button>
      </div>
      <div className="app-content">
        {view === 'player' && <PlayerLibraryScreen />}
        {view === 'editor' && <CardEditorScreen />}
        {view === 'settings' && <SettingsScreen />}
      </div>
    </div>
  )
}

export default App
