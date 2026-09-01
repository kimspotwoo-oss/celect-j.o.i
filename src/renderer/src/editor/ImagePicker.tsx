import type { MediaAsset } from '@shared/types/card'
import AssetThumbnail from './AssetThumbnail'

interface ImagePickerProps {
  cardId: string
  mediaSet: MediaAsset[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

function ImagePicker({
  cardId,
  mediaSet,
  selectedIds,
  onChange
}: ImagePickerProps): React.JSX.Element {
  const toggle = (id: string): void => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id])
  }

  if (mediaSet.length === 0) {
    return <p className="editor-hint">먼저 위쪽 「이미지 자산」에서 이미지를 추가하세요.</p>
  }

  return (
    <div className="image-picker">
      {mediaSet.map((media) => (
        <button
          type="button"
          key={media.id}
          className={`image-picker-item ${selectedIds.includes(media.id) ? 'selected' : ''}`}
          onClick={() => toggle(media.id)}
          title={media.id}
        >
          <AssetThumbnail cardId={cardId} filename={media.file} alt={media.id} />
        </button>
      ))}
    </div>
  )
}

export default ImagePicker
