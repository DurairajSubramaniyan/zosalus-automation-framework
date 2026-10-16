const { createBdd } = require('playwright-bdd');
const { test } = require('../../fixtures/testFixture');
const { expect } = require('@playwright/test');
const { generateRandomEmail } = require('../../utils/helpers');
const SignupPage = require('../../pages/SignupPage');
const LoginPage = require('../../pages/LoginPage');
const AccountSetupPage = require('../../pages/AccountSetupPage');

/**
 * @typedef {Object} BddSetupFixtures
 * @property {AccountSetupPage} accountSetupPage
 * @property {LoginPage} loginPage
 * @property {SignupPage} signupPage
 * @property {import('@playwright/test').Page} page
 */

const { Given, When, Then } = createBdd(test);

// User state variables for cross-step execution
let sharedUserEmail = '';
const sharedUserPassword = 'ValidPassword123!';

// ----------------------------------------------------
// ACCOUNT CREATION & AUTHENTICATION PREREQUISITES
// ----------------------------------------------------

Given('user creates a new account on the Signup page', async ({ page }) => {
  sharedUserEmail = generateRandomEmail('setup_user');
  const signupPage = new SignupPage(page);
  await signupPage.open();
  await signupPage.fillRegistrationForm(sharedUserEmail, sharedUserPassword, sharedUserPassword);
  await signupPage.submit();
  await page.waitForURL('**/login', { timeout: 20000 });
  await page.locator('input#email').waitFor({ state: 'visible', timeout: 10000 });
});

Then('a registration success toast should display {string}', async ({ page }, expectedToast) => {
  const toast = page.locator('li[data-type="success"] div[data-title], div[data-title*="User created successfully"]').first();
  await expect(toast).toBeVisible({ timeout: 10000 });
  await expect(toast).toContainText(expectedToast);
});

When('user logs in with the newly created account credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.fillEmail(sharedUserEmail);
  await loginPage.fillPassword(sharedUserPassword);
  await loginPage.submit();
});

Then('user should be redirected to the account setup page', async ({ page }) => {
  await page.waitForURL(url => url.pathname.includes('/account-setup'), { timeout: 20000 });
  expect(page.url()).toContain('/account-setup');
  await page.locator('input#firstName').waitFor({ state: 'visible', timeout: 15000 });
});

Given('user is authenticated and on the account setup page', async ({ page }) => {
  sharedUserEmail = generateRandomEmail('setup_user');
  const signupPage = new SignupPage(page);
  await signupPage.open();
  await signupPage.fillRegistrationForm(sharedUserEmail, sharedUserPassword, sharedUserPassword);
  await signupPage.submit();
  await page.waitForURL('**/login', { timeout: 20000 });
  await page.locator('input#email').waitFor({ state: 'visible', timeout: 10000 });

  const loginPage = new LoginPage(page);
  await loginPage.fillEmail(sharedUserEmail);
  await loginPage.fillPassword(sharedUserPassword);
  await loginPage.submit();

  await page.waitForURL(url => url.pathname.includes('/account-setup'), { timeout: 20000 });
  await page.locator('input#firstName').waitFor({ state: 'visible', timeout: 15000 });
});

// ----------------------------------------------------
// UI VERIFICATION STEPS
// ----------------------------------------------------

Then('the setup page heading should display {string}', async ({ page, accountSetupPage }, expectedHeading) => {
  await expect(page.locator(accountSetupPage.selectors.pageHeading)).toHaveText(expectedHeading);
});

Then('the setup page subtitle should display {string}', async ({ page, accountSetupPage }, expectedSubtitle) => {
  await expect(page.locator(accountSetupPage.selectors.subtitle).first()).toContainText(expectedSubtitle);
});

Then('the First Name input field should be visible', async ({ page, accountSetupPage }) => {
  await expect(page.locator(accountSetupPage.selectors.firstNameInput)).toBeVisible();
});

