import { test, expect } from '@playwright/test'
import { authedPage } from './fixtures'

test.setTimeout(120_000)

test('stop button aborts an in-flight stream', async ({ page }) => {
  await authedPage(page, '/')
  await page.locator('button.sidebar-item', { hasText: '새 채팅' }).click()
  await page.waitForURL(/\/chat\//)

  await page.locator('.composer-field').fill('아주 긴 이야기를 들려줘. 최대한 길게.')
  await page.getByRole('button', { name: '보내기' }).click()

  const stop = page.getByRole('button', { name: '응답 중단' })
  await expect(stop).toBeVisible({ timeout: 60_000 })
  await stop.click()

  await expect(stop).toBeHidden({ timeout: 10_000 })
  await expect(page.locator('.chat-stream-msg-live')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '보내기' })).toBeVisible()
})
