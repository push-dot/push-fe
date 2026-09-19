import { useEffect, useState } from 'react'
import { openUrl } from '@tauri-apps/plugin-opener'
import { createBillingPortal, createCheckout } from '@/shared/api'
import { useLocaleStore, useT } from '@/shared/i18n'
import type { Locale } from '@/shared/i18n'
import {
  Button,
  CanvasHeader,
  ErrorState,
  Form,
  FormRow,
  FormSection,
  Select,
  SkeletonRows,
  showToast,
} from '@/shared/ui'
import { persistTheme, useSettingsStore } from '../model/settings-store'

const isTauri = () => '__TAURI_INTERNALS__' in window

const SettingsPage = () => {
  const t = useT()
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
  const [billingPending, setBillingPending] = useState(false)

  useEffect(() => {
    void load()
  }, [load])

  const save = () => {
    persistTheme(theme)
    showToast(t('common.saved'), 'check')
  }

  const openBillingUrl = async (fn: () => Promise<string>) => {
    setBillingPending(true)
    try {
      const url = await fn()
      if (isTauri()) {
        await openUrl(url)
      } else {
        window.location.assign(url)
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('common.loadFailed'), 'circle-alert')
    } finally {
      setBillingPending(false)
    }
  }

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
            </FormSection>
            <FormSection title={t('settings.plan')}>
              <FormRow label={t('settings.currentPlan')} hint={plan} />
              {plan !== 'ULTRA' ? (
                <FormRow label="Pro">
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={billingPending}
                    onClick={() => void openBillingUrl(() => createCheckout('PRO'))}
                  >
                    {t('settings.upgrade')}
                  </Button>
                </FormRow>
              ) : null}
              {plan === 'FREE' ? (
                <FormRow label="Ultra">
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={billingPending}
                    onClick={() => void openBillingUrl(() => createCheckout('ULTRA'))}
                  >
                    {t('settings.upgrade')}
                  </Button>
                </FormRow>
              ) : null}
              {plan !== 'FREE' ? (
                <FormRow label={t('settings.manageBilling')}>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={billingPending}
                    onClick={() => void openBillingUrl(createBillingPortal)}
                  >
                    {t('settings.manageBilling')}
                  </Button>
                </FormRow>
              ) : null}
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
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="라이트">{t('settings.themeLight')}</option>
                </Select>
              </FormRow>
            </FormSection>
            <Button variant="primary" size="md" onClick={save}>
              {t('common.save')}
            </Button>
          </Form>
        ) : null}
      </div>
    </>
  )
}

export default SettingsPage
