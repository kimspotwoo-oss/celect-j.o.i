import { useState } from 'react'
import type { Character } from '@shared/types/card'
import type { DraftTarget } from '@shared/types/llm'

interface DraftAssistButtonProps {
  character: Character
  worldSetting: string
  target: DraftTarget
  contextHint: string
  onDraft: (text: string) => void
}

function DraftAssistButton({
  character,
  worldSetting,
  target,
  contextHint,
  onDraft
}: DraftAssistButtonProps): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const draft = await window.api.llm.suggestDraft({
        character,
        world_setting: worldSetting,
        target,
        context_hint: contextHint
      })
      onDraft(draft)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <span className="draft-assist">
      <button type="button" className="draft-assist-btn" onClick={handleClick} disabled={loading}>
        {loading ? 'AI 제안 생성 중...' : 'AI 초안 제안'}
      </button>
      {error && <span className="draft-assist-error">{error}</span>}
    </span>
  )
}

export default DraftAssistButton
