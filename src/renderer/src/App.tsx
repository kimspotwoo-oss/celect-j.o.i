import PlayerScreen from './player/PlayerScreen'
import { sampleCard } from './player/sampleCard'

function App(): React.JSX.Element {
  return <PlayerScreen card={sampleCard} />
}

export default App
