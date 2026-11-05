import type { Profile } from '@push/api-client'

type Counts = Partial<Pick<Profile, 'followingCount' | 'followerCount' | 'postCount'>>

export const profileStats = (p: Counts) =>
  [
    { value: p.followingCount, label: '팔로잉' },
    { value: p.followerCount, label: '팔로워' },
    { value: p.postCount, label: '게시글' },
  ].filter((stat): stat is { value: number; label: string } => stat.value != null)
