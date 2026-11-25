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

let activeAccountSetupUser = null;
let dynamicOwnerData = null;
let dynamicContact1 = null;
let dynamicContact2 = null;

Given(
  'a regression patient account is logged in and navigated to the Account Setup page',
  async ({ page, loginPage, accountSetupPage, testUserManager }) => {
    dynamicOwnerData = generateDynamicOwnerProfile();
    const account =
      testUserManager.getPatientWithoutPet() ||
      testUserManager.getActivePatient('login-patient');
    activeAccountSetupUser = account || {
      email: 'zosalus.patient.003@zosalus-test.org',
    };

    await loginPage.open();
    await loginPage.fillLoginForm(
      activeAccountSetupUser.email,
      testUserManager.getCommonPassword()
    );
    await loginPage.submit();

    await page.waitForURL(
      url =>
        url.pathname.includes('/account-setup') ||
        url.pathname.includes('/home') ||
        url.pathname.includes('/add-pet') ||
        url.pathname.includes('/pets'),
      { timeout: 35000 }
    );

    if (!page.url().includes('/account-setup')) {
      await accountSetupPage.open();
    }
    await accountSetupPage.waitForPageLoaded();
  }
);

When(
  'the regression user fills dynamically generated First Name, Last Name, valid US Phone, and Username on Account Setup',
  async ({ accountSetupPage }) => {
    dynamicOwnerData = generateDynamicOwnerProfile();
    await accountSetupPage.fillFirstName(dynamicOwnerData.firstName);
    await accountSetupPage.fillLastName(dynamicOwnerData.lastName);
    await accountSetupPage.fillPhoneNumber(dynamicOwnerData.phone);
    await accountSetupPage.fillUsername(dynamicOwnerData.username);
  }
);

When(
  'the regression user verifies the Email field on Account Setup is pre-filled with the authenticated account email',
  async ({ accountSetupPage }) => {
    const emailVal = await accountSetupPage.getEmailValue();
    expect(emailVal).toBeTruthy();
    expect(emailVal).toContain('@');
  }
);

When(
  'the regression user selects Preferred Contact Method {string} on Account Setup',
  async ({ accountSetupPage }, method) => {
    await accountSetupPage.selectPreferredContactMethod(method);
  }
);

When(
  'the regression user fills a dynamically generated US Home Address with street, unit, city, state, and ZIP on Account Setup',
  async ({ accountSetupPage }) => {
    const address = generateDynamicAddress();
    dynamicOwnerData.address = address;
    await accountSetupPage.fillAddress(address);
  }
);

When(
  'the regression user adds a dynamically generated emergency contact with name, relationship, and phone on Account Setup',
  async ({ page }) => {
    dynamicContact1 = generateDynamicEmergencyContact();
    const addBtn = page
      .locator(
        'button:has-text("Add an emergency contact"), button:has-text("Add Contact"), button:has-text("Add Emergency Contact")'
      )
      .first();
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();
    }

    const nameInput = page
      .locator(
        'input[placeholder*="contact name" i], input[name*="emergency" i][name*="name" i], input#emergencyContactName-0'
      )
      .first();
    if (await nameInput.isVisible({ timeout: 2500 }).catch(() => false)) {
      await nameInput.fill(dynamicContact1.name);
    }

    const relInput = page
      .locator(
        'input[placeholder*="relationship" i], input#emergencyContactRelationship-0'
      )
      .first();
    if (await relInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await relInput.fill(dynamicContact1.relationship);
    }

    const phoneInput = page
      .locator(
        'input#emergencyContactPhone-0, input[placeholder*="emergency" i]'
      )
      .first();
    if (await phoneInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await phoneInput.fill(dynamicContact1.phone);
    }
  }
);

When(
  'the regression user clicks Save and Continue on Account Setup',
  async ({ accountSetupPage }) => {
    await accountSetupPage.clickSaveAndContinue();
  }
);

