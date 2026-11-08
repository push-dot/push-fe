import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { Button, Icon, Sheet, showToast, Text, TextField } from '@/shared/components'
import { hitSlopTo, spacing } from '@/theme'
import { useDocument, useRenameDocument } from '../api/hooks'
import { clipTitle, DOC_RENAME_COPY, DOC_TITLE_MAX, renamedTitle, titleLength } from '../utils'

const CLEAR_SIZE = 24

const DocRenameSheet = ({ id }: { id: string }) => {
  const doc = useDocument(id).data?.data
  const [typed, setTyped] = useState<string>()
  const value = typed ?? doc?.title ?? ''
  const rename = useRenameDocument(doc)
  const save = () => {
    if (!doc || rename.isPending) return
    const next = renamedTitle(doc.title, value)
    if (!next) return router.back()
    rename.mutate(next, {
      onSuccess: () => router.back(),
      onError: () => showToast({ message: DOC_RENAME_COPY.failed, tone: 'error', opaque: true }),
    })
  }
  return (
    <Sheet title={DOC_RENAME_COPY.title} description={DOC_RENAME_COPY.description}>
      <TextField
        value={value}
        onChangeText={(t) => setTyped(clipTitle(t))}
        placeholder={DOC_RENAME_COPY.placeholder}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={save}
        accessibilityLabel={DOC_RENAME_COPY.title}
        trailing={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
            {value ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={DOC_RENAME_COPY.clear}
                hitSlop={hitSlopTo(CLEAR_SIZE, CLEAR_SIZE)}
                onPress={() => setTyped('')}
                style={{ width: CLEAR_SIZE, height: CLEAR_SIZE, alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon name="x" size={16} color="t3" />
              </Pressable>
            ) : null}
            <Text v="c1" color="t3">
              {titleLength(value)}/{DOC_TITLE_MAX}
            </Text>
          </View>
        }
      />
      <View style={{ flexDirection: 'row', gap: spacing[2] }}>
        <Button label={DOC_RENAME_COPY.cancel} variant="secondary" onPress={() => router.back()} style={{ flex: 1 }} />
        <Button label={DOC_RENAME_COPY.save} disabled={!doc || !value.trim() || rename.isPending} onPress={save} style={{ flex: 1 }} />
      </View>
    </Sheet>
  )
}

export default DocRenameSheet
