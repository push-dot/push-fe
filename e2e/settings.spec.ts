import { expect, test } from '@playwright/test'
import { authedPage } from './fixtures'

test('dark theme applies globally and persists', async ({ page }) => {
  await authedPage(page, '/settings')
  await page.locator('select[aria-label="테마"]').selectOption('dark')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.locator('select[aria-label="테마"]').selectOption('light')
})

test('settings shows current plan with upgrade button to plan page', async ({ page }) => {
  await authedPage(page, '/settings')
  await page.getByRole('button', { name: '업그레이드' }).click()
  await page.waitForURL('/settings/plan')
  await expect(page.locator('.plan-card')).toHaveCount(3)
  await expect(page.locator('.plan-card').nth(1)).toContainText('$9')
  await expect(page.locator('.plan-card').nth(2)).toContainText('$29')
})

test('byok credentials live in settings, not chat popover', async ({ page }) => {
  await authedPage(page, '/settings')
  await page.locator('select[aria-label="자격 증명"]').selectOption('BYOK')
  await expect(page.locator('select[aria-label="BYOK 프로바이더"]')).toBeVisible()
  await page.goto('/')
  await page.getByRole('button', { name: '추론 설정' }).click()
  await expect(
    page.locator('.inference-popover').getByText('자격 증명'),
  ).toHaveCount(0)
})
