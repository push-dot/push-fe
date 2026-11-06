import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Keyboard, useWindowDimensions } from 'react-native'
import { FILTER_KEYS, FilterSheetBody, LONG_FILTER_KINDS, formatCount, useJobListStore, usePostingCount, type FilterKey } from '@/features/jobs'
import { useTrending } from '@/features/search'
import { Sheet } from '@/shared/components'

// Grabber, header row, CTA and the sheet's own top and bottom margins: the list scrolls in what is left.
const SHEET_CHROME = 282

const useKeyboardHeight = () => {
  const [height, setHeight] = useState(0)
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => setHeight(e.endCoordinates.height))
    const hide = Keyboard.addListener('keyboardDidHide', () => setHeight(0))
    return () => {
      show.remove()
      hide.remove()
    }
  }, [])
  return height
}

const kindOf = (value: string | string[] | undefined) => {
  const kind = Array.isArray(value) ? value[0] : value
  return FILTER_KEYS.includes(kind as FilterKey) ? (kind as FilterKey) : null
}

const JobFilterSheetScreen = () => {
  const params = useLocalSearchParams<{ kind?: string }>()
  const kind = kindOf(params.kind)
  const [draft, setDraft] = useState(() => useJobListStore.getState().filters)
  const setFilters = useJobListStore((s) => s.setFilters)
  const count = usePostingCount(draft)
  const total = count.data?.page.total
  const trending = useTrending().data?.skills.map((s) => s.id) ?? []
  const screen = useWindowDimensions()
  const keyboard = useKeyboardHeight()

  useEffect(() => {
    if (!kind) router.back()
  }, [kind])

  if (!kind) return null

  return (
    <Sheet
      action={{
        label: total === undefined ? '공고 보기' : `공고 ${formatCount(total)}개 보기`,
        onPress: () => {
          setFilters(draft)
          router.back()
        },
      }}
    >
      <FilterSheetBody
        kind={kind}
        draft={draft}
        trending={trending}
        onChange={setDraft}
        scrollMax={LONG_FILTER_KINDS.includes(kind) ? screen.height - keyboard - SHEET_CHROME : undefined}
      />
    </Sheet>
  )
}

export default JobFilterSheetScreen
