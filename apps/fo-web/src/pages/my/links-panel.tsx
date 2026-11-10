import type { LinkKind, UserLink } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { useLinks } from '../../entities/profile'
import { meAddLink } from '../../features/add-link'
import { removeLink, restoreLink } from '../../features/remove-link'
import { Icon } from '../../shared/ui/icon'
import type { MenuItem } from '../../shared/ui/popover'
import Skeleton from '../../shared/ui/skeleton'
import StateBlock, { ErrorState } from '../../shared/ui/state-block'
import Toast, { useToast } from '../../shared/ui/toast'
import {
  LINK_ADD,
  LINK_ADD_FAILED,
  LINK_ADDED,
  LINK_DELETE,
  LINK_EMPTY,
  LINK_FAILED,
  LINK_KIND_EMPTY,
  LINK_KINDS,
  LINK_MENU,
  LINK_NOTE,
  RETRY_LABEL,
  UNDO_LABEL,
} from './constants'
import LinkAddDialog from './link-add-dialog'
import LinkRow from './link-row'
import { guessLinkKind } from './my-rules'

const LINKS_KEY = ['links']

const LinksPanel = () => {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [kind, setKind] = useState<LinkKind | 'all'>('all')
  const [adding, setAdding] = useState(false)
  const all = useLinks('all')
  const query = useLinks(kind)
  const refresh = () => queryClient.invalidateQueries({ queryKey: LINKS_KEY })
  const add = useMutation({
    mutationFn: (url: string) => meAddLink({ url, kind: guessLinkKind(url) }),
    onSuccess: async () => {
      setAdding(false)
      toast.show(LINK_ADDED)
      await refresh()
    },
    onError: () => toast.show(LINK_ADD_FAILED, { tone: 'err' }),
  })
  const restore = useMutation({ mutationFn: (id: string) => restoreLink(id), onSettled: refresh })
  const remove = useMutation({
    mutationFn: (link: UserLink) => removeLink(link.id),
    onSuccess: async (_, link) => {
      toast.show(LINK_DELETE.done, {
        action: {
          label: UNDO_LABEL,
          onClick: () => {
            toast.show(null)
            restore.mutate(link.id)
          },
        },
      })
      await refresh()
    },
    onError: (_, link) =>
      toast.show(LINK_DELETE.failed, {
        tone: 'err',
        action: { label: RETRY_LABEL, onClick: () => remove.mutate(link) },
      }),
  })
  const menu = (link: UserLink): MenuItem[] => [
    {
      label: LINK_MENU.open,
      icon: 'ext',
      onSelect: () => window.open(link.url, '_blank', 'noopener'),
    },
    { divider: true },
    { label: LINK_MENU.remove, icon: 'trash', danger: true, onSelect: () => remove.mutate(link) },
  ]
  const total = all.data?.data.length ?? 0
  const items = query.data?.data ?? []
  const addButton = (
    <button type="button" className="btn pri sm" onClick={() => setAdding(true)}>
      <Icon name="plus" size={16} />
      {LINK_ADD}
    </button>
  )
  return (
    <section className="links-panel">
      {all.isLoading ? <Skeleton rows={4} /> : null}
      {all.isError ? (
        <ErrorState boxed title={LINK_FAILED} onRetry={() => void all.refetch()} />
      ) : null}
      {all.isSuccess && total === 0 ? (
        <StateBlock
          boxed
          icon="link"
          title={LINK_EMPTY}
          description={LINK_NOTE}
          action={addButton}
        />
      ) : null}
      {all.isSuccess && total > 0 ? (
        <>
          <div className="link-bar">
            <div className="kind-row">
              {LINK_KINDS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className="chip"
                  aria-pressed={kind === item.key}
                  onClick={() => setKind(item.key)}
                >
                  {item.key === 'all' ? `${item.label} ${total}` : item.label}
                </button>
              ))}
            </div>
            {addButton}
          </div>
          {query.isError ? (
            <ErrorState boxed title={LINK_FAILED} onRetry={() => void query.refetch()} />
          ) : null}
          {query.isSuccess && items.length === 0 ? (
            <StateBlock boxed icon="link" title={LINK_KIND_EMPTY} />
          ) : null}
          {items.length ? (
            <div className="box doc-box">
              {items.map((link) => (
                <LinkRow key={link.id} link={link} menu={menu(link)} />
              ))}
            </div>
          ) : null}
          <p className="c1 t3">{LINK_NOTE}</p>
        </>
      ) : null}
      {adding ? (
        <LinkAddDialog
          busy={add.isPending}
          onAdd={(url) => add.mutate(url)}
          onClose={() => setAdding(false)}
        />
      ) : null}
      <Toast message={toast.message} tone={toast.tone} action={toast.action} />
    </section>
  )
}

export default LinksPanel
