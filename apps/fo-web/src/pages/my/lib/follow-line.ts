import { JOB_CATEGORIES, type Profile } from '@push/api-client'

export const followLine = (profile: Pick<Profile, 'jobCategory' | 'tenureYears'>) =>
  [
    profile.jobCategory && (JOB_CATEGORIES.find((item) => item.key === profile.jobCategory)?.label ?? profile.jobCategory),
    profile.tenureYears == null ? null : `${profile.tenureYears}년`,
  ]
    .filter(Boolean)
    .join(' · ')
