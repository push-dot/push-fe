import { CAREER_STATUSES, type Profile } from '@push/api-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { assetUrl } from '../../shared/api/client'
import { brandOf, initials, periodLabel } from '../../shared/lib/format'
import Toast, { useToast } from '../../shared/ui/toast'
import { PROFILE_SAVED } from './constants'
import { meProfile, meUpdateProfile } from '../../shared/api/operations'


type CareerDraft = { company: string; role: string; startedOn: string; endedOn: string; description: string }

type Draft = { displayName: string; headline: string; intro: string; skills: string; careers: CareerDraft[] }

const blankCareer = (): CareerDraft => ({ company: '', role: '', startedOn: '', endedOn: '', description: '' })

const toDraft = (profile: Profile): Draft => ({
  displayName: profile.displayName,
  headline: profile.headline,
  intro: profile.intro,
  skills: profile.skills.join(', '),
  careers: profile.careers.length
    ? profile.careers.map((career) => ({
        company: career.company,
        role: career.role,
        startedOn: career.startedOn.slice(0, 10),
        endedOn: career.endedOn ? career.endedOn.slice(0, 10) : '',
        description: career.description,
      }))
    : [blankCareer()],
})

const ProfileForm = () => {
  const queryClient = useQueryClient()
  const { message, show } = useToast()
  const query = useQuery({ queryKey: ['me', 'profile'], queryFn: () => meProfile() })
  const [draft, setDraft] = useState<Draft | null>(null)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const form = draft ?? (query.data ? toDraft(query.data) : null)
  const save = useMutation({
    mutationFn: (next: Draft) =>
      meUpdateProfile({
        displayName: next.displayName.trim(),
        headline: next.headline.trim(),
        intro: next.intro.trim(),
        skills: next.skills
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        careers: next.careers
          .filter((career) => career.company.trim() && career.role.trim() && career.startedOn)
          .map((career) => ({
            company: career.company.trim(),
            role: career.role.trim(),
            startedOn: career.startedOn,
            endedOn: career.endedOn || null,
            description: career.description.trim(),
          })),
      }),
    onSuccess: async (profile) => {
      setDraft(null)
      setError(null)
      queryClient.setQueryData(['me', 'profile'], profile)
      setEditing(false)
      show(PROFILE_SAVED)
    },
    onError: () => setError('프로필을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.'),
  })
  if (query.isError) return <p className="b2 t3">프로필을 불러오지 못했어요.</p>
  if (!form || !query.data) return <p className="b2 t3" aria-busy="true">프로필을 불러오고 있어요.</p>
  const patch = (next: Draft) => setDraft(next)
  const profile = query.data
  const status = CAREER_STATUSES.find((item) => item.key === profile.careerStatus)?.label
  const tone = profile.careerStatus === 'seeking' ? 'green' : profile.careerStatus === 'feedback' ? 'orange' : 'grey'
  if (!editing) {
    return (
      <div className="preview">
        <p className="c1 t3">{`허브에 이렇게 보여요 · 팔로워 ${profile.followerCount}`}</p>
        <div className="box">
          <div className="preview-head">
            {profile.avatarUrl ? (
              <img className="av" src={assetUrl(profile.avatarUrl)} alt="" />
            ) : (
              <span className="av" style={{ background: brandOf(profile.displayName) }}>
                {initials(profile.displayName)}
              </span>
            )}
            <span>
              <span className="h2">
                {profile.displayName} {status ? <span className={`badge ${tone}`}>{status}</span> : null}
              </span>
              <span className="b1 t2">{profile.headline}</span>
            </span>
            <button type="button" className="btn sec sm" onClick={() => setEditing(true)}>
              기본 정보 편집
            </button>
          </div>
        </div>
        <section className="profile-block">
          <div className="preview-head">
            <h2 className="h2">소개</h2>
            <button type="button" className="btn sec sm" onClick={() => setEditing(true)}>
              편집
            </button>
          </div>
          <p className="b1 t2">{profile.intro}</p>
        </section>
        <section className="profile-block">
          <div className="preview-head">
            <h2 className="h2">경력</h2>
            <button type="button" className="btn sec sm" onClick={() => setEditing(true)}>
              편집
            </button>
          </div>
          {profile.careers.map((career) => (
            <div key={`${career.company}-${career.startedOn}`}>
              <span className="b1 w7">
                {career.company} · {career.role}
              </span>
              <span className="c1 t3">{periodLabel(career)}</span>
              {career.description ? <p className="b2 t2">{career.description}</p> : null}
            </div>
          ))}
        </section>
        <section className="profile-block">
          <div className="preview-head">
            <h2 className="h2">기술 스택</h2>
            <button type="button" className="btn sec sm" onClick={() => setEditing(true)}>
              편집
            </button>
          </div>
          <div className="skill-row">
            {profile.skills.map((skill) => (
              <span className="chip" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        </section>
      </div>
    )
  }
  return (
    <form
      className="stack form"
      onSubmit={(event) => {
        event.preventDefault()
        save.mutate(form)
      }}
    >
      <section className="stack">
        <h2 className="h3">기본 정보</h2>
        <label className="field">
          이름
          <input value={form.displayName} onChange={(event) => patch({ ...form, displayName: event.target.value })} />
        </label>
        <label className="field">
          한 줄 소개
          <input value={form.headline} onChange={(event) => patch({ ...form, headline: event.target.value })} />
        </label>
      </section>
      <section className="stack">
        <h2 className="h3">소개</h2>
        <label className="field">
          소개
          <textarea rows={5} value={form.intro} onChange={(event) => patch({ ...form, intro: event.target.value })} />
        </label>
      </section>
      <section className="stack">
        <h2 className="h3">경력</h2>
        {form.careers.map((career, index) => (
          <div className="career-fields" key={`${career.company}-${index}`}>
            <label className="field">
              회사
              <input
                value={career.company}
                onChange={(event) =>
                  patch({
                    ...form,
                    careers: form.careers.map((item, itemIndex) => (itemIndex === index ? { ...item, company: event.target.value } : item)),
                  })
                }
              />
            </label>
            <label className="field">
              직무
              <input
                value={career.role}
                onChange={(event) =>
                  patch({
                    ...form,
                    careers: form.careers.map((item, itemIndex) => (itemIndex === index ? { ...item, role: event.target.value } : item)),
                  })
                }
              />
            </label>
            <label className="field">
              시작일
              <input
                type="date"
                value={career.startedOn}
                onChange={(event) =>
                  patch({
                    ...form,
                    careers: form.careers.map((item, itemIndex) => (itemIndex === index ? { ...item, startedOn: event.target.value } : item)),
                  })
                }
              />
            </label>
          </div>
        ))}
        <button type="button" className="text-link" onClick={() => patch({ ...form, careers: [...form.careers, blankCareer()] })}>
          경력 추가
        </button>
      </section>
      <section className="stack">
        <h2 className="h3">기술 스택</h2>
        <label className="field">
          쉼표로 구분
          <input value={form.skills} onChange={(event) => patch({ ...form, skills: event.target.value })} />
        </label>
      </section>
      {error ? <p className="auth-error">{error}</p> : null}
      <button type="submit" className="primary" disabled={save.isPending}>
        저장
      </button>
      <Toast message={message} />
    </form>
  )
}

export default ProfileForm
