import { defineConfig, devices } from '@playwright/test'

// One browser, one spec file. `webServer` means `npx playwright test` is the whole
// command a student has to run -- Vite is started and stopped for them.
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:5173',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
