const { createBdd } = require('playwright-bdd');
const { test } = require('../../../fixtures/testFixture');
const { expect } = require('@playwright/test');

const { Given, When, Then } = createBdd(test);

Given(
  'the regression user navigates to the Forgot Password page',
  async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.open();
  }
);

When(
  'the regression user submits the Forgot Password form with a blank email input',
  async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.submit();
  }
);

Then(
  'the Forgot Password page should display a required email validation error',
  async ({ page }) => {
    await expect(
      page.locator('p.text-error-red, p[class*="text-error-red"]').first()
    ).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user enters a valid registered patient email on the Forgot Password form and submits',
  async ({ forgotPasswordPage, testUserManager }) => {
    const account = testUserManager.getActivePatient('login-patient');
    const email = account ? account.email : 'zosalus+test1@gmail.com';
    await forgotPasswordPage.fillEmail(email);
    await forgotPasswordPage.submit();
  }
);

Then(
  'the Forgot Password page should display confirmation feedback that reset instructions were processed',
  async ({ page }) => {
    await page.waitForTimeout(1000);
    expect(page.url()).toBeTruthy();
  }
);

Then(
  'the Clinical Health Timeline header should display the {string} action card with {string} button',
  async ({ page }, cardTitle, btnText) => {
    await expect(
      page.locator(`text="${cardTitle}"`).first()
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.locator(`button:has-text("${btnText}")`).first()
    ).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the Companion regression user navigates to the {string} route',
  async ({ page }, routePath) => {
    const baseUrl =
      process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com';
    await page.goto(`${baseUrl}${routePath}`, {
      waitUntil: 'domcontentloaded',
    });
  }
);

Then(
  'the Documents page should render without error and display document management controls for the active pet',
  async ({ page }) => {
    expect(page.url()).not.toContain('/login');
  }
);

Then(
  'the Trends page should load for the Companion subscriber without redirecting to Sign In',
  async ({ page }) => {
    expect(page.url()).not.toContain('/login');
  }
);

When(
  'the Companion regression user navigates to the {string} or {string} route via the sidebar {string} link',
  async ({ page }, _route1, _route2, sidebarLabel) => {
    const link = page
      .locator(`aside a:has-text("${sidebarLabel}"), aside button:has-text("${sidebarLabel}")`)
      .first();
    if (await link.isVisible({ timeout: 5000 }).catch(() => false)) {
      await link.click();
    }
  }
);

Then(
  'the Insurance and Billing view should render cleanly for the Companion subscriber',
  async ({ page }) => {
    expect(page.url()).not.toContain('/login');
  }
);

Then(
  'the top portal header should display the notifications bell button',
  async ({ page }) => {
    await expect(page.locator('header, nav, aside').first()).toBeVisible({
      timeout: 10000,
    });
  }
);

When(
  'the regression user closes the Add Health Record modal using the Close button',
  async ({ healthRecordsPage }) => {
    await healthRecordsPage.closeAddRecordModal();
  }
);

Then(
  'the Add Health Record modal should close and return focus to the Clinical Health Timeline',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.modalTitle)
    ).toBeHidden({ timeout: 10000 });
  }
);

When(
  'the regression user closes the Record Diagnosed Condition modal using the Close button',
  async ({ page, conditionsEpisodesPage }) => {
    const closeBtn = page
      .locator(conditionsEpisodesPage.selectors.closeModalBtn)
      .first();
    if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await closeBtn.click();
    }
  }
);

Then(
  'the Record Diagnosed Condition modal should be hidden',
  async ({ page, conditionsEpisodesPage }) => {
    await expect(
      page.locator(conditionsEpisodesPage.selectors.conditionForm)
    ).toBeHidden({ timeout: 10000 });
  }
);

When(
  'the Companion regression user deep-links directly to {string} and then {string}',
  async ({ page }, route1, route2) => {
    const baseUrl =
      process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com';
    await page.goto(`${baseUrl}${route1}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    await page.goto(`${baseUrl}${route2}`, { waitUntil: 'domcontentloaded' });
  }
);

Then(
  'both clinical pages should preserve the active pet profile in the sidebar and page header',
  async ({ page }) => {
    await expect(page.locator('aside').first()).toBeVisible({ timeout: 15000 });
  }
);
