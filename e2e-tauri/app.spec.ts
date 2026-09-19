describe('Push desktop app', () => {
  it('launches and shows the login screen', async () => {
    await browser.execute(() => {
      localStorage.clear()
      location.href = '/login'
    })
    const google = await $('button*=Google')
    await google.waitForExist({ timeout: 30_000 })
  })

  it('loads the app shell with a dev session', async () => {
    await browser.execute(() => {
      localStorage.setItem(
        'push-session',
        JSON.stringify({
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
        }),
      )
      location.href = '/'
    })
    const sidebar = await $('.sidebar')
    await sidebar.waitForExist({ timeout: 30_000 })
    const settings = await $('button*=설정')
    await settings.waitForExist({ timeout: 10_000 })
  })
})
