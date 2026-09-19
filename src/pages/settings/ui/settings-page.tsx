import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
} from '@/shared/ui'
import { useInferenceSettings } from '@/features/chat'
import { useSettingsStore } from '../model/settings-store'
import type { Theme } from '../model/settings-store'

const SettingsPage = () => {
  const t = useT()
  const navigate = useNavigate()
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)
  const me = useSettingsStore((s) => s.me)
  const billing = useSettingsStore((s) => s.billing)
  const models = useSettingsStore((s) => s.models)
  const status = useSettingsStore((s) => s.status)
  const error = useSettingsStore((s) => s.error)
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const load = useSettingsStore((s) => s.load)
  const credentialMode = useInferenceSettings((s) => s.credentialMode)
  const setCredentialMode = useInferenceSettings((s) => s.setCredentialMode)
  const byokKey = useInferenceSettings((s) => s.byokKey)
  const setByokKey = useInferenceSettings((s) => s.setByokKey)
  const byokModel = useInferenceSettings((s) => s.byokModel)
  const setByokModel = useInferenceSettings((s) => s.setByokModel)

  useEffect(() => {
    void load()
  }, [load])

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
                  className="form-select"
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
                    <Input
                      type="text"
                      value={byokModel}
                      placeholder="gpt-4o-mini"
                      autoComplete="off"
                      onChange={(e) => setByokModel(e.target.value)}
                    />
                  </FormRow>
                  <FormRow label="" hint={t('infer.byokHint')} />
                </>
              ) : null}
            </FormSection>
            <FormSection title={t('settings.plan')}>
              <FormRow label={t('settings.currentPlan')}>
                <div className="form-row-plan">
                  <span className="form-row-hint">{plan}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(ROUTES.plan)}
                  >
                    {t('settings.upgrade')}
                  </Button>
                </div>
              </FormRow>
            </FormSection>
            <FormSection title={t('settings.appearance')}>
              <FormRow label={t('settings.language')}>
                <Select
                  className="form-select"
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
                  className="form-select"
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
