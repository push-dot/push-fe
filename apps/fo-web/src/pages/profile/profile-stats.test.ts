import { describe, expect, it } from 'vitest'
import { profileStats } from './profile-stats'

describe('profileStats', () => {
  it('lists following, followers and posts in the design order', () => {
    expect(profileStats({ followingCount: 42, followerCount: 128, postCount: 15 })).toEqual([
      { value: 42, label: '팔로잉' },
      { value: 128, label: '팔로워' },
      { value: 15, label: '게시글' },
    ])
  })

  it('skips a count the server left out', () => {
    expect(profileStats({ followerCount: 3 })).toEqual([{ value: 3, label: '팔로워' }])
  })
})
