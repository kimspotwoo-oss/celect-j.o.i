import { useEffect, useMemo, useState } from 'react'
import type { StoryCard } from '@shared/types/card'
import { findPlayableNode, getOpeningNodeId } from '../engine/traversal'
import { useSlideshow } from './useSlideshow'
import { useCardImage } from './useCardImage'
import { placeholderGradient } from './mediaPlaceholder'
import './PlayerScreen.css'

interface PlayerScreenProps {
  card: StoryCard
}

function PlayerScreen({ card }: PlayerScreenProps): React.JSX.Element {
  const [currentNodeId, setCurrentNodeId] = useState(() => getOpeningNodeId(card) ?? '')
  const [history, setHistory] = useState<string[]>([])
  const [freeText, setFreeText] = useState('')
  const [saveLoaded, setSaveLoaded] = useState(false)
  const [reaction, setReaction] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  // 저장된 진행 상황이 있으면 이어서 재생
  useEffect(() => {
    let cancelled = false
    window.api.saves.load(card.card_id).then((save) => {
      if (cancelled) return
      if (save) {
        setCurrentNodeId(save.current_node_id)
        setHistory(save.history)
      }
      setSaveLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [card.card_id])

  // 노드 이동 시마다 자동 저장 (기획서 §7)
  useEffect(() => {
    if (!saveLoaded || !currentNodeId) return
    window.api.saves.write({
      save_id: `${card.card_id}_save`,
      card_id: card.card_id,
      current_node_id: currentNodeId,
      history,
      last_played: new Date().toISOString()
    })
  }, [saveLoaded, card.card_id, currentNodeId, history])

  const node = useMemo(() => findPlayableNode(card, currentNodeId), [card, currentNodeId])
  const activeImageId = useSlideshow(node?.image_ids ?? [], card.assets.default_transition_seconds)
  const resolvedImageUrl = useCardImage(card, activeImageId)

  if (!saveLoaded) {
    return <div className="player-screen" />
  }

  if (!node) {
    return <div className="player-screen">노드를 찾을 수 없습니다: {currentNodeId}</div>
  }

  const goTo = (nodeId: string): void => {
    setFreeText('')
    setReaction(null)
    setGenError(null)
    setHistory((h) => [...h, nodeId])
    setCurrentNodeId(nodeId)
  }

  const handleFreeTextSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!freeText.trim() || !node.next_node || generating) return
    setGenerating(true)
    setGenError(null)
    try {
      const replyText = await window.api.llm.generateReply({
        character: card.character,
        world_setting: card.outline.world_setting,
        recent_node_text: node.text,
        user_instruction: freeText.trim()
      })
      setReaction(replyText)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : String(err))
    } finally {
      setGenerating(false)
    }
  }

  const displayedText = reaction ?? node.text

  return (
    <div className="player-screen">
      {activeImageId && (
        <div
          key={activeImageId}
          className={`player-bg anim-${card.assets.animation_style}`}
          style={{
            backgroundImage: resolvedImageUrl
              ? `url(${resolvedImageUrl})`
              : placeholderGradient(activeImageId)
          }}
        />
      )}

      {node.isEnding && <div className="player-ending-badge">엔딩</div>}

      <div className="player-dialogue">{displayedText}</div>

      {reaction && node.next_node && (
        <button className="player-advance-btn" onClick={() => goTo(node.next_node!)}>
          계속 ▸
        </button>
      )}

      {!reaction && node.choices && (
        <div className="player-choices">
          {node.choices.map((choice) => (
            <button
              key={choice.next_node}
              className="player-choice-btn"
              onClick={() => goTo(choice.next_node)}
            >
              {choice.label}
            </button>
          ))}
        </div>
      )}

      {!reaction && !node.choices && !node.isEnding && node.next_node && !node.allow_free_text && (
        <button className="player-advance-btn" onClick={() => goTo(node.next_node!)}>
          계속 ▸
        </button>
      )}

      <form className="player-input-bar" onSubmit={handleFreeTextSubmit}>
        <input
          type="text"
          placeholder={
            node.allow_free_text
              ? '캐릭터에게 지시를 내려보세요...'
              : '이 장면에서는 입력할 수 없습니다'
          }
          value={freeText}
          disabled={!node.allow_free_text || Boolean(reaction) || generating}
          onChange={(e) => setFreeText(e.target.value)}
        />
        <button
          type="submit"
          disabled={!node.allow_free_text || !freeText.trim() || Boolean(reaction) || generating}
        >
          {generating ? '생성 중...' : '전송'}
        </button>
      </form>

      {genError && <div className="player-gen-error">{genError}</div>}
    </div>
  )
}

export default PlayerScreen