Then('the Last Name input field should be visible', async ({ page, accountSetupPage }) => {
  await expect(page.locator(accountSetupPage.selectors.lastNameInput)).toBeVisible();
});

Then('the Email input field should be prefilled with the registered email', async ({ page, accountSetupPage }) => {
  const emailInput = page.locator(accountSetupPage.selectors.emailInput);
  await expect(emailInput).toBeVisible();
  const value = await emailInput.inputValue();
  expect(value).toBe(sharedUserEmail);
});

Then('the Phone Number input field with country code should be visible', async ({ page, accountSetupPage }) => {
  await expect(page.locator(accountSetupPage.selectors.phoneNumberInput)).toBeVisible();
  await expect(page.locator(accountSetupPage.selectors.countryCodeBtn)).toBeVisible();
});

Then('the Username input field should be visible', async ({ page, accountSetupPage }) => {
  await expect(page.locator(accountSetupPage.selectors.usernameInput)).toBeVisible();
});

Then('the Preferred Contact Method options should be visible', async ({ page, accountSetupPage }) => {
  await expect(page.locator(accountSetupPage.selectors.prefContactPhoneLabel)).toBeVisible();
  await expect(page.locator(accountSetupPage.selectors.prefContactTextLabel)).toBeVisible();
  await expect(page.locator(accountSetupPage.selectors.prefContactEmailLabel)).toBeVisible();
});

Then('the Home Address input fields should be visible', async ({ page, accountSetupPage }) => {
  await expect(page.locator(accountSetupPage.selectors.addressLine1Input)).toBeVisible();
  await expect(page.locator(accountSetupPage.selectors.cityInput)).toBeVisible();
  await expect(page.locator(accountSetupPage.selectors.stateInput)).toBeVisible();
  await expect(page.locator(accountSetupPage.selectors.zipInput)).toBeVisible();
});

Then('the Timezone selector should display {string}', async ({ page, accountSetupPage }, expectedTimezone) => {
  const timezoneBtn = page.locator(accountSetupPage.selectors.timezoneBtn);
  await expect(timezoneBtn).toBeVisible();
  await expect(timezoneBtn).toContainText(expectedTimezone);
});

Then('the Language selector should display {string}', async ({ page, accountSetupPage }, expectedLanguage) => {
  const languageBtn = page.locator(accountSetupPage.selectors.languageBtn);
  await expect(languageBtn).toBeVisible();
  await expect(languageBtn).toContainText(expectedLanguage);
});

Then('the {string} button should be visible on setup page', async ({ page }, buttonName) => {
  await expect(page.locator(`button:has-text("${buttonName}")`)).toBeVisible();
});

Then('the setup "Save & Continue" button should be visible', async ({ page, accountSetupPage }) => {
  await expect(page.locator(accountSetupPage.selectors.saveAndContinueBtn)).toBeVisible();
});

Then('the setup "Skip for now" button should be visible', async ({ page, accountSetupPage }) => {
  await expect(page.locator(accountSetupPage.selectors.skipForNowBtn)).toBeVisible();
});

// ----------------------------------------------------
// FORM FILLING & SUBMISSION STEPS
// ----------------------------------------------------

When('user enters profile first name {string}', async ({ accountSetupPage }, firstName) => {
  await accountSetupPage.fillFirstName(firstName);
});

When('user enters profile last name {string}', async ({ accountSetupPage }, lastName) => {
  await accountSetupPage.fillLastName(lastName);
});

When('user enters profile phone number {string}', async ({ accountSetupPage }, phone) => {
  await accountSetupPage.fillPhoneNumber(phone);
});

When('user enters a unique profile username', async ({ accountSetupPage }) => {
  const uniqueUsername = 'user_' + Date.now().toString().slice(-6);
  await accountSetupPage.fillUsername(uniqueUsername);
});

When('user selects preferred contact method {string}', async ({ accountSetupPage }, method) => {
  await accountSetupPage.selectPreferredContactMethod(method);
});

