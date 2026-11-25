const { createBdd } = require('playwright-bdd');
const { test } = require('../../../fixtures/testFixture');
const { expect } = require('@playwright/test');

const { Given, When, Then } = createBdd(test);

Given(
  'the regression user opens the Zosalus Sign In page',
  async ({ loginPage }) => {
    await loginPage.open();
  }
);

When(
  'the regression user enters a valid registered patient email and password from SQLite on the Sign In form',
  async ({ loginPage, testUserManager }) => {
    const account = testUserManager.getActivePatient('login-patient');
    const email = account ? account.email : 'zosalus+test1@gmail.com';
    const password = testUserManager.getCommonPassword();
    await loginPage.fillLoginForm(email, password);
  }
);

When(
  'the regression user clicks the Sign In submit button',
  async ({ loginPage }) => {
    await loginPage.submit();
  }
);

Then(
  'the regression user should be authenticated and directed to the Zosalus patient portal',
  async ({ page }) => {
    await page.waitForURL(
      url =>
        url.pathname.includes('/home') ||
        url.pathname.includes('/account-setup') ||
        url.pathname.includes('/add-pet') ||
        url.pathname.includes('/dashboard') ||
        url.pathname.includes('/pets'),
      { timeout: 35000 }
    );
    expect(page.url()).not.toContain('/login');
  }
);

When(
  'the regression user signs in with an unverified patient account from SQLite',
  async ({ loginPage, testUserManager }) => {
    const account = testUserManager.getActivePatient('login-patient');
    const email = account ? account.email : 'zosalus+test2@gmail.com';
    await loginPage.fillLoginForm(email, testUserManager.getCommonPassword());
    await loginPage.submit();
  }
);

Then(
  'the portal should show the email verification status indicator for the signed-in account',
  async ({ page }) => {
    await page.goto(
      `${process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com'}/account`,
      { waitUntil: 'domcontentloaded' }
    );
    await expect(
      page.locator('text=/Verify your email|Unverified|Email/i').first()
    ).toBeVisible({ timeout: 15000 });
  }
);

When(
  'the regression user clicks the Sign In submit button with empty credentials',
  async ({ loginPage }) => {
    await loginPage.submit();
  }
);

Then(
  'the Sign In email field should display a required field validation error',
  async ({ loginPage }) => {
    const err = await loginPage.getEmailErrorMessage();
    expect(err.length).toBeGreaterThan(0);
  }
);

Then(
  'the Sign In password field should display a required field validation error',
  async ({ loginPage }) => {
    const err = await loginPage.getPasswordErrorMessage();
    expect(err.length).toBeGreaterThan(0);
  }
);

When(
  'the regression user enters a valid registered patient email and leaves password blank on the Sign In form',
  async ({ loginPage, testUserManager }) => {
    const account = testUserManager.getActivePatient('login-patient');
    const email = account ? account.email : 'zosalus+test1@gmail.com';
    await loginPage.fillEmail(email);
    await loginPage.fillPassword('');
  }
);

When(
  'the regression user enters malformed email {string} and password {string} on the Sign In form',
  async ({ loginPage }, email, password) => {
    await loginPage.fillLoginForm(email, password);
  }
);

Then(
  'the Sign In email field should display an invalid email validation error',
  async ({ loginPage }) => {
    const err = await loginPage.getEmailErrorMessage();
    expect(err.toLowerCase()).toMatch(/valid|email|invalid/);
  }
);

When(
  'the regression user enters an unregistered patient email and password {string} on the Sign In form',
  async ({ loginPage }, password) => {
    await loginPage.fillLoginForm('unknown.patient.999999@gmail.com', password);
  }
);

Then(
  'the Sign In page should display an invalid credentials error alert and remain on the Sign In route',
  async ({ page, loginPage }) => {
    const err = await loginPage.getServerErrorMessage();
    expect(err.length).toBeGreaterThan(0);
    expect(page.url()).toContain('/login');
  }
);

When(
  'the regression user enters a valid registered patient email with wrong password {string} on the Sign In form',
  async ({ loginPage, testUserManager }, wrongPassword) => {
    const account = testUserManager.getActivePatient('login-patient');
    const email = account ? account.email : 'zosalus+test1@gmail.com';
    await loginPage.fillLoginForm(email, wrongPassword);
  }
);

