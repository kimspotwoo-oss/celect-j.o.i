import { useState } from 'react'
import type { MediaAsset } from '@shared/types/card'
import AssetThumbnail from './AssetThumbnail'

interface MediaSetEditorProps {
  cardId: string
  mediaSet: MediaAsset[]
  onChange: (mediaSet: MediaAsset[]) => void
}

function newMediaId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

function MediaSetEditor({ cardId, mediaSet, onChange }: MediaSetEditorProps): React.JSX.Element {
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (): Promise<void> => {
    setError(null)
    const path = await window.api.assets.pickFile()
    if (!path) return
    setUploading(true)
    try {
      const filename = await window.api.assets.upload(cardId, path)
      onChange([
        ...mediaSet,
        { id: newMediaId(), type: 'image', source: 'uploaded', file: filename }
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setUploading(false)
    }
  }

  const handleGenerate = async (): Promise<void> => {
    if (!prompt.trim()) return
    setGenerating(true)
    setError(null)
    try {
      const filename = await window.api.assets.generate(cardId, prompt.trim())
      onChange([
        ...mediaSet,
        {
          id: newMediaId(),
          type: 'image',
          source: 'generated',
          generation: { provider: 'stability', prompt: prompt.trim() },
          file: filename
        }
      ])
      setPrompt('')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setGenerating(false)
    }
  }

  const removeAsset = (id: string): void => {
    onChange(mediaSet.filter((m) => m.id !== id))
  }

  return (
    <div className="editor-section">
      <div className="editor-section-header">
        <h3>이미지 자산</h3>
        <button type="button" onClick={handleUpload} disabled={uploading}>
          {uploading ? '업로드 중...' : '이미지 업로드'}
        </button>
      </div>
      <p className="editor-hint">
        여기서 만든 이미지를 아래 노드 편집에서 각 노드에 연결할 수 있습니다.
      </p>

      <div className="media-generate-row">
        <input
          placeholder="AI에게 생성시킬 이미지 설명 (프롬프트)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button type="button" onClick={handleGenerate} disabled={generating || !prompt.trim()}>
          {generating ? '생성 중...' : 'AI로 생성'}
        </button>
      </div>
      {error && <div className="editor-error">{error}</div>}

      <div className="media-grid">
        {mediaSet.map((media) => (
          <div className="media-grid-item" key={media.id}>
            <AssetThumbnail cardId={cardId} filename={media.file} alt={media.id} />
            <div className="media-grid-caption">
              <span>{media.source === 'generated' ? 'AI 생성' : '업로드'}</span>
              <button type="button" onClick={() => removeAsset(media.id)}>
                ✕
              </button>
            </div>
          </div>
        ))}
        {mediaSet.length === 0 && <p className="editor-hint">아직 등록된 이미지가 없습니다.</p>}
      </div>
    </div>
  )
}

export default MediaSetEditor
