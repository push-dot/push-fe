import { describe, expect, it, vi } from 'vitest'
import { POSTS_SUPPORT, postsMenu, postsTitle } from './posts-menu'

const on = () => ({ view: vi.fn(), sort: vi.fn() })
const titles = (s: ReturnType<typeof postsMenu>) => s.map((g) => [g.title, g.actions.map((a) => a.label)])

describe('postsMenu', () => {
  it('shows only the supported views and no sort group while one sort is all there is', () => {
    expect(titles(postsMenu({ view: 'mine', sort: 'latest' }, on()))).toEqual([['보기', ['내가 쓴 글', '댓글 단 글']]])
  })

  it('shows every choice with a check on the current ones once the server supports them', () => {
    const all = { view: { mine: true, commented: true, saved: true }, sort: { latest: true, views: true, comments: true } }
    const menu = postsMenu({ view: 'commented', sort: 'views' }, on(), all)
    expect(titles(menu)).toEqual([
      ['보기', ['내가 쓴 글', '댓글 단 글', '저장한 글']],
      ['정렬', ['최신순', '조회 많은 순', '댓글 많은 순']],
    ])
    expect(menu.flatMap((g) => g.actions.filter((a) => a.selected).map((a) => a.label))).toEqual(['댓글 단 글', '조회 많은 순'])
  })

  it('turning on one capability adds just that item', () => {
    const menu = postsMenu({ view: 'mine', sort: 'latest' }, on(), { ...POSTS_SUPPORT, view: { ...POSTS_SUPPORT.view, saved: true } })
    expect(menu[0]!.actions.map((a) => a.label)).toEqual(['내가 쓴 글', '댓글 단 글', '저장한 글'])
  })

  it('reports the picked view', () => {
    const h = on()
    postsMenu({ view: 'mine', sort: 'latest' }, h)[0]!.actions[1]!.onPress()
    expect(h.view).toHaveBeenCalledWith('commented')
  })
})

describe('postsTitle', () => {
  it('follows the chosen view', () => {
    expect(['mine', 'commented', 'saved'].map((v) => postsTitle(v as 'mine'))).toEqual(['내가 쓴 글', '댓글 단 글', '저장한 글'])
  })
})
