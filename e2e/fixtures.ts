import type { Page } from '@playwright/test'

export const DEV_SESSION = {
  state: {
    session: {
      accessToken: 'dev-token',
      refreshToken: 'dev-refresh',
      expiresIn: 86400,
      user: {
        id: '00000000-0000-4000-8000-000000000001',
        displayName: 'Dev',
        locale: 'ko',
      },
    },
  },
  version: 0,
}

export const loginAsDev = async (page: Page): Promise<void> => {
  await page.addInitScript((session) => {
    localStorage.setItem('push-session', JSON.stringify(session))
    localStorage.setItem('push-locale', '"ko"')
  }, DEV_SESSION)
}

export const authedPage = async (page: Page, path = '/'): Promise<void> => {
  await loginAsDev(page)
  await page.goto(path)
  await page.waitForSelector('.sidebar', { timeout: 15_000 })
}
