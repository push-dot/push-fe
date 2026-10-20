import { expect, test } from '@playwright/test'
import { authedPage } from './fixtures'

test('new chat sends message and streams a reply', async ({ page }) => {
  await authedPage(page)
  await page.getByText('새 채팅').first().click()
  await page.waitForURL(/\/chat\//)
  await page.fill('.composer-field', '안녕')
  await page.getByRole('button', { name: '보내기' }).click()
  await expect(page.locator('.chat-stream-msg-user').first()).toContainText('안녕')
  await expect(page.locator('.chat-stream-msg-ai').last()).not.toBeEmpty({ timeout: 45_000 })
})

test('inference popover groups models by provider', async ({ page }) => {
  await authedPage(page)
  await page.getByRole('button', { name: '추론 설정' }).click()
  const groups = page.locator('.inference-popover select optgroup')
  expect(await groups.count()).toBeGreaterThanOrEqual(1)
})
