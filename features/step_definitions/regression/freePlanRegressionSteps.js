const { createBdd } = require('playwright-bdd');
const { test } = require('../../../fixtures/testFixture');
const { expect } = require('@playwright/test');
const {
  generateDynamicOwnerProfile,
  generateDynamicPetProfile,
} = require('../../../utils/dynamicTestDataGenerator');
const { generatePetAvatarImage } = require('../../../utils/petImageGenerator');

const { Given, When, Then } = createBdd(test);

const BASE_URL =
  process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com';

let freePlanUser = null;
let freePlanOwner = null;
let freePlanPet = null;

/**
 * Helper: Wait for any "Loading subscription details" or "Loading your account" spinner to finish
 * @param {import('@playwright/test').Page} page
 */
async function waitForLoadingToSettle(page) {
  const loaders = page.locator(
    'text=/Loading subscription details|Loading your account/i'
  );
  if (await loaders.first().isVisible({ timeout: 2000 }).catch(() => false)) {
    await loaders
      .first()
      .waitFor({ state: 'hidden', timeout: 25000 })
      .catch(() => {});
  }
  await page.waitForTimeout(400);
}

/**
 * Helper: Assert a list of exact text strings are visible on the page
 * @param {import('@playwright/test').Page} page
 * @param {string[]} expectedTexts
 * @param {number} [timeout=15000]
 */
async function assertAllTextsVisible(page, expectedTexts, timeout = 15000) {
  for (const text of expectedTexts) {
    await expect(
      page.getByText(text, { exact: false }).first(),
      `Expected text to be visible: "${text}"`
    ).toBeVisible({ timeout });
  }
}

/**
 * Helper: Verify both Trends and Insurance & Billing sidebar links have the Companion lock icon
 * @param {import('@playwright/test').Page} page
 */
async function assertTrendsAndInsuranceLockedInSidebar(page) {
  const trendsLink = page.locator('aside a[href="/trends"]').first();
  await expect(trendsLink).toBeVisible({ timeout: 15000 });
  await expect(trendsLink).toContainText('Trends');
  await expect(
    trendsLink.locator('span[title="Companion Feature"] svg.lucide-lock').first()
  ).toBeVisible({ timeout: 10000 });

  const insuranceLink = page
    .locator('aside a[href="/insurance-billing"]')
    .first();
  await expect(insuranceLink).toBeVisible({ timeout: 15000 });
  await expect(insuranceLink).toContainText('Insurance & Billing');
  await expect(
    insuranceLink
      .locator('span[title="Companion Feature"] svg.lucide-lock')
      .first()
  ).toBeVisible({ timeout: 10000 });
}

// ============================================================================
// SHARED SETUP: CREATE NEW ACCOUNT -> LOGIN -> COMPLETE PROFILE SETUP
// ============================================================================

Given(
  'a brand-new Free plan user creates an account, logs in, and completes dynamic profile setup',
  async ({
    page,
    signupPage,
    loginPage,
    accountSetupPage,
    testUserManager,
  }) => {
    test.setTimeout(180000);

    freePlanPet = null;
    freePlanOwner = generateDynamicOwnerProfile();
    const candidate = testUserManager.generatePatient('login-patient');
    const password = testUserManager.getCommonPassword();

    // 1. Create a brand-new account via /signup
    await signupPage.open();
    await signupPage.fillRegistrationForm(candidate.email, password, password);
    await signupPage.submit();
    await page.waitForURL('**/login', { timeout: 30000 });

    freePlanUser = testUserManager.savePatient({
      ...candidate,
      firstName: freePlanOwner.firstName,
      lastName: freePlanOwner.lastName,
      accountStatus: 'ACTIVE',
      hasPet: 0,
      petCount: 0,
      subscriptionTier: 'free',
    });

    // 2. Log in with the newly created account
    await loginPage.open();
    await loginPage.fillLoginForm(freePlanUser.email, password);
    await loginPage.submit();
    await page.waitForURL(
      url =>
        url.pathname.includes('/account-setup') ||
        url.pathname.includes('/home') ||
        url.pathname.includes('/add-pet'),
      { timeout: 35000 }
    );

    // 3. Complete Account / Profile Setup dynamically
    if (page.url().includes('/account-setup')) {
      await accountSetupPage.waitForPageLoaded();
      await accountSetupPage.fillFirstName(freePlanOwner.firstName);
      await accountSetupPage.fillLastName(freePlanOwner.lastName);
      await accountSetupPage.fillPhoneNumber(freePlanOwner.phone);
      await accountSetupPage.fillUsername(freePlanOwner.username);
      await accountSetupPage.clickSaveAndContinue();
      await page.waitForURL(
        url => !url.pathname.includes('/account-setup'),
        { timeout: 30000 }
      );
    }

    // Land on /home to begin assertions from a clean portal state
    await page.goto(`${BASE_URL}/home`, { waitUntil: 'domcontentloaded' });
    await waitForLoadingToSettle(page);
  }
);

