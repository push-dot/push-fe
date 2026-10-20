import { POST_CATEGORIES, type PostCategory } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../api'
import { POST_BODY_MAX, POST_IMAGE_MAX, POST_TITLE_MAX } from './constants'

const ComposerSheet = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient()
  const [category, setCategory] = useState<PostCategory | ''>('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const ready = category !== '' && title.trim().length >= 1 && title.trim().length <= POST_TITLE_MAX && body.trim().length >= 1 && body.trim().length <= POST_BODY_MAX
  const create = useMutation({
    mutationFn: async () => {
      if (category === '') throw new Error('category')
      const imageKeys: string[] = []
      for (const file of files.slice(0, POST_IMAGE_MAX)) {
        const form = new FormData()
        form.set('file', file)
        const uploaded = await api.uploads.image(form)
        imageKeys.push(uploaded.key)
      }
      return api.posts.create({ category, title: title.trim(), body: body.trim(), imageKeys })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posts'] })
      onClose()
    },
    onError: () => setError('글을 올리지 못했어요. 잠시 후 다시 시도해 주세요.'),
  })
  return (
    <div className="sheet-scrim" role="presentation" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="새 글" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-head">
          <h2 className="h3">새 글</h2>
          <button type="button" className="text-link" onClick={onClose}>
            닫기
          </button>
        </div>
        <div className="sheet-chips">
          {POST_CATEGORIES.filter((item) => item.key).map((item) => (
            <button key={item.key} type="button" className="chip" aria-pressed={category === item.key} onClick={() => setCategory(item.key ?? '')}>
              {item.label}
            </button>
          ))}
        </div>
        <label className="field">
          제목
          <input value={title} maxLength={POST_TITLE_MAX} onChange={(event) => setTitle(event.target.value)} />
          <span className="c1 t3">{`${title.length} / ${POST_TITLE_MAX}`}</span>
        </label>
        <label className="field">
          본문
          <textarea value={body} maxLength={POST_BODY_MAX} rows={6} onChange={(event) => setBody(event.target.value)} />
          <span className="c1 t3">{`${body.length} / ${POST_BODY_MAX}`}</span>
        </label>
        <label className="field">
          이미지
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              const picked = [...(event.target.files ?? [])]
              setFiles(picked.slice(0, POST_IMAGE_MAX))
              if (picked.length > POST_IMAGE_MAX) setError('이미지는 4장까지 올릴 수 있어요.')
              else setError(null)
            }}
          />
        </label>
        {files.length > 0 ? <p className="c1 t3">{files.map((file) => file.name).join(', ')}</p> : null}
        {error ? <p className="auth-error">{error}</p> : null}
        <button type="button" className="primary" disabled={!ready || create.isPending} onClick={() => create.mutate()}>
          올리기
        </button>
      </div>
    </div>
  )
}

export default ComposerSheet