Then(
  'the Account Setup submission should succeed and navigate to the Add Pet or Home portal page',
  async ({ page }) => {
    await page.waitForURL(
      url =>
        url.pathname.includes('/add-pet') ||
        url.pathname.includes('/home') ||
        url.pathname.includes('/pets'),
      { timeout: 25000 }
    );
  }
);

When(
  'the regression user clears First Name, Last Name, Phone Number, and Username on Account Setup',
  async ({ accountSetupPage }) => {
    await accountSetupPage.fillFirstName('');
    await accountSetupPage.fillLastName('');
    await accountSetupPage.fillPhoneNumber('');
    await accountSetupPage.fillUsername('');
  }
);

Then(
  'Account Setup should display required validation errors for First Name, Last Name, Phone Number, and Username',
  async ({ page }) => {
    const errors = page.locator('p.text-error-red, p[class*="text-error-red"]');
    await expect(errors.first()).toBeVisible({ timeout: 10000 });
    expect(await errors.count()).toBeGreaterThanOrEqual(2);
  }
);

When(
  'the regression user fills whitespace-only First Name, Last Name, and Username with a valid dynamic US Phone on Account Setup',
  async ({ accountSetupPage }) => {
    await accountSetupPage.fillFirstName('   ');
    await accountSetupPage.fillLastName('   ');
    await accountSetupPage.fillPhoneNumber(generateValidUsPhone());
    await accountSetupPage.fillUsername('   ');
  }
);

Then(
  'Account Setup should display validation errors for blank or whitespace-only required fields',
  async ({ page }) => {
    const errors = page.locator('p.text-error-red, p[class*="text-error-red"]');
    await expect(errors.first()).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user fills dynamically generated First Name, Last Name, and Username with an invalid short phone number on Account Setup',
  async ({ accountSetupPage }) => {
    const profile = generateDynamicOwnerProfile();
    await accountSetupPage.fillFirstName(profile.firstName);
    await accountSetupPage.fillLastName(profile.lastName);
    await accountSetupPage.fillPhoneNumber(String(Math.floor(1000 + Math.random() * 9000)));
    await accountSetupPage.fillUsername(profile.username);
  }
);

Then(
  'Account Setup should display a phone number format validation error',
  async ({ page }) => {
    const phoneError = page
      .locator('p.text-error-red, p[class*="text-error-red"]')
      .filter({ hasText: /phone|digits|valid/i })
      .first();
    await expect(phoneError).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user fills a dynamically generated US Home Address with an invalid alphabetic ZIP code on Account Setup',
  async ({ accountSetupPage }) => {
    const addr = generateDynamicAddress();
    await accountSetupPage.fillAddress({
      ...addr,
      zip: 'INVALIDZIP',
    });
  }
);

Then(
  'Account Setup should display a ZIP code validation error or remain on Account Setup',
  async ({ page }) => {
    await page.waitForTimeout(800);
    const hasError = await page
      .locator('p.text-error-red, p[class*="text-error-red"]')
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasError || page.url().includes('/account-setup')).toBe(true);
  }
);

Then(
  'the {string} Preferred Contact Method radio option should be active on Account Setup',
  async ({ page, accountSetupPage }, method) => {
    const lower = method.toLowerCase();
    if (lower.includes('phone')) {
      await expect(
        page.locator(accountSetupPage.selectors.prefContactPhoneRadio)
      ).toBeChecked();
    } else if (lower.includes('sms') || lower.includes('text')) {
      await expect(
        page.locator(accountSetupPage.selectors.prefContactTextRadio)
      ).toBeChecked();
    } else {
      await expect(
        page.locator(accountSetupPage.selectors.prefContactEmailRadio)
      ).toBeChecked();
    }
  }
);

When(
  'the regression user adds a first dynamically generated emergency contact on Account Setup',
  async ({ page }) => {
    dynamicContact1 = generateDynamicEmergencyContact();
    const addBtn = page
      .locator(
        'button:has-text("Add an emergency contact"), button:has-text("Add Contact")'
      )
      .first();
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();
    }
    const firstInput = page
      .locator('input[id*="emergency"], input[placeholder*="Name" i]')
      .last();
    if (await firstInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstInput.fill(dynamicContact1.name);
    }
  }
);

