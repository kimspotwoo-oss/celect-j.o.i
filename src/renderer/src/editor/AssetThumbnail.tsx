import { useEffect, useState } from 'react'

interface AssetThumbnailProps {
  cardId: string
  filename: string
  alt: string
  className?: string
}

interface LoadState {
  key: string
  url: string | null
  failed: boolean
}

function AssetThumbnail({
  cardId,
  filename,
  alt,
  className
}: AssetThumbnailProps): React.JSX.Element {
  const requestKey = `${cardId}:${filename}`
  const [state, setState] = useState<LoadState>({ key: requestKey, url: null, failed: false })

  if (state.key !== requestKey) {
    setState({ key: requestKey, url: null, failed: false })
  }

  useEffect(() => {
    let cancelled = false
    window.api.assets
      .read(cardId, filename)
      .then((dataUrl) => {
        if (!cancelled) setState((s) => (s.key === requestKey ? { ...s, url: dataUrl } : s))
      })
      .catch(() => {
        if (!cancelled) setState((s) => (s.key === requestKey ? { ...s, failed: true } : s))
      })
    return () => {
      cancelled = true
    }
  }, [cardId, filename, requestKey])

  const { url, failed } = state.key === requestKey ? state : { url: null, failed: false }

  if (failed) return <div className={`asset-thumb asset-thumb-missing ${className ?? ''}`}>?</div>
  if (!url) return <div className={`asset-thumb asset-thumb-loading ${className ?? ''}`} />
  return <img className={`asset-thumb ${className ?? ''}`} src={url} alt={alt} />
}

export default AssetThumbnail
