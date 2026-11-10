import { useLayoutEffect, useRef, type RefObject } from 'react'

const SLACK = 80

/** Whether the reader is at the newest message (or within a short reach of it). */
export const nearBottom = (box: { scrollHeight: number; scrollTop: number; clientHeight: number }) =>
  box.scrollHeight - box.scrollTop - box.clientHeight <= SLACK

export const nearTop = (box: { scrollTop: number }) => box.scrollTop <= SLACK

/** Older pages of the conversation, loaded when the reader scrolls back to the top. */
export type OlderPages = { more: boolean; loading: boolean; load: () => void }

/** Where the reader was when older pages were asked for; `seen` once the load has started. */
type Anchor = { height: number; top: number; seen: boolean }

/** The scroll position that keeps the same message in view after content went in above it. */
export const anchoredTop = (anchor: { height: number; top: number }, height: number) =>
  anchor.top + height - anchor.height

/**
 * Keeps the message area on the newest message as the thread grows, and on opening a conversation or sending (`key`).
 * A reader who scrolled up stays where they are until they come back to the bottom; at the top, older pages load above
 * the message they were reading without moving it.
 */
export const useStickToBottom = (
  box: RefObject<HTMLElement | null>,
  key: string | undefined,
  older?: OlderPages,
) => {
  const stuck = useRef(true)
  const anchor = useRef<Anchor | null>(null)
  const pages = useRef(older)
  pages.current = older
  useLayoutEffect(() => {
    stuck.current = true
  }, [key])
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const onScroll = () => {
      stuck.current = nearBottom(el)
      const next = pages.current
      if (!next?.more || next.loading || anchor.current || !nearTop(el)) return
      anchor.current = { height: el.scrollHeight, top: el.scrollTop, seen: false }
      next.load()
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [box])
  // Every render: the thread grows while a turn streams, not only when the item count changes.
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const held = anchor.current
    if (held) {
      // Messages and jobs come back as two pages, so the anchor holds until both have landed.
      el.scrollTop = anchoredTop(held, el.scrollHeight)
      const loading = Boolean(pages.current?.loading)
      anchor.current =
        held.seen && !loading
          ? null
          : { height: el.scrollHeight, top: el.scrollTop, seen: held.seen || loading }
      return
    }
    if (stuck.current) el.scrollTop = el.scrollHeight
  })
}
