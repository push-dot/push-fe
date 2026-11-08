import { LinearGradient } from 'expo-linear-gradient'
import { router, useNavigation } from 'expo-router'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, KeyboardAvoidingView, Platform, Pressable, View, type ListRenderItem, type TextInputInstance } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { radius, spacing, useColors } from '@/theme'
import { askConfirm, Glass, GlassButton, Icon, Mascot, Menu, Text, useKeyboardHeight, useReduceMotion, type MenuAction } from '@/shared/components'
import { shareMessage } from '@/shared/infrastructure'
import { usePersonalPurchase } from '@/features/billing'
import { useConvertDocument, type PickedFile } from '@/features/my'
import {
  answer,
  ApprovalPanel,
  AWAITING_TEXT,
  AwaitingRow,
  ComposerArea,
  composerPlaceholder,
  ConsentSheet,
  OPEN_DRAWER,
  DELETE_CONFIRM,
  headerMenu,
  headerCompany,
  hydrate,
  Item,
  Queued,
  Appear,
  AppearStill,
  accountPath,
  docsPath,
  fromHistory,
  materialsPath,
  quickStartPath,
  renamePath,
  send,
  StatusRow,
  stop,
  threadInset,
  useChat,
  useConversationList,
  useArchiveConversation,
  useDeleteConversation,
  usePinConversation,
  useChatStore,
  type ChatItem,
  type QuickStart,
} from '@/features/chat'

const keyOf = (item: ChatItem) => item.id
const openQuickStart = (qs: QuickStart) => router.push(quickStartPath(qs.key))
// Read at press time so the menu does not change with every streamed line.
const shareText = (id: string) =>
  (useChatStore.getState().chats[id]?.items ?? [])
    .map((i) => (i.type === 'user' ? `나: ${i.text}` : i.type === 'agentText' ? `AI: ${i.text.replace(/\*\*/g, '')}` : i.type === 'tool' ? `· ${i.action} ${i.result ?? i.error ?? ''}` : ''))
    .filter(Boolean)
    .join('\n')


