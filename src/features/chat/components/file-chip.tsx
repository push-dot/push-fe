import { useT } from '@/shared/i18n'
import { Icon } from '@/shared/components'

const FileChip = ({ name, onRemove }: { name: string; onRemove: () => void }) => {
  const t = useT()
  return (
    <span className="file-chip">
      <Icon name="file-text" size={16} />
      <span className="file-chip-name">{name}</span>
      <button
        type="button"
        className="file-chip-remove"
        aria-label={t('composer.removeFile')}
        onClick={onRemove}
      >
        <Icon name="x" size={16} />
      </button>
    </span>
  )
}

export default FileChip
