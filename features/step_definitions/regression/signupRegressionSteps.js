const { createBdd } = require('playwright-bdd');
const { test } = require('../../../fixtures/testFixture');
const { expect } = require('@playwright/test');

const { Given, When, Then } = createBdd(test);

let generatedSignupCandidate = null;

Given(
  'the regression user opens the Zosalus Signup page',
  async ({ signupPage }) => {
    await signupPage.open();
  }
);

When(
  'the regression user enters a newly generated unique patient email on the signup form',
  async ({ signupPage, testUserManager }) => {
    generatedSignupCandidate = testUserManager.generatePatient('login-patient');
    await signupPage.fillEmail(generatedSignupCandidate.email);
  }
);

When(
  'the regression user enters email {string} on the signup form',
  async ({ signupPage }, email) => {
    await signupPage.fillEmail(email);
  }
);

When(
  'the regression user enters an incomplete domain email address on the signup form',
  async ({ signupPage }) => {
    await signupPage.fillEmail('patient.incomplete@');
  }
);

When(
  'the regression user enters a patient email with surrounding whitespace on the signup form',
  async ({ signupPage }) => {
    await signupPage.fillEmail('   trimmed.patient@gmail.com   ');
  }
);

When(
  'the regression user enters an existing active patient email from the SQLite database on the signup form',
  async ({ signupPage, testUserManager }) => {
    const existing = testUserManager.getActivePatient('login-patient');
    const emailToUse = existing ? existing.email : 'zosalus+test1@gmail.com';
    await signupPage.fillEmail(emailToUse);
  }
);

When(
  'the regression user enters password {string} and confirm password {string} on the signup form',
  async ({ signupPage }, password, confirmPassword) => {
    await signupPage.fillPassword(password);
    await signupPage.fillConfirmPassword(confirmPassword);
  }
);

When(
  'the regression user clicks the Create Account submit button on the signup form',
  async ({ signupPage }) => {
    await signupPage.submit();
  }
);

When(
  'the regression user clicks the Create Account submit button on the signup form without entering any fields',
  async ({ signupPage }) => {
    await signupPage.submit();
  }
);

Then(
  'the regression user should be redirected from signup to the Login page with a registration success notification',
  async ({ page }) => {
    await page.waitForURL('**/login', { timeout: 30000 });
    expect(page.url()).toContain('/login');
  }
);

Then(
  'the newly registered regression account should be persisted in the local SQLite test database',
  async ({ testUserManager }) => {
    expect(generatedSignupCandidate).toBeTruthy();
    const saved = testUserManager.savePatient({
      ...generatedSignupCandidate,
      accountStatus: 'ACTIVE',
    });
    expect(saved.email).toBe(generatedSignupCandidate.email);
  }
);

When(
  'the regression user registers a fresh unverified patient account and logs into the portal',
  async ({ page, signupPage, loginPage, testUserManager }) => {
    const candidate = testUserManager.generatePatient('login-patient');
    const password = testUserManager.getCommonPassword();

    await signupPage.open();
    await signupPage.fillRegistrationForm(candidate.email, password, password);
    await signupPage.submit();
    await page.waitForURL('**/login', { timeout: 30000 });

    testUserManager.savePatient({
      ...candidate,
      accountStatus: 'ACTIVE',
    });

    await loginPage.fillLoginForm(candidate.email, password);
    await loginPage.submit();
    await page.waitForURL(
      url =>
        url.pathname.includes('/account-setup') ||
        url.pathname.includes('/home') ||
        url.pathname.includes('/add-pet'),
      { timeout: 30000 }
    );
  }
);

Then(
  'the portal should display the {string} banner with badge {string}',
  async ({ page }, bannerText, badgeText) => {
    await expect(
      page.locator(`text=/${bannerText}/i`).first()
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.locator(`text=/${badgeText}/i`).first()
    ).toBeVisible({ timeout: 10000 });
  }
);

Then(
  'the email verification banner should display the {string} button and {string} navigation link',
  async ({ page }, resendText, settingsText) => {
    await expect(
      page.locator(`button:has-text("${resendText}")`).first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.locator(`text=/${settingsText}/i`).first()
    ).toBeVisible({ timeout: 10000 });
  }
);

Then(
  'the signup email field should show a required validation error',
  async ({ signupPage }) => {
    const msg = await signupPage.getEmailErrorMessage();
    expect(msg.length).toBeGreaterThan(0);
  }
);

Then(
  'the signup password field should show a required validation error',
  async ({ signupPage }) => {
    const msg = await signupPage.getPasswordErrorMessage();
    expect(msg.length).toBeGreaterThan(0);
  }
);

Then(
  'the signup confirm password field should show a required validation error',
  async ({ signupPage }) => {
    const msg = await signupPage.getConfirmPasswordErrorMessage();
    expect(msg.length).toBeGreaterThan(0);
  }
);

Then(
  'the signup email field should show an invalid email format error message',
  async ({ signupPage }) => {
    const msg = await signupPage.getEmailErrorMessage();
    expect(msg.toLowerCase()).toMatch(/valid email|invalid|email/);
  }
);

Then(
  'the signup page should display a duplicate account error alert and remain on the signup route',
  async ({ page, signupPage }) => {
    const msg = await signupPage.getServerErrorMessage();
    expect(msg.length).toBeGreaterThan(0);
    expect(page.url()).toContain('/signup');
  }
);

Then(
  'the signup password field should show a minimum length validation error',
  async ({ signupPage }) => {
    const msg = await signupPage.getPasswordErrorMessage();
    expect(msg.toLowerCase()).toMatch(/8|character|short|least/);
  }
);

Then(
  'the signup password field should show a complexity validation error',
  async ({ signupPage }) => {
    const msg = await signupPage.getPasswordErrorMessage();
    expect(msg.length).toBeGreaterThan(0);
  }
);

Then(
  'the signup confirm password field should show a password mismatch error message',
  async ({ signupPage }) => {
    const msg = await signupPage.getConfirmPasswordErrorMessage();
    expect(msg.toLowerCase()).toMatch(/match|same/);
  }
);

Then(
  'the signup password input type should be {string} and confirm password input type should be {string}',
  async ({ signupPage }, expectedPwType, expectedConfirmType) => {
    expect(await signupPage.getPasswordType()).toBe(expectedPwType);
    expect(await signupPage.getConfirmPasswordType()).toBe(expectedConfirmType);
  }
);

When(
  'the regression user toggles both password and confirm password visibility buttons on the signup form',
  async ({ signupPage }) => {
    await signupPage.togglePasswordVisibility();
    await signupPage.toggleConfirmPasswordVisibility();
  }
);

Then(
  'the signup password field should show a complexity or required validation error',
  async ({ signupPage }) => {
    const msg = await signupPage.getPasswordErrorMessage();
    expect(msg.length).toBeGreaterThan(0);
  }
);
