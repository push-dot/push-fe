import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { api } from '@/shared/api'
import {
  Button,
  CanvasHeader,
  ErrorState,
  Icon,
  SkeletonRows,
  showToast,
} from '@/shared/components'
import { useDocument } from '@/features/documents'

const DocEditorPage = () => {
  const { id = '' } = useParams()
  const { data, isPending, isError, error, refetch } = useDocument(id)
  const current = data?.document ?? null
  const currentVersion = data?.version ?? null
  const [exporting, setExporting] = useState<'PDF' | 'DOCX' | null>(null)

  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: { attributes: { class: 'editor-body' } },
  })

  useEffect(() => {
    if (editor && currentVersion) {
      editor.commands.setContent(currentVersion.content)
    }
  }, [editor, currentVersion])

  const exportAs = async (format: 'PDF' | 'DOCX') => {
    if (!current || !currentVersion) return
    setExporting(format)
    try {
      const resp = await api.get(
        `documents/${current.id}/versions/${currentVersion.id}/export`,
        { searchParams: { format } },
      )
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${current.title}.${format.toLowerCase()}`
      a.click()
      URL.revokeObjectURL(url)
      showToast(`${format} 파일을 저장했어요`, 'file-down')
    } catch (error) {
      showToast(error instanceof Error ? error.message : '출력하지 못했어요', 'circle-alert')
    } finally {
      setExporting(null)
    }
  }

  return (
    <>
      <CanvasHeader
        title={current?.title ?? '문서'}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={!currentVersion}
              loading={exporting === 'DOCX'}
              onClick={() => void exportAs('DOCX')}
            >
              <Icon name="file-down" size={20} /> DOCX
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!currentVersion}
              loading={exporting === 'PDF'}
              onClick={() => void exportAs('PDF')}
            >
              <Icon name="file-down" size={20} /> PDF
            </Button>
          </>
        }
      />
      {isError ? (
        <div className="canvas-body">
          <ErrorState message={error?.message} onRetry={() => void refetch()} />
        </div>
      ) : (
        <div className="editor">
          {isPending ? (
            <div className="editor-body">
              <SkeletonRows count={6} height={20} />
            </div>
          ) : (
            <EditorContent editor={editor} />
          )}
        </div>
      )}
    </>
  )
}

export default DocEditorPage
