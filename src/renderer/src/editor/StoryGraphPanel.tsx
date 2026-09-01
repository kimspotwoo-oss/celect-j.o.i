import { useState } from 'react'
import type { Character, EndingNode, Outline, RequiredNode, StoryNode } from '@shared/types/card'
import type { GenerateStoryGraphResult } from '@shared/types/llm'

interface StoryGraphPanelProps {
  character: Character
  outline: Outline
  requiredNodes: RequiredNode[]
  endingNodes: EndingNode[]
  storyNodes: StoryNode[]
  onGenerated: (result: GenerateStoryGraphResult) => void
  onStoryNodesChange: (nodes: StoryNode[]) => void
}

function StoryGraphPanel({
  character,
  outline,
  requiredNodes,
  endingNodes,
  storyNodes,
  onGenerated,
  onStoryNodesChange
}: StoryGraphPanelProps): React.JSX.Element {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])

  const handleGenerate = async (): Promise<void> => {
    setGenerating(true)
    setError(null)
    setWarnings([])
    try {
      const result = await window.api.llm.generateStoryGraph({
        character,
        world_setting: outline.world_setting,
        target_depth: outline.target_depth,
        required_nodes: requiredNodes,
        ending_nodes: endingNodes
      })
      onGenerated(result)
      setWarnings(result.warnings)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setGenerating(false)
    }
  }

  const updateNode = (index: number, patch: Partial<StoryNode>): void => {
    onStoryNodesChange(
      storyNodes.map((n, i) => (i === index ? ({ ...n, ...patch } as StoryNode) : n))
    )
  }

  const removeNode = (index: number): void => {
    onStoryNodesChange(storyNodes.filter((_, i) => i !== index))
  }

  return (
    <div className="editor-section">
      <div className="editor-section-header">
        <h3>스토리 노드 (AI 생성)</h3>
        <button type="button" onClick={handleGenerate} disabled={generating}>
          {generating ? '생성 중...' : 'AI로 노드 생성'}
        </button>
      </div>
      <p className="editor-hint">
        필수 노드와 엔딩 사이를 AI가 연결합니다. 생성 후 아래에서 내용을 검토/수정하세요.
      </p>

      {error && <div className="editor-error">{error}</div>}
      {warnings.length > 0 && (
        <ul className="editor-warnings">
          {warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}

      {storyNodes.length === 0 && (
        <p className="editor-hint">아직 생성된 스토리 노드가 없습니다.</p>
      )}

      {storyNodes.map((node, index) => (
        <div className="editor-node-card" key={node.node_id}>
          <div className="editor-node-row">
            <span className="editor-node-badge">{node.type === 'branch' ? '분기' : '선형'}</span>
            <input
              className="editor-node-id"
              value={node.node_id}
              onChange={(e) => updateNode(index, { node_id: e.target.value })}
            />
            <button type="button" className="editor-remove-btn" onClick={() => removeNode(index)}>
              삭제
            </button>
          </div>
          <textarea
            value={node.text}
            onChange={(e) => updateNode(index, { text: e.target.value })}
          />
          {node.type === 'linear' ? (
            <label className="editor-inline-label">
              다음 노드
              <input
                value={node.next_node}
                onChange={(e) => updateNode(index, { next_node: e.target.value })}
              />
            </label>
          ) : (
            <div className="editor-choices">
              {node.choices.map((choice, choiceIndex) => (
                <div className="editor-choice-row" key={choiceIndex}>
                  <input
                    value={choice.label}
                    placeholder="선택지 문구"
                    onChange={(e) => {
                      const choices = node.choices.map((c, i) =>
                        i === choiceIndex ? { ...c, label: e.target.value } : c
                      )
                      updateNode(index, { choices })
                    }}
                  />
                  <input
                    value={choice.next_node}
                    placeholder="다음 노드 id"
                    onChange={(e) => {
                      const choices = node.choices.map((c, i) =>
                        i === choiceIndex ? { ...c, next_node: e.target.value } : c
                      )
                      updateNode(index, { choices })
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default StoryGraphPanel
