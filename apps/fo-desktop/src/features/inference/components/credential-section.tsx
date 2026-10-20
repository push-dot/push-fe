import { formSelect } from '@push/design-system'
import { useT } from '@/shared/i18n'
import { FormRow, FormSection, Input, Select } from '@/shared/components'
import { useByokModels } from '../api/hooks'
import { useInferenceSettings } from '../stores'
import type { ByokProvider } from '../types'

const CredentialSection = ({ modelLabel }: { modelLabel: string }) => {
  const t = useT()
  const credentialMode = useInferenceSettings((s) => s.credentialMode)
  const setCredentialMode = useInferenceSettings((s) => s.setCredentialMode)
  const byokKey = useInferenceSettings((s) => s.byokKey)
  const setByokKey = useInferenceSettings((s) => s.setByokKey)
  const byokModel = useInferenceSettings((s) => s.byokModel)
  const setByokModel = useInferenceSettings((s) => s.setByokModel)
  const byokProvider = useInferenceSettings((s) => s.byokProvider)
  const setByokProvider = useInferenceSettings((s) => s.setByokProvider)
  const byokModelsQuery = useByokModels(byokProvider, credentialMode === 'BYOK' ? byokKey : '')
  const byokModels = byokModelsQuery.data ?? []

  return (
    <FormSection title={t('settings.ai')}>
      <FormRow label={t('settings.model')} hint={modelLabel} />
      <FormRow label={t('settings.credentials')}>
        <Select
          className={formSelect}
          aria-label={t('settings.credentials')}
          value={credentialMode}
          onChange={(e) => setCredentialMode(e.target.value as 'MANAGED' | 'BYOK')}
        >
          <option value="MANAGED">{t('infer.managed')}</option>
          <option value="BYOK">{t('infer.byok')}</option>
        </Select>
      </FormRow>
      {credentialMode === 'BYOK' ? (
        <>
          <FormRow label={t('settings.byokProvider')}>
            <Select
              className={formSelect}
              aria-label={t('settings.byokProvider')}
              value={byokProvider}
              onChange={(e) => setByokProvider(e.target.value as ByokProvider)}
            >
              <option value="OPENAI">OpenAI</option>
              <option value="OPENROUTER">OpenRouter</option>
              <option value="CLAUDE">Claude (Anthropic)</option>
              <option value="GROK">Grok (xAI)</option>
            </Select>
          </FormRow>
          <FormRow label={t('infer.apiKey')}>
            <Input
              type="password"
              value={byokKey}
              placeholder="sk-..."
              autoComplete="off"
              onChange={(e) => setByokKey(e.target.value)}
            />
          </FormRow>
          <FormRow label={t('settings.byokModel')}>
            {byokModels.length > 0 ? (
              <Select
                className={formSelect}
                aria-label={t('settings.byokModel')}
                value={byokModel}
                onChange={(e) => setByokModel(e.target.value)}
              >
                {!byokModels.some((m) => m.model === byokModel) ? (
                  <option value={byokModel}>{byokModel}</option>
                ) : null}
                {byokModels.map((m) => (
                  <option key={m.model} value={m.model}>
                    {m.label}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                type="text"
                value={byokModel}
                placeholder="gpt-4o-mini"
                autoComplete="off"
                onChange={(e) => setByokModel(e.target.value)}
              />
            )}
          </FormRow>
          <FormRow label="" hint={t('infer.byokHint')} />
        </>
      ) : null}
    </FormSection>
  )
}

export default CredentialSection
