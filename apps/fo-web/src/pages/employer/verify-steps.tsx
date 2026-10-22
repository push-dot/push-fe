import { STEP_ACCOUNT, STEP_START, STEP_VERIFY } from './constants'

const STEPS = [STEP_ACCOUNT, STEP_VERIFY, STEP_START]

const VerifySteps = ({ current }: { current: 1 | 2 | 3 }) => (
  <div className="auth-steps">
    {STEPS.map((label, index) => {
      const number = index + 1
      const state = number < current ? 'done' : number === current ? 'now' : 'later'
      return (
        <div key={label} className={`auth-step ${state}`}>
          {index > 0 ? <span className="auth-step-line" aria-hidden="true" /> : null}
          <span className="auth-step-dot" aria-hidden="true">
            {state === 'done' ? (
              <svg viewBox="0 0 24 24">
                <path d="M5 12l5 5L20 7" />
              </svg>
            ) : (
              number
            )}
          </span>
          <span>{label}</span>
        </div>
      )
    })}
  </div>
)

export default VerifySteps
