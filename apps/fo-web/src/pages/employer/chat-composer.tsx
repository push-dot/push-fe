import type { AccessMode } from '@push/api-client'
import { fileSize } from '@push/shared'
import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Icon } from '../../shared/ui/icon'
import { Popover } from '../../shared/ui/popover'
import ChatIcon, { StopIcon } from './chat-icon'
import { ATTACH_MENU, AWAITING_PLACEHOLDER, PDF_BADGE, PDF_REMOVE, PDF_UPLOAD, PICK_NONE, STOP_MESSAGE } from './chat-copy'
import { ACCESS_MODE_GROUP, ACCESS_MODES, ATTACH_LABEL, COMPOSER_LABEL, COMPOSER_PLACEHOLDER, PDF_LOCK, SEND_MESSAGE } from './constants'

export type ComposerPerson = { applicationId: string; name: string }
export type ComposerFile = { name: string; size: number }

type ChatComposerProps = {
  text: string
  sending: boolean
  awaiting: boolean
  applicationId: string
  people: ComposerPerson[]
  file: ComposerFile | null
  pdfLocked: boolean
  accessMode: AccessMode
  onAccessMode: (mode: AccessMode) => void
  onText: (value: string) => void
  onApplication: (value: string) => void
  onFile: (file: File | null) => void
  onStop: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const ChatComposer = ({
  text,
  sending,
  awaiting,
  applicationId,
  people,
  file,
  pdfLocked,
  accessMode,
  onAccessMode,
  onText,
  onApplication,
  onFile,
  onStop,
  onSubmit,
}: ChatComposerProps) => {
  const [menu, setMenu] = useState<'attach' | 'pick' | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const picked = people.find((person) => person.applicationId === applicationId)
  const ready = text.trim().length > 0 && !sending
  const close = () => setMenu(null)
  const submitOnEnter = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
  }
  return (
    <form className="chat-compose" onSubmit={onSubmit}>
      {file ? (
        <div className="chat-files">
          <span className="chat-file">
            <span className="badge red">{PDF_BADGE}</span>
            <span className="chat-file-copy">
              <span className="b2 w7">{file.name}</span>
              <span className="c2 t3">{fileSize(file.size)}</span>
            </span>
            <button type="button" className="chat-file-x t3" aria-label={PDF_REMOVE} onClick={() => onFile(null)}>
              <Icon name="close" size={16} width={2.4} />
            </button>
          </span>
        </div>
      ) : null}
      <textarea
        rows={1}
        className="b1"
        aria-label={COMPOSER_LABEL}
        placeholder={awaiting ? AWAITING_PLACEHOLDER : COMPOSER_PLACEHOLDER}
        value={text}
        onChange={(event) => onText(event.target.value)}
        onKeyDown={submitOnEnter}
      />
      <div className="chat-compose-row">
        <span className="chat-pop-host">
          <button type="button" className="hbtn chat-attach" aria-label={ATTACH_MENU} aria-expanded={menu === 'attach'} onClick={() => setMenu(menu === 'attach' ? null : 'attach')}>
            <Icon name="plus" size={20} width={2.2} />
          </button>
          {menu === 'attach' ? (
            <Popover label={ATTACH_MENU} onClose={close} className="chat-pop">
              <div className="menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="mi"
                  disabled={pdfLocked}
                  onClick={() => {
                    close()
                    input.current?.click()
                  }}
                >
                  <Icon name="upload" size={20} />
                  <span className="w6">{PDF_UPLOAD}</span>
                </button>
                {pdfLocked ? <p className="c1 t3 chat-pop-note">{PDF_LOCK}</p> : null}
                <div className="hr" role="separator" />
                <p className="c1 w7 t3 chat-pop-note">{ACCESS_MODE_GROUP}</p>
                {ACCESS_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={mode.value === accessMode}
                    className="mi chat-mode"
                    onClick={() => {
                      onAccessMode(mode.value)
                      close()
                    }}
                  >
                    <span className="chat-mode-copy">
                      <span className="w6">{mode.label}</span>
                      <span className="c1 t3">{mode.description}</span>
                    </span>
                    {mode.value === accessMode ? <Icon name="check" size={18} width={2.4} className="ac" /> : null}
                  </button>
                ))}
              </div>
            </Popover>
          ) : null}
        </span>
        <input
          ref={input}
          hidden
          aria-label={PDF_UPLOAD}
          type="file"
          accept="application/pdf,.pdf"
          disabled={pdfLocked}
          onChange={(event) => {
            const next = event.target.files?.[0]
            event.target.value = ''
            if (next) onFile(next)
          }}
        />
        <span className="chat-pop-host">
          <button type="button" className={picked ? 'chip on' : 'chip'} aria-expanded={menu === 'pick'} onClick={() => setMenu(menu === 'pick' ? null : 'pick')}>
            <ChatIcon name="at" size={16} />
            {picked ? picked.name : ATTACH_LABEL}
          </button>
          {menu === 'pick' ? (
            <Popover label={ATTACH_LABEL} onClose={close} className="chat-pop">
              <div className="menu" role="menu">
                {people.map((person) => (
                  <button
                    key={person.applicationId}
                    type="button"
                    role="menuitemradio"
                    aria-checked={person.applicationId === applicationId}
                    className="mi"
                    onClick={() => {
                      onApplication(person.applicationId)
                      close()
                    }}
                  >
                    <span className="w6">{person.name}</span>
                  </button>
                ))}
                {picked ? (
                  <button
                    type="button"
                    role="menuitem"
                    className="mi t3"
                    onClick={() => {
                      onApplication('')
                      close()
                    }}
                  >
                    <span className="w6">{PICK_NONE}</span>
                  </button>
                ) : null}
              </div>
            </Popover>
          ) : null}
        </span>
        <span className="chat-compose-gap" />
        {sending ? (
          <button type="button" className="hbtn chat-send stop" aria-label={STOP_MESSAGE} onClick={onStop}>
            <StopIcon />
          </button>
        ) : (
          <button type="submit" className={ready ? 'hbtn chat-send on' : 'hbtn chat-send'} aria-label={SEND_MESSAGE} disabled={!ready}>
            <ChatIcon name="send" size={20} width={2.4} />
          </button>
        )}
      </div>
    </form>
  )
}

export default ChatComposer
