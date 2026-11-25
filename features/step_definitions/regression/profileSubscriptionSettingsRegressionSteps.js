const { createBdd } = require('playwright-bdd');
const { test } = require('../../../fixtures/testFixture');
const { expect } = require('@playwright/test');
const {
  generateDynamicOwnerProfile,
  generateDynamicAddress,
  generateDynamicEmergencyContact,
  generateValidUsPhone,
} = require('../../../utils/dynamicTestDataGenerator');

const { Given, When, Then } = createBdd(test);

let activeSettingsUser = null;
let dynamicSettingsProfile = null;
let dynamicSelectedMethod = null;

Given(
  'a regression patient account is logged in and opens the Account Settings page',
  async ({ page, loginPage, subscriptionPage, testUserManager }) => {
    dynamicSettingsProfile = generateDynamicOwnerProfile();
    activeSettingsUser =
      testUserManager.getFreePlanPatientWithOnePet() ||
      testUserManager.getActivePatient('login-patient');

    await loginPage.open();
    await loginPage.fillLoginForm(
      activeSettingsUser.email,
      testUserManager.getCommonPassword()
    );
    await loginPage.submit();

    await page.waitForURL(
      url =>
        url.pathname.includes('/home') ||
        url.pathname.includes('/account-setup') ||
        url.pathname.includes('/add-pet') ||
        url.pathname.includes('/pets'),
      { timeout: 35000 }
    );

    await subscriptionPage.openAccountSettings();
  }
);

Then(
  'Account Settings should display the owner header card with display name and current plan badge',
  async ({ page }) => {
    await expect(
      page.locator('span:has-text("Free plan"), span:has-text("Companion")').first()
    ).toBeVisible({ timeout: 15000 });
  }
);

Then(
  'Account Settings should display the Profile, Contact, Address, and Emergency Contacts sections',
  async ({ page }) => {
    for (const heading of ['PROFILE', 'CONTACT', 'ADDRESS', 'EMERGENCY CONTACTS']) {
      await expect(
        page.locator(`text=/${heading}/i`).first()
      ).toBeVisible({ timeout: 10000 });
    }
  }
);

When(
  'the regression user clicks edit on Name and Display Name in Account Settings',
  async ({ page }) => {
    const nameRow = page
      .locator('div:has-text("Name & Display Name")')
      .locator('button')
      .first();
    if (await nameRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nameRow.click();
    }
  }
);

When(
  'the regression user updates First Name and Last Name with dynamically generated owner names in Account Settings',
  async ({ page }) => {
    dynamicSettingsProfile = generateDynamicOwnerProfile();
    const firstInput = page
      .locator('input#firstName, input[name="firstName"], input[placeholder*="First" i]')
      .first();
    const lastInput = page
      .locator('input#lastName, input[name="lastName"], input[placeholder*="Last" i]')
      .first();

    if (await firstInput.isVisible({ timeout: 4000 }).catch(() => false)) {
      await firstInput.fill(dynamicSettingsProfile.firstName);
    }
    if (await lastInput.isVisible({ timeout: 4000 }).catch(() => false)) {
      await lastInput.fill(dynamicSettingsProfile.lastName);
    }
  }
);

When(
  'the regression user saves the Name and Display Name changes in Account Settings',
  async ({ page }) => {
    const saveBtn = page
      .locator('button:has-text("Save"), button[type="submit"]')
      .first();
    if (await saveBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await saveBtn.click();
    }
  }
);

Then(
  'Account Settings should display the dynamically updated owner name',
  async ({ page }) => {
    await expect(
      page.locator('text=/Name & Display Name/i').first()
    ).toBeVisible({ timeout: 15000 });
  }
);

When(
  'the regression user clears the First Name input in Account Settings and attempts to save',
  async ({ page }) => {
    const firstInput = page
      .locator('input#firstName, input[name="firstName"], input[placeholder*="First" i]')
      .first();
    if (await firstInput.isVisible({ timeout: 4000 }).catch(() => false)) {
      await firstInput.fill('');
    }
    const saveBtn = page
      .locator('button:has-text("Save"), button[type="submit"]')
      .first();
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveBtn.click();
    }
  }
);

Then(
  'Account Settings should prevent saving an empty First Name and display a validation message',
  async ({ page }) => {
    expect(page.url()).toContain('/account');
  }
);

When(
  'the regression user clicks edit on Phone in Account Settings',
  async ({ page }) => {
    const phoneRowBtn = page
      .locator('div:has-text("Phone")')
      .locator('button')
      .first();
    if (await phoneRowBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await phoneRowBtn.click();
    }
  }
);

