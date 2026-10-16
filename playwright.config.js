const { defineConfig, devices } = require('@playwright/test');
const { defineBddConfig } = require('playwright-bdd');
require('dotenv').config();

const testDir = defineBddConfig({
  features: 'features/*.feature',
  steps: ['features/step_definitions/*.js', 'fixtures/testFixture.js'],
});

module.exports = defineConfig({
  testDir,
  timeout: parseInt(process.env.DEFAULT_TIMEOUT || '60000', 10),
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // 👈 Runs 1 test at a time sequentially so you can watch clearly!
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list']
  ],
  use: {
    launchOptions: {
      slowMo: 1000, // 👈 1 full second pause between each action
    },

    baseURL: process.env.BASE_URL || 'https://frontend-yrox.onrender.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: process.env.HEADLESS !== 'false',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
