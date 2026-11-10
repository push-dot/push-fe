import { Icon } from '../../shared/ui/icon'

const EditButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button type="button" className="btn sec sm" onClick={onClick}>
    <Icon name="pencil" size={15} />
    {label}
  </button>
)

export default EditButton