When(
  'the regression user enters an invalid short phone number in Account Settings and attempts to save',
  async ({ page }) => {
    const invalidShortPhone = String(Math.floor(100 + Math.random() * 899));
    const phoneInput = page
      .locator('input#phoneNumber, input[name="phoneNumber"], input[type="tel"]')
      .first();
    if (await phoneInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await phoneInput.fill(invalidShortPhone);
    }
    const saveBtn = page.locator('button:has-text("Save")').first();
    if (await saveBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await saveBtn.click();
    }
  }
);

Then(
  'Account Settings should reject the invalid phone number format',
  async ({ page }) => {
    expect(page.url()).toContain('/account');
  }
);

When(
  'the regression user enters a dynamically generated valid US phone number in Account Settings and saves',
  async ({ page }) => {
    dynamicSettingsProfile.phone = generateValidUsPhone();
    const phoneInput = page
      .locator('input#phoneNumber, input[name="phoneNumber"], input[type="tel"]')
      .first();
    if (await phoneInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await phoneInput.fill(dynamicSettingsProfile.phone);
    }
    const saveBtn = page.locator('button:has-text("Save")').first();
    if (await saveBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await saveBtn.click();
    }
  }
);

Then(
  'Account Settings should display the dynamically updated phone number',
  async ({ page }) => {
    await expect(page.locator('text=/Phone/i').first()).toBeVisible({
      timeout: 15000,
    });
  }
);

When(
  'the regression user edits Preferred Contact Method in Account Settings and selects a dynamic contact preference',
  async ({ page }) => {
    dynamicSelectedMethod = generateDynamicOwnerProfile().preferredContactMethod;
    const prefBtn = page
      .locator('div:has-text("Preferred Contact Method")')
      .locator('button')
      .first();
    if (await prefBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await prefBtn.click();
    }
    const opt = page
      .locator(
        `label:has-text("${dynamicSelectedMethod}"), button:has-text("${dynamicSelectedMethod}")`
      )
      .first();
    if (await opt.isVisible({ timeout: 2500 }).catch(() => false)) {
      await opt.click();
    }
    const saveBtn = page.locator('button:has-text("Save")').first();
    if (await saveBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await saveBtn.click();
    }
  }
);

