import type { SourceItem } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useSources } from '../../entities/profile'
import {
  documentPostingId,
  openDocument,
  removeDocument,
  renameDocument,
} from '../../features/manage-documents'
import { uploadResume } from '../../features/upload-resume'
import { ConfirmDialog } from '../../shared/ui/dialog'
import { Icon } from '../../shared/ui/icon'
import type { MenuItem } from '../../shared/ui/popover'
import Skeleton from '../../shared/ui/skeleton'
import StateBlock, { ErrorState } from '../../shared/ui/state-block'
import Toast, { useToast } from '../../shared/ui/toast'
import {
  DELETE_LABEL,
  DOCUMENT_AI_LABEL,
  DOCUMENT_COUNT,
  DOCUMENT_DELETE,
  DOCUMENT_EMPTY,
  DOCUMENT_LOAD_FAILED,
  DOCUMENT_OPEN_FAILED,
  DOCUMENT_REGISTER,
  DOCUMENT_RENAME,
  DOCUMENT_UPLOAD,
  DOCUMENT_UPLOAD_FAILED,
  DOCUMENT_UPLOADED,
  DROP_HINT,
  DROP_TITLE,
  FILE_MENU,
  FRESH_MS,
  POSTING_NOT_FOUND,
  PUSH_DOC_MENU,
  PUSH_DOCS_TITLE,
  RETRY_LABEL,
  UNDO_LABEL,
  UPLOADS_GROUP,
} from './constants'
import DocumentErrorRow from './document-error-row'
import DocumentFileRow from './document-file-row'
import DocumentGroup from './document-group'
import DocumentPushRow from './document-push-row'
import DocumentRenameDialog from './document-rename-dialog'
import DocumentUploadingRow from './document-uploading-row'
import {
  documentDeleteNotice,
  pushDocGroups,
  referencedByEvidence,
  splitDocuments,
  uploadProblem,
  type PushDocAction,
} from './my-rules'
import { useUndoDelete } from './use-undo-delete'

const ACCEPT =
  '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const SOURCES_KEY = ['sources']

