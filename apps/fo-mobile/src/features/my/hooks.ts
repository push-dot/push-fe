import { useCallback, useEffect, useRef, useState } from 'react'
import { useRemoveSource } from './api/hooks'
import { SHEET_SWAP_MS } from './constants'
import { deleteDocCopy } from './utils'

type ToastAction = { label: string; onPress: () => void }

export const useToast = () => {
  const [text, setText] = useState<string | null>(null)
  const [action, setAction] = useState<ToastAction | null>(null)
  const hide = useCallback(() => {
    setText(null)
    setAction(null)
  }, [])
  const show = useCallback((next: string, extra?: { action: string; onAction: () => void }) => {
    setText(next)
    setAction(extra ? { label: extra.action, onPress: extra.onAction } : null)
  }, [])
  return { text, action, show, hide }
}

export const useUndoRemove = (onRemoved?: () => void) => {
  const remove = useRemoveSource(() => onRemoved?.())
  const toast = useToast()
  const [hiddenId, setHiddenId] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )
  const [asking, setAsking] = useState<{ id: string; fileName: string } | null>(null)
  const [open, setOpen] = useState(false)
  const ask = (doc: { id: string; fileName: string }) => {
    setAsking(doc)
    setTimeout(() => setOpen(true), SHEET_SWAP_MS)
  }
  const confirm = () => {
    if (!asking) return
    const doc = asking
    const copy = deleteDocCopy(doc.fileName)
    if (timer.current) clearTimeout(timer.current)
    setHiddenId(doc.id)
    toast.show(copy.toast, {
      action: copy.undo,
      onAction: () => {
        if (timer.current) clearTimeout(timer.current)
        timer.current = null
        setHiddenId(null)
        toast.hide()
      },
    })
    timer.current = setTimeout(() => {
      timer.current = null
      remove.mutate(doc.id)
      setHiddenId(null)
    }, 2500)
  }
  return { hiddenId, ask, asking, open, confirm, cancel: () => setOpen(false), toast }
}
