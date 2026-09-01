import type { Character, MediaAsset, RequiredNode } from '@shared/types/card'
import DraftAssistButton from './DraftAssistButton'
import ImagePicker from './ImagePicker'

interface RequiredNodesEditorProps {
  nodes: RequiredNode[]
  character: Character
  worldSetting: string
  cardId: string
  mediaSet: MediaAsset[]
  onChange: (nodes: RequiredNode[]) => void
}

function nextNodeId(nodes: RequiredNode[]): string {
  let i = nodes.length + 1
  while (nodes.some((n) => n.node_id === `req_${i}`)) i++
  return `req_${i}`
}

function RequiredNodesEditor({
  nodes,
  character,
  worldSetting,
  cardId,
  mediaSet,
  onChange
}: RequiredNodesEditorProps): React.JSX.Element {
  const updateNode = (index: number, patch: Partial<RequiredNode>): void => {
    onChange(nodes.map((n, i) => (i === index ? { ...n, ...patch } : n)))
  }

  const removeNode = (index: number): void => {
    onChange(nodes.filter((_, i) => i !== index))
  }

  const addNode = (): void => {
    const id = nextNodeId(nodes)
    onChange([
      ...nodes,
      {
        node_id: id,
        approx_stage: nodes.length > 0 ? Math.max(...nodes.map((n) => n.approx_stage)) + 1 : 1,
        text: '',
        fixed: true,
        allow_free_text: false
      }
    ])
  }

  return (
    <div className="editor-section">
      <div className="editor-section-header">
        <h3>필수 노드</h3>
        <button type="button" onClick={addNode}>
          + 필수 노드 추가
        </button>
      </div>
      <p className="editor-hint">
        제작자가 직접 쓰는, 스토리에 반드시 등장해야 하는 경유 지점입니다.
      </p>

      {nodes.map((node, index) => (
        <div className="editor-node-card" key={index}>
          <div className="editor-node-row">
            <label>
              id
              <input
                value={node.node_id}
                onChange={(e) => updateNode(index, { node_id: e.target.value })}
              />
            </label>
            <label>
              단계(approx_stage)
              <input
                type="number"
                value={node.approx_stage}
                onChange={(e) => updateNode(index, { approx_stage: Number(e.target.value) })}
              />
            </label>
            <label className="editor-checkbox">
              <input
                type="checkbox"
                checked={Boolean(node.allow_free_text)}
                onChange={(e) => updateNode(index, { allow_free_text: e.target.checked })}
              />
              자유 텍스트 입력 지점
            </label>
            <button type="button" className="editor-remove-btn" onClick={() => removeNode(index)}>
              삭제
            </button>
          </div>
          <textarea
            value={node.text}
            placeholder="이 노드에서 벌어지는 사건/대사를 작성하세요"
            onChange={(e) => updateNode(index, { text: e.target.value })}
          />
          <DraftAssistButton
            character={character}
            worldSetting={worldSetting}
            target="required_node"
            contextHint={
              index === 0 ? '오프닝 장면' : `${node.approx_stage}단계에서 반드시 등장해야 하는 사건`
            }
            onDraft={(text) => updateNode(index, { text })}
          />
          <ImagePicker
            cardId={cardId}
            mediaSet={mediaSet}
            selectedIds={node.image_ids ?? []}
            onChange={(image_ids) => updateNode(index, { image_ids })}
          />
        </div>
      ))}
    </div>
  )
}

export default RequiredNodesEditor
