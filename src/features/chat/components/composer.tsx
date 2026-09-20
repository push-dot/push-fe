import { useEffect, useRef, useState } from 'react'
import { useT } from '@/shared/i18n'
import { Icon, IconButton, showToast } from '@/shared/components'
import { importEvidence, uploadSource } from '@/features/evidence'
import type { CareerEvidence } from '@/features/evidence'
import { usePendingFiles } from '../stores'
import { InferenceSettings } from '@/features/inference'

type ComposerProps = {
  onSend: (text: string, evidence?: Pick<CareerEvidence, 'id' | 'title'>[]) => void
  onAbort?: () => void
  sending?: boolean
}

const Composer = ({ onSend, onAbort, sending = false }: ComposerProps) => {
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
      const evidence: Pick<CareerEvidence, 'id' | 'title'>[] = []
      for (const file of pending) {
        try {
          const source = await uploadSource(file, 'RESUME')
          const ev = await importEvidence(file, source.id)
          evidence.push({ id: ev.id, title: ev.title })
          showToast(t('composer.uploaded'))
        } catch (error) {
          showToast(
            error instanceof Error ? error.message : t('composer.uploadFailed'),
            'circle-alert',
          )
          return
        }
      }
      clearFiles()
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
      {settingsOpen ? <InferenceSettings /> : null}
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
