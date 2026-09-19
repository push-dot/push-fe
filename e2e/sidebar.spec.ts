import { expect, test } from '@playwright/test'
import { authedPage } from './fixtures'

test('chat item context menu renames, pins, and deletes', async ({ page }) => {
  const title = `e2e ${Date.now()}`
  await authedPage(page)
  await page.getByText('새 채팅').first().click()
  await page.waitForURL(/\/chat\//)
  const item = page.locator('.sidebar-scroll .sidebar-item').nth(1)
  await item.click({ button: 'right' })
  await page.getByRole('button', { name: '이름 바꾸기' }).click()
  await page.fill('.sidebar-item-input', title)
  await page.keyboard.press('Enter')
  await expect(item).toContainText(title)
  await item.click({ button: 'right' })
  await page.getByRole('button', { name: '고정' }).click()
  await expect(item.locator('.sidebar-item-pin')).toBeVisible()
  await item.click({ button: 'right' })
  await page.getByRole('button', { name: '삭제' }).click()
  await expect(page.locator('.sidebar-item').getByText(title)).toHaveCount(0)
})

test('sidebar resizes within bounds via right-edge drag', async ({ page }) => {
  await authedPage(page)
  const sidebar = page.locator('.sidebar')
  const before = (await sidebar.boundingBox())!.width
  const resizer = page.locator('.sidebar-resizer')
  const box = (await resizer.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + 80, box.y + box.height / 2, { steps: 5 })
  await page.mouse.up()
  const after = (await sidebar.boundingBox())!.width
  expect(after).toBeGreaterThan(before)
  expect(after).toBeLessThanOrEqual(340)
  await page.mouse.move(box.x + 80, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x - 600, box.y + box.height / 2, { steps: 5 })
  await page.mouse.up()
  expect((await sidebar.boundingBox())!.width).toBeGreaterThanOrEqual(180)
})