// ============================================================================
// SUBSCRIPTION & PLAN COMPARISON FULL CONTENT ASSERTIONS
// ============================================================================

When(
  'the Free plan user navigates to the Subscription and Plans page',
  async ({ page }) => {
    await page.goto(`${BASE_URL}/subscription`, {
      waitUntil: 'domcontentloaded',
    });
    await waitForLoadingToSettle(page);
  }
);

Then(
  'the My Subscription tab should display full expected Free Tier active plan and add-on content for {int} registered pets',
  async ({ page }, registeredCount) => {
    await waitForLoadingToSettle(page);
    await expect(
      page.locator('button:has-text("My Subscription")').first()
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.locator('button:has-text("Plan Comparison")').first()
    ).toBeVisible({ timeout: 15000 });

    await assertAllTextsVisible(page, [
      'SUBSCRIPTION & PLANS',
      'Current Plan',
      'Your active tier, billing terms, and itemized charges',
      'Zosalus Free Tier',
      'Active',
      'Single animal profile · Standard permanent medical record storage',
      'Upgrade to Companion',
      'Manage Payment Method',
      'Available Changes & Add-ons',
      'Expand your pet capacity or manage billing preferences',
      '$4.99 / mo',
      'Additional Pets Add-on',
      'Expand capacity by +5 animal profiles. Stack multiple bundles as your family or rescue expands.',
      'Current Pet Limit:',
      '1 profiles',
      'Current Living Pets:',
      `${registeredCount} registered`,
      'Capacity after +1 bundle:',
      '6 profiles',
      'Add 5 Pet Slots',
      '2 Months Free on Annual',
      'Switch to Annual Billing',
      'Pay $99.99/year instead of $9.99/month and get 2 full months of Companion free.',
      'Monthly Rate:',
      '$9.99 / mo ($119.88/yr)',
      'Annual Rate:',
      '$99.99 / yr ($8.33/mo)',
      'View Plan Comparison',
    ]);
  }
);

When(
  'the Free plan user switches to the Plan Comparison tab',
  async ({ page }) => {
    const planTab = page.locator('button:has-text("Plan Comparison")').first();
    await planTab.waitFor({ state: 'visible', timeout: 15000 });
    await planTab.click();
    await expect(
      page
        .locator('h2:has-text("Choose the right care plan for your animal family")')
        .first()
    ).toBeVisible({ timeout: 15000 });
  }
);

Then(
  'the Plan Comparison header and billing toggles should match all expected content',
  async ({ page }) => {
    await assertAllTextsVisible(page, [
      'Simple, transparent health record plans',
      'Choose the right care plan for your animal family',
      'Every health record in Zosalus is permanently saved. Upgrade to Companion anytime for multi-pet care, AI insights, and full insurance claim tracking.',
      'Monthly Billing ($9.99/mo)',
      'Annual Billing ($99.99/yr)',
      '2 MONTHS FREE',
    ]);
  }
);

Then(
  'the Free Tier plan card should display all expected pricing, description, feature bullets, and Stay on Free button',
  async ({ page }) => {
    await assertAllTextsVisible(page, [
      'ESSENTIAL CARE',
      'Free Tier',
      'Forever Free',
      '$0',
      '/ month',
      'Comprehensive lifetime health record keeping for a single pet. Ideal for new pet parents getting started.',
      '1 active pet profile',
      'Complete vaccinations, meds & vitals history',
      'Automated document & invoice OCR',
      'Multiple pets & bundle expansion',
      'AI clinical insights & insurance tracker',
    ]);
    await expect(
      page.locator('button:has-text("Stay on Free")').first()
    ).toBeVisible({ timeout: 10000 });
  }
);

