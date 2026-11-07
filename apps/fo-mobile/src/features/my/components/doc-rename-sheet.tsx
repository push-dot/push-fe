import { router } from 'expo-router'
import { useState } from 'react'
import { Sheet, TextField } from '@/shared/components'
import { useDocument, useRenameDocument } from '../api/hooks'

const DocRenameSheet = ({ id }: { id: string }) => {
  const doc = useDocument(id).data?.data
  const [title, setTitle] = useState<string>()
  const value = title ?? doc?.title ?? ''
  const rename = useRenameDocument(doc, () => router.back())
  return (
    <Sheet
      title="서류 이름을 바꿀까요?"
      action={{ label: '이름 바꾸기', disabled: !value.trim() || !doc || rename.isPending, onPress: () => rename.mutate(value.trim()) }}
    >
      <TextField value={value} onChangeText={setTitle} max={300} autoFocus accessibilityLabel="서류 이름" />
    </Sheet>
  )
}

export default DocRenameSheet
