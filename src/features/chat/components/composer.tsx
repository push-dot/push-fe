import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useT } from '@/shared/i18n'
import { Icon, IconButton, showToast } from '@/shared/components'
import type { PendingUploadResult } from '@/features/evidence'
import { usePendingFiles } from '../stores'

type ComposerProps = {
  onSend: (text: string, evidence?: PendingUploadResult['evidence']) => void
  onUploadPending: (files: File[]) => Promise<PendingUploadResult>
  onAbort?: () => void
  sending?: boolean
  settingsPanel?: ReactNode
}

const Composer = ({ onSend, onUploadPending, onAbort, sending = false, settingsPanel }: ComposerProps) => {
  const t = useT()
  const [text, setText] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!settingsOpen) return
    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [settingsOpen])

  const pending = usePendingFiles((s) => s.files)
  const addFiles = usePendingFiles((s) => s.add)
  const removeFile = usePendingFiles((s) => s.remove)
  const clearFiles = usePendingFiles((s) => s.clear)

  const submit = () => {
    const value = text.trim()
    if ((!value && pending.length === 0) || sending) return
    void (async () => {
      const { evidence, failed } = await onUploadPending(pending)
      evidence.forEach(() => showToast(t('composer.uploaded')))
      failed.forEach(({ error }) =>
        showToast(
          error instanceof Error ? error.message : t('composer.uploadFailed'),
          'circle-alert',
        ),
      )
      clearFiles()
      if (failed.length) addFiles(failed.map((f) => f.file))
      if (value || evidence.length) {
        onSend(value || pending.map((f) => f.name).join(', '), evidence)
        setText('')
      }
    })()
  }

  const onAttach = (file: File | undefined) => {
    if (file) addFiles([file])
  }

  return (
    <div className="composer-wrap" ref={wrapRef}>
      {settingsOpen ? settingsPanel : null}
      {pending.length ? (
        <div className="composer-files">
          {pending.map((file, i) => (
            <span key={`${file.name}-${i}`} className="file-chip">
              <Icon name="file-text" size={16} />
              <span className="file-chip-name">{file.name}</span>
              <button
                type="button"
                className="file-chip-remove"
                aria-label={t('composer.removeFile')}
                onClick={() => removeFile(i)}
              >
                <Icon name="x" size={16} />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <div className="composer">
        <IconButton
          icon="paperclip"
          aria-label={t('composer.attach')}
          onClick={() => fileRef.current?.click()}
        />
        <input
          ref={fileRef}
          type="file"
          hidden
          onChange={(e) => {
            onAttach(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <IconButton
          icon="sliders-horizontal"
          aria-label={t('composer.inference')}
          onClick={() => setSettingsOpen((v) => !v)}
        />
        <textarea
          className="composer-field"
          rows={1}
          placeholder={t('composer.placeholder')}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            e.currentTarget.style.height = 'auto'
            e.currentTarget.style.height =
              `${Math.min(e.currentTarget.scrollHeight, 160)}px`
          }}
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault()
              submit()
            }
          }}
        />
        {sending ? (
          <IconButton
            icon="square"
            iconSize={16}
            aria-label={t('composer.stop')}
            onClick={onAbort}
          />
        ) : (
          <IconButton
            icon="send-horizontal"
            iconSize={16}
            aria-label={t('composer.send')}
            onClick={submit}
            disabled={!text.trim() && pending.length === 0}
          />
        )}
      </div>
    </div>
  )
}

export default Composer
