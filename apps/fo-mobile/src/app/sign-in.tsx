import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { signIn } from '../lib/auth'
import { DEV_AUTH_TOKEN } from '../lib/config'
import { useSession } from '../lib/session'

// Placeholder layout; styled from the Claude Design "SignIn" board in a later step.
const devToken = __DEV__ ? DEV_AUTH_TOKEN : undefined

export default function SignIn() {
  const [error, setError] = useState<string | null>(null)
  const run = (provider: 'google' | 'github') =>
    signIn(provider).catch(() => setError('로그인하지 못했어요. 잠시 후 다시 시도해 주세요.'))

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 12 }}>
      <Pressable accessibilityRole="button" onPress={() => run('google')}>
        <Text>Google로 계속하기</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => run('github')}>
        <Text>GitHub로 계속하기</Text>
      </Pressable>
      {devToken ? (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            useSession.getState().set({
              accessToken: devToken,
              refreshToken: '',
              expiresIn: 0,
              user: { id: 'dev', displayName: '개발자', locale: 'ko' },
            })
          }
        >
          <Text>개발 토큰으로 들어가기</Text>
        </Pressable>
      ) : null}
      {error ? <Text accessibilityRole="alert">{error}</Text> : null}
    </View>
  )
}