Then('the {string} contact method should be selected', async ({ page }, method) => {
  const methodLower = method.toLowerCase();
  let radioSelector = 'input#setup-pref-phone';
  if (methodLower.includes('sms') || methodLower.includes('text')) {
    radioSelector = 'input#setup-pref-text';
  } else if (methodLower.includes('email')) {
    radioSelector = 'input#setup-pref-email';
  }
  await expect(page.locator(radioSelector)).toBeChecked();
});

When('user enters street address {string}', async ({ accountSetupPage }, street) => {
  await accountSetupPage.fillAddress({ street });
});

When('user enters apartment suite {string}', async ({ accountSetupPage }, unit) => {
  await accountSetupPage.fillAddress({ unit });
});

When('user enters city {string}', async ({ accountSetupPage }, city) => {
  await accountSetupPage.fillAddress({ city });
});

When('user enters state {string}', async ({ accountSetupPage }, state) => {
  await accountSetupPage.fillAddress({ state });
});

When('user enters zip code {string}', async ({ accountSetupPage }, zip) => {
  await accountSetupPage.fillAddress({ zip });
});

When('user clicks the setup "Save & Continue" button', async ({ accountSetupPage }) => {
  await accountSetupPage.clickSaveAndContinue();
});

When('user clicks the setup "Save & Continue" button without entering required details', async ({ accountSetupPage }) => {
  await accountSetupPage.clickSaveAndContinue();
});

When('user clicks the setup "Skip for now" button', async ({ accountSetupPage }) => {
  await accountSetupPage.clickSkipForNow();
});

Then('user should be redirected to the add pet page', async ({ page }) => {
  await page.waitForURL(url => url.pathname.includes('/add-pet'), { timeout: 20000 });
  expect(page.url()).toContain('/add-pet');
});

Then('the setup "Add Contact" button should be visible', async ({ page, accountSetupPage }) => {
  await expect(page.locator(accountSetupPage.selectors.addEmergencyContactBtn)).toBeVisible();
});

Then('the setup "Add an emergency contact" button should be visible', async ({ page, accountSetupPage }) => {
  await expect(page.locator(accountSetupPage.selectors.addEmergencyContactLink)).toBeVisible();
});

// ----------------------------------------------------
// VALIDATION ERROR ASSERTIONS
// ----------------------------------------------------

Then('the first name error message should be {string}', async ({ page }, expectedError) => {
  const errorEl = page.locator('p:has-text("First name is required")').first();
  await expect(errorEl).toBeVisible({ timeout: 5000 });
  await expect(errorEl).toHaveText(expectedError);
});

Then('the last name error message should be {string}', async ({ page }, expectedError) => {
  const errorEl = page.locator('p:has-text("Last name is required")').first();
  await expect(errorEl).toBeVisible({ timeout: 5000 });
  await expect(errorEl).toHaveText(expectedError);
});

Then('the phone number error message should be {string}', async ({ page }, expectedError) => {
  const errorEl = page.locator('p:has-text("Phone number is required")').first();
  await expect(errorEl).toBeVisible({ timeout: 5000 });
  await expect(errorEl).toHaveText(expectedError);
});

Then('the username error message should be {string}', async ({ page }, expectedError) => {
  const errorEl = page.locator('p:has-text("Username is required")').first();
  await expect(errorEl).toBeVisible({ timeout: 5000 });
  await expect(errorEl).toHaveText(expectedError);
});

When('user enters login email for the newly created account', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.fillEmail(sharedUserEmail);
});

// ----------------------------------------------------
// EDGE CASES
// ----------------------------------------------------

Given('user navigates directly to the account setup page without authentication', async ({ page }) => {
  await page.goto('https://frontend-yrox.onrender.com/account-setup');
  // Wait to see if redirected to login
  await page.waitForURL(url => url.pathname.includes('/login') || url.pathname.includes('/account-setup'), { timeout: 15000 });
});
