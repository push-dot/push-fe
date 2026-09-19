import { readFileSync } from 'node:fs'
import { test, expect } from '@playwright/test'
import { authedPage } from './fixtures'

const PDF_PATH =
  '/Users/cyjoon/.paseo/uploads/upload_c105e269-6e22-403b-8c69-d95ac706e6ab/________________.pdf'

test('drag a pdf onto chat page shows overlay and uploads', async ({ page }) => {
  await authedPage(page, '/')
  await page.locator('button.sidebar-item', { hasText: '새 채팅' }).click()
  await page.waitForURL(/\/chat\//)

  const b64 = readFileSync(PDF_PATH).toString('base64')
  const dataTransfer = await page.evaluateHandle(async (data) => {
    const dt = new DataTransfer()
    const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
    dt.items.add(new File([bytes], 'resume.pdf', { type: 'application/pdf' }))
    return dt
  }, b64)

  await page.dispatchEvent('body', 'dragenter', { dataTransfer })
  await expect(page.locator('.drop-overlay')).toBeVisible()

  await page.dispatchEvent('body', 'drop', { dataTransfer })
  await expect(page.locator('.drop-overlay')).toBeHidden()
  await expect(page.locator('.toast')).toContainText('파일을 올렸어요', { timeout: 15_000 })
})
