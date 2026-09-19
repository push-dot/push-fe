import { useT } from '@/shared/i18n'
import Icon from './icon'

const DropOverlay = () => {
  const t = useT()
  return (
    <div className="drop-overlay">
      <Icon name="file-down" size={48} />
      <span>{t('composer.drop')}</span>
    </div>
  )
}

export default DropOverlay
