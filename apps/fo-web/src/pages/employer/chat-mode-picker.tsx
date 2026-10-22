import type { AccessMode } from '@push/api-client'
import { ACCESS_MODE_GROUP, ACCESS_MODES } from './constants'

const ChatModePicker = ({ value, onChange }: { value: AccessMode; onChange: (mode: AccessMode) => void }) => (
  <div className="chat-modes">
    <div role="group" aria-label={ACCESS_MODE_GROUP} className="chat-mode-chips">
      {ACCESS_MODES.map((mode) => (
        <button key={mode.value} type="button" className="chip" aria-pressed={mode.value === value} onClick={() => onChange(mode.value)}>
          {mode.label}
        </button>
      ))}
    </div>
    <p className="c1 t3">{ACCESS_MODES.find((mode) => mode.value === value)?.description}</p>
  </div>
)

export default ChatModePicker
