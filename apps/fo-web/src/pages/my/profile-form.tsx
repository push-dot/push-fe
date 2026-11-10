import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { useMyProfile } from '../../entities/profile'
import { meUpdateProfile } from '../../features/update-profile'
import Skeleton from '../../shared/ui/skeleton'
import { ErrorState } from '../../shared/ui/state-block'
import Toast, { useToast } from '../../shared/ui/toast'
import {
  EDIT_PARAM,
  PROFILE_LOAD_FAILED,
  PROFILE_PHOTO,
  PROFILE_SAVE_FAILED,
  PROFILE_SAVED,
  RETRY_LABEL,
} from './constants'
import ProfileEditForm, { type ProfileDraft } from './profile-edit-form'
import ProfileView from './profile-view'

const ProfileForm = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  const query = useMyProfile()
  const [params, setParams] = useSearchParams()
  const editing = params.get(EDIT_PARAM) === '1'
  const setEditing = (on: boolean) =>
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (on) next.set(EDIT_PARAM, '1')
      else next.delete(EDIT_PARAM)
      return next
    })
  const save = useMutation({
    mutationFn: (draft: ProfileDraft) =>
      meUpdateProfile({
        ...draft,
        displayName: draft.displayName.trim(),
        headline: draft.headline.trim(),
        intro: draft.intro.trim(),
      }),
    onSuccess: (profile) => {
      queryClient.setQueryData(['me', 'profile'], profile)
      setEditing(false)
      toast.show(PROFILE_SAVED)
    },
    onError: (_, draft) =>
      toast.show(PROFILE_SAVE_FAILED, {
        tone: 'err',
        action: { label: RETRY_LABEL, onClick: () => save.mutate(draft) },
      }),
  })
  if (query.isError)
    return <ErrorState boxed title={PROFILE_LOAD_FAILED} onRetry={() => void query.refetch()} />
  if (!query.data) return <Skeleton rows={4} />
  return (
    <>
      {editing ? (
        <ProfileEditForm
          profile={query.data}
          busy={save.isPending}
          onSave={(draft) => save.mutate(draft)}
          onCancel={() => setEditing(false)}
          onPhotoFail={() => toast.show(PROFILE_PHOTO.failed, { tone: 'err' })}
        />
      ) : (
        <ProfileView profile={query.data} onEdit={() => setEditing(true)} />
      )}
      <Toast message={toast.message} tone={toast.tone} action={toast.action} />
    </>
  )
}

export default ProfileForm
