import { router } from 'expo-router'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { ActivityIndicator, Platform, Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { JOB_CATEGORIES } from '@push/api-client'
import { useStartChat } from '@/features/chat'
import { ApplySheet } from '@/features/jobs'
import {
  Avatar,
  careerPeriod,
  ConfirmSheet,
  FitRing,
  FIX_DOC,
  hubProfile,
  pushCardLines,
  SET_BASE_COPY,
  tenureLabel,
  Toast,
  useDocument,
  useDocumentVersions,
  useMyApplications,
  useMyProfile,
  useSetBaseProfile,
  useToast,
} from '@/features/my'
import { Badge, Button, Glass, Text, TopBar } from '@/shared/components'
import { useColors } from '@/theme'

const HUB_BADGE = '지원 서류용 프로필(허브형)'

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <View style={{ paddingHorizontal: 20, gap: 8 }}>
    <Text v="h3" accessibilityRole="header">
      {title}
    </Text>
    {children}
  </View>
)

const PushDocScreen = ({ id }: { id: string }) => {
  const c = useColors()
  const insets = useSafeAreaInsets()
  const doc = useDocument(id)
  const versions = useDocumentVersions(id)
  const apps = useMyApplications()
  const me = useMyProfile().data
  const start = useStartChat()
  const toast = useToast()
  const [asking, setAsking] = useState(false)
  const [based, setBased] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const setBase = useSetBaseProfile(() => {
    setBased(true)
    toast.show(SET_BASE_COPY.toast)
  })
  const item = doc.data?.data
  const application = apps.data?.data.find((a) => a.id === item?.applicationId) ?? null
  const lines = item ? pushCardLines(item, application) : null
  const version = versions.data?.data[0]
  const profile = hubProfile(version?.content)
  const intro = profile.intro || (version?.blocks ?? []).map((b) => b.text).filter(Boolean).join('\n')
  const job = JOB_CATEGORIES.find((j) => j.key === me?.jobCategory)?.label ?? ''
  const jobLine = [job, tenureLabel(me?.tenureYears ?? null)].filter(Boolean).join(' · ')
  const android = Platform.OS === 'android'

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <TopBar title={application ? undefined : '지원 서류용 프로필'} onBack={() => router.back()} />
      {doc.isLoading || !item || !lines ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40, gap: 24 }}>
          {application ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${lines.company} ${lines.title} 공고 보기`}
              onPress={() => router.push(`/postings/${application.jobId}`)}
              style={{ paddingHorizontal: 20, paddingTop: 4 }}
            >
              <Glass style={{ borderRadius: 20, paddingVertical: 14, paddingLeft: 20, paddingRight: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <Text v="b1" weight="800" numberOfLines={1}>
                    {lines.title}
                    <Text v="c1" weight="600" color="t2">
                      {'  '}
                      {lines.company}
                    </Text>
                  </Text>
                  <Text v="c1" color="t2">
                    공고 보기 ›
                  </Text>
                </View>
                {lines.score ? <FitRing score={lines.score} /> : null}
              </Glass>
            </Pressable>
          ) : null}

          <View style={{ alignItems: 'center', gap: 6, paddingHorizontal: 20 }}>
            <Avatar name={me?.displayName ?? ''} url={me?.avatarUrl ?? null} size={84} />
            <Text v="h1" style={{ marginTop: 6 }}>
              {me?.displayName}
            </Text>
            {profile.headline || me?.headline ? (
              <Text v="b2" color="t2" style={{ textAlign: 'center' }}>
                {profile.headline || me?.headline}
              </Text>
            ) : null}
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
              {jobLine ? <Badge label={jobLine} tone="grey" /> : null}
              {application ? null : <Badge label={HUB_BADGE} tone="ac" />}
            </View>
            {application || based ? null : (
              <Button
                label={setBase.isPending ? '설정하는 중' : SET_BASE_COPY.action}
                size="sm"
                disabled={setBase.isPending}
                onPress={() => setAsking(true)}
                style={{ marginTop: 10 }}
              />
            )}
          </View>

          {intro ? (
            <Section title="소개">
              <Text v="b2" color="t2">
                {intro}
              </Text>
            </Section>
          ) : null}

          {profile.careers.length ? (
            <Section title="경력">
              {profile.careers.map((cr, i) => {
                const last = i === profile.careers.length - 1
                return (
                  <View key={`${cr.company}-${i}`} style={{ flexDirection: 'row', gap: 14 }}>
                    <View style={{ alignItems: 'center', paddingTop: 6 }}>
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: cr.endedOn ? c.t4 : c.ac }} />
                      {!last ? <View style={{ flex: 1, width: 2, backgroundColor: c.line, marginTop: 4 }} /> : null}
                    </View>
                    <View style={{ flex: 1, paddingBottom: last ? 0 : 12 }}>
                      <Text v="b1" weight="700">
                        {cr.company} · {cr.role}
                      </Text>
                      {cr.startedOn ? (
                        <Text v="c1" color="t3">
                          {careerPeriod({ startedOn: cr.startedOn, endedOn: cr.endedOn })}
                        </Text>
                      ) : null}
                      {cr.description ? (
                        <Text v="b2" color="t2" style={{ marginTop: 4 }}>
                          {cr.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                )
              })}
            </Section>
          ) : null}

          {profile.skills.length ? (
            <Section title="기술 스택">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {profile.skills.map((s) => (
                  <Badge key={s} label={s} tone="grey" />
                ))}
              </View>
            </Section>
          ) : null}
        </ScrollView>
      )}
      {application ? (
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            paddingTop: 14,
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + (android ? 10 : 6),
            backgroundColor: c.bg,
            borderTopWidth: android ? 1 : 0,
            borderTopColor: c.line,
          }}
        >
          <Button
            label="에이전트로 고치기"
            icon="spark"
            variant="secondary"
            onPress={() => void start(FIX_DOC, FIX_DOC, undefined, undefined, undefined, { documentId: id })}
          />
          <Button
            label={applied || application.appliedAt ? '지원 완료' : '이 공고에 지원'}
            disabled={applied || !!application.appliedAt}
            onPress={() => setApplying(true)}
            style={{ flex: 1 }}
          />
        </View>
      ) : null}
      {application ? (
        <ApplySheet
          postingId={application.jobId}
          company={application.company}
          title={application.title}
          visible={applying}
          onClose={() => setApplying(false)}
          onApplied={() => {
            setApplying(false)
            setApplied(true)
          }}
        />
      ) : null}
      <ConfirmSheet
        visible={asking}
        title={SET_BASE_COPY.title}
        body={SET_BASE_COPY.body}
        confirm={SET_BASE_COPY.confirm}
        cancel={SET_BASE_COPY.cancel}
        onConfirm={() => setBase.mutate(id)}
        onClose={() => setAsking(false)}
      />
      <Toast text={toast.text} action={toast.action} onHide={toast.hide} />
    </View>
  )
}

export default PushDocScreen
