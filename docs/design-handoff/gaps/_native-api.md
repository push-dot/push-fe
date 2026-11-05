# N0 native primitives API (push-fe PR #143, feat/native-primitives)
From `@/shared/components` (sheetOptions from `@/shared/navigation`):
- Switch { value, onValueChange, label } — iOS RN Switch, Android Material 3.
- SegmentedControl { items:{key,label}[], value, onChange } — iOS segmented, Android Material segmented buttons.
- Menu { actions: MenuAction[], accessibilityLabel, children } — tap opens (iOS pull-down / Android dropdown). Child must be a plain View (not Pressable).
- MenuAction { key, label, onPress, systemImage? (iOS), destructive?, selected? }
- ContextMenu { actions, accessibilityLabel, onPress?, preview?, children } — tap → onPress, long press → menu; preview iOS only; row must not be its own Pressable.
- DatePicker { value: Date|null, onChange, label, mode?: 'date'|'time'|'month', min?, max? } — iOS compact (month = year+month menus), Android Material dialog. Pass a default for null where it matters.
- showToast({ message, action?: {label,onPress} }) + <ToastHost/> (mounted in root; mount another inside RN Modal/pageSheet).
- Native sheet route: <Stack.Screen name="x" options={sheetOptions(colors, detents='fitToContents')}/> in src/app/_layout.tsx; wrap screen in <Sheet title? description? action?>; router.push('/x') / router.back(); long lists: detents [0.5,1] + ScrollView. Reference: 실행 방식 → /access-mode.
- Old BottomSheet still exported (X removed) until areas migrate.
- Native theme now follows the in-app light/dark setting.
