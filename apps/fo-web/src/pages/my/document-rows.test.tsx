import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import DocumentErrorRow from './document-error-row'
import DocumentGroup from './document-group'
import DocumentUploadingRow from './document-uploading-row'

const MB = 1_000_000

describe('document rows', () => {
  it('draws the upload in flight with its size and a cancel button', () => {
    const file = { name: '김서준_이력서_2026_11.pdf', size: 1.8 * MB } as File
    const html = renderToStaticMarkup(
      <DocumentUploadingRow file={file} onCancel={() => undefined} />,
    )
    expect(html).toContain('김서준_이력서_2026_11.pdf')
    expect(html).toContain('올리는 중 · 1.8MB')
    expect(html).toContain('doc-bar')
    expect(html).toContain('aria-label="올리기 취소"')
  })

  it('keeps a too-big file as an alert row in the list', () => {
    const html = renderToStaticMarkup(
      <DocumentErrorRow
        name="포트폴리오_전체.pdf"
        text="20MB까지 올릴 수 있어요 · 이 파일은 34.2MB예요"
        onClose={() => undefined}
      />,
    )
    expect(html).toContain('role="alert"')
    expect(html).toContain('이 파일은 34.2MB예요')
  })

  it('titles the AI group with a light note and the upload group with its count', () => {
    expect(
      renderToStaticMarkup(
        <DocumentGroup title="Push 서류" note="앱의 에이전트에서 만듦">
          x
        </DocumentGroup>,
      ),
    ).toContain('<span class="doc-group-note"> · 앱의 에이전트에서 만듦</span>')
    expect(
      renderToStaticMarkup(<DocumentGroup title="올린 파일 · 3개">x</DocumentGroup>),
    ).not.toContain('doc-group-note')
  })
})
