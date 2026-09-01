import type { Character, EndingNode } from '@shared/types/card'
import DraftAssistButton from './DraftAssistButton'

interface EndingNodesEditorProps {
  nodes: EndingNode[]
  character: Character
  worldSetting: string
  onChange: (nodes: EndingNode[]) => void
}

function nextEndingId(nodes: EndingNode[]): string {
  let i = nodes.length + 1
  while (nodes.some((n) => n.ending_id === `end_${i}`)) i++
  return `end_${i}`
}

function EndingNodesEditor({
  nodes,
  character,
  worldSetting,
  onChange
}: EndingNodesEditorProps): React.JSX.Element {
  const updateNode = (index: number, patch: Partial<EndingNode>): void => {
    onChange(nodes.map((n, i) => (i === index ? { ...n, ...patch } : n)))
  }

  const removeNode = (index: number): void => {
    onChange(nodes.filter((_, i) => i !== index))
  }

  const addNode = (): void => {
    onChange([
      ...nodes,
      { ending_id: nextEndingId(nodes), text: '', requirements: '', path_count: 1 }
    ])
  }

  return (
    <div className="editor-section">
      <div className="editor-section-header">
        <h3>엔딩</h3>
        <button type="button" onClick={addNode}>
          + 엔딩 추가
        </button>
      </div>
      <p className="editor-hint">
        path_count는 해당 엔딩까지 도달하는 서로 다른 경로 수입니다 (AI 노드 생성 시 참고).
      </p>

      {nodes.map((node, index) => (
        <div className="editor-node-card" key={index}>
          <div className="editor-node-row">
            <label>
              id
              <input
                value={node.ending_id}
                onChange={(e) => updateNode(index, { ending_id: e.target.value })}
              />
            </label>
            <label>
              도달 조건(requirements)
              <input
                value={node.requirements}
                placeholder="예: 호감도 높음"
                onChange={(e) => updateNode(index, { requirements: e.target.value })}
              />
            </label>
            <label>
              path_count
              <input
                type="number"
                min={1}
                value={node.path_count}
                onChange={(e) => updateNode(index, { path_count: Number(e.target.value) })}
              />
            </label>
            <button type="button" className="editor-remove-btn" onClick={() => removeNode(index)}>
              삭제
            </button>
          </div>
          <textarea
            value={node.text}
            placeholder="엔딩 내용을 작성하세요"
            onChange={(e) => updateNode(index, { text: e.target.value })}
          />
          <DraftAssistButton
            character={character}
            worldSetting={worldSetting}
            target="ending_node"
            contextHint={`엔딩 (도달 조건: ${node.requirements || '미정'})`}
            onDraft={(text) => updateNode(index, { text })}
          />
        </div>
      ))}
    </div>
  )
}

export default EndingNodesEditor
