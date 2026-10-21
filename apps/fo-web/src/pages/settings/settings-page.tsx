import { ApiError, type Settings } from '@push/api-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import MySide from '../my/my-side'
import { sessionStore } from '../../shared/auth/session'
import { useSession } from '../../shared/auth/use-session'
import {
  CAREER_VISIBILITY,
  CONSENT_COPY,
  CONSENT_TITLE,
  CONTACT_VISIBILITY,
  DELETE_ADMIN,
  DELETE_CONFIRM,
  DELETE_FAILED,
  HIDE_COMPANY_LABEL,
  LOCALES,
  LOCALE_NOTE,
  NOTIFY_ROWS,
  SETTINGS_CHANNEL_NOTE,
  SETTINGS_LOAD_ERROR,
} from './constants'

const SettingsPage = () => {
  const session = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: () => api.me.settings() })
  const consentQuery = useQuery({ queryKey: ['consents'], queryFn: () => api.me.consents() })
  const [confirming, setConfirming] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const saveSettings = useMutation({
    mutationFn: (patch: Partial<Settings>) => api.me.updateSettings(patch),
    onSuccess: (settings) => queryClient.setQueryData(['settings'], settings),
  })
  const saveConsent = useMutation({
    mutationFn: (referenceData: boolean) => api.me.updateConsents(referenceData),
    onSuccess: (consent) => queryClient.setQueryData(['consents'], consent),
  })
  const withdraw = useMutation({
    mutationFn: () => api.me.deleteAccount(),
    onSuccess: () => {
      sessionStore.clear()
      navigate('/')
    },
    onError: (error) => {
      setDeleteError(error instanceof ApiError && error.code === 'ADMIN_TRANSFER_REQUIRED' ? DELETE_ADMIN : DELETE_FAILED)
    },
  })
  const settings = settingsQuery.data
  const consent = consentQuery.data
  if (settingsQuery.isError || consentQuery.isError) {
    return (
      <main className="page my-layout">
        <MySide />
        <p className="b2 t3">{SETTINGS_LOAD_ERROR}</p>
      </main>
    )
  }
  if (!settings || !consent) {
    return (
      <main className="page my-layout" aria-busy="true">
        <MySide />
      </main>
    )
  }
  const patch = (next: Partial<Settings>) => saveSettings.mutate(next)
  return (
    <main className="page settings my-layout">
      <MySide />
      <div className="my-main">
        <h1 className="h1">설정</h1>
        <section className="box">
          <div className="settings-row">
            <span className="b1 w7">{session?.user.displayName}</span>
          </div>
        </section>
        <section className="box">
          <h2 className="side-label">알림</h2>
          {NOTIFY_ROWS.map((row) => (
            <label key={row.key} className="switch-row">
              <span>
                <span className="b1">{row.label}</span>
                {row.sub ? <span className="c1 t3">{row.sub}</span> : null}
              </span>
              <input type="checkbox" role="switch" checked={Boolean(settings[row.key])} onChange={(event) => patch({ [row.key]: event.target.checked })} />
            </label>
          ))}
          <p className="c1 t3" style={{ padding: '8px 18px 16px' }}>
            {SETTINGS_CHANNEL_NOTE}
          </p>
        </section>
        <section className="box">
          <h2 className="side-label">일반</h2>
          <label className="field">
            <span>언어</span>
            <span className="c1 t3">{LOCALE_NOTE}</span>
            <select value={settings.locale} onChange={(event) => patch({ locale: event.target.value as Settings['locale'] })}>
              {LOCALES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </section>
        <section className="box">
          <h2 className="side-label">허브 공개</h2>
          <label className="switch-row">
            <span className="b1">프로필 공개</span>
            <input type="checkbox" role="switch" checked={settings.profilePublic} onChange={(event) => patch({ profilePublic: event.target.checked })} />
          </label>
          <label className="field">
            커리어 상태 공개 범위
            <select
              value={settings.careerStatusVisibility}
              onChange={(event) => patch({ careerStatusVisibility: event.target.value as Settings['careerStatusVisibility'] })}
            >
              {CAREER_VISIBILITY.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="switch-row">
            <span className="b1">{HIDE_COMPANY_LABEL}</span>
            <input
              type="checkbox"
              role="switch"
              checked={settings.hideFromCurrentCompany}
              onChange={(event) => patch({ hideFromCurrentCompany: event.target.checked })}
            />
          </label>
          <label className="field">
            연락처 공개 범위
            <select value={settings.contactVisibility} onChange={(event) => patch({ contactVisibility: event.target.value as Settings['contactVisibility'] })}>
              {CONTACT_VISIBILITY.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </section>
        <section className="box">
          <h2 className="side-label">데이터</h2>
          <label className="switch-row">
            <span>
              <span className="b1">{CONSENT_TITLE}</span>
              <span className="c1 t3">{CONSENT_COPY}</span>
            </span>
            <input type="checkbox" role="switch" checked={consent.referenceData} onChange={(event) => saveConsent.mutate(event.target.checked)} />
          </label>
        </section>
        <section className="box">
          <div className="settings-row">고객센터</div>
          <div className="settings-row">약관 및 정책</div>
          <button
            type="button"
            className="settings-row danger"
            onClick={() => {
              sessionStore.clear()
              navigate('/')
            }}
          >
            로그아웃
          </button>
          <button
            type="button"
            className="settings-row danger"
            onClick={() => {
              setDeleteError(null)
              setConfirming(true)
            }}
          >
            회원 탈퇴
          </button>
        </section>
      </div>
      {confirming ? (
        <div className="sheet-scrim" role="presentation">
          <div className="sheet" role="dialog" aria-modal="true" aria-label="회원 탈퇴">
            <h2 className="h3">회원 탈퇴</h2>
            <p className="b2">{DELETE_CONFIRM}</p>
            {deleteError ? <p className="auth-error">{deleteError}</p> : null}
            <div className="sheet-actions">
              <button type="button" className="btn sec sm" onClick={() => setConfirming(false)}>
                취소
              </button>
              <button type="button" className="btn pri sm" disabled={withdraw.isPending} onClick={() => withdraw.mutate()}>
                탈퇴
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default SettingsPage
