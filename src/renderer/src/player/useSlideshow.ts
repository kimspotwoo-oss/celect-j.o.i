import { useEffect, useState } from 'react'

/** image_ids를 일정 간격으로 순환시키는 슬라이드쇼 훅. 이미지가 1개 이하면 전환 없이 고정. */
export function useSlideshow(imageIds: string[], intervalSeconds: number): string | undefined {
  const key = imageIds.join('|')
  const [state, setState] = useState({ key, index: 0 })

  if (state.key !== key) {
    setState({ key, index: 0 })
  }

  const count = imageIds.length
  useEffect(() => {
    if (count < 2) return
    const timer = window.setInterval(
      () => setState((s) => ({ ...s, index: (s.index + 1) % count })),
      Math.max(1, intervalSeconds) * 1000
    )
    return () => window.clearInterval(timer)
  }, [key, count, intervalSeconds])

  return imageIds[state.key === key ? state.index : 0]
}
