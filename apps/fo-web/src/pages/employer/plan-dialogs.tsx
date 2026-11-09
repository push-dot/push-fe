import { useState, type FormEvent, type ReactNode } from 'react'

import { topupReady } from '../../shared/model/employer-plans'
import { useBillingLedger } from '../../entities/billing'
import { Dialog } from '../../shared/ui/dialog'
import { Icon } from '../../shared/ui/icon'
import { ErrorState } from '../../shared/ui/state-block'
import {
  LEDGER_EMPTY,
  LEDGER_FAILED,
  LEDGER_LOADING,
  LEDGER_RECEIPT,
  PLAN_BUY,
  PLAN_BUY_PACK_HINT,
  PLAN_BUY_PACKS,
  PLAN_BUY_TITLE,
  PLAN_CANCEL,
  PLAN_CLOSE,
  PLAN_HISTORY,
  buyTotal,
  ledgerDate,
  ledgerPayments,
  ledgerSubtitle,
  ledgerUsd,
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
  const ledger = useBillingLedger()
  const rows = ledgerPayments(ledger.data?.data ?? [])
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
            <li key={row.id}>
              <div className="plan-ledger-copy">
                <p className="b2 w7">{row.title}</p>
                <p className="c1 t3">{ledgerDate(row.createdAt)}</p>
              </div>
              <span className="b2 w7 num">{ledgerUsd(row.amountUsd)}</span>
              {row.receiptUrl ? (
                <a className="c1 w6 ac plan-receipt" href={row.receiptUrl} target="_blank" rel="noreferrer">
                  {LEDGER_RECEIPT}
                  <Icon name="ext" size={14} />
                </a>
              ) : null}
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

export const BuyDialog = ({ pending, error, onSubmit, onClose }: { pending: boolean; error: string | null; onSubmit: (packs: number) => void; onClose: () => void }) => {
  const [packsText, setPacksText] = useState('1')
  const packs = Number(packsText)
  const ready = topupReady(packs)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (ready && !pending) onSubmit(packs)
  }
  return (
    <Dialog label={PLAN_BUY_TITLE} onClose={onClose} className="plan-dialog">
      <DialogHead title={PLAN_BUY_TITLE} subtitle={PLAN_BUY_PACK_HINT} onClose={onClose} />
      <form className="plan-buy-form" onSubmit={submit}>
        <label className="field">
          <span>{PLAN_BUY_PACKS}</span>
          <input type="number" inputMode="numeric" min={1} max={20} step={1} value={packsText} onChange={(event) => setPacksText(event.target.value)} />
        </label>
        {ready ? <p className="b2 t2 num">{buyTotal(packs)}</p> : null}
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="sheet-actions">
          <button type="button" className="btn sec" onClick={onClose}>
            {PLAN_CANCEL}
          </button>
          <button type="submit" className="btn pri" disabled={!ready || pending}>
            {PLAN_BUY}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
