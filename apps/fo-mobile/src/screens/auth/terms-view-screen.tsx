import { ScrollView, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { LegalDocument, TERMS_AGREE, TERM_DOCUMENTS, isTermKey, useTermsConsent } from '@/features/auth'
import { Button, CtaBar, TopBar } from '@/shared/components'
import { spacing, useColors } from '@/theme'

const CTA_CLEARANCE = 120

const TermsViewScreen = () => {
  const c = useColors()
  const { term } = useLocalSearchParams<{ term?: string }>()
  const agree = useTermsConsent((state) => state.agree)
  if (!isTermKey(term))
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <TopBar onBack={() => router.back()} />
      </View>
    )

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <TopBar onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing[6], paddingTop: spacing[2], paddingBottom: CTA_CLEARANCE, gap: spacing[6] }}>
        <LegalDocument document={TERM_DOCUMENTS[term]} />
      </ScrollView>
      <CtaBar>
        <Button
          label={TERMS_AGREE}
          onPress={() => {
            agree(term)
            router.back()
          }}
          style={{ flex: 1 }}
        />
      </CtaBar>
    </View>
  )
}

export default TermsViewScreen
