import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import {
  CHAT_ROW_HEIGHT_ESTIMATE,
  CHAT_VIRTUAL_MIN_ROWS,
  CHAT_VIRTUAL_OVERSCAN_PX,
} from './constants'

type Anchor = { id: string; delta: number }

type VirtualRowsArgs = {
  count: number
  keyAt: (index: number) => string
  listRef: RefObject<HTMLDivElement | null>
  pinnedRef: RefObject<boolean>
}

export type VirtualRows = {
  active: boolean
  start: number
  end: number
  topPad: number
  bottomPad: number
  rowRef: (id: string) => (el: HTMLDivElement | null) => void
  syncFromScroll: () => void
}

export const useVirtualRows = ({
  count,
  keyAt,
  listRef,
  pinnedRef,
}: VirtualRowsArgs): VirtualRows => {
  const active = count > CHAT_VIRTUAL_MIN_ROWS
  const elsRef = useRef(new Map<string, HTMLDivElement>())
  const idsByElRef = useRef(new Map<HTMLDivElement, string>())
  const refCacheRef = useRef(new Map<string, (el: HTMLDivElement | null) => void>())
  const anchorRef = useRef<Anchor | null>(null)
  const roRef = useRef<ResizeObserver | null>(null)
  const [scroll, setScroll] = useState({ top: 0, height: 0 })
  const [heights, setHeights] = useState(() => new Map<string, number>())

  const measureEl = useCallback((id: string, el: HTMLDivElement) => {
    const height = el.offsetHeight
    if (height <= 0) return
    setHeights((prev) => {
      if (prev.get(id) === height) return prev
      const next = new Map(prev)
      next.set(id, height)
      return next
    })
  }, [])

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLDivElement
        const id = idsByElRef.current.get(el)
        if (id) measureEl(id, el)
      }
    })
    roRef.current = ro
    for (const el of elsRef.current.values()) ro.observe(el)
    return () => {
      ro.disconnect()
      roRef.current = null
    }
  }, [measureEl])

  const rowRef = useCallback(
    (id: string) => {
      const cached = refCacheRef.current.get(id)
      if (cached) return cached
      const ref = (el: HTMLDivElement | null) => {
        if (!el) {
          const prev = elsRef.current.get(id)
          if (prev) {
            roRef.current?.unobserve(prev)
            idsByElRef.current.delete(prev)
            elsRef.current.delete(id)
          }
          return
        }
        elsRef.current.set(id, el)
        idsByElRef.current.set(el, id)
        measureEl(id, el)
        roRef.current?.observe(el)
      }
      refCacheRef.current.set(id, ref)
      return ref
    },
    [measureEl],
  )

  const { offsets, total, indexById } = useMemo(() => {
    const offsets = new Array<number>(count)
    const indexById = new Map<string, number>()
    let acc = 0
    for (let i = 0; i < count; i++) {
      const id = keyAt(i)
      offsets[i] = acc
      indexById.set(id, i)
      acc += heights.get(id) ?? CHAT_ROW_HEIGHT_ESTIMATE
    }
    return { offsets, total: acc, indexById }
  }, [count, keyAt, heights])

  const firstVisibleAt = useCallback(
    (top: number) => {
      let lo = 0
      let hi = count - 1
      let result = 0
      while (lo <= hi) {
        const mid = (lo + hi) >> 1
        const height = heights.get(keyAt(mid)) ?? CHAT_ROW_HEIGHT_ESTIMATE
        if (offsets[mid] + height > top) {
          result = mid
          hi = mid - 1
        } else {
          lo = mid + 1
        }
      }
      return result
    },
    [count, keyAt, offsets, heights],
  )

  const captureAnchor = useCallback(() => {
    const el = listRef.current
    if (!el || !active || count === 0 || pinnedRef.current) {
      anchorRef.current = null
      return
    }
    const idx = firstVisibleAt(el.scrollTop)
    anchorRef.current = { id: keyAt(idx), delta: el.scrollTop - offsets[idx] }
  }, [listRef, active, count, pinnedRef, firstVisibleAt, keyAt, offsets])

  useLayoutEffect(() => {
    const el = listRef.current
    if (!el || !active || count === 0 || pinnedRef.current) return
    const anchor = anchorRef.current
    if (!anchor) {
      captureAnchor()
      return
    }
    const idx = indexById.get(anchor.id)
    if (idx === undefined) {
      captureAnchor()
      return
    }
    const next = offsets[idx] + anchor.delta
    if (Math.abs(el.scrollTop - next) > 0.5) {
      el.scrollTop = next
      setScroll({ top: next, height: el.clientHeight })
    }
    captureAnchor()
  }, [listRef, active, count, pinnedRef, indexById, offsets, captureAnchor])

  const syncFromScroll = useCallback(() => {
    const el = listRef.current
    if (!el) return
    setScroll((prev) => {
      if (prev.top === el.scrollTop && prev.height === el.clientHeight) return prev
      return { top: el.scrollTop, height: el.clientHeight }
    })
    captureAnchor()
  }, [listRef, captureAnchor])

  useEffect(() => {
    syncFromScroll()
  }, [syncFromScroll, count])

  return useMemo(() => {
    if (!active) {
      return {
        active,
        start: 0,
        end: count,
        topPad: 0,
        bottomPad: 0,
        rowRef,
        syncFromScroll,
      }
    }
    const viewTop = Math.max(0, scroll.top - CHAT_VIRTUAL_OVERSCAN_PX)
    const viewBottom = scroll.top + scroll.height + CHAT_VIRTUAL_OVERSCAN_PX
    const start = firstVisibleAt(viewTop)
    let end = start
    while (end < count && offsets[end] <= viewBottom) end += 1
    return {
      active,
      start,
      end,
      topPad: offsets[start],
      bottomPad: end >= count ? 0 : Math.max(0, total - offsets[end]),
      rowRef,
      syncFromScroll,
    }
  }, [active, count, scroll, offsets, total, firstVisibleAt, rowRef, syncFromScroll])
}
