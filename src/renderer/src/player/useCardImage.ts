import { useEffect, useState } from 'react'
import type { StoryCard } from '@shared/types/card'

/** media_set에서 mediaId에 해당하는 실제 이미지 파일을 data URL로 불러온다. 파일이 없으면
 * (예: 샘플 카드처럼 실제 파일이 없는 데모 데이터) null을 반환해 placeholder로 대체하게 한다. */
export function useCardImage(card: StoryCard, mediaId: string | undefined): string | null {
  const [cache, setCache] = useState<Record<string, string>>({})
  const media = mediaId ? card.assets.media_set.find((m) => m.id === mediaId) : undefined

  useEffect(() => {
    if (!media || cache[media.id]) return
    let cancelled = false
    window.api.assets
      .read(card.card_id, media.file)
      .then((dataUrl) => {
        if (!cancelled) setCache((c) => ({ ...c, [media.id]: dataUrl }))
      })
      .catch(() => {
        // 실제 파일이 없는 경우: 캐시에 넣지 않고 호출부가 placeholder로 대체하게 둔다
      })
    return () => {
      cancelled = true
    }
  }, [card.card_id, media, cache])

  return media ? (cache[media.id] ?? null) : null
}
