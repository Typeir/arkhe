/**
 * @fileoverview Playwright config: browser checks jsdom cannot make (caret,
 * layout, real focus), run against the built showcase in Chromium.
 *
 * @module playwright.config
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import { defineConfig, devices } from '@playwright/test';

const PORT = 5194;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: `http://127.0.0.1:${PORT}/` },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort --host 127.0.0.1`,
    cwd: 'apps/showcase',
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: false,
  },
});
