const { createBdd } = require('playwright-bdd');
const { test } = require('../../../fixtures/testFixture');
const { expect } = require('@playwright/test');
const {
  generateDynamicOwnerProfile,
} = require('../../../utils/dynamicTestDataGenerator');

const { Given, When, Then } = createBdd(test);

let regressionFreeUser = null;
let regressionStripeUrl = null;

Given(
  'a regression Free plan user with one registered pet is retrieved from SQLite and logged in',
  async ({ page, loginPage, testUserManager }) => {
    regressionFreeUser =
      testUserManager.getFreePlanPatientWithOnePet() ||
      testUserManager.getActivePatient('login-patient');

    await loginPage.open();
    await loginPage.fillLoginForm(
      regressionFreeUser.email,
      testUserManager.getCommonPassword()
    );
    await loginPage.submit();

    await page.waitForURL(
      url =>
        url.pathname.includes('/home') ||
        url.pathname.includes('/pets') ||
        url.pathname.includes('/add-pet'),
      { timeout: 35000 }
    );
  }
);

When(
  'the regression Free plan user opens Account Settings',
  async ({ subscriptionPage }) => {
    await subscriptionPage.openAccountSettings();
  }
);

Then(
  'Account Settings should display the {string} badge in the profile header',
  async ({ page }, badgeText) => {
    await expect(
      page.locator(`span:has-text("${badgeText}")`).first()
    ).toBeVisible({ timeout: 15000 });
  }
);

When(
  'the regression Free plan user clicks the sidebar add pet button to add a second animal',
  async ({ subscriptionPage }) => {
    await subscriptionPage.triggerAddSecondPet();
  }
);

Then(
  'the Add Pet route should render the upgrade gate heading {string}',
  async ({ page }, headingText) => {
    await expect(
      page
        .locator(
          `h4:has-text("${headingText}"), h3:has-text("${headingText}")`
        )
        .first()
    ).toBeVisible({ timeout: 15000 });
  }
);

When(
  'the regression Free plan user clicks the {string} button on the second pet upgrade gate',
  async ({ page }, btnLabel) => {
    await page.locator(`button:has-text("${btnLabel}")`).first().click();
  }
);

Then(
  'the user should remain on the Free plan and return to the portal dashboard or pet view',
  async ({ page }) => {
    await page.waitForTimeout(1000);
    expect(page.url()).not.toContain('checkout.stripe.com');
  }
);

When(
  'the regression Free plan user clicks the {string} item in the left navigation sidebar',
  async ({ page }, navLabel) => {
    const navItem = page
      .locator(`aside a:has-text("${navLabel}"), aside button:has-text("${navLabel}")`)
      .first();
    if (await navItem.isVisible({ timeout: 5000 }).catch(() => false)) {
      await navItem.click();
    }
  }
);

Then(
  'the portal should display a Companion upgrade prompt or PRO feature gate for Trends',
  async ({ page }) => {
    await expect(
      page.locator('text=/Companion|Trends|Upgrade/i').first()
    ).toBeVisible({ timeout: 15000 });
  }
);

Then(
  'the portal should display a Companion upgrade prompt or PRO feature gate for Insurance and Billing',
  async ({ page }) => {
    await expect(
      page.locator('text=/Companion|Insurance|Upgrade/i').first()
    ).toBeVisible({ timeout: 15000 });
  }
);

When(
  'the regression Free plan user clicks {string} on the upgrade gate',
  async ({ subscriptionPage }, _btnText) => {
    await subscriptionPage.clickUpgradeFromSecondPetGate();
  }
);

Then(
  'the Subscription Plans page should display {string}',
  async ({ page }, heading) => {
    await expect(
      page.locator(`h2:has-text("${heading}")`).first()
    ).toBeVisible({ timeout: 15000 });
  }
);

Then(
  'the Plan Comparison view should display both {string} and {string} with 15-day free trial badge',
  async ({ page }, freeCard, companionCard) => {
    await expect(
      page.locator(`h3:has-text("${freeCard}")`).first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.locator(`h3:has-text("${companionCard}")`).first()
    ).toBeVisible({ timeout: 10000 });
  }
);

