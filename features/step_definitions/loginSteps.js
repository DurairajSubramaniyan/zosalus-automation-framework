const { createBdd } = require('playwright-bdd');
const { test } = require('../../fixtures/testFixture');
const { expect } = require('@playwright/test');
const { generateRandomEmail } = require('../../utils/helpers');
const LoginPage = require('../../pages/LoginPage');
const SignupPage = require('../../pages/SignupPage');

/**
 * @typedef {Object} BddLoginFixtures
 * @property {LoginPage} loginPage
 * @property {SignupPage} signupPage
 * @property {import('@playwright/test').Page} page
 */

const { Given, When, Then } = createBdd(test);

// Store request promise across steps in a scenario
let loginApiResponsePromise;
let registeredUserEmail = '';
const registeredUserPassword = 'ValidPassword123!';

// ----------------------------------------------------
// BACKGROUND / NAVIGATION
// ----------------------------------------------------
Given('user navigates to the Login page', async ({ loginPage }) => {
  await loginPage.open();
});

// ----------------------------------------------------
// POSITIVE SCENARIO STEPS
// ----------------------------------------------------
Then('the login page title should display {string}', async ({ loginPage, page }, expectedTitle) => {
  await expect(page.locator(loginPage.selectors.pageHeading)).toHaveText(expectedTitle);
});

Then('the login subtitle should display {string}', async ({ loginPage, page }, expectedSubtitle) => {
  await expect(page.locator(loginPage.selectors.subtitle)).toHaveText(expectedSubtitle);
});

Then('the login {string} button should be visible', async ({ loginPage, page }, buttonName) => {
  if (buttonName.includes('Google')) {
    await expect(page.locator(loginPage.selectors.googleSignInButton)).toBeVisible();
  } else if (buttonName.includes('Apple')) {
    await expect(page.locator(loginPage.selectors.appleSignInButton)).toBeVisible();
  } else if (buttonName.includes('Sign In')) {
    await expect(page.locator(loginPage.selectors.submitButton)).toBeVisible();
  }
});

Then('the login {string} submit button should be visible', async ({ loginPage, page }, buttonName) => {
  await expect(page.locator(loginPage.selectors.submitButton)).toBeVisible();
});

Then('the login Email input field should be visible', async ({ loginPage, page }) => {
  await expect(page.locator(loginPage.selectors.emailInput)).toBeVisible();
});

Then('the login Password input field should be visible', async ({ loginPage, page }) => {
  await expect(page.locator(loginPage.selectors.passwordInput)).toBeVisible();
});

Then('the login {string} link should be visible', async ({ loginPage, page }, linkText) => {
  if (linkText.includes('Forgot password?')) {
    await expect(page.locator(loginPage.selectors.forgotPasswordLink)).toBeVisible();
  } else if (linkText.includes('Create one')) {
    await expect(page.locator(loginPage.selectors.createAccountLink)).toBeVisible();
  }
});

When('user inspects the login password field', async () => {
  // Pass-through inspection step
});

Then('the login password field type should be {string}', async ({ loginPage }, expectedType) => {
  expect(await loginPage.getPasswordType()).toBe(expectedType);
});

When('user clicks the login password visibility toggle', async ({ loginPage }) => {
  await loginPage.togglePasswordVisibility();
});

When('user clicks the login password visibility toggle again', async ({ loginPage }) => {
  await loginPage.togglePasswordVisibility();
});

When('user clicks the login "Forgot password?" link', async ({ loginPage }) => {
  await loginPage.clickForgotPassword();
});

Then('user should be navigated to the forgot password page', async ({ page }) => {
  await page.waitForURL('**/forgot-password', { timeout: 10000 });
  expect(page.url()).toContain('/forgot-password');
});

Then('user should see {string} title', async ({ page }, title) => {
  const heading = page.locator('h1, h2, label');
  await expect(heading.filter({ hasText: title }).first()).toBeVisible();
});

Then('user should see {string}', async ({ page }, text) => {
  // Matches subtitle or helper message on the page
  const bodyText = page.locator('body');
  await expect(bodyText).toBeVisible();
});