const DocumentsPanel = () => {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const cancelledRef = useRef<File | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()
  const query = useSources()
  const [problem, setProblem] = useState<{ name: string; text: string } | null>(null)
  const [cancelled, setCancelled] = useState<File | null>(null)
  const [fresh, setFresh] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<SourceItem | null>(null)
  const [deleting, setDeleting] = useState<SourceItem | null>(null)
  const refresh = () => queryClient.invalidateQueries({ queryKey: SOURCES_KEY })
  const { hidden, start, undo } = useUndoDelete<SourceItem>({
    remove: removeDocument,
    onDone: refresh,
    onFail: (retry, error) =>
      toast.show(documentDeleteNotice(error), {
        tone: 'err',
        ...(referencedByEvidence(error) ? {} : { action: { label: RETRY_LABEL, onClick: retry } }),
      }),
  })
  const upload = useMutation({ mutationFn: (file: File) => uploadResume(file) })
  const rename = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameDocument(id, name),
    onSuccess: async () => {
      setRenaming(null)
      toast.show(DOCUMENT_RENAME.done)
      await refresh()
    },
    onError: () => toast.show(DOCUMENT_RENAME.failed, { tone: 'err' }),
  })

  useEffect(() => {
    if (!fresh) return
    const timer = window.setTimeout(() => setFresh(null), FRESH_MS)
    return () => window.clearTimeout(timer)
  }, [fresh])

  const take = (file: File | undefined) => {
    if (!file || upload.isPending) return
    const text = uploadProblem(file)
    setProblem(text ? { name: file.name, text } : null)
    if (text) return
    cancelledRef.current = null
    setCancelled(null)
    upload.mutate(file, {
      onSuccess: async (source) => {
        if (cancelledRef.current === file) {
          await removeDocument({ id: source.id, origin: 'UPLOAD' }).catch(() => undefined)
          return
        }
        setFresh(source.id)
        toast.show(DOCUMENT_UPLOADED)
        await refresh()
      },
      onError: () => {
        if (cancelledRef.current !== file) toast.show(DOCUMENT_UPLOAD_FAILED, { tone: 'err' })
      },
    })
  }

  const pick = () => inputRef.current?.click()

  const cancel = (file: File) => {
    cancelledRef.current = file
    setCancelled(file)
  }

  const view = (item: SourceItem, download = false) =>
    openDocument(item, download).catch(() => toast.show(DOCUMENT_OPEN_FAILED, { tone: 'err' }))

  const remove = (item: SourceItem) => {
    setDeleting(null)
    start(item)
    toast.show(DOCUMENT_DELETE.done, {
      action: {
        label: UNDO_LABEL,
        onClick: () => {
          undo(item.id)
          toast.show(null)
        },
      },
    })
  }

  const openPosting = async (item: SourceItem) => {
    const postingId = await documentPostingId(item).catch(() => null)
    if (postingId) navigate(`/postings/${postingId}`)
    else toast.show(POSTING_NOT_FOUND, { tone: 'err' })
  }

  const pushMenu = (item: SourceItem): MenuItem[] => {
    const actions: Record<PushDocAction, MenuItem> = {
      posting: {
        label: PUSH_DOC_MENU.posting,
        icon: 'ext',
        onSelect: () => void openPosting(item),
      },
      export: {
        label: PUSH_DOC_MENU.export,
        icon: 'download',
        onSelect: () => void view(item, true),
      },
      rename: { label: PUSH_DOC_MENU.rename, icon: 'pencil', onSelect: () => setRenaming(item) },
      remove: {
        label: PUSH_DOC_MENU.remove,
        icon: 'trash',
        danger: true,
        onSelect: () => setDeleting(item),
      },
    }
    return pushDocGroups(item).flatMap((group, index) => [
      ...(index ? [{ divider: true as const }] : []),
      ...group.map((action) => actions[action]),
    ])
  }

  const fileMenu = (item: SourceItem): MenuItem[] => [
    { label: FILE_MENU.view, icon: 'eye', onSelect: () => void view(item) },
    { label: FILE_MENU.remove, icon: 'trash', danger: true, onSelect: () => setDeleting(item) },
  ]

  const items = (query.data ?? []).filter((item) => !hidden.includes(item.id))
  const { push, uploads } = splitDocuments(items)
  const uploading = upload.isPending && upload.variables !== cancelled ? upload.variables : null
  const empty = query.isSuccess && items.length === 0 && !uploading && !problem

  return (
    <section className="doc-panel">
      <input
        ref={inputRef}
        id={inputId}
        className="file-input"
        type="file"
        accept={ACCEPT}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          take(file)
        }}
      />
      {query.isLoading ? <Skeleton rows={4} /> : null}
      {query.isError ? (
        <ErrorState boxed title={DOCUMENT_LOAD_FAILED} onRetry={() => void query.refetch()} />
      ) : null}
      {empty ? (
        <StateBlock
          boxed
          icon="doc"
          title={DOCUMENT_EMPTY}
          description={DROP_HINT}
          action={
            <button type="button" className="btn pri sm" onClick={pick}>
              <Icon name="upload" size={16} width={2.2} />
              {DOCUMENT_REGISTER}
            </button>
          }
        />
      ) : null}
      {query.isSuccess && !empty ? (
        <>
          <div className="doc-head">
            <span className="b2 t3">{DOCUMENT_COUNT(items.length)}</span>
            <button type="button" className="btn pri sm" disabled={upload.isPending} onClick={pick}>
              <Icon name="upload" size={16} width={2.2} />
              {DOCUMENT_UPLOAD}
            </button>
          </div>
          {push.length ? (
            <DocumentGroup title={PUSH_DOCS_TITLE} note={DOCUMENT_AI_LABEL}>
              {push.map((item) => (
                <DocumentPushRow
                  key={item.id}
                  item={item}
                  menu={pushMenu(item)}
                  onView={() => void view(item)}
                />
              ))}
            </DocumentGroup>
          ) : null}
          {uploads.length || uploading || problem ? (
            <DocumentGroup title={UPLOADS_GROUP(uploads.length)}>
              {problem ? (
                <DocumentErrorRow
                  name={problem.name}
                  text={problem.text}
                  onClose={() => setProblem(null)}
                />
              ) : null}
              {uploading ? (
                <DocumentUploadingRow file={uploading} onCancel={() => cancel(uploading)} />
              ) : null}
              {uploads.map((item) => (
                <DocumentFileRow
                  key={item.id}
                  file={item}
                  fresh={item.id === fresh}
                  menu={fileMenu(item)}
                  onView={() => void view(item)}
                />
              ))}
            </DocumentGroup>
          ) : null}
          <label
            htmlFor={inputId}
            className="drop"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              take(event.dataTransfer.files[0])
            }}
          >
            <Icon name="upload" size={26} width={2.2} className="t3" />
            <span className="b1 w7">{DROP_TITLE}</span>
            <span className="c1 t3">{DROP_HINT}</span>
          </label>
        </>
      ) : null}
      {renaming ? (
        <DocumentRenameDialog
          name={renaming.fileName}
          busy={rename.isPending}
          onSave={(name) => rename.mutate({ id: renaming.id, name })}
          onClose={() => setRenaming(null)}
        />
      ) : null}
      {deleting ? (
        <ConfirmDialog
          title={DOCUMENT_DELETE.title}
          body={deleting.fileName}
          confirmLabel={DELETE_LABEL}
          danger
          onConfirm={() => remove(deleting)}
          onClose={() => setDeleting(null)}
        />
      ) : null}
      <Toast message={toast.message} tone={toast.tone} action={toast.action} />
    </section>
  )
}

export default DocumentsPanel
