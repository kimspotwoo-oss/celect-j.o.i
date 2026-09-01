/**
 * 실제 이미지 파일(assets.media_set[].file) 로딩은 카드 패키지 경로가 정해지는
 * 에디터/로더 작업 이후에 연결한다. 그 전까지 플레이어 레이아웃을 확인할 수 있도록
 * id를 시드로 한 결정적 그라디언트를 배경으로 사용한다.
 */
export function placeholderGradient(mediaId: string): string {
  let hash = 0
  for (let i = 0; i < mediaId.length; i++) {
    hash = (hash * 31 + mediaId.charCodeAt(i)) >>> 0
  }
  const hue1 = hash % 360
  const hue2 = (hue1 + 55) % 360
  return `linear-gradient(160deg, hsl(${hue1} 45% 22%), hsl(${hue2} 40% 12%))`
}
