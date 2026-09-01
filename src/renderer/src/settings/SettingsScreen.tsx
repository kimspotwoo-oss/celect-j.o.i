import { useEffect, useState } from 'react'
import type { SecretKeyName } from '@shared/ipc'
import './SettingsScreen.css'

interface KeyFieldProps {
  keyName: SecretKeyName
  label: string
  placeholder: string
}

function KeyField({ keyName, label, placeholder }: KeyFieldProps): React.JSX.Element {
  const [hasKey, setHasKey] = useState(false)
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<'idle' | 'saved'>('idle')

  useEffect(() => {
    window.api.secrets.has(keyName).then(setHasKey)
  }, [keyName])

  const handleSave = async (): Promise<void> => {
    if (!value.trim()) return
    await window.api.secrets.set(keyName, value.trim())
    setValue('')
    setHasKey(true)
    setStatus('saved')
    window.setTimeout(() => setStatus('idle'), 1500)
  }

  return (
    <div className="settings-field">
      <label>
        {label} {hasKey && <span className="settings-badge">설정됨</span>}
      </label>
      <div className="settings-row">
        <input
          type="password"
          placeholder={hasKey ? '변경하려면 새 키를 입력하세요' : placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button onClick={handleSave} disabled={!value.trim()}>
          저장
        </button>
      </div>
      {status === 'saved' && <div className="settings-saved">저장되었습니다</div>}
    </div>
  )
}

function SettingsScreen(): React.JSX.Element {
  return (
    <div className="settings-screen">
      <h2>API 키 설정 (BYOK)</h2>
      <p className="settings-desc">
        입력한 키는 이 기기의 OS 보안 저장소로 암호화되어 로컬에만 저장됩니다. 서버로 전송되지
        않습니다.
      </p>
      <KeyField keyName="llm_api_key" label="LLM API 키" placeholder="sk-..." />
      <KeyField keyName="image_gen_api_key" label="이미지 생성 API 키" placeholder="sk-..." />
    </div>
  )
}

export default SettingsScreen
