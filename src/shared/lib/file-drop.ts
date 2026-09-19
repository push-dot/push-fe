import { useEffect, useState } from 'react'
import { useT } from '@/shared/i18n'
import { showToast } from '@/shared/ui'
import { uploadSource } from '@/shared/api'

export const useFileDrop = () => {
  const t = useT()
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
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
      const files = Array.from(e.dataTransfer?.files ?? [])
      void (async () => {
        for (const file of files) {
          try {
            await uploadSource(file, 'RESUME')
            showToast(t('composer.uploaded'))
          } catch (error) {
            showToast(
              error instanceof Error ? error.message : t('composer.uploadFailed'),
              'circle-alert',
            )
          }
        }
      })()
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
  }, [t])

  return dragging
}
