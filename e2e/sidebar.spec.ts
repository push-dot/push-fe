import { expect, test } from '@playwright/test'
import { authedPage, loginAsDev } from './fixtures'

test('nav hover prefetches the list so entry shows no skeleton', async ({ page }) => {
  let listRequests = 0
  page.on('request', (r) => {
    if (r.url().includes('/api/v1/documents') && r.method() === 'GET') listRequests += 1
  })

  await loginAsDev(page)
  const coldStart = Date.now()
  await page.goto('/documents')
  await expect(page.locator('.canvas-body')).not.toBeEmpty()
  const coldMs = Date.now() - coldStart

  await page.goto('/')
  await page.waitForSelector('.sidebar', { timeout: 15_000 })
  const nav = page.getByRole('button', { name: '내 서류' })
  const warmed = page.waitForResponse(
    (r) => r.url().includes('/api/v1/documents') && r.request().method() === 'GET',
  )
  await nav.hover()
  await warmed

  const warmStart = Date.now()
  await nav.click()
  await page.waitForURL('/documents')
  const skeletonCount = await page.locator('[class*="skeleton"]').count()
  await expect(page.locator('.canvas-body')).not.toBeEmpty()
  const warmMs = Date.now() - warmStart

  expect(skeletonCount).toBe(0)
  expect(listRequests).toBe(1)
  console.log(`[e2e] documents entry cold=${coldMs}ms warm=${warmMs}ms requests=${listRequests}`)
})

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
