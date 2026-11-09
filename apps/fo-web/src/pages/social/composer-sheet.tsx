import { POST_CATEGORIES, type PostCategory } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'

import { COMPOSER_PROMPT, postsCreate, uploadsImage } from '../../features/compose-post'
import { Dialog } from '../../shared/ui/dialog'
import { Icon } from '../../shared/ui/icon'
import { invalidFields, type ComposeField } from './compose-fields'
import {
  COMPOSER_ACTION,
  COMPOSE_CANCEL,
  COMPOSE_CATEGORY_HINT,
  COMPOSE_ERRORS,
  COMPOSE_SUBMIT,
  POST_BODY_MAX,
  POST_IMAGE_MAX,
  POST_TITLE_MAX,
} from './constants'

const CATEGORY_OPTIONS = POST_CATEGORIES.filter((item) => item.key)

const ComposerSheet = ({ initialCategory, onClose }: { initialCategory: PostCategory | null; onClose: () => void }) => {
  const queryClient = useQueryClient()
  const fileInput = useRef<HTMLInputElement>(null)
  const [category, setCategory] = useState<PostCategory | ''>(initialCategory ?? '')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [touched, setTouched] = useState({ category: false, title: false, body: false })
  const [error, setError] = useState<string | null>(null)
  const invalid = invalidFields({ category, title, body })
  const touch = (field: ComposeField) => setTouched((current) => ({ ...current, [field]: true }))
  const create = useMutation({
    mutationFn: async () => {
      if (category === '') throw new Error('category')
      const imageKeys: string[] = []
      for (const file of files.slice(0, POST_IMAGE_MAX)) {
        const form = new FormData()
        form.set('file', file)
        const uploaded = await uploadsImage(form)
        imageKeys.push(uploaded.key)
      }
      return postsCreate({ category, title: title.trim(), body: body.trim(), imageKeys })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posts'] })
      onClose()
    },
    onError: () => setError('글을 올리지 못했어요. 잠시 후 다시 시도해 주세요.'),
  })
  const submit = () => {
    setTouched({ category: true, title: true, body: true })
    if (invalid.category || invalid.title || invalid.body) return
    setError(null)
    create.mutate()
  }
  const shown = (field: ComposeField) => touched[field] && invalid[field]
  return (
    <Dialog label={COMPOSER_ACTION} onClose={onClose} wide>
      <div className="cmp-head">
        <h2 className="h2">{COMPOSER_ACTION}</h2>
        <button type="button" className="hbtn cmp-close" aria-label="닫기" onClick={onClose}>
          <Icon name="close" size={18} width={2.4} />
        </button>
      </div>
      <label className={shown('category') ? 'field err' : 'field'}>
        카테고리
        <span className="cmp-select">
          <select value={category} aria-invalid={shown('category')} onChange={(event) => setCategory(event.target.value as PostCategory | '')} onBlur={() => touch('category')}>
            <option value="" disabled>
              {COMPOSE_CATEGORY_HINT}
            </option>
            {CATEGORY_OPTIONS.map((item) => (
              <option key={item.key} value={item.key ?? ''}>
                {item.label}
              </option>
            ))}
          </select>
          <Icon name="down" size={20} className="t3" />
        </span>
        {shown('category') ? <span className="auth-error">{COMPOSE_ERRORS.category}</span> : null}
      </label>
      <label className={shown('title') ? 'field err' : 'field'}>
        제목
        <input value={title} maxLength={POST_TITLE_MAX} aria-invalid={shown('title')} onChange={(event) => setTitle(event.target.value)} onBlur={() => touch('title')} />
        {shown('title') ? <span className="auth-error">{COMPOSE_ERRORS.title}</span> : null}
      </label>
      <label className={shown('body') ? 'field err cmp-body' : 'field cmp-body'}>
        내용
        <textarea
          value={body}
          maxLength={POST_BODY_MAX}
          placeholder={COMPOSER_PROMPT}
          aria-invalid={shown('body')}
          onChange={(event) => setBody(event.target.value)}
          onBlur={() => touch('body')}
        />
        {shown('body') ? <span className="auth-error">{COMPOSE_ERRORS.body}</span> : null}
      </label>
      {files.length > 0 ? <p className="c1 t3">{files.map((file) => file.name).join(', ')}</p> : null}
      {error ? <p className="auth-error">{error}</p> : null}
      <div className="cmp-foot">
        <input
          ref={fileInput}
          type="file"
          className="file-input"
          accept="image/*"
          multiple
          tabIndex={-1}
          onChange={(event) => {
            const picked = [...(event.target.files ?? [])]
            setFiles(picked.slice(0, POST_IMAGE_MAX))
            setError(picked.length > POST_IMAGE_MAX ? `이미지는 ${POST_IMAGE_MAX}장까지 올릴 수 있어요.` : null)
          }}
        />
        <button type="button" className="hbtn cmp-image" aria-label="사진 추가" onClick={() => fileInput.current?.click()}>
          <Icon name="image" size={20} />
        </button>
        <span className="c1 t3 num cmp-count">{`${body.length.toLocaleString()}/${POST_BODY_MAX.toLocaleString()}`}</span>
        <button type="button" className="btn sec" onClick={onClose}>
          {COMPOSE_CANCEL}
        </button>
        <button type="button" className="btn pri" disabled={create.isPending} onClick={submit}>
          {COMPOSE_SUBMIT}
        </button>
      </div>
    </Dialog>
  )
}

export default ComposerSheet
