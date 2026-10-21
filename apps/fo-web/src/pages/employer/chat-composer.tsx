import type { FormEvent } from 'react'
import { APPLICANT_NONE, ATTACH_LABEL, COMPOSER_LABEL, COMPOSER_PLACEHOLDER, PDF_ATTACH, PDF_LOCK, SEND_MESSAGE } from './constants'

type Person = { applicationId: string; name: string }

type ChatComposerProps = {
  text: string
  sending: boolean
  applicationId: string
  people: Person[]
  applicantName: string | null
  pdfDisabled: boolean
  showPdfNote: boolean
  onText: (value: string) => void
  onApplication: (value: string) => void
  onFile: (file: File) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

const ChatComposer = ({
  text,
  sending,
  applicationId,
  people,
  applicantName,
  pdfDisabled,
  showPdfNote,
  onText,
  onApplication,
  onFile,
  onSubmit,
}: ChatComposerProps) => (
  <form className="chat-compose" onSubmit={onSubmit}>
    <textarea rows={2} aria-label={COMPOSER_LABEL} placeholder={COMPOSER_PLACEHOLDER} value={text} onChange={(event) => onText(event.target.value)} />
    <div className="chat-compose-row">
      <label>
        <span className="c1 t3">{ATTACH_LABEL}</span>
        <select aria-label={ATTACH_LABEL} value={applicationId} onChange={(event) => onApplication(event.target.value)}>
          <option value="">{APPLICANT_NONE}</option>
          {people.map((person) => (
            <option key={person.applicationId} value={person.applicationId}>
              {person.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="c1 t3">{PDF_ATTACH}</span>
        <input
          aria-label={PDF_ATTACH}
          type="file"
          accept="application/pdf,.pdf"
          disabled={pdfDisabled}
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) onFile(file)
          }}
        />
      </label>
      <button className="btn pri sm" type="submit" disabled={sending || text.trim().length === 0}>
        {SEND_MESSAGE}
      </button>
    </div>
    {applicantName ? <span className="chip">{applicantName}</span> : null}
    {showPdfNote ? <p className="b2 t3">{PDF_LOCK}</p> : null}
  </form>
)

export default ChatComposer
