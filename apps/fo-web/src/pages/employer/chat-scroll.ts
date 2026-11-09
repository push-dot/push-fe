import { useLayoutEffect, useRef, type RefObject } from 'react'

const SLACK = 80

/** Whether the reader is at the newest message (or within a short reach of it). */
export const nearBottom = (box: { scrollHeight: number; scrollTop: number; clientHeight: number }) =>
  box.scrollHeight - box.scrollTop - box.clientHeight <= SLACK

/**
 * Keeps the message area on the newest message as the thread grows, and on opening a conversation.
 * A reader who scrolled up stays where they are until they come back to the bottom.
 */
export const useStickToBottom = (box: RefObject<HTMLElement | null>, key: string | undefined) => {
  const stuck = useRef(true)
  useLayoutEffect(() => {
    stuck.current = true
  }, [key])
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const onScroll = () => {
      stuck.current = nearBottom(el)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [box])
  // Every render: the thread grows while a turn streams, not only when the item count changes.
  useLayoutEffect(() => {
    const el = box.current
    if (el && stuck.current) el.scrollTop = el.scrollHeight
  })
}
