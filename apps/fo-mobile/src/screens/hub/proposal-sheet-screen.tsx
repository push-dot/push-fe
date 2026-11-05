import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { ProposalSheet, proposalSubtitle, useOfferBookmarks, useProfile, useSendOffer } from '@/features/hub'
import { Sheet } from '@/shared/components'

const param = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

const ProposalSheetScreen = () => {
  const userId = param(useLocalSearchParams<{ userId?: string }>().userId)
  const profile = useProfile(userId ?? '')
  const bookmarks = useOfferBookmarks(!!userId)
  const [message, setMessage] = useState('')
  const [postingId, setPostingId] = useState<string>()
  const [error, setError] = useState<string | null>(null)
  const send = useSendOffer(userId ?? '', message, postingId, () => router.back(), setError)
  const p = profile.data

  useEffect(() => {
    if (!userId) router.back()
  }, [userId])

  if (!userId) return null

  return (
    <Sheet
      title="제안하기"
      action={{ label: '제안 보내기', onPress: () => send.mutate(), disabled: !message.trim() || send.isPending }}
    >
      <ProposalSheet
        userId={userId}
        name={p?.displayName ?? ''}
        subtitle={p ? proposalSubtitle(p) : ''}
        message={message}
        postingId={postingId}
        postings={bookmarks.data?.data ?? []}
        error={error}
        onMessage={setMessage}
        onPosting={setPostingId}
        onError={setError}
      />
    </Sheet>
  )
}

export default ProposalSheetScreen
