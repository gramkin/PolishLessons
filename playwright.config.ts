import { defineConfig, devices } from '@playwright/test'

const PORT = 4173

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    // exec hands the port to serve itself, so Playwright's shutdown stops it instead of orphaning it.
    command: 'pnpm generate && exec node_modules/.bin/serve .output/public -l 4173',
    url: `http://localhost:${PORT}`,
    // Never test a stale build: a busy port must fail loudly rather than be reused.
    reuseExistingServer: false,
    timeout: 300_000,
  },
})