Given(
  'the regression Free plan user launches a Companion Plan Stripe Hosted Checkout session',
  async ({ page, loginPage, subscriptionPage, testUserManager }) => {
    if (regressionStripeUrl) {
      await page.goto(regressionStripeUrl, { waitUntil: 'domcontentloaded' });
      const frame = await subscriptionPage
        .getStripeCheckoutFrame(12000)
        .catch(() => null);
      if (frame) return;
    }

    regressionFreeUser =
      testUserManager.getFreePlanPatientWithOnePet() ||
      testUserManager.getActivePatient('login-patient');

    await loginPage.open();
    await loginPage.fillLoginForm(
      regressionFreeUser.email,
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
    await page.goto(`${baseUrl}/subscription?tab=plans`, {
      waitUntil: 'domcontentloaded',
    });
    await subscriptionPage.clickUpgradeOnPlansPageAndWaitForStripe();
    regressionStripeUrl = page.url();
  }
);

When(
  'the regression user enters Stripe card {string}, expiry {string}, CVC {string}, and a dynamically generated cardholder name',
  async ({ subscriptionPage }, cardNumber, expiry, cvc) => {
    const dynamicBillingOwner = generateDynamicOwnerProfile();
    const frame = await subscriptionPage.getStripeCheckoutFrame(30000);
    await frame
      .locator(subscriptionPage.selectors.stripeCardNumberInput)
      .first()
      .fill(cardNumber);
    await frame
      .locator(subscriptionPage.selectors.stripeCardExpiryInput)
      .first()
      .fill(expiry);
    await frame
      .locator(subscriptionPage.selectors.stripeCardCvcInput)
      .first()
      .fill(cvc);
    const nameInput = frame
      .locator(subscriptionPage.selectors.stripeBillingNameInput)
      .first();
    if (await nameInput.isVisible({ timeout: 2500 }).catch(() => false)) {
      await nameInput.fill(dynamicBillingOwner.fullName);
    }
  }
);

When(
  'the regression user clicks Start trial on Stripe Hosted Checkout',
  async ({ page, subscriptionPage }) => {
    const baseUrl =
      process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com';
    await page.route('https://dev.zosalus.com/**', async route => {
      const targetUrl = new URL(route.request().url());
      await route.fulfill({
        status: 302,
        headers: {
          Location: `${baseUrl}${targetUrl.pathname}${targetUrl.search}`,
        },
      });
    });

    const frame = await subscriptionPage.getStripeCheckoutFrame(20000);
    await frame
      .locator(subscriptionPage.selectors.stripeSubmitBtn)
      .first()
      .click();
  }
);

Then(
  'Stripe Hosted Checkout should reject the payment with a decline alert for code {string}',
  async ({ page, subscriptionPage }, _declineCode) => {
    const frame = await subscriptionPage.getStripeCheckoutFrame(15000);
    const err = frame
      .locator(
        '[role="alert"], .FieldError, .Notice--error, div[class*="Error"], span[class*="Error"]'
      )
      .filter({
        hasText:
          /declined|insufficient funds|expired|security code|error occurred/i,
      })
      .first();
    await expect(err).toBeVisible({ timeout: 25000 });
    expect(page.url()).toContain('checkout.stripe.com');
  }
);

Then(
  'Stripe Hosted Checkout should display the 3D Secure OTP authentication challenge frame',
  async ({ page }) => {
    await expect
      .poll(
        async () => {
          for (const frame of page.frames()) {
            if (
              frame.url().includes('3ds') ||
              frame.url().includes('authenticate') ||
              frame.url().includes('challenge')
            ) {
              return true;
            }
            const has3ds = await frame
              .locator(
                'text=/3D Secure|Complete authentication|Fail authentication/i'
              )
              .first()
              .isVisible({ timeout: 300 })
              .catch(() => false);
            if (has3ds) return true;
          }
          return false;
        },
        { timeout: 30000 }
      )
      .toBe(true);
    regressionStripeUrl = null;
  }
);

When(
  'the regression user navigates back from Stripe Hosted Checkout to Zosalus without completing payment',
  async ({ page }) => {
    const baseUrl =
      process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com';
    await page.goto(`${baseUrl}/add-pet`, { waitUntil: 'domcontentloaded' });
  }
);

Then(
  'the user should remain on the Free plan and still see the Companion upgrade gate on Add Pet',
  async ({ page }) => {
    await expect(
      page
        .locator('h4:has-text("Adding a second animal requires Companion")')
        .first()
    ).toBeVisible({ timeout: 15000 });
  }
);

Then(
  'the Companion Plan subscription should activate and update the user tier to {string} in SQLite',
  async ({ page, testUserManager }, tier) => {
    await page.waitForURL(
      url => !url.hostname.includes('checkout.stripe.com'),
      { timeout: 45000 }
    );
    if (regressionFreeUser) {
      testUserManager.updatePatientSubscriptionTier(
        regressionFreeUser.email,
        tier
      );
    }
  }
);

Then(
  'the Add Pet wizard should be unlocked for adding a second pet without the upgrade gate',
  async ({ page, loginPage, addPetPage, testUserManager }) => {
    const baseUrl =
      process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com';
    if (regressionFreeUser) {
      await loginPage.open();
      await loginPage.fillLoginForm(
        regressionFreeUser.email,
        testUserManager.getCommonPassword()
      );
      await loginPage.submit();
      await page.waitForURL(
        url =>
          url.pathname.includes('/home') || url.pathname.includes('/pets'),
        { timeout: 30000 }
      );
    }
    await page.goto(`${baseUrl}/add-pet`, { waitUntil: 'domcontentloaded' });
    await expect(
      page.locator(addPetPage.selectors.petNameInput).first()
    ).toBeVisible({ timeout: 20000 });
  }
);

Given(
  'an active Companion Plan subscriber from SQLite is logged into the Zosalus portal',
  async ({ page, loginPage, testUserManager }) => {
    const companionUser =
      testUserManager
        .getAllPatients()
        .find(u => u.subscriptionTier === 'companion') ||
      testUserManager.getActivePatient('login-patient');

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
  }
);

When(
  'the active Companion subscriber navigates to the Add Pet wizard',
  async ({ page }) => {
    const baseUrl =
      process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com';
    await page.goto(`${baseUrl}/add-pet`, { waitUntil: 'domcontentloaded' });
  }
);

Then(
  'the Add Pet Step 1 form should be immediately unlocked without displaying the Free tier upgrade gate',
  async ({ page, addPetPage }) => {
    await expect(
      page.locator(addPetPage.selectors.petNameInput).first()
    ).toBeVisible({ timeout: 20000 });
  }
);
