import { useIsFocused } from 'expo-router'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { askConfirm, showToast, type ConfirmRequest } from '@/shared/components'
import { pickDocument } from '@/shared/infrastructure'
import { useRemoveSource } from './api/hooks'
import { MAX_BYTES, RESUME_DOCUMENT_OPTIONS, SHEET_SWAP_MS, UNDO_MS } from './constants'
import type { PickedFile } from './types'
import { useDocDelete, useDocImport } from './stores'
import { createUndo, deleteDocCopy, SIZE_LIMIT } from './utils'

// A sheet only files the request; the screen under it acts on it `ms` after regaining focus, and drops it if it loses focus first.
const useSheetHandoff = <T,>(request: T | null | false, clear: () => void, fire: (request: T) => void, ms: number) => {
  const focused = useIsFocused()
  const onClear = useEffectEvent(clear)
  const onFire = useEffectEvent(fire)
  useEffect(() => {
    if (!focused || !request) return
    const timer = setTimeout(() => {
      onClear()
      onFire(request)
    }, ms)
    return () => {
      clearTimeout(timer)
      onClear()
    }
  }, [focused, request, ms])
}

export const useImportRequest = (onPick: () => void) =>
  useSheetHandoff(useDocImport((st) => st.requested), () => useDocImport.setState({ requested: false }), onPick, SHEET_SWAP_MS)

export const deleteConfirm = (doc: { fileName: string }, onConfirm: () => void): ConfirmRequest => {
  const { title, body, confirm, cancel } = deleteDocCopy(doc.fileName)
  return { title, body, confirm, cancel, danger: true, onConfirm }
}

export const useUndoRemove = (onRemoved?: () => void) => {
  const alive = useRef(true)
  const { mutate } = useRemoveSource(() => {
    if (alive.current) onRemoved?.()
  })
  const [hiddenId, setHiddenId] = useState<string | null>(null)
  const [undo] = useState(() =>
    createUndo((id) => {
      mutate(id)
      setHiddenId(null)
    }, UNDO_MS),
  )
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      undo.flush()
    }
  }, [undo])
  const confirm = (doc: { id: string; fileName: string }) => {
    const copy = deleteDocCopy(doc.fileName)
    undo.start(doc.id)
    setHiddenId(doc.id)
    showToast({
      message: copy.toast,
      action: {
        label: copy.undo,
        onPress: () => {
          undo.cancel()
          setHiddenId(null)
        },
      },
    })
  }
  const ask = (doc: { id: string; fileName: string }) => askConfirm(deleteConfirm(doc, () => confirm(doc)))
  useSheetHandoff(useDocDelete((st) => st.doc), () => useDocDelete.setState({ doc: null }), confirm, 0)
  return { hiddenId, ask }
}

export const pickResume = async (): Promise<PickedFile | null> => {
  const res = await pickDocument(RESUME_DOCUMENT_OPTIONS)
  const file = res.canceled ? null : res.assets[0]
  if (!file) return null
  if ((file.size ?? 0) > MAX_BYTES) {
    showToast({ message: SIZE_LIMIT.title, tone: 'error' })
    return null
  }
  return file
}
