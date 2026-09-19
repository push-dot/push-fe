import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWebview } from '@tauri-apps/api/webview'
import { usePendingFiles } from './pending-files'

const MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  txt: 'text/plain',
  md: 'text/plain',
}

const fileFromBytes = (bytes: number[], path: string): File => {
  const name = path.split('/').pop() ?? 'file'
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return new File([new Uint8Array(bytes)], name, { type: MIME_BY_EXT[ext] ?? '' })
}

const subscribeTauriDrop = async (setDragging: (v: boolean) => void) =>
  getCurrentWebview().onDragDropEvent((event) => {
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
        usePendingFiles.getState().add(files)
      })()
    }
  })

const subscribeDomDrop = (setDragging: (v: boolean) => void) => {
  let depth = 0
  const hasFiles = (e: DragEvent) => e.dataTransfer?.types.includes('Files') ?? false
  const onDragEnter = (e: DragEvent) => {
    if (!hasFiles(e)) return
    e.preventDefault()
    depth += 1
    setDragging(true)
  }
  const onDragOver = (e: DragEvent) => {
    e.preventDefault()
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
    e.preventDefault()
    depth = 0
    setDragging(false)
    if (!hasFiles(e)) return
    usePendingFiles.getState().add(Array.from(e.dataTransfer?.files ?? []))
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
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const offDom = subscribeDomDrop(setDragging)
    let offTauri: (() => void) | undefined
    if ('__TAURI_INTERNALS__' in window) {
      void subscribeTauriDrop(setDragging).then((unlisten) => {
        offTauri = unlisten
      })
    }
    return () => {
      offDom()
      offTauri?.()
    }
  }, [])

  return dragging
}
