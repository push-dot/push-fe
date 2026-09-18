import { useEffect } from 'react'
import { Select } from '@/shared/ui'
import { useInferenceSettings } from '../model/inference-settings'

const EFFORT_OPTIONS = [
  { value: 'LOW', label: '낮음' },
  { value: 'MEDIUM', label: '보통' },
  { value: 'HIGH', label: '높음' },
  { value: 'ULTRA', label: 'UltraResume' },
] as const

const InferenceSettings = () => {
  const effort = useInferenceSettings((s) => s.effort)
  const ultraResume = useInferenceSettings((s) => s.ultraResume)
  const models = useInferenceSettings((s) => s.models)
  const modelsStatus = useInferenceSettings((s) => s.modelsStatus)
  const setEffort = useInferenceSettings((s) => s.setEffort)
  const setUltraResume = useInferenceSettings((s) => s.setUltraResume)
  const setModel = useInferenceSettings((s) => s.setModel)
  const selectedModel = useInferenceSettings((s) => s.selectedModel)
  const loadModels = useInferenceSettings((s) => s.loadModels)

  useEffect(() => {
    if (modelsStatus === 'idle') void loadModels()
  }, [modelsStatus, loadModels])

  const availableModels = models.filter((m) => m.available)
  const activeModel = availableModels.find((m) => m.model === selectedModel) ?? availableModels[0]

  return (
    <div className="inference-popover" role="dialog" aria-label="추론 설정">
      <div className="form-section">
        <div className="form-row">
          <span className="form-row-label">모델</span>
          {modelsStatus === 'success' && availableModels.length === 0 ? (
            <span className="form-row-hint">사용 가능한 모델 없음</span>
          ) : (
            <Select
              className="form-select"
              value={activeModel?.model ?? ''}
              onChange={(e) => setModel(e.target.value)}
            >
              {availableModels.map((m) => (
                <option key={m.model} value={m.model}>
                  {m.label}
                </option>
              ))}
            </Select>
          )}
        </div>
        <div className="form-row">
          <span className="form-row-label">추론 강도</span>
          <Select
            className="form-select"
            value={ultraResume ? 'ULTRA' : effort}
            onChange={(e) => {
              if (e.target.value === 'ULTRA') {
                setUltraResume(true)
              } else {
                setUltraResume(false)
                setEffort(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')
              }
            }}
          >
            {EFFORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  )
}

export default InferenceSettings
