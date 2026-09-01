import { useMemo, useState } from 'react'
import type { StoryCard } from '@shared/types/card'
import { findPlayableNode, getOpeningNodeId } from '../engine/traversal'
import { useSlideshow } from './useSlideshow'
import { placeholderGradient } from './mediaPlaceholder'
import './PlayerScreen.css'

interface PlayerScreenProps {
  card: StoryCard
}

function PlayerScreen({ card }: PlayerScreenProps): React.JSX.Element {
  const [currentNodeId, setCurrentNodeId] = useState(() => getOpeningNodeId(card) ?? '')
  const [freeText, setFreeText] = useState('')

  const node = useMemo(() => findPlayableNode(card, currentNodeId), [card, currentNodeId])
  const activeImageId = useSlideshow(node?.image_ids ?? [], card.assets.default_transition_seconds)

  if (!node) {
    return <div className="player-screen">노드를 찾을 수 없습니다: {currentNodeId}</div>
  }

  const goTo = (nodeId: string): void => {
    setFreeText('')
    setCurrentNodeId(nodeId)
  }

  const handleFreeTextSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!freeText.trim() || !node.next_node) return
    // TODO: 여기서 사용자 LLM API 키로 캐릭터 반응을 생성해야 한다 (BYOK, 플레이 시점 로컬 처리).
    // 지금은 엔진/UI 배선 확인 단계라 반응 생성 없이 다음 노드로 진행한다.
    goTo(node.next_node)
  }

  return (
    <div className="player-screen">
      {activeImageId && (
        <div
          key={activeImageId}
          className={`player-bg anim-${card.assets.animation_style}`}
          style={{ backgroundImage: placeholderGradient(activeImageId) }}
        />
      )}

      {node.isEnding && <div className="player-ending-badge">엔딩</div>}

      <div className="player-dialogue">{node.text}</div>

      {node.choices && (
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

      {!node.choices && !node.isEnding && node.next_node && !node.allow_free_text && (
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
          disabled={!node.allow_free_text}
          onChange={(e) => setFreeText(e.target.value)}
        />
        <button type="submit" disabled={!node.allow_free_text || !freeText.trim()}>
          전송
        </button>
      </form>
    </div>
  )
}

export default PlayerScreen
