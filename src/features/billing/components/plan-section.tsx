import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import { formRowHint } from '@push/design-system'
import { useT } from '@/shared/i18n'
import { Button, FormRow, FormSection } from '@/shared/components'
import { useBilling } from '../api/hooks'

const PlanSection = () => {
  const t = useT()
  const navigate = useNavigate()
  const plan = useBilling().data?.plan ?? 'FREE'
  return (
    <FormSection title={t('settings.plan')}>
      <FormRow label={t('settings.currentPlan')}>
        <div className="form-row-plan">
          <span className={formRowHint}>{plan}</span>
          <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.plan)}>
            {t('settings.upgrade')}
          </Button>
        </div>
      </FormRow>
    </FormSection>
  )
}

export default PlanSection