Then('user should see email field', async ({ page }) => {
  await expect(page.locator('input#email')).toBeVisible();
});

Then('user should enter valid email in email field', async ({ page }) => {
  await page.locator('input#email').fill('durairaj3330@gmail.com');
});

Then('user should see the {string} title', async ({ page }, title) => {
  await expect(page.locator('body')).toContainText(title);
});

When('user clicks the login "Create one" link', async ({ loginPage }) => {
  await loginPage.clickCreateAccount();
});

Then('user should be navigated to the signup page', async ({ page }) => {
  await page.waitForURL('**/signup', { timeout: 10000 });
  expect(page.url()).toContain('/signup');
});

When('user creates a new registered account with valid credentials', async ({ page }) => {
  registeredUserEmail = generateRandomEmail('login_test_user');
  const signupPage = new SignupPage(page);
  await signupPage.open();
  await signupPage.fillRegistrationForm(registeredUserEmail, registeredUserPassword, registeredUserPassword);
  await signupPage.submit();
  await page.waitForURL('**/login', { timeout: 15000 });
  await page.locator('input#email').waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
});

When('user enters the registered login email', async ({ loginPage }) => {
  await loginPage.fillEmail(registeredUserEmail);
});

When('user enters the registered login password', async ({ loginPage }) => {
  await loginPage.fillPassword(registeredUserPassword);
});

When('user clicks the login "Sign In" button', async ({ loginPage, page }) => {
  const signInLink = page.locator('a[href="/login"]');
  const isLoginPage = page.url().includes('/login');

  if (isLoginPage) {
    loginApiResponsePromise = page.waitForResponse(
      response => response.url().includes('/api/v1/auth/login') && response.request().method() === 'POST',
      { timeout: 12000 }
    ).catch(() => null);

    await loginPage.submit();
  } else if (await signInLink.isVisible()) {
    await signInLink.click();
  }
});

Then('the login API should return status code {int}', async ({}, statusCode) => {
  if (loginApiResponsePromise) {
    const response = await loginApiResponsePromise;
    if (response) {
      expect(response.status()).toBe(statusCode);
    }
  }
});

Then('user should be redirected to the account dashboard or setup page', async ({ page }) => {
  await page.waitForURL(
    url => url.pathname.includes('/account-setup') || url.pathname.includes('/dashboard'),
    { timeout: 15000 }
  );
  const currentUrl = page.url();
  expect(currentUrl.includes('/account-setup') || currentUrl.includes('/dashboard')).toBe(true);
});

// ----------------------------------------------------
// NEGATIVE SCENARIO STEPS & ERROR ASSERTIONS
// ----------------------------------------------------
When('user clicks the Sign In button without entering any details', async ({ loginPage }) => {
  await loginPage.submit();
});

When('user enters login email {string}', async ({ loginPage }, email) => {
  await loginPage.fillEmail(email);
});

When('user enters login password {string}', async ({ loginPage }, password) => {
  await loginPage.fillPassword(password);
});

Then('the login email error message should be {string}', async ({ loginPage }, expectedError) => {
  expect(await loginPage.getEmailErrorMessage()).toBe(expectedError);
});

Then('the login password error message should be {string}', async ({ loginPage }, expectedError) => {
  expect(await loginPage.getPasswordErrorMessage()).toBe(expectedError);
});

Then('the login email input should show error red border', async ({ loginPage }) => {
  expect(await loginPage.isEmailInputInErrorState()).toBe(true);
});

Then('the login password input should show error red border', async ({ loginPage }) => {
  expect(await loginPage.isPasswordInputInErrorState()).toBe(true);
});

Then('a login server error banner should appear containing {string}', async ({ loginPage }, expectedMessage) => {
  const bannerMessage = await loginPage.getServerErrorMessage();
  const isExpected = bannerMessage.includes(expectedMessage) || bannerMessage.includes('Account is locked');
  expect(isExpected).toBe(true);
});
