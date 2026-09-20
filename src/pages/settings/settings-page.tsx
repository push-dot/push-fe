import { useNavigate } from 'react-router-dom'
import { formRowHint, formSelect } from '@push/design-system'
import { useAiModels, useByokModels } from '@/features/inference'

import { ROUTES } from '@/shared/constants'
import { useLocaleStore, useT } from '@/shared/i18n'
import type { Locale } from '@/shared/i18n'
import {
  Button,
  CanvasHeader,
  ErrorState,
  Form,
  FormRow,
  FormSection,
  Input,
  Select,
  SkeletonRows,
} from '@/shared/components'
import { useInferenceSettings } from '@/features/inference'
import type { ByokProvider } from '@/features/inference'
import { useSettingsStore } from '@/features/settings'
import { useMe } from '@/features/auth'
import { useBilling } from '@/features/billing'
import type { Theme } from '@/features/settings'

const SettingsPage = () => {
  const t = useT()
  const navigate = useNavigate()
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)
  const meQuery = useMe()
  const billingQuery = useBilling()
  const modelsQuery = useAiModels()
  const me = meQuery.data ?? null
  const billing = billingQuery.data ?? null
  const models = modelsQuery.data ?? []
  const status: 'loading' | 'error' | 'success' =
    meQuery.isPending || billingQuery.isPending || modelsQuery.isPending
      ? 'loading'
      : meQuery.isError || billingQuery.isError || modelsQuery.isError
        ? 'error'
        : 'success'
  const error =
    meQuery.error?.message ?? billingQuery.error?.message ?? modelsQuery.error?.message ?? null
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const load = async () => {
    await Promise.all([meQuery.refetch(), billingQuery.refetch(), modelsQuery.refetch()])
  }

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

  const modelLabel = models.find((m) => m.available)?.label ?? '—'
  const plan = billing?.plan ?? 'FREE'

  return (
    <>
      <CanvasHeader title={t('nav.settings')} />
      <div className="canvas-body">
        {status === 'loading' ? <SkeletonRows count={6} height={40} /> : null}
        {status === 'error' ? (
          <ErrorState message={error ?? undefined} onRetry={() => void load()} />
        ) : null}
        {status === 'success' ? (
          <Form>
            <FormSection title={t('settings.account')}>
              <FormRow label={t('settings.name')} hint={me?.displayName ?? '—'} />
              <FormRow label={t('settings.locale')} hint={me?.locale ?? '—'} />
            </FormSection>
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
            <FormSection title={t('settings.plan')}>
              <FormRow label={t('settings.currentPlan')}>
                <div className="form-row-plan">
                  <span className={formRowHint}>{plan}</span>
                  <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.plan)}>
                    {t('settings.upgrade')}
                  </Button>
                </div>
              </FormRow>
            </FormSection>
            <FormSection title={t('settings.appearance')}>
              <FormRow label={t('settings.language')}>
                <Select
                  className={formSelect}
                  aria-label={t('settings.language')}
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as Locale)}
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                </Select>
              </FormRow>
              <FormRow label={t('settings.theme')}>
                <Select
                  className={formSelect}
                  aria-label={t('settings.theme')}
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as Theme)}
                >
                  <option value="light">{t('settings.themeLight')}</option>
                  <option value="dark">{t('settings.themeDark')}</option>
                </Select>
              </FormRow>
            </FormSection>
          </Form>
        ) : null}
      </div>
    </>
  )
}

export default SettingsPage
