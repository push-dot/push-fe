import { formSelect } from '@push/design-system'
import { useLocaleStore, useT } from '@/shared/i18n'
import type { Locale } from '@/shared/i18n'
import { FormRow, FormSection, Select } from '@/shared/components'
import { useSettingsStore } from '../stores'
import type { Theme } from '../types'

const AppearanceSection = () => {
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)

  return (
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
  )
}

export default AppearanceSection