Then(
  'the Companion Plan card should display all expected Annual billing pricing, 15-day free trial badges, feature bullets, and Upgrade CTA',
  async ({ page }) => {
    await assertAllTextsVisible(page, [
      '15-DAY FREE TRIAL',
      'MOST POPULAR',
      'Companion Plan',
      '$99.99',
      '/ year ($8.33/mo)',
      'Includes 15-day free trial · 2 months free (~17% off)',
      'Full multi-pet health ecosystem: up to 10 animals base, AI health summaries, insurance claim management, and expandable pet slots.',
      'Up to 10 animal profiles (base)',
      '+5 Pet Slot Bundles available ($4.99/mo)',
      'AI-powered clinical health summaries',
      'Pet insurance policy & deductible tracker',
      'Full longitudinal health & biomarker trends',
      '15 days free. You will not be charged if you cancel before trial ends.',
    ]);
    await expect(
      page.locator('button:has-text("Upgrade to Companion")').first()
    ).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the Free plan user toggles to Monthly Billing on Plan Comparison',
  async ({ page }) => {
    const monthlyBtn = page
      .locator('button:has-text("Monthly Billing")')
      .first();
    await monthlyBtn.waitFor({ state: 'visible', timeout: 10000 });
    await monthlyBtn.click();
    await page.waitForTimeout(400);
  }
);

Then(
  'the Companion Plan card should update to display Monthly Billing pricing at $9.99 per month',
  async ({ page }) => {
    await assertAllTextsVisible(page, ['$9.99', '/ month', 'Companion Plan']);
  }
);

Then(
  'the Feature-by-Feature Comparison table should display all expected rows, Free Tier limits, Companion Plan benefits, and Permanent Health Record Guarantee',
  async ({ page }) => {
    await assertAllTextsVisible(page, [
      'Feature-by-Feature Comparison',
      'Clear breakdown of what is included in each plan',
      'Permanent medical record storage',
      'Animal Profiles Limit',
      'Active living pet profiles managed simultaneously',
      '1 pet slot',
      '10 pet slots (Expandable)',
      'Stackable Additional Pets',
      'Purchase +5 slots bundles anytime ($4.99/mo)',
      'Yes (+5 slots per bundle)',
      'Full Health Records & Timeline',
      'Vaccines, medications, labs, vitals, allergies & episodes',
      'Smart Document OCR & Extraction',
      'Scan and automatically parse veterinary clinic invoices & records',
      'Trend Analytics & Visual Biomarkers',
      'Interactive weight & vital trend charts with full clinical history',
      'Basic view (blurred preview)',
      'Full interactive charts',
      'AI Clinical Health Insights',
      'On-demand intelligent summaries of complex health histories',
      'Full access',
      'Pet Insurance & Claims Tracker',
      'Deductible tracking, claim status logs & reimbursements',
      'Full policy tracking',
      'Permanent Health Record Guarantee',
      'Your medical records and history are never deleted',
      'Never lose access to recorded history even if you switch back to Free.',
    ]);
    await expect(
      page.locator('button:has-text("Start 15-Day Free Trial")').first()
    ).toBeVisible({ timeout: 10000 });
  }
);

// ============================================================================
// 0-PET FREE PLAN CONTENT & LOCKED FIELDS VALIDATION
// ============================================================================

Then(
  'the Free plan sidebar without a pet should display {string}, {string}, and {string}',
  async ({ page }, heading, subtitle, ctaText) => {
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toContainText(heading, { timeout: 15000 });
    await expect(sidebar).toContainText(subtitle, { timeout: 10000 });
    await expect(
      sidebar.locator(`button:has-text("${ctaText}")`).first()
    ).toBeVisible({ timeout: 10000 });
  }
);

Then(
  'the Free plan user with 0 pets should see the empty-pet sidebar, Dashboard empty state, and locked Trends and Insurance & Billing navigation items',
  async ({ page }) => {
    await page.goto(`${BASE_URL}/home`, { waitUntil: 'domcontentloaded' });
    await waitForLoadingToSettle(page);

    const sidebar = page.locator('aside').first();
    await expect(sidebar).toContainText('No Pets Added', { timeout: 15000 });
    await expect(sidebar).toContainText(
      'Register a pet to unlock full health logs'
    );
    await expect(
      sidebar.locator('button:has-text("Add First Pet")').first()
    ).toBeVisible();

    await assertAllTextsVisible(page, [
      'DASHBOARD',
      'No pets registered yet',
      'Add your first animal profile to access medical records, care teams, and health tracking.',
      'Add Your First Pet',
    ]);

    await assertTrendsAndInsuranceLockedInSidebar(page);
  }
);

Then(
  'the Dashboard page without a pet should display full expected empty-state content and the unverified email notice',
  async ({ page }) => {
    await page.goto(`${BASE_URL}/home`, { waitUntil: 'domcontentloaded' });
    await waitForLoadingToSettle(page);

    await assertAllTextsVisible(page, [
      'PET PORTAL',
      'DASHBOARD',
      'No pets registered yet',
      'Add your first animal profile to access medical records, care teams, and health tracking.',
      'Add Your First Pet',
      'Verify your email',
      'REQUIRED',
      `We sent a link to ${freePlanUser.email}. Please verify your address.`,
      'Resend Link',
      'Settings',
    ]);
  }
);

Then(
  'the Health Records page without a pet should display full expected empty-state content',
  async ({ page }) => {
    await page.goto(`${BASE_URL}/health-records`, {
      waitUntil: 'domcontentloaded',
    });
    await waitForLoadingToSettle(page);

    await assertAllTextsVisible(page, [
      'CLINICAL HEALTH RECORDS',
      'No pet profiles registered',
      'Add your first pet to start tracking vaccinations, medications, diagnostic blood panels, and vital trends.',
      'Add Your First Pet',
    ]);
  }
);

Then(
  'the Conditions and Episodes page without a pet should display full expected 0-count summary cards and empty-state content',
  async ({ page }) => {
    await page.goto(`${BASE_URL}/conditions-episodes`, {
      waitUntil: 'domcontentloaded',
    });
    await waitForLoadingToSettle(page);

    await assertAllTextsVisible(page, [
      'MEDICAL CONDITIONS & EPISODIC DIARY',
      'Medical Diagnoses',
      'Episodic Diary',
      'Record Diagnosis',
      'ACTIVE',
      'Under treatment',
      'CHRONIC',
      'Long-term care',
      'RECURRENT',
      'Periodic flare-ups',
      'RESOLVED',
      'Clinically inactive',
      'INSURANCE',
      'Claim relevant',
      '0 diagnoses matching',
      'No past medical records logged for your pet',
      'Record standing medical conditions, chronic illnesses, or past diagnoses to build a permanent veterinary medical history.',
      'Record First Diagnosis',
    ]);
  }
);

Then(
  'the Documents page without a pet should display full expected Document Library empty-state content',
  async ({ page }) => {
    await page.goto(`${BASE_URL}/documents`, { waitUntil: 'domcontentloaded' });
    await waitForLoadingToSettle(page);

    await assertAllTextsVisible(page, [
      'DOCUMENTS & RECORDS',
      'Document Library',
      '0 documents total',
      'OCR Queue',
      'Upload Document',
      'Email documents directly to your library',
      'Automatic Intake',
      'No documents yet',
      'Upload a lab report or give your vet your personal inbound email address to see documents appear automatically.',
      'Upload First Document',
      'Get Inbound Email Address',
    ]);
  }
);

Then(
  'both {string} and {string} sidebar links should display the Companion Feature lock icon',
  async ({ page }, _firstLabel, _secondLabel) => {
    await assertTrendsAndInsuranceLockedInSidebar(page);
  }
);

When(
  'the Free plan user clicks the locked {string} sidebar link',
  async ({ page }, navLabel) => {
    const href = navLabel.toLowerCase().includes('trend')
      ? '/trends'
      : '/insurance-billing';
    const link = page.locator(`aside a[href="${href}"]`).first();
    await link.waitFor({ state: 'visible', timeout: 15000 });
    await link.click();
    await page.waitForURL(`**${href}**`, { timeout: 15000 });
    await waitForLoadingToSettle(page);
  }
);

Then(
  'the Health Trends page should display the complete Companion Tier Feature lock screen content',
  async ({ page }) => {
    const petRef = freePlanPet ? freePlanPet.name : 'your pet';
    await assertAllTextsVisible(page, [
      'HEALTH TRENDS',
      'Companion Tier Feature',
      `Unlock Lifetime Health Trends for ${petRef}`,
      'Longitudinal weight tracking, AI-powered health score heatmaps, lab reference bands, and on-demand summary synthesis are available exclusively on the Companion Tier.',
      'Lifetime weight change curves with non-living status gap shading',
      'Specific lab test picker with physiological reference range bands',
      'Gantt-style medication history & insurance claim PDF exports',
      'Claude 3.5 Haiku on-demand lifetime context assembly & narrative',
    ]);
    await expect(
      page.locator('button:has-text("Upgrade to Companion")').first()
    ).toBeVisible({ timeout: 10000 });
  }
);

Then(
  'the Insurance and Billing page should display the complete Companion Plan Exclusive lock screen content',
  async ({ page }) => {
    const petRef = freePlanPet ? freePlanPet.name : 'your pet';
    await assertAllTextsVisible(page, [
      'INSURANCE & BILLING',
      'COMPANION PLAN EXCLUSIVE',
      'Pet Insurance & Claims Tracker',
      `Manage pet insurance policies, submit claims, track reimbursements, and monitor annual veterinary spend for ${petRef}. Available exclusively on the Companion plan.`,
      'WHAT COMPANION UNLOCKS:',
      'Direct policy integration with major pet insurance carriers',
      'One-click insurance claim generation & status tracking',
      'Veterinary invoice ledger & annual expense analytics',
      'Deductible & payout tracking dashboard',
    ]);
    await expect(
      page
        .locator('button:has-text("Upgrade to Companion (15-Day Free Trial)")')
        .first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.locator('button:has-text("Back to Dashboard")').first()
    ).toBeVisible({ timeout: 10000 });
  }
);

// ============================================================================
// ACCOUNT SETTINGS FREE PLAN ASSERTIONS
// ============================================================================

Then(
  'Account Settings should display the Free plan badge and {string} billing summary',
  async ({ page }, billingSummary) => {
    await page.goto(`${BASE_URL}/account`, { waitUntil: 'domcontentloaded' });
    await waitForLoadingToSettle(page);

    await assertAllTextsVisible(page, [
      'ACCOUNT SETTINGS',
      'Free plan',
      'SUBSCRIPTION & BILLING',
      'Plan & Billing',
      billingSummary,
    ]);
  }
);

Then(
  'Account Settings should display the dynamic owner profile, the Free plan badge, and {string} billing summary',
  async ({ page }, billingSummary) => {
    await page.goto(`${BASE_URL}/account`, { waitUntil: 'domcontentloaded' });
    await waitForLoadingToSettle(page);

    await assertAllTextsVisible(page, [
      'ACCOUNT SETTINGS',
      freePlanOwner.fullName,
      `@${freePlanOwner.username}`,
      freePlanUser.email,
      'Free plan',
      'SUBSCRIPTION & BILLING',
      'Plan & Billing',
      billingSummary,
    ]);
  }
);

// ============================================================================
// 1-PET REGISTRATION & VERIFICATION ON FREE PLAN
// ============================================================================

When(
  'the Free plan user registers 1 dynamic pet on the Free plan',
  async ({ page, addPetPage, testUserManager }) => {
    freePlanPet = generateDynamicPetProfile({
      species: 'Dog',
      neuterStatus: 'Neutered / Spayed',
    });

    await page.goto(`${BASE_URL}/add-pet`, { waitUntil: 'domcontentloaded' });
    await waitForLoadingToSettle(page);
    await page
      .locator(addPetPage.selectors.petNameInput)
      .waitFor({ state: 'visible', timeout: 25000 });

    await addPetPage.fillStep1({
      name: freePlanPet.name,
      species: freePlanPet.species,
      breed: freePlanPet.breed,
    });
    const resolvedBreed = await page
      .locator(addPetPage.selectors.petBreedInput)
      .inputValue()
      .catch(() => freePlanPet.breed);
    if (resolvedBreed && resolvedBreed.trim()) {
      freePlanPet.breed = resolvedBreed.trim();
    }
    await addPetPage.clickContinue();

    await addPetPage.fillStep2({
      birthdate: freePlanPet.birthdate,
      sex: freePlanPet.sex,
      neuterStatus: freePlanPet.neuterStatus,
      colorMarkings: freePlanPet.colorMarkings,
      microchipNumber: freePlanPet.microchipNumber,
    });
    await addPetPage.clickContinue();

    const avatarPath = generatePetAvatarImage(
      'dog',
      `free-plan-${freePlanPet.name.toLowerCase()}-${Date.now()}.png`
    );
    await addPetPage.uploadAndCropPetPhoto(avatarPath);
    await addPetPage.clickSaveProfile();

    await page.waitForURL(
      url =>
        url.pathname.includes('/pets') || url.pathname.includes('/home'),
      { timeout: 30000 }
    );
    await waitForLoadingToSettle(page);

    const petUrlMatch = page.url().match(/\/pets\/([^/?#]+)/);
    testUserManager.markPatientHasPet(freePlanUser.email, {
      petName: freePlanPet.name,
      petSpecies: freePlanPet.species,
      petId: petUrlMatch ? petUrlMatch[1] : null,
    });
  }
);

Then(
  "the sidebar should display 1 active pet profile with the pet's saved name and breed while keeping Trends and Insurance & Billing locked",
  async ({ page }) => {
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toContainText(/My Pets/i, { timeout: 15000 });
    await expect(sidebar).toContainText(freePlanPet.name, { timeout: 15000 });
    await expect(sidebar).toContainText(freePlanPet.breed, { timeout: 10000 });
    await assertTrendsAndInsuranceLockedInSidebar(page);
  }
);

Then(
  'the My Subscription tab should reflect Free Tier active status with 1 of 1 living pet registered',
  async ({ page }) => {
    await page.goto(`${BASE_URL}/subscription`, {
      waitUntil: 'domcontentloaded',
    });
    await waitForLoadingToSettle(page);

    await assertAllTextsVisible(page, [
      'Zosalus Free Tier',
      'Active',
      'Single animal profile · Standard permanent medical record storage',
      'Current Pet Limit:',
      '1 profiles',
      'Current Living Pets:',
      'registered',
      'Capacity after +1 bundle:',
      '6 profiles',
    ]);
    await expect(page.locator('aside').first()).toContainText(freePlanPet.name, {
      timeout: 10000,
    });
  }
);

// ============================================================================
// 2ND PET COMPANION UPGRADE GATE FULL CONTENT & NAVIGATION VALIDATION
// ============================================================================

When(
  'the Free plan user attempts to add a second pet on the Free plan',
  async ({ page, subscriptionPage }) => {
    await subscriptionPage.triggerAddSecondPet();
    await waitForLoadingToSettle(page);
  }
);

Then(
  'the Add Pet route should display the complete Companion upgrade gate content blocking the second pet',
  async ({ page, addPetPage }) => {
    await assertAllTextsVisible(page, [
      'Step 1 of 3',
      'Let’s meet your new friend!',
      'Enter their basic name, species, and breed details.',
      'Adding a second animal requires Companion',
      'The Free tier includes 1 active pet profile. Upgrade to Companion to care for up to 10 pets with AI insights, insurance tracking, and full analytics.',
      'Step 1 of 3 · Pet Identity',
      'Every pet deserves a loving profile',
      'Creating your pet’s profile unlocks lifetime health tracking, vaccination reminders, and seamless care team sharing.',
    ]);

    await expect(
      page.locator('button:has-text("Stay on Free")').first()
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page
        .locator('button:has-text("Upgrade to Companion (15-Day Free Trial)")')
        .first()
    ).toBeVisible({ timeout: 10000 });

    // Confirm the pet creation form input is blocked / not rendered
    const petNameCount = await page
      .locator(addPetPage.selectors.petNameInput)
      .count();
    expect(petNameCount).toBe(0);
  }
);

When(
  'the Free plan user clicks {string} on the second pet upgrade gate',
  async ({ page }, buttonLabel) => {
    const btn = page.locator(`button:has-text("${buttonLabel}")`).first();
    await btn.waitFor({ state: 'visible', timeout: 15000 });
    await btn.click();
    await page.waitForTimeout(1000);
  }
);

Then(
  'the Free plan user should return to the portal without upgrading and remain on the Free plan',
  async ({ page }) => {
    expect(page.url()).not.toContain('checkout.stripe.com');
    expect(page.url()).not.toContain('/add-pet');
    await assertTrendsAndInsuranceLockedInSidebar(page);
  }
);

Then(
  'the browser should navigate to the Subscription Plan Comparison view displaying both Free Tier and Companion Plan full content',
  async ({ page }) => {
    await page.waitForURL('**/subscription**', { timeout: 15000 });
    await waitForLoadingToSettle(page);

    await assertAllTextsVisible(page, [
      'Choose the right care plan for your animal family',
      'Free Tier',
      'Forever Free',
      '1 active pet profile',
      'Companion Plan',
      '15-DAY FREE TRIAL',
      'Up to 10 animal profiles (base)',
      'AI-powered clinical health summaries',
      'Pet insurance policy & deductible tracker',
      'Full longitudinal health & biomarker trends',
      'Feature-by-Feature Comparison',
    ]);
  }
);
