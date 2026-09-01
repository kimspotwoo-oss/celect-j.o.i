import { useEffect, useState } from 'react'
import type { CardSummary, StoryCard, StoryNode } from '@shared/types/card'
import type { GenerateStoryGraphResult } from '@shared/types/llm'
import RequiredNodesEditor from './RequiredNodesEditor'
import EndingNodesEditor from './EndingNodesEditor'
import StoryGraphPanel from './StoryGraphPanel'
import './CardEditorScreen.css'

function CardEditorScreen(): React.JSX.Element {
  const [cards, setCards] = useState<CardSummary[]>([])
  const [card, setCard] = useState<StoryCard | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle')
  const [newCardName, setNewCardName] = useState('')

  const refreshCards = (): void => {
    window.api.cards.list().then(setCards)
  }

  useEffect(() => {
    refreshCards()
  }, [])

  const openCard = (cardId: string): void => {
    window.api.cards.load(cardId).then((loaded) => {
      if (loaded) setCard(loaded)
    })
  }

  const createCard = async (): Promise<void> => {
    const name = newCardName.trim()
    if (!name) return
    const cardId = `card_${Date.now()}`
    const blank = await window.api.cards.createBlank(cardId, name)
    await window.api.cards.save(blank)
    setNewCardName('')
    refreshCards()
    setCard(blank)
  }

  const deleteCard = async (cardId: string): Promise<void> => {
    await window.api.cards.delete(cardId)
    if (card?.card_id === cardId) setCard(null)
    refreshCards()
  }

  const handleSave = async (): Promise<void> => {
    if (!card) return
    await window.api.cards.save(card)
    refreshCards()
    setSaveStatus('saved')
    window.setTimeout(() => setSaveStatus('idle'), 1500)
  }

  const applyGeneratedGraph = (result: GenerateStoryGraphResult): void => {
    setCard((c) =>
      c ? { ...c, required_nodes: result.required_nodes, story_nodes: result.story_nodes } : c
    )
  }

  return (
    <div className="card-editor-screen">
      <aside className="card-editor-sidebar">
        <h3>카드 목록</h3>
        <div className="card-editor-new">
          <input
            placeholder="새 카드 이름"
            value={newCardName}
            onChange={(e) => setNewCardName(e.target.value)}
          />
          <button type="button" onClick={createCard} disabled={!newCardName.trim()}>
            + 새 카드
          </button>
        </div>
        <ul className="card-editor-list">
          {cards.map((summary) => (
            <li key={summary.card_id} className={card?.card_id === summary.card_id ? 'active' : ''}>
              <button type="button" onClick={() => openCard(summary.card_id)}>
                {summary.name || summary.card_id}
              </button>
              <button
                type="button"
                className="card-editor-delete"
                onClick={() => deleteCard(summary.card_id)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="card-editor-main">
        {!card ? (
          <p className="editor-hint">왼쪽에서 카드를 선택하거나 새로 만드세요.</p>
        ) : (
          <>
            <div className="card-editor-toolbar">
              <h2>{card.character.name || card.card_id}</h2>
              <button type="button" onClick={handleSave}>
                저장
              </button>
              {saveStatus === 'saved' && <span className="editor-saved">저장됨</span>}
            </div>

            <div className="editor-section">
              <h3>기본 정보</h3>
              <label>
                캐릭터 이름
                <input
                  value={card.character.name}
                  onChange={(e) =>
                    setCard({ ...card, character: { ...card.character, name: e.target.value } })
                  }
                />
              </label>
              <label>
                성격
                <input
                  value={card.character.personality}
                  onChange={(e) =>
                    setCard({
                      ...card,
                      character: { ...card.character, personality: e.target.value }
                    })
                  }
                />
              </label>
              <label>
                말투
                <input
                  value={card.character.speech_style}
                  onChange={(e) =>
                    setCard({
                      ...card,
                      character: { ...card.character, speech_style: e.target.value }
                    })
                  }
                />
              </label>
              <label>
                세계관/배경 (world_setting)
                <textarea
                  value={card.outline.world_setting}
                  onChange={(e) =>
                    setCard({
                      ...card,
                      outline: { ...card.outline, world_setting: e.target.value }
                    })
                  }
                />
              </label>
              <label>
                목표 깊이 (target_depth)
                <input
                  type="number"
                  value={card.outline.target_depth}
                  onChange={(e) =>
                    setCard({
                      ...card,
                      outline: { ...card.outline, target_depth: Number(e.target.value) }
                    })
                  }
                />
              </label>
            </div>

            <RequiredNodesEditor
              nodes={card.required_nodes}
              character={card.character}
              worldSetting={card.outline.world_setting}
              onChange={(required_nodes) => setCard({ ...card, required_nodes })}
            />

            <EndingNodesEditor
              nodes={card.ending_nodes}
              character={card.character}
              worldSetting={card.outline.world_setting}
              onChange={(ending_nodes) => setCard({ ...card, ending_nodes })}
            />

            <StoryGraphPanel
              character={card.character}
              outline={card.outline}
              requiredNodes={card.required_nodes}
              endingNodes={card.ending_nodes}
              storyNodes={card.story_nodes}
              onGenerated={applyGeneratedGraph}
              onStoryNodesChange={(story_nodes: StoryNode[]) => setCard({ ...card, story_nodes })}
            />
          </>
        )}
      </main>
    </div>
  )
}

export default CardEditorScreen