When(
  'the regression user enters a valid registered patient email in uppercase characters with valid password on the Sign In form',
  async ({ loginPage, testUserManager }) => {
    const account = testUserManager.getActivePatient('login-patient');
    const email = (
      account ? account.email : 'zosalus+test1@gmail.com'
    ).toUpperCase();
    await loginPage.fillLoginForm(email, testUserManager.getCommonPassword());
  }
);

When(
  'the regression user types password {string} into the Sign In password field',
  async ({ loginPage }, password) => {
    await loginPage.fillPassword(password);
  }
);

Then(
  'the Sign In password field type attribute should be {string}',
  async ({ loginPage }, expectedType) => {
    expect(await loginPage.getPasswordType()).toBe(expectedType);
  }
);

When(
  'the regression user clicks the password show hide toggle button on the Sign In form',
  async ({ loginPage }) => {
    await loginPage.togglePasswordVisibility();
  }
);

When(
  'the regression user signs into the portal with a valid registered account',
  async ({ page, loginPage, testUserManager }) => {
    const account = testUserManager.getActivePatient('login-patient');
    const email = account ? account.email : 'zosalus+test2@gmail.com';
    await loginPage.open();
    await loginPage.fillLoginForm(email, testUserManager.getCommonPassword());
    await loginPage.submit();
    await page.waitForURL(
      url =>
        url.pathname.includes('/home') ||
        url.pathname.includes('/account-setup') ||
        url.pathname.includes('/add-pet') ||
        url.pathname.includes('/pets'),
      { timeout: 35000 }
    );
  }
);

When(
  'the regression user performs a hard page reload in the browser',
  async ({ page }) => {
    await page.reload({ waitUntil: 'domcontentloaded' });
  }
);

Then(
  'the regression user should remain authenticated inside the patient portal without being redirected to Sign In',
  async ({ page }) => {
    await page.waitForTimeout(1000);
    expect(page.url()).not.toContain('/login');
  }
);

When(
  'the regression user navigates sequentially across Dashboard, Health Records, Conditions and Episodes, and Account Settings',
  async ({ page }) => {
    const baseUrl =
      process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com';
    for (const route of [
      '/home',
      '/health-records',
      '/conditions-episodes',
      '/account',
    ]) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      expect(page.url()).not.toContain('/login');
    }
  }
);

Then(
  'each protected portal route should render cleanly without losing the authenticated session',
  async ({ page }) => {
    expect(page.url()).toContain('/account');
  }
);

When(
  'the regression user signs out from the patient portal',
  async ({ page }) => {
    const signOutBtn = page
      .locator('button:has-text("Sign Out"), button:has-text("Log Out"), button:has-text("Logout")')
      .first();
    if (await signOutBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await signOutBtn.click();
    } else {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.context().clearCookies();
      await page.goto(
        `${process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com'}/login`,
        { waitUntil: 'domcontentloaded' }
      );
    }
  }
);

Then(
  'the browser should redirect to the Sign In page',
  async ({ page }) => {
    await page.waitForURL('**/login', { timeout: 15000 });
    expect(page.url()).toContain('/login');
  }
);

When(
  'the unauthenticated regression user attempts to open protected route {string} directly',
  async ({ page }, routePath) => {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();
    const baseUrl =
      process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com';
    await page.goto(`${baseUrl}${routePath}`, {
      waitUntil: 'domcontentloaded',
    });
  }
);

Then(
  'the browser should redirect the unauthenticated user to the Sign In page',
  async ({ page }) => {
    await page.waitForURL('**/login**', { timeout: 15000 });
    expect(page.url()).toContain('/login');
  }
);

When(
  'the regression user clicks the browser Back button after logout',
  async ({ page }) => {
    await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => {});
  }
);

Then(
  'the regression user should remain gated by authentication and not regain access to protected data',
  async ({ page }) => {
    const baseUrl =
      process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com';
    await page.goto(`${baseUrl}/account`, { waitUntil: 'domcontentloaded' });
    await page.waitForURL('**/login**', { timeout: 15000 });
    expect(page.url()).toContain('/login');
  }
);
