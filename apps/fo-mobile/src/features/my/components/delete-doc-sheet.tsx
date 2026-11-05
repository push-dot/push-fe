import type { useUndoRemove } from '../hooks'
import { deleteDocCopy } from '../utils'
import ConfirmSheet from './confirm-sheet'

const DeleteDocSheet = ({ undo }: { undo: ReturnType<typeof useUndoRemove> }) => {
  const copy = deleteDocCopy(undo.asking?.fileName ?? '')
  return (
    <ConfirmSheet
      visible={undo.open}
      title={copy.title}
      body={copy.body}
      confirm={copy.confirm}
      cancel={copy.cancel}
      danger
      onConfirm={undo.confirm}
      onClose={undo.cancel}
    />
  )
}

export default DeleteDocSheet
