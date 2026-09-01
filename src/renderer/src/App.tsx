import { useState } from 'react'
import PlayerScreen from './player/PlayerScreen'
import { sampleCard } from './player/sampleCard'
import SettingsScreen from './settings/SettingsScreen'
import './App.css'

type View = 'player' | 'settings'

function App(): React.JSX.Element {
  const [view, setView] = useState<View>('player')

  return (
    <div className="app-shell">
      <div className="app-nav">
        <button className={view === 'player' ? 'active' : ''} onClick={() => setView('player')}>
          플레이어
        </button>
        <button className={view === 'settings' ? 'active' : ''} onClick={() => setView('settings')}>
          설정
        </button>
      </div>
      <div className="app-content">
        {view === 'player' ? <PlayerScreen card={sampleCard} /> : <SettingsScreen />}
      </div>
    </div>
  )
}

export default App
