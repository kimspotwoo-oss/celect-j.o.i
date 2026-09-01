/** 저장 데이터 스키마 타입 정의 (project_spec2.md §7 기준) */

export interface SaveData {
  save_id: string
  card_id: string
  current_node_id: string
  history: string[]
  last_played: string
}
