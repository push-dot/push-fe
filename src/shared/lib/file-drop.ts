import { useEffect, useState } from 'react'
import { useT } from '@/shared/i18n'
import { showToast } from '@/shared/ui'
import { uploadSource } from '@/shared/api'
import type { MsgKey } from '@/shared/i18n'

type T = (key: MsgKey) => string

const MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  txt: 'text/plain',
  md: 'text/plain',
}

const uploadFiles = async (files: File[], t: T) => {
  for (const file of files) {
    try {
      await uploadSource(file, 'RESUME')
      showToast(t('composer.uploaded'))
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('composer.uploadFailed'), 'circle-alert')
    }
  }
}

const fileFromBytes = (bytes: number[], path: string): File => {
  const name = path.split('/').pop() ?? 'file'
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return new File([new Uint8Array(bytes)], name, { type: MIME_BY_EXT[ext] ?? '' })
}

const subscribeTauriDrop = (setDragging: (v: boolean) => void, t: T) => {
  let unlisten: (() => void) | undefined
  void (async () => {
    const { getCurrentWebview } = await import('@tauri-apps/api/webview')
    const { invoke } = await import('@tauri-apps/api/core')
    unlisten = await getCurrentWebview().onDragDropEvent((event) => {
      const p = event.payload
      if (p.type === 'enter' || p.type === 'over') {
        setDragging(true)
      } else if (p.type === 'leave') {
        setDragging(false)
      } else if (p.type === 'drop') {
        setDragging(false)
        void (async () => {
          const files = await Promise.all(
            p.paths.map(async (path) =>
              fileFromBytes(await invoke<number[]>('read_dropped_file', { path }), path),
            ),
          )
          await uploadFiles(files, t)
        })()
      }
    })
  })()
  return () => unlisten?.()
}

const subscribeDomDrop = (setDragging: (v: boolean) => void, t: T) => {
  let depth = 0
  const hasFiles = (e: DragEvent) => e.dataTransfer?.types.includes('Files') ?? false
  const onDragEnter = (e: DragEvent) => {
    if (!hasFiles(e)) return
    e.preventDefault()
    depth += 1
    setDragging(true)
  }
  const onDragOver = (e: DragEvent) => {
    if (hasFiles(e)) e.preventDefault()
  }
  const onDragLeave = (e: DragEvent) => {
    if (!hasFiles(e)) return
    depth -= 1
    if (depth <= 0) {
      depth = 0
      setDragging(false)
    }
  }
  const onDrop = (e: DragEvent) => {
    if (!hasFiles(e)) return
    e.preventDefault()
    depth = 0
    setDragging(false)
    void uploadFiles(Array.from(e.dataTransfer?.files ?? []), t)
  }
  window.addEventListener('dragenter', onDragEnter)
  window.addEventListener('dragover', onDragOver)
  window.addEventListener('dragleave', onDragLeave)
  window.addEventListener('drop', onDrop)
  return () => {
    window.removeEventListener('dragenter', onDragEnter)
    window.removeEventListener('dragover', onDragOver)
    window.removeEventListener('dragleave', onDragLeave)
    window.removeEventListener('drop', onDrop)
  }
}

export const useFileDrop = () => {
  const t = useT()
  const [dragging, setDragging] = useState(false)

  useEffect(
    () =>
      '__TAURI_INTERNALS__' in window ? subscribeTauriDrop(setDragging, t) : subscribeDomDrop(setDragging, t),
    [t],
  )

  return dragging
}
