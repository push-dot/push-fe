import type { Profile } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../api'
import { useSession } from '../../shared/auth/use-session'
import Toast, { useToast } from '../../shared/ui/toast'
import { LINK_COPIED } from './constants'
import OfferSheet from './offer-sheet'

const ProfileTools = ({ profile }: { profile: Profile }) => {
  const session = useSession()
  const queryClient = useQueryClient()
  const { message, show } = useToast()
  const [offerOpen, setOfferOpen] = useState(false)
  const self = session?.user.id === profile.userId
  const follow = useMutation({
    mutationFn: () => (profile.following ? api.profiles.unfollow(profile.userId) : api.profiles.follow(profile.userId)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile', profile.userId] })
    },
  })
  const share = async () => {
    const url = window.location.href
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ url })
      } catch {
        return
      }
      return
    }
    await navigator.clipboard.writeText(url)
    show(LINK_COPIED)
  }
  return (
    <>
      <div className="profile-tools">
        {self ? null : (
          <button type="button" aria-pressed={profile.following === true} disabled={follow.isPending} onClick={() => follow.mutate()}>
            {profile.following ? '팔로우 취소' : '팔로우'}
          </button>
        )}
        <button type="button" onClick={() => void share()}>
          공유
        </button>
        <button type="button" onClick={() => setOfferOpen(true)}>
          제안하기
        </button>
      </div>
      {offerOpen ? (
        <OfferSheet
          userId={profile.userId}
          name={profile.displayName}
          onClose={() => setOfferOpen(false)}
          onSent={(text) => {
            setOfferOpen(false)
            show(text)
            void queryClient.invalidateQueries({ queryKey: ['profile', profile.userId] })
          }}
        />
      ) : null}
      <Toast message={message} />
    </>
  )
}

export default ProfileTools
