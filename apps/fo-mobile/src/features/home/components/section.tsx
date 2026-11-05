import { router } from 'expo-router'
import { FlatList, Pressable, View } from 'react-native'
import type { Posting } from '@push/api-client'
import type { SectionKind } from '@/features/jobs'
import { Button, Icon, JobCard, Text } from '../../../shared/components'
import { radius, space, useColors } from '../../../theme'
import { useHomePostings } from '../api/hooks'
import { SECTION_ERROR_LINES, SECTION_RETRY_LABEL } from '../constants'
import SectionSkeleton from './section-skeleton'

const Section = ({ kind, title, onBookmark }: { kind: SectionKind; title: string; onBookmark: (posting: Posting) => void }) => {
  const c = useColors()
  const q = useHomePostings(kind)
  const items = q.data?.data ?? []
  if (q.isSuccess && !items.length) return null
  if (q.isPending) return <SectionSkeleton />
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: space[5], paddingTop: space[6], paddingBottom: space[3] }}>
        <Text v="h2" accessibilityRole="header" style={{ flex: 1 }}>
          {title}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${title} 전체보기`}
          onPress={() => router.push(`/section/${kind}`)}
          hitSlop={14}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Text v="c1" weight="600" color="t3">
            전체보기
          </Text>
          <Icon name="chev" size={14} color="t3" />
        </Pressable>
      </View>
      {q.isError ? (
        <View style={{ marginHorizontal: space[5], borderRadius: radius.lg, backgroundColor: c.bg2, alignItems: 'center', padding: space[6], gap: space[3] }}>
          <View>
            {SECTION_ERROR_LINES.map((line) => (
              <Text key={line} v="b2" color="t3" style={{ textAlign: 'center' }}>
                {line}
              </Text>
            ))}
          </View>
          <Button label={SECTION_RETRY_LABEL} variant="secondary" size="sm" onPress={() => q.refetch()} />
        </View>
      ) : (
        <FlatList
          horizontal
          data={items}
          keyExtractor={(p) => p.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 14, paddingHorizontal: space[5] }}
          renderItem={({ item }) => (
            <JobCard posting={item} onPress={() => router.push(`/postings/${item.id}`)} onBookmark={() => onBookmark(item)} />
          )}
        />
      )}
    </View>
  )
}

export default Section
