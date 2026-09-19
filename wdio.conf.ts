export const config = {
  runner: 'local',
  specs: ['./e2e-tauri/**/*.spec.ts'],
  maxInstances: 1,
  logLevel: 'info',
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    timeout: 120_000,
  },
  services: ['@wdio/tauri-service'],
  capabilities: [
    {
      browserName: 'tauri',
      'tauri:options': {
        application: './src-tauri/target/debug/push',
      },
    },
  ],
}
