import type { BlockedUser, ListEnvelope } from '@push/api-client'
import { brandColor } from '@push/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { meUnblockUser } from '../../features/update-settings'
import { initials } from '../../shared/lib/format'
import { BLOCKED_COPY } from './constants'
import { blockedLine, withoutBlocked } from './lib'

const BlockedRow = ({ row, onFailed }: { row: BlockedUser; onFailed: () => void }) => {
  const queryClient = useQueryClient()
  const unblock = useMutation({
    mutationFn: () => meUnblockUser(row.user.id),
    onSuccess: () => {
      queryClient.setQueryData<ListEnvelope<BlockedUser>>(['blocks'], (old) => withoutBlocked(old, row.user.id))
      void queryClient.invalidateQueries({ queryKey: ['offers'] })
    },
    onError: onFailed,
  })
  return (
    <li className="my-row">
      <span className="my-row-who">
        <span className="av sm" style={{ background: brandColor(row.user.displayName) }} aria-hidden="true">
          {initials(row.user.displayName)}
        </span>
        <span className="my-row-copy">
          <span className="b2 w7 cap">{row.user.displayName}</span>
          <span className="c1 t3">{blockedLine(row.createdAt)}</span>
        </span>
      </span>
      <button type="button" className="btn sec sm" disabled={unblock.isPending} onClick={() => unblock.mutate()}>
        {BLOCKED_COPY.unblock}
      </button>
    </li>
  )
}

export default BlockedRow