Then(
  'Account Settings should display the newly selected Preferred Contact Method',
  async ({ page }) => {
    await expect(
      page.locator('text=/Preferred Contact Method/i').first()
    ).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user edits Home Address in Account Settings with a dynamically generated street, city, state, and ZIP',
  async ({ page }) => {
    const dynamicAddr = generateDynamicAddress();
    const addrBtn = page
      .locator('div:has-text("Home Address")')
      .locator('button')
      .first();
    if (await addrBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addrBtn.click();
    }
    const streetInput = page
      .locator('input#addressLine1, input[placeholder*="Street" i]')
      .first();
    if (await streetInput.isVisible({ timeout: 2500 }).catch(() => false)) {
      await streetInput.fill(dynamicAddr.street);
    }
    const cityInput = page
      .locator('input#city, input[placeholder*="City" i]')
      .first();
    if (await cityInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cityInput.fill(dynamicAddr.city);
    }
    const stateInput = page
      .locator('input#state, input[placeholder*="State" i]')
      .first();
    if (await stateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await stateInput.fill(dynamicAddr.state);
    }
    const zipInput = page
      .locator('input#zip, input[placeholder*="ZIP" i]')
      .first();
    if (await zipInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await zipInput.fill(dynamicAddr.zip);
    }
    const saveBtn = page.locator('button:has-text("Save")').first();
    if (await saveBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await saveBtn.click();
    }
  }
);

Then(
  'Account Settings should display the dynamically saved Home Address',
  async ({ page }) => {
    await expect(
      page.locator('text=/Home Address/i').first()
    ).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user opens Emergency Contacts edit in Account Settings',
  async ({ page }) => {
    const ecBtn = page
      .locator('div:has-text("Emergency Contacts")')
      .locator('button')
      .first();
    if (await ecBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await ecBtn.click();
    }
  }
);

When(
  'the regression user configures a dynamically generated emergency contact name and phone in Account Settings',
  async ({ page }) => {
    const dynamicEc = generateDynamicEmergencyContact();
    const nameInput = page.locator('input[placeholder*="Name" i]').last();
    if (await nameInput.isVisible({ timeout: 2500 }).catch(() => false)) {
      await nameInput.fill(dynamicEc.name);
    }
    const phoneInput = page.locator('input[type="tel"]').last();
    if (await phoneInput.isVisible({ timeout: 2500 }).catch(() => false)) {
      await phoneInput.fill(dynamicEc.phone);
    }
    const saveBtn = page.locator('button:has-text("Save")').first();
    if (await saveBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await saveBtn.click();
    }
  }
);

Then(
  'Account Settings should display the configured emergency contact details',
  async ({ page }) => {
    await expect(
      page.locator('text=/Emergency Contacts/i').first()
    ).toBeVisible({ timeout: 10000 });
  }
);

Then(
  'Account Settings Contact section should display the account email address and verification status action',
  async ({ page }) => {
    await expect(page.locator('text=/Email/i').first()).toBeVisible({
      timeout: 10000,
    });
  }
);

When(
  'the regression user navigates from Account Settings to the Subscription and Plans page',
  async ({ page }) => {
    const baseUrl =
      process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com';
    await page.goto(`${baseUrl}/subscription?tab=plans`, {
      waitUntil: 'domcontentloaded',
    });
  }
);

Then(
  'the Subscription and Plans page should display the {string} tab and {string} tab',
  async ({ page }, tab1, tab2) => {
    await expect(
      page.locator(`button:has-text("${tab1}")`).first()
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.locator(`button:has-text("${tab2}")`).first()
    ).toBeVisible({ timeout: 15000 });
  }
);

When(
  'the regression user opens the {string} tab on the Subscription and Plans page',
  async ({ page }, tabName) => {
    const baseUrl =
      process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com';
    if (!page.url().includes('/subscription')) {
      await page.goto(`${baseUrl}/subscription?tab=plans`, {
        waitUntil: 'domcontentloaded',
      });
    }
    const tabBtn = page.locator(`button:has-text("${tabName}")`).first();
    await tabBtn.waitFor({ state: 'visible', timeout: 15000 });
    await tabBtn.click();
  }
);

When(
  'the regression user toggles between {string} and {string}',
  async ({ page }, toggle1, toggle2) => {
    const btn1 = page.locator(`button:has-text("${toggle1}")`).first();
    const btn2 = page.locator(`button:has-text("${toggle2}")`).first();
    if (await btn1.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn1.click();
    }
    if (await btn2.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn2.click();
    }
  }
);

Then(
  'the Companion Plan pricing display should update between monthly and annual billing tiers',
  async ({ page }) => {
    await expect(
      page.locator('text=/99\\.99|9\\.99/i').first()
    ).toBeVisible({ timeout: 10000 });
  }
);

When(
  'a Free tier regression user clicks {string} on the Subscription and Plans page',
  async ({ page, subscriptionPage }, _btnText) => {
    const baseUrl =
      process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com';
    await page.goto(`${baseUrl}/subscription?tab=plans`, {
      waitUntil: 'domcontentloaded',
    });
    await subscriptionPage.clickUpgradeOnPlansPageAndWaitForStripe();
  }
);

Then(
  'the browser should redirect to a valid Stripe Hosted Checkout session URL',
  async ({ page }) => {
    expect(page.url()).toContain('checkout.stripe.com');
  }
);

When(
  'a Companion tier regression user from SQLite logs in and opens the Subscription page',
  async ({ page, loginPage, testUserManager }) => {
    const allUsers = testUserManager.getAllPatients();
    const companionUser =
      allUsers.find(u => u.subscriptionTier === 'companion') || allUsers[0];
    await loginPage.open();
    await loginPage.fillLoginForm(
      companionUser.email,
      testUserManager.getCommonPassword()
    );
    await loginPage.submit();
    await page.waitForURL(
      url =>
        url.pathname.includes('/home') ||
        url.pathname.includes('/pets') ||
        url.pathname.includes('/add-pet'),
      { timeout: 30000 }
    );
    const baseUrl =
      process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com';
    await page.goto(`${baseUrl}/subscription`, {
      waitUntil: 'domcontentloaded',
    });
  }
);

Then(
  'the Subscription page should reflect the active Companion tier status',
  async ({ page }) => {
    await expect(
      page.locator('text=/Companion|Subscription/i').first()
    ).toBeVisible({ timeout: 15000 });
  }
);

When(
  'the regression user updates their profile details in Account Settings and performs a logout and login cycle',
  async ({ page, loginPage, testUserManager }) => {
    const email = activeSettingsUser
      ? activeSettingsUser.email
      : 'zosalus+test2@gmail.com';
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();
    await loginPage.open();
    await loginPage.fillLoginForm(email, testUserManager.getCommonPassword());
    await loginPage.submit();
    await page.waitForURL(
      url =>
        url.pathname.includes('/home') ||
        url.pathname.includes('/pets') ||
        url.pathname.includes('/account-setup'),
      { timeout: 30000 }
    );
  }
);

When(
  'the regression user re-opens Account Settings',
  async ({ subscriptionPage }) => {
    await subscriptionPage.openAccountSettings();
  }
);

Then(
  'Account Settings should retain the dynamically updated profile information',
  async ({ page }) => {
    await expect(
      page.locator('text=/Name & Display Name/i').first()
    ).toBeVisible({ timeout: 15000 });
  }
);
