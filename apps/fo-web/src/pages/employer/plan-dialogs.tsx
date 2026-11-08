import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent, type ReactNode } from 'react'

import { topupReady } from '../../shared/model/employer-plans'
import { api } from '../../shared/api/client'
import { Dialog } from '../../shared/ui/dialog'
import { Icon } from '../../shared/ui/icon'
import { ErrorState } from '../../shared/ui/state-block'
import {
  LEDGER_EMPTY,
  LEDGER_FAILED,
  LEDGER_LOADING,
  LEDGER_TYPE,
  PLAN_BUY,
  PLAN_BUY_AMOUNT,
  PLAN_BUY_TITLE,
  PLAN_CANCEL,
  PLAN_CLOSE,
  PLAN_HISTORY,
  ledgerAmount,
  ledgerBalance,
  ledgerDate,
  ledgerSubtitle,
} from './constants'

const DialogHead = ({ title, subtitle, onClose }: { title: string; subtitle?: ReactNode; onClose: () => void }) => (
  <div className="plan-dialog-head">
    <div>
      <h2 className="h2">{title}</h2>
      {subtitle ? <p className="b2 t3">{subtitle}</p> : null}
    </div>
    <button type="button" className="hbtn plan-close" aria-label={PLAN_CLOSE} onClick={onClose}>
      <Icon name="close" size={18} width={2.4} />
    </button>
  </div>
)

export const LedgerDialog = ({ company, onClose }: { company: string; onClose: () => void }) => {
  const ledger = useQuery({ queryKey: ['billing', 'ledger'], queryFn: () => api.billing.ledger() })
  const rows = ledger.data?.data ?? []
  return (
    <Dialog label={PLAN_HISTORY} onClose={onClose} wide className="plan-dialog">
      <DialogHead title={PLAN_HISTORY} subtitle={ledger.isSuccess && rows.length > 0 ? ledgerSubtitle(company, rows.length) : undefined} onClose={onClose} />
      {ledger.isError ? (
        <ErrorState title={LEDGER_FAILED} onRetry={() => void ledger.refetch()} />
      ) : ledger.isPending ? (
        <p className="b2 t3">{LEDGER_LOADING}</p>
      ) : rows.length === 0 ? (
        <p className="b2 t3">{LEDGER_EMPTY}</p>
      ) : (
        <ul className="plan-ledger">
          {rows.map((row) => (
            <li key={`${row.createdAt}-${row.type}`}>
              <div className="plan-ledger-copy">
                <p className="b2 w7">{LEDGER_TYPE[row.type]}</p>
                <p className="c1 t3">{`${ledgerDate(row.createdAt)} · ${ledgerBalance(row.balanceAfter)}`}</p>
              </div>
              <span className="b2 w7 num">{ledgerAmount(row.type, row.amountMicroCredits)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="sheet-actions">
        <button type="button" className="btn sec" onClick={onClose}>
          {PLAN_CLOSE}
        </button>
      </div>
    </Dialog>
  )
}

export const BuyDialog = ({ pending, error, onSubmit, onClose }: { pending: boolean; error: string | null; onSubmit: (amount: number) => void; onClose: () => void }) => {
  const [amountText, setAmountText] = useState('')
  const amount = Number(amountText)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (topupReady(amount) && !pending) onSubmit(amount)
  }
  return (
    <Dialog label={PLAN_BUY_TITLE} onClose={onClose} className="plan-dialog">
      <DialogHead title={PLAN_BUY_TITLE} onClose={onClose} />
      <form className="plan-buy-form" onSubmit={submit}>
        <label className="field">
          <span>{PLAN_BUY_AMOUNT}</span>
          <input type="number" inputMode="decimal" value={amountText} onChange={(event) => setAmountText(event.target.value)} />
        </label>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="sheet-actions">
          <button type="button" className="btn sec" onClick={onClose}>
            {PLAN_CANCEL}
          </button>
          <button type="submit" className="btn pri" disabled={!topupReady(amount) || pending}>
            {PLAN_BUY}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
