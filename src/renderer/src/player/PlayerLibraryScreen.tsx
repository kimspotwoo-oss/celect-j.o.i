import { useEffect, useState } from 'react'
import type { StoryCard } from '@shared/types/card'
import PlayerScreen from './PlayerScreen'
import { sampleCard } from './sampleCard'
import './PlayerLibraryScreen.css'

const SAMPLE_ID = '__sample__'

function PlayerLibraryScreen(): React.JSX.Element {
  const [cardIds, setCardIds] = useState<{ card_id: string; name: string }[]>([])
  const [selectedId, setSelectedId] = useState(SAMPLE_ID)
  const [loadedCard, setLoadedCard] = useState<StoryCard | null>(null)

  useEffect(() => {
    window.api.cards.list().then(setCardIds)
  }, [])

  useEffect(() => {
    if (selectedId === SAMPLE_ID) return
    let cancelled = false
    window.api.cards.load(selectedId).then((loaded) => {
      if (!cancelled && loaded) setLoadedCard(loaded)
    })
    return () => {
      cancelled = true
    }
  }, [selectedId])

  const card = selectedId === SAMPLE_ID ? sampleCard : (loadedCard ?? sampleCard)

  return (
    <div className="player-library-screen">
      <div className="player-library-picker">
        <label>
          카드 선택
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value={SAMPLE_ID}>샘플 카드</option>
            {cardIds.map((c) => (
              <option key={c.card_id} value={c.card_id}>
                {c.name || c.card_id}
              </option>
            ))}
          </select>
        </label>
      </div>
      <PlayerScreen key={card.card_id} card={card} />
    </div>
  )
}

export default PlayerLibraryScreen
