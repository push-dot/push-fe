import { ApiError, type Settings } from '@push/api-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { sessionStore } from '../../shared/auth/session'
import { useSession } from '../../shared/auth/use-session'
import {
  CAREER_VISIBILITY,
  CONSENT_COPY,
  CONTACT_VISIBILITY,
  DELETE_ADMIN,
  DELETE_CONFIRM,
  DELETE_FAILED,
  LOCALES,
  NOTIFY_ROWS,
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
  if (settingsQuery.isError || consentQuery.isError) return <main className="page"><p className="b2 t3">설정을 불러오지 못했어요.</p></main>
  if (!settings || !consent) return <main className="page" aria-busy="true" />
  const patch = (next: Partial<Settings>) => saveSettings.mutate(next)
  return (
    <main className="page settings">
      <header className="head">
        <h1 className="h1">설정</h1>
      </header>
      <section className="settings-group">
        <h2 className="h3">계정</h2>
        <p className="b1 w7">{session?.user.displayName}</p>
        <label className="switch-row">
          <span>
            <span className="b1">참고 데이터 동의</span>
            <span className="c1 t3">{CONSENT_COPY}</span>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={consent.referenceData}
            onChange={(event) => saveConsent.mutate(event.target.checked)}
          />
        </label>
      </section>
      <section className="settings-group">
        <h2 className="h3">알림</h2>
        {NOTIFY_ROWS.map((row) => (
          <label key={row.key} className="switch-row">
            <span>
              <span className="b1">{row.label}</span>
              {row.sub ? <span className="c1 t3">{row.sub}</span> : null}
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={Boolean(settings[row.key])}
              onChange={(event) => patch({ [row.key]: event.target.checked })}
            />
          </label>
        ))}
      </section>
      <section className="settings-group">
        <h2 className="h3">일반</h2>
        <label className="field">
          언어
          <select value={settings.locale} onChange={(event) => patch({ locale: event.target.value as Settings['locale'] })}>
            {LOCALES.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </section>
      <section className="settings-group">
        <h2 className="h3">허브 공개</h2>
        <label className="switch-row">
          <span className="b1">프로필 공개</span>
          <input type="checkbox" role="switch" checked={settings.profilePublic} onChange={(event) => patch({ profilePublic: event.target.checked })} />
        </label>
        <label className="field">
          커리어 상태
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
        <label className="field">
          연락처
          <select value={settings.contactVisibility} onChange={(event) => patch({ contactVisibility: event.target.value as Settings['contactVisibility'] })}>
            {CONTACT_VISIBILITY.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="switch-row">
          <span className="b1">지금 다니는 회사 사람에게 숨기기</span>
          <input
            type="checkbox"
            role="switch"
            checked={settings.hideFromCurrentCompany}
            onChange={(event) => patch({ hideFromCurrentCompany: event.target.checked })}
          />
        </label>
      </section>
      <section className="settings-group">
        <h2 className="h3">기타</h2>
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
      {confirming ? (
        <div className="sheet-scrim" role="presentation">
          <div className="sheet" role="dialog" aria-modal="true" aria-label="회원 탈퇴">
            <h2 className="h3">회원 탈퇴</h2>
            <p className="b2">{DELETE_CONFIRM}</p>
            {deleteError ? <p className="auth-error">{deleteError}</p> : null}
            <button type="button" className="text-link" onClick={() => setConfirming(false)}>
              취소
            </button>
            <button type="button" className="primary" disabled={withdraw.isPending} onClick={() => withdraw.mutate()}>
              탈퇴
            </button>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default SettingsPage
