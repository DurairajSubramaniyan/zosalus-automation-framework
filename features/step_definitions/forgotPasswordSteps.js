const { createBdd } = require('playwright-bdd');
const { test } = require('../../fixtures/testFixture');
const { expect } = require('@playwright/test');
const ForgotPasswordPage = require('../../pages/ForgotPasswordPage');

/**
 * @typedef {Object} BddForgotPasswordFixtures
 * @property {ForgotPasswordPage} forgotPasswordPage
 * @property {import('@playwright/test').Page} page
 */

const { Given, When, Then } = createBdd(test);

// ----------------------------------------------------
// BACKGROUND / NAVIGATION
// ----------------------------------------------------
Given('user navigates to the Forgot Password page', async ({ forgotPasswordPage }) => {
  await forgotPasswordPage.open();
});

// ----------------------------------------------------
// STAGE 1 - INITIAL REQUEST STEPS
// ----------------------------------------------------
Then('the forgot password page title should display {string}', async ({ forgotPasswordPage, page }, expectedTitle) => {
  await expect(page.locator(forgotPasswordPage.selectors.pageHeading)).toHaveText(expectedTitle);
});

Then('the forgot password subtitle should be visible', async ({ forgotPasswordPage, page }) => {
  await expect(page.locator(forgotPasswordPage.selectors.subtitle)).toBeVisible();
});

Then('the forgot password Email input field should be visible', async ({ forgotPasswordPage, page }) => {
  await expect(page.locator(forgotPasswordPage.selectors.emailInput)).toBeVisible();
});

Then('the "Send Reset Code" button should be visible on forgot password page', async ({ forgotPasswordPage, page }) => {
  await expect(page.locator(forgotPasswordPage.selectors.sendResetCodeBtn)).toBeVisible();
});

Then('the "Remember your password? Sign in" link should be visible on forgot password page', async ({ forgotPasswordPage, page }) => {
  await expect(page.locator(forgotPasswordPage.selectors.signInLink)).toBeVisible();
});

When('user enters email {string} on the forgot password page', async ({ forgotPasswordPage }, email) => {
  await forgotPasswordPage.fillEmail(email);
});

When('user clicks the "Send Reset Code" button on forgot password page', async ({ forgotPasswordPage }) => {
  await forgotPasswordPage.clickSendResetCode();
});

// ----------------------------------------------------
// STAGE 2 - 6-CHARACTER RESET CODE (OTP) SCREEN (IMAGE FLOW)
// ----------------------------------------------------
Then('the 6-character reset code OTP screen should be displayed', async ({ forgotPasswordPage }) => {
  expect(await forgotPasswordPage.isOtpScreenVisible()).toBe(true);
});

Then('the prefilled email should be {string}', async ({ forgotPasswordPage }, expectedEmail) => {
  expect(await forgotPasswordPage.getInputValue(forgotPasswordPage.selectors.emailInput)).toBe(expectedEmail);
});

Then('the reset screen subtitle should display {string}', async ({ forgotPasswordPage, page }, expectedSubtitle) => {
  await expect(page.locator(forgotPasswordPage.selectors.subtitle)).toHaveText(expectedSubtitle);
});

Then('the 6-character OTP input field should be visible', async ({ forgotPasswordPage, page }) => {
  await expect(page.locator(forgotPasswordPage.selectors.otpInput)).toBeVisible();
});

Then('the New Password input field should be visible on reset screen', async ({ forgotPasswordPage, page }) => {
  await expect(page.locator(forgotPasswordPage.selectors.newPasswordInput)).toBeVisible();
});

Then('the Confirm Password input field should be visible on reset screen', async ({ forgotPasswordPage, page }) => {
  await expect(page.locator(forgotPasswordPage.selectors.confirmPasswordInput)).toBeVisible();
});

Then('the password requirement helper text on reset screen should be {string}', async ({ forgotPasswordPage, page }, helperText) => {
  await expect(page.locator(forgotPasswordPage.selectors.passwordHelperText)).toHaveText(helperText);
});

Then('the "Reset Password" button should be visible on reset screen', async ({ forgotPasswordPage, page }) => {
  await expect(page.locator(forgotPasswordPage.selectors.resetPasswordBtn)).toBeVisible();
});

Then('the Resend code timer button should be visible', async ({ forgotPasswordPage, page }) => {
  await expect(page.locator(forgotPasswordPage.selectors.resendButton)).toBeVisible();
});

When('user clicks the new password visibility toggle', async ({ forgotPasswordPage }) => {
  await forgotPasswordPage.toggleNewPasswordVisibility();
});

Then('the new password field type should be {string}', async ({ forgotPasswordPage }, expectedType) => {
  expect(await forgotPasswordPage.getNewPasswordType()).toBe(expectedType);
});

When('user clicks the new password visibility toggle again', async ({ forgotPasswordPage }) => {
  await forgotPasswordPage.toggleNewPasswordVisibility();
});

When('user clicks the confirm password visibility toggle on reset screen', async ({ forgotPasswordPage }) => {
  await forgotPasswordPage.toggleConfirmPasswordVisibility();
});

Then('the confirm password field type on reset screen should be {string}', async ({ forgotPasswordPage }, expectedType) => {
  expect(await forgotPasswordPage.getConfirmPasswordType()).toBe(expectedType);
});

When('user clicks the confirm password visibility toggle on reset screen again', async ({ forgotPasswordPage }) => {
  await forgotPasswordPage.toggleConfirmPasswordVisibility();
});

When('user clicks the "Sign in" link on forgot password page', async ({ forgotPasswordPage }) => {
  await forgotPasswordPage.clickSignIn();
});

When('user enters reset code {string}', async ({ forgotPasswordPage }, otp) => {
  await forgotPasswordPage.fillOtp(otp);
});

When('user enters new password {string}', async ({ forgotPasswordPage }, password) => {
  await forgotPasswordPage.fillNewPassword(password);
});

When('user enters confirm password {string} on reset screen', async ({ forgotPasswordPage }, confirmPassword) => {
  await forgotPasswordPage.fillConfirmPassword(confirmPassword);
});

When('user clicks the "Reset Password" button on reset screen', async ({ forgotPasswordPage }) => {
  await forgotPasswordPage.clickResetPassword();
});

Then('an error message on reset screen should appear containing {string}', async ({ forgotPasswordPage }, expectedError) => {
  const errorMessage = await forgotPasswordPage.getErrorMessage();
  expect(errorMessage).toContain(expectedError);
});
