import { useEffect, useRef, useState } from 'react'
import { useT } from '@/shared/i18n'
import { IconButton, showToast } from '@/shared/ui'
import { uploadSource } from '@/shared/api'
import InferenceSettings from './inference-settings'

type ComposerProps = {
  onSend: (text: string) => void
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

  const submit = () => {
    const value = text.trim()
    if (!value || sending) return
    onSend(value)
    setText('')
  }

  const onAttach = async (file: File | undefined) => {
    if (!file) return
    try {
      await uploadSource(file, 'RESUME')
      showToast(t('composer.uploaded'))
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('composer.uploadFailed'), 'circle-alert')
    }
  }

  return (
    <div className="composer-wrap" ref={wrapRef}>
      {settingsOpen ? <InferenceSettings /> : null}
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
            void onAttach(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <IconButton
          icon="sliders-horizontal"
          aria-label={t('composer.inference')}
          onClick={() => setSettingsOpen((v) => !v)}
        />
        <input
          className="composer-field"
          placeholder={t('composer.placeholder')}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) submit()
          }}
        />
        {sending ? (
          <IconButton icon="square" iconSize={16} aria-label={t('composer.stop')} onClick={onAbort} />
        ) : (
          <IconButton
            icon="send-horizontal"
            iconSize={16}
            aria-label={t('composer.send')}
            onClick={submit}
            disabled={!text.trim()}
          />
        )}
      </div>
    </div>
  )
}

export default Composer
