import type { Settings } from '@push/api-client'
import { brandColor } from '@push/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import MySide from '../my/my-side'
import { useSession } from '../../shared/auth/use-session'
import { useAuthMe, useBlocks, useSettings } from '../../entities/session'
import { initials } from '../../shared/lib/format'
import { THEME_CHOICES, setTheme, useTheme } from '../../shared/lib/theme'
import { useSignOut } from '../../features/sign-out'
import { meUpdateSettings } from '../../features/update-settings'
import { ConfirmDialog } from '../../shared/ui/dialog'
import { Icon } from '../../shared/ui/icon'
import { ErrorState } from '../../shared/ui/state-block'
import Skeleton from '../../shared/ui/skeleton'
import {
  CAREER_VISIBILITY,
  CONTACT_VISIBILITY,
  HIDE_COMPANY_LABEL,
  LOCALES,
  LOCALE_NOTE,
  LOGIN_LABEL,
  LOGOUT_TITLE,
  SETTINGS_CHANNEL_NOTE,
  SETTINGS_GROUPS,
  SETTINGS_LABELS,
  SETTINGS_LOAD_ERROR,
  SUPPORT_MAIL,
  THEME_LABEL,
  BLOCKED_COPY,
} from './constants'
import { blockedCount, settingsSections } from './lib'
import SettingsPick from './settings-pick'
import SettingsRow from './settings-row'
import SettingsSwitch from './settings-switch'
import WithdrawDialog from './withdraw-dialog'

const SettingsPage = () => {
  const session = useSession()
  const signOut = useSignOut()
  const queryClient = useQueryClient()
  const account = useAuthMe()
  const settingsQuery = useSettings()
  const theme = useTheme()
  const sections = settingsSections(session?.user.accountType)
  const blocks = useBlocks(sections.hub)
  const [dialog, setDialog] = useState<'logout' | 'withdraw' | null>(null)
  const saveSettings = useMutation({
    mutationFn: (patch: Partial<Settings>) => meUpdateSettings(patch),
    onSuccess: (settings) => queryClient.setQueryData(['settings'], settings),
  })
  const settings = settingsQuery.data
  const patch = (next: Partial<Settings>) => saveSettings.mutate(next)
  const name = session?.user.displayName ?? ''
  const login = LOGIN_LABEL[account.data?.provider ?? ''] ?? ''
  return (
    <main className="page settings my-layout">
      <MySide />
      <div className="my-main">
        <h1 className="h1">{SETTINGS_LABELS.title}</h1>
        {settingsQuery.isError ? <ErrorState boxed title={SETTINGS_LOAD_ERROR} onRetry={() => void settingsQuery.refetch()} /> : null}
        {settingsQuery.isLoading ? <Skeleton rows={4} /> : null}
        {settings ? (
          <>
            <section className="box set-account">
              <span className="av" style={{ background: brandColor(name || 'Push') }} aria-hidden="true">
                {initials(name)}
              </span>
              <span className="set-copy">
                <span className="b1 w7">{name}</span>
                {login ? <span className="c1 t3">{login}</span> : null}
              </span>
            </section>
            <section className="set-group">
              <h2 className="b2 w7 t3">{SETTINGS_GROUPS.notify}</h2>
              <div className="box">
                {sections.notify.map((row) => (
                  <SettingsSwitch key={row.key} label={row.label} sub={row.sub} checked={Boolean(settings[row.key])} onChange={(next) => patch({ [row.key]: next })} />
                ))}
              </div>
              <p className="c1 t3 set-note">{SETTINGS_CHANNEL_NOTE}</p>
            </section>
            <section className="set-group">
              <h2 className="b2 w7 t3">{SETTINGS_GROUPS.general}</h2>
              <div className="box">
                <SettingsRow label={SETTINGS_LABELS.locale} sub={LOCALE_NOTE}>
                  <SettingsPick label={SETTINGS_LABELS.locale} value={settings.locale} options={LOCALES} onChange={(locale) => patch({ locale })} />
                </SettingsRow>
                <SettingsRow label={SETTINGS_LABELS.theme}>
                  <div className="seg" role="group" aria-label={SETTINGS_LABELS.theme}>
                    {THEME_CHOICES.map((choice) => (
                      <button key={choice} type="button" aria-pressed={theme === choice} onClick={() => setTheme(choice)}>
                        {THEME_LABEL[choice]}
                      </button>
                    ))}
                  </div>
                </SettingsRow>
              </div>
            </section>
            {sections.hub ? (
              <section className="set-group">
                <h2 className="b2 w7 t3">{SETTINGS_GROUPS.hub}</h2>
                <div className="box">
                  <SettingsSwitch label={SETTINGS_LABELS.profilePublic} checked={settings.profilePublic} onChange={(profilePublic) => patch({ profilePublic })} />
                  <SettingsRow label={SETTINGS_LABELS.career}>
                    <SettingsPick
                      label={SETTINGS_LABELS.career}
                      value={settings.careerStatusVisibility}
                      options={CAREER_VISIBILITY}
                      onChange={(careerStatusVisibility) => patch({ careerStatusVisibility })}
                    />
                  </SettingsRow>
                  <SettingsSwitch
                    label={HIDE_COMPANY_LABEL}
                    checked={settings.hideFromCurrentCompany}
                    onChange={(hideFromCurrentCompany) => patch({ hideFromCurrentCompany })}
                  />
                  <SettingsRow label={SETTINGS_LABELS.contact}>
                    <SettingsPick
                      label={SETTINGS_LABELS.contact}
                      value={settings.contactVisibility}
                      options={CONTACT_VISIBILITY}
                      onChange={(contactVisibility) => patch({ contactVisibility })}
                    />
                  </SettingsRow>
                  <Link to="/settings/blocked" className="set-row">
                    <span className="set-copy">
                      <span className="b1">{BLOCKED_COPY.title}</span>
                    </span>
                    <span className="b2 t3">{blockedCount(blocks.data?.page.total ?? blocks.data?.data.length)}</span>
                    <Icon name="next" size={18} className="t3" />
                  </Link>
                </div>
              </section>
            ) : null}
            <section className="box">
              <a href={SUPPORT_MAIL} className="set-row">
                <span className="set-copy b1">{SETTINGS_LABELS.support}</span>
                <Icon name="next" size={18} className="t3" />
              </a>
              <Link to="/terms" className="set-row">
                <span className="set-copy b1">{SETTINGS_LABELS.terms}</span>
                <Icon name="next" size={18} className="t3" />
              </Link>
              <button type="button" className="set-row settings-row danger" onClick={() => setDialog('logout')}>
                <span className="set-copy b1">{SETTINGS_LABELS.logout}</span>
              </button>
              <button type="button" className="set-row settings-row danger" onClick={() => setDialog('withdraw')}>
                <span className="set-copy b1">{SETTINGS_LABELS.withdraw}</span>
              </button>
            </section>
          </>
        ) : null}
      </div>
      {dialog === 'logout' ? (
        <ConfirmDialog
          title={LOGOUT_TITLE}
          confirmLabel={SETTINGS_LABELS.logout}
          onConfirm={() => void signOut()}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog === 'withdraw' ? <WithdrawDialog subscriptionNote={sections.subscriptionNote} onClose={() => setDialog(null)} /> : null}
    </main>
  )
}

export default SettingsPage
