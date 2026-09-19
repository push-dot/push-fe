import { useEffect } from 'react'
import { useT } from '@/shared/i18n'
import type { MsgKey } from '@/shared/i18n'
import { Input, Select } from '@/shared/ui'
import { useInferenceSettings } from '../model/inference-settings'

const EFFORT_OPTIONS: { value: string; labelKey: MsgKey | null }[] = [
  { value: 'LOW', labelKey: 'infer.low' },
  { value: 'MEDIUM', labelKey: 'infer.medium' },
  { value: 'HIGH', labelKey: 'infer.high' },
  { value: 'ULTRA', labelKey: null },
]

const InferenceSettings = () => {
  const t = useT()
  const effort = useInferenceSettings((s) => s.effort)
  const ultraResume = useInferenceSettings((s) => s.ultraResume)
  const webSearch = useInferenceSettings((s) => s.webSearch)
  const setWebSearch = useInferenceSettings((s) => s.setWebSearch)
  const plan = useInferenceSettings((s) => s.plan)
  const models = useInferenceSettings((s) => s.models)
  const modelsStatus = useInferenceSettings((s) => s.modelsStatus)
  const setEffort = useInferenceSettings((s) => s.setEffort)
  const setUltraResume = useInferenceSettings((s) => s.setUltraResume)
  const setModel = useInferenceSettings((s) => s.setModel)
  const selectedModel = useInferenceSettings((s) => s.selectedModel)
  const credentialMode = useInferenceSettings((s) => s.credentialMode)
  const setCredentialMode = useInferenceSettings((s) => s.setCredentialMode)
  const byokKey = useInferenceSettings((s) => s.byokKey)
  const setByokKey = useInferenceSettings((s) => s.setByokKey)
  const byokModel = useInferenceSettings((s) => s.byokModel)
  const setByokModel = useInferenceSettings((s) => s.setByokModel)
  const loadModels = useInferenceSettings((s) => s.loadModels)

  useEffect(() => {
    if (modelsStatus === 'idle') void loadModels()
  }, [modelsStatus, loadModels])

  const availableModels = models.filter((m) => m.available)
  const activeModel = availableModels.find((m) => m.model === selectedModel) ?? availableModels[0]

  return (
    <div className="inference-popover" role="dialog" aria-label={t('composer.inference')}>
      <div className="form-section">
        <div className="form-row">
          <span className="form-row-label">{t('infer.credential')}</span>
          <Select
            className="form-select"
            value={credentialMode}
            onChange={(e) => setCredentialMode(e.target.value as 'MANAGED' | 'BYOK')}
          >
            <option value="MANAGED">{t('infer.managed')}</option>
            <option value="BYOK">{t('infer.byok')}</option>
          </Select>
        </div>
        {credentialMode === 'BYOK' ? (
          <>
            <div className="form-row">
              <span className="form-row-label">{t('infer.apiKey')}</span>
              <Input
                type="password"
                value={byokKey}
                placeholder="sk-..."
                onChange={(e) => setByokKey(e.target.value)}
              />
            </div>
            <div className="form-row">
              <span className="form-row-hint">{t('infer.byokHint')}</span>
            </div>
            <div className="form-row">
              <span className="form-row-label">{t('infer.model')}</span>
              <Input
                value={byokModel}
                placeholder="gpt-4o-mini"
                onChange={(e) => setByokModel(e.target.value)}
              />
            </div>
          </>
        ) : (
          <div className="form-row">
            <span className="form-row-label">{t('infer.model')}</span>
            {modelsStatus === 'success' && availableModels.length === 0 ? (
              <span className="form-row-hint">{t('infer.noModels')}</span>
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
        )}
        <div className="form-row">
          <span className="form-row-label">{t('infer.effort')}</span>
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
              <option
                key={o.value}
                value={o.value}
                disabled={o.value === 'ULTRA' && plan !== 'ULTRA'}
              >
                {o.labelKey ? t(o.labelKey) : 'UltraResume'}
              </option>
            ))}
          </Select>
        </div>
        <div className="form-row">
          <span className="form-row-label">{t('infer.webSearch')}</span>
          <button
            type="button"
            role="switch"
            aria-checked={webSearch}
            aria-label={t('infer.webSearch')}
            className={['switch', webSearch ? 'is-on' : ''].filter(Boolean).join(' ')}
            onClick={() => setWebSearch(!webSearch)}
          >
            <span className="switch-thumb" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default InferenceSettings
