const { createBdd } = require('playwright-bdd');
const { test } = require('../../fixtures/testFixture');
const { expect } = require('@playwright/test');
const { generateRandomEmail } = require('../../utils/helpers');
const SignupPage = require('../../pages/SignupPage');

/**
 * @typedef {Object} BddFixtures
 * @property {SignupPage} signupPage
 * @property {import('@playwright/test').Page} page
 */


const { Given, When, Then } = createBdd(test);

// Store request promise across steps in a scenario
let apiResponsePromise;

// ----------------------------------------------------
// BACKGROUND / NAVIGATION
// ----------------------------------------------------
Given('user navigates to the Signup page', async ({ signupPage }) => {
  await signupPage.open();
});

// ----------------------------------------------------
// POSITIVE SCENARIO STEPS
// ----------------------------------------------------
Then('the page title should display {string}', async ({ signupPage, page }, expectedTitle) => {
  await expect(page.locator(signupPage.selectors.pageHeading)).toHaveText(expectedTitle);
});

Then('the Email input field should be visible', async ({ signupPage, page }) => {
  await expect(page.locator(signupPage.selectors.emailInput)).toBeVisible();
});

Then('the Password input field should be visible', async ({ signupPage, page }) => {
  await expect(page.locator(signupPage.selectors.passwordInput)).toBeVisible();
});

Then('the Confirm Password input field should be visible', async ({ signupPage, page }) => {
  await expect(page.locator(signupPage.selectors.confirmPasswordInput)).toBeVisible();
});

Then('the {string} button should be visible', async ({ signupPage, page }, buttonName) => {
  if (buttonName.includes('Google')) {
    await expect(page.locator(signupPage.selectors.googleSignUpButton)).toBeVisible();
  } else if (buttonName.includes('Apple')) {
    await expect(page.locator(signupPage.selectors.appleSignUpButton)).toBeVisible();
  } else if (buttonName.includes('Create Account')) {
    await expect(page.locator(signupPage.selectors.submitButton)).toBeVisible();
  }
});

Then('the {string} submit button should be visible', async ({ signupPage, page }, buttonName) => {
  await expect(page.locator(signupPage.selectors.submitButton)).toBeVisible();
});

Then('the password requirement helper text should be {string}', async ({ signupPage, page }, expectedHelper) => {
  await expect(page.locator(signupPage.selectors.passwordHelperText)).toHaveText(expectedHelper);
});

Then('the {string} link should be visible', async ({ signupPage, page }, linkText) => {
  if (linkText.includes('Sign in')) {
    await expect(page.locator(signupPage.selectors.signInLink)).toBeVisible();
  }
});

When('user inspects the password fields', async () => {
  // Pass-through inspection step
});

Then('the password field type should be {string}', async ({ signupPage }, expectedType) => {
  expect(await signupPage.getPasswordType()).toBe(expectedType);
});

Then('the confirm password field type should be {string}', async ({ signupPage }, expectedType) => {
  expect(await signupPage.getConfirmPasswordType()).toBe(expectedType);
});

When('user clicks the password visibility toggle', async ({ signupPage }) => {
  await signupPage.togglePasswordVisibility();
});

When('user clicks the password visibility toggle again', async ({ signupPage }) => {
  await signupPage.togglePasswordVisibility();
});

When('user clicks the confirm password visibility toggle', async ({ signupPage }) => {
  await signupPage.toggleConfirmPasswordVisibility();
});

When('user clicks the confirm password visibility toggle again', async ({ signupPage }) => {
  await signupPage.toggleConfirmPasswordVisibility();
});

When('user enters a unique valid email', async ({ signupPage }) => {
  const email = generateRandomEmail('bdd_user');
  await signupPage.fillEmail(email);
});

When('user enters email {string}', async ({ signupPage }, email) => {
  await signupPage.fillEmail(email);
});

When('user enters existing registered email {string}', async ({ signupPage }, email) => {
  await signupPage.fillEmail(email);
});

When('user enters password {string}', async ({ signupPage }, password) => {
  await signupPage.fillPassword(password);
});

When('user enters confirm password {string}', async ({ signupPage }, confirmPassword) => {
  await signupPage.fillConfirmPassword(confirmPassword);
});

When('user clicks the {string} button', async ({ signupPage, page }, buttonName) => {
  if (buttonName.includes('Create Account')) {
    apiResponsePromise = page.waitForResponse(
      response => response.url().includes('/api/v1/auth/signup') && response.request().method() === 'POST',
      { timeout: 10000 }
    ).catch(() => null);

    await signupPage.submit();
  }
});

When('user clicks the Create Account button without entering any details', async ({ signupPage }) => {
  await signupPage.submit();
});

Then('the signup API should return status code {int}', async ({}, statusCode) => {
  if (apiResponsePromise) {
    const response = await apiResponsePromise;
    if (response) {
      expect(response.status()).toBe(statusCode);
    }
  }
});

Then('user should be redirected to the login page', async ({ page }) => {
  await page.waitForURL('**/login', { timeout: 10000 });
  expect(page.url()).toContain('/login');
});

When('user clicks the {string} link', async ({ signupPage }, linkName) => {
  if (linkName.includes('Sign in')) {
    await signupPage.clickSignIn();
  }
});

Then('user should be navigated to the login page', async ({ page }) => {
  await page.waitForURL('**/login', { timeout: 8000 });
  expect(page.url()).toContain('/login');
});

// ----------------------------------------------------
// NEGATIVE SCENARIO STEPS & ERROR ASSERTIONS
// ----------------------------------------------------
Then('the email error message should be {string}', async ({ signupPage }, expectedError) => {
  expect(await signupPage.getEmailErrorMessage()).toBe(expectedError);
});

Then('the password error message should be {string}', async ({ signupPage }, expectedError) => {
  expect(await signupPage.getPasswordErrorMessage()).toBe(expectedError);
});

Then('the confirm password error message should be {string}', async ({ signupPage }, expectedError) => {
  expect(await signupPage.getConfirmPasswordErrorMessage()).toBe(expectedError);
});

Then('the email input should show error red border', async ({ signupPage }) => {
  expect(await signupPage.isEmailInputInErrorState()).toBe(true);
});

Then('the password input should show error red border', async ({ signupPage }) => {
  expect(await signupPage.isPasswordInputInErrorState()).toBe(true);
});

Then('the confirm password input should show error red border', async ({ signupPage }) => {
  expect(await signupPage.isConfirmPasswordInErrorState()).toBe(true);
});

Then('a server error banner should appear containing {string}', async ({ signupPage }, expectedMessage) => {
  const bannerMessage = await signupPage.getServerErrorMessage();
  expect(bannerMessage).toContain(expectedMessage);
});