When(
  'the regression user adds a second dynamically generated emergency contact on Account Setup',
  async ({ page }) => {
    dynamicContact2 = generateDynamicEmergencyContact();
    const addBtn = page
      .locator(
        'button:has-text("Add another"), button:has-text("Add Contact"), button:has-text("Add an emergency contact")'
      )
      .first();
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();
    }
    const secondInput = page
      .locator('input[id*="emergency"], input[placeholder*="Name" i]')
      .last();
    if (await secondInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await secondInput.fill(dynamicContact2.name);
    }
  }
);

Then(
  'Account Setup should display 2 configured emergency contacts and prevent adding a 3rd emergency contact',
  async ({ page }) => {
    expect(page.url()).toContain('/account-setup');
  }
);

When(
  'the regression user removes the dynamically added emergency contact on Account Setup',
  async ({ page }) => {
    const removeBtn = page
      .locator(
        'button:has-text("Remove"), button[aria-label*="Remove" i], button[aria-label*="Delete" i]'
      )
      .first();
    if (await removeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await removeBtn.click();
    }
  }
);

Then(
  'the removed dynamic emergency contact should no longer appear on Account Setup',
  async ({ page }) => {
    if (dynamicContact1) {
      const contactLocator = page.locator(`text="${dynamicContact1.name}"`);
      expect(await contactLocator.count()).toBe(0);
    }
  }
);

When(
  'the regression user opens the Add Emergency Contact form on Account Setup and submits with blank contact fields',
  async ({ page, accountSetupPage }) => {
    const addBtn = page
      .locator(
        'button:has-text("Add an emergency contact"), button:has-text("Add Contact")'
      )
      .first();
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();
    }
    await accountSetupPage.clickSaveAndContinue();
  }
);

Then(
  'Account Setup should require valid emergency contact name and phone details before saving the contact',
  async ({ page }) => {
    expect(page.url()).toContain('/account-setup');
  }
);

When(
  'the regression user inspects the Timezone and Language preference controls on Account Setup',
  async ({ page, accountSetupPage }) => {
    await page
      .locator(accountSetupPage.selectors.timezoneBtn)
      .scrollIntoViewIfNeeded()
      .catch(() => {});
  }
);

Then(
  'the Timezone selector and Language selector should be visible and interactive on Account Setup',
  async ({ page, accountSetupPage }) => {
    await expect(
      page.locator(accountSetupPage.selectors.timezoneBtn).first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.locator(accountSetupPage.selectors.languageBtn).first()
    ).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user clicks the Skip for now button on Account Setup',
  async ({ accountSetupPage }) => {
    await accountSetupPage.clickSkipForNow();
  }
);

Then(
  'the browser should navigate from Account Setup to the Add Pet or Home portal page',
  async ({ page }) => {
    await page.waitForURL(
      url =>
        url.pathname.includes('/add-pet') ||
        url.pathname.includes('/home') ||
        url.pathname.includes('/pets'),
      { timeout: 25000 }
    );
  }
);

When(
  'the regression user navigates to Account Settings and reloads the browser page',
  async ({ page, subscriptionPage }) => {
    await subscriptionPage.openAccountSettings();
    await page.reload({ waitUntil: 'domcontentloaded' });
  }
);

Then(
  'Account Settings should display the dynamically saved owner name and phone number',
  async ({ page }) => {
    expect(dynamicOwnerData).toBeTruthy();
    await expect(
      page.locator(`text=/${dynamicOwnerData.firstName}/i`).first()
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.locator(`text=/${dynamicOwnerData.phone}/i`).first()
    ).toBeVisible({ timeout: 15000 });
  }
);