const ConversationScreen = ({ id }: { id: string }) => {
  const c = useColors()
  const insets = useSafeAreaInsets()
  const reduce = useReduceMotion()
  const chat = useChat(id)
  const purchase = usePersonalPurchase()
  const convert = useConvertDocument((documentId) => {
    router.push(`/docs/push/${documentId}`)
  })
  const list = useConversationList()
  const conv = list.data?.data.find((x) => x.id === id)
  const navigation = useNavigation()
  const [sayingFor, setSayingFor] = useState<string>()
  const [bottomH, setBottomH] = useState(160)
  const [fresh, setFresh] = useState(false)
  const thread = useRef<FlatList<ChatItem>>(null)
  const atBottom = useRef(true)
  const input = useRef<TextInputInstance>(null)

  useEffect(() => {
    hydrate(id).catch(() => undefined)
  }, [id])
  const saying = !!chat.approval && sayingFor === chat.approval.id

  const { mutate: remove } = useDeleteConversation()
  const { mutate: pin } = usePinConversation()
  const { mutate: archive } = useArchiveConversation()

  const onAction = useCallback((text: string) => send(id, text), [id])
  const { mutate: convertDocument } = convert
  const onConvert = useCallback((card: { documentId: string }) => convertDocument(card.documentId), [convertDocument])
  const onView = useCallback((card: { documentId: string }) => router.push(`/docs/push/${card.documentId}`), [])
  const { buyCredits } = purchase
  const onUsage = useCallback((action: 'plan' | 'credits') => (action === 'plan' ? router.push(accountPath('plan')) : buyCredits()), [buyCredits])

  const onStop = useCallback(() => stop(id), [id])
  const onSend = useCallback((text: string, attachment?: PickedFile) => send(id, text, attachment), [id])
  const onDrawer = useCallback(() => navigation.dispatch(OPEN_DRAWER), [navigation])


  const menu = useMemo(() => headerMenu(!!conv?.pinned).map((action) => ({
    key: action.id,
    label: action.label,
    systemImage: action.systemImage,
    destructive: action.destructive,
    onPress: () => {
      if (action.id === 'rename') router.push(renamePath(id))
      else if (action.id === 'docs') router.push(docsPath())
      else if (action.id === 'share') void shareMessage({ title: conv?.title, message: shareText(id) })
      else if (action.id === 'pin' && conv) pin(conv)
      else if (action.id === 'archive' && conv) archive(conv, { onSuccess: () => router.dismissTo('/chat') })
      else if (action.id === 'delete')
        askConfirm({ ...DELETE_CONFIRM, danger: true, onConfirm: () => remove(id, { onSuccess: () => router.dismissTo('/chat') }) })
    },
  })), [conv, id, pin, archive, remove])

  const company = headerCompany(chat.items, conv?.company)
  const placeholder = composerPlaceholder(chat)
  // The keyboard lifts the composer on Android, so the nav-bar inset below it would leave a gap.
  const keyboard = useKeyboardHeight()
  const showPanel = chat.approval && !saying
  const { working, awaiting } = chat
  const above = useMemo(
    () => (working ? <StatusRow verbs={working.verbs} startedAt={working.startedAt} onStop={onStop} /> : awaiting ? <AwaitingRow text={AWAITING_TEXT[awaiting]} /> : null),
    [working, awaiting, onStop],
  )
  const awaitingResultId = chat.approval ? chat.items.findLast((i) => i.type === 'result')?.id : undefined
  const pending = convert.isPending
  // Inverted: newest first, so the thread stays bottom-anchored and grows upward without scrollToEnd.
  const rows = useMemo(() => [...chat.items].reverse(), [chat.items])
  const renderItem = useCallback<ListRenderItem<ChatItem>>(
    ({ item }) => (
      <AppearStill value={fromHistory(item)}>
        <Item item={item} onAction={onAction} onConvert={onConvert} onView={onView} resultPending={pending} resultAwaiting={item.id === awaitingResultId} onUsage={onUsage} />
      </AppearStill>
    ),
    [onAction, onConvert, onView, onUsage, pending, awaitingResultId],
  )

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <FlatList
        ref={thread}
        inverted
        data={rows}
        keyExtractor={keyOf}
        renderItem={renderItem}
        ListHeaderComponent={
          chat.queue.length ? (
            <View style={{ gap: 18 }}>
              {chat.queue.map((item, i) => (
                <Queued key={`${i}-${item.text}`} text={item.text} />
              ))}
            </View>
          ) : undefined
        }
        contentContainerStyle={{ gap: 18, paddingHorizontal: spacing[5], paddingBottom: insets.top + 64, paddingTop: threadInset({ bottomH, keyboard, navBar: insets.bottom, approval: !!showPanel, android: Platform.OS === 'android' }) }}
        onScroll={(e) => {
          atBottom.current = e.nativeEvent.contentOffset.y <= 48
          if (atBottom.current) setFresh(false)
        }}
        scrollEventThrottle={64}
        // Keep the line being read in place while new lines land below it; follow them only at the bottom (feature-spec 15.4).
        maintainVisibleContentPosition={{ minIndexForVisible: 0, autoscrollToTopThreshold: 48 }}
        onContentSizeChange={() => !atBottom.current && setFresh(true)}
        keyboardDismissMode="interactive"
      />

      <Header onDrawer={onDrawer} title={company} menu={menu} />

      <KeyboardAvoidingView behavior="padding" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
        {fresh ? (
          <Appear kind="fade" style={{ alignItems: 'center', paddingBottom: spacing[2] }}>
            <Pressable
              accessibilityRole="button"
              onPress={() => (thread.current?.scrollToOffset({ offset: 0, animated: !reduce }), setFresh(false))}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[1], height: 36, paddingHorizontal: 14, borderRadius: 18, backgroundColor: c.t1 }}
            >
              <Icon name="down" size={16} color={c.bg} />
              <Text v="c1" weight="700" style={{ color: c.bg }}>
                새 내용
              </Text>
            </Pressable>
          </Appear>
        ) : null}
        <View onLayout={(e) => setBottomH(e.nativeEvent.layout.height)}>
          {showPanel ? (
            <ApprovalPanel
              key={chat.approval!.id}
              approval={chat.approval!}
              onAnswer={(text, choice) => answer(id, text, choice)}
              onSay={() => (setSayingFor(chat.approval?.id), setTimeout(() => input.current?.focus(), 50))}
              // The picked material lands in the composer; sending it re-asks the gate with that material.
              onMaterials={() => (setSayingFor(chat.approval?.id), router.push(materialsPath()))}
            />
          ) : (
            <View style={{ paddingHorizontal: spacing[3], paddingBottom: Platform.OS === 'android' ? (keyboard ? spacing[2] : insets.bottom + spacing[2]) : Math.max(insets.bottom, 6) }}>
              <ComposerArea
                inputRef={input}
                placeholder={saying ? '어떻게 할지 말해 주세요' : placeholder}
                working={!!chat.working}
                onStop={onStop}
                onSend={onSend}
                onShortcut={openQuickStart}
                above={above}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      <ConsentSheet />
    </View>
  )
}

const Header = memo(function Header({ onDrawer, title, menu }: { onDrawer: () => void; title?: string; menu: MenuAction[] }) {
  const c = useColors()
  const insets = useSafeAreaInsets()
  const ios = Platform.OS === 'ios'
  const pill = (
    <View style={{ height: 44, minWidth: 76, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingLeft: title ? spacing[3] : 0, paddingRight: title ? spacing[4] : 0 }}>
      <Mascot size={36} />
      {title ? (
        <Text v="b2" weight="700" numberOfLines={1} style={{ flexShrink: 1 }}>
          {title}
        </Text>
      ) : null}
    </View>
  )
  const more = (
    <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="more" size={22} color="t1" />
    </View>
  )
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0 }} pointerEvents="box-none">
      {ios ? (
        <LinearGradient colors={[c.bg, c.bg, `${c.bg}00`]} locations={[0, 0.6, 1]} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: insets.top + 76 }} pointerEvents="none" />
      ) : (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: insets.top + 56, backgroundColor: c.bg }} />
      )}
      <View style={{ marginTop: insets.top, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: ios ? spacing[3] : spacing[2] }}>
        <GlassButton actions={[{ icon: 'side', label: '대화 목록 열기', onPress: onDrawer }]} />
        <View accessibilityRole="header" accessibilityLabel={title ? `Push · ${title}` : 'Push'} style={{ flex: 1, alignItems: 'center', paddingHorizontal: spacing[2] }}>
          {ios ? <Glass style={{ borderRadius: radius.pill, maxWidth: '100%' }}>{pill}</Glass> : pill}
        </View>
        <Menu accessibilityLabel="대화 더 보기" actions={menu}>
          {ios ? <Glass interactive style={{ borderRadius: radius.pill }}>{more}</Glass> : more}
        </Menu>
      </View>
    </View>
  )
})

export default ConversationScreen
