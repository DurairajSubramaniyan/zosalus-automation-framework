const { test: base } = require('playwright-bdd');
const SignupPage = require('../pages/SignupPage');
const LoginPage = require('../pages/LoginPage');
const ForgotPasswordPage = require('../pages/ForgotPasswordPage');
const AccountSetupPage = require('../pages/AccountSetupPage');
const AddPetPage = require('../pages/AddPetPage');
const HealthRecordsPage = require('../pages/HealthRecordsPage');
const ConditionsEpisodesPage = require('../pages/ConditionsEpisodesPage');
const SubscriptionPage = require('../pages/SubscriptionPage');
const BasePage = require('../pages/BasePage');
const { testUserManager } = require('../utils/TestUserManager');

/**
 * @typedef {Object} CustomFixtures
 * @property {BasePage} basePage
 * @property {SignupPage} signupPage
 * @property {LoginPage} loginPage
 * @property {ForgotPasswordPage} forgotPasswordPage
 * @property {AccountSetupPage} accountSetupPage
 * @property {AddPetPage} addPetPage
 * @property {HealthRecordsPage} healthRecordsPage
 * @property {ConditionsEpisodesPage} conditionsEpisodesPage
 * @property {SubscriptionPage} subscriptionPage
 * @property {import('../utils/TestUserManager').TestUserManager} testUserManager
 */

/** @type {import('@playwright/test').TestType<import('@playwright/test').PlaywrightTestArgs & import('@playwright/test').PlaywrightTestOptions & import('playwright-bdd').BddTestFixtures & CustomFixtures, import('@playwright/test').PlaywrightWorkerArgs & import('@playwright/test').PlaywrightWorkerOptions & import('playwright-bdd').BddWorkerFixtures>} */
const test = base.extend({
  basePage: async ({ page }, use) => {
    await use(new BasePage(page));
  },
  signupPage: async ({ page }, use) => {
    const signupPage = new SignupPage(page);
    await signupPage.open();
    await use(signupPage);
  },
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await use(loginPage);
  },
  forgotPasswordPage: async ({ page }, use) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await forgotPasswordPage.open();
    await use(forgotPasswordPage);
  },
  accountSetupPage: async ({ page }, use) => {
    const accountSetupPage = new AccountSetupPage(page);
    await use(accountSetupPage);
  },
  addPetPage: async ({ page }, use) => {
    await use(new AddPetPage(page));
  },
  healthRecordsPage: async ({ page }, use) => {
    await use(new HealthRecordsPage(page));
  },
  conditionsEpisodesPage: async ({ page }, use) => {
    await use(new ConditionsEpisodesPage(page));
  },
  subscriptionPage: async ({ page }, use) => {
    await use(new SubscriptionPage(page));
  },
  testUserManager: async ({}, use) => {
    await use(testUserManager);
  },
});

module.exports = {
  test,
  expect: base.expect,
};
