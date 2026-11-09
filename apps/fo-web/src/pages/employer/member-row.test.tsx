import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { MemberRow } from './member-row'

describe('MemberRow', () => {
  it('puts 관리자 넘기기 as a button before 내보내기, like WebBizMembersTransfer', () => {
    const html = renderToStaticMarkup(
      <MemberRow name="한지호" email="jiho.han@moapay.kr" roleLabel="담당자" admin={false} self={false} busy={false} onRemove={() => undefined} onTransfer={() => undefined} />,
    )
    expect(html).not.toContain('member-more')
    expect(html.indexOf('>관리자 넘기기</button>')).toBeGreaterThan(-1)
    expect(html.indexOf('>관리자 넘기기</button>')).toBeLessThan(html.indexOf('>내보내기</button>'))
  })
})
