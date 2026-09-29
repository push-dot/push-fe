import { useT } from '@/shared/i18n'
import { FormRow, FormSection } from '@/shared/components'
import type { AuthUser } from '../api/schemas'

const AccountSection = ({ me }: { me: AuthUser | null }) => {
  const t = useT()
  return (
    <FormSection title={t('settings.account')}>
      <FormRow label={t('settings.name')} hint={me?.displayName ?? '—'} />
      <FormRow label={t('settings.locale')} hint={me?.locale ?? '—'} />
    </FormSection>
  )
}

export default AccountSection
