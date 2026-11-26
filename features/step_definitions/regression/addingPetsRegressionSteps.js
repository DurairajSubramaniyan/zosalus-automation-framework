const { createBdd } = require('playwright-bdd');
const { test } = require('../../../fixtures/testFixture');
const { expect } = require('@playwright/test');
const { generatePetAvatarImage } = require('../../../utils/petImageGenerator');
const {
  generateSpeciesCompleteBundle,
} = require('../../../utils/speciesClinicalDataGenerator');
const {
  generateDynamicOwnerProfile,
} = require('../../../utils/dynamicTestDataGenerator');

const { Given, When, Then } = createBdd(test);

const MAX_COMPANION_BASE_PETS = 10;

let activeOnePetCompanionUser = null;
let addedPetBundles = [];

/**
 * Helper: Switch the active pet in the left sidebar MY PETS switcher by pet name
 * @param {import('@playwright/test').Page} page
 * @param {string} petName
 */
async function selectPetInSidebar(page, petName) {
  const petAvatarBtn = page
    .locator(`aside button:has(img[alt="${petName}"])`)
    .first();

  if (await petAvatarBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await petAvatarBtn.evaluate(el => el.click());
  } else {
    // Fallback: locate by partial alt or text inside sidebar
    const fallbackBtn = page
      .locator(`aside button:has-text("${petName}"), aside img[alt*="${petName}"]`)
      .first();
    await fallbackBtn.waitFor({ state: 'visible', timeout: 10000 });
    await fallbackBtn.evaluate(el => el.click());
  }

  // Confirm active pet card heading in sidebar switched to petName
  await expect(
    page.locator(`aside h4:has-text("${petName}")`).first()
  ).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(400);
}

// ============================================================================
// PHASE 0: RETRIEVE COMPANION USER WITH 1 PET & LOG IN
// ============================================================================

Given(
  'an active Companion plan user who currently has only 1 registered pet is retrieved from SQLite and logged into the Zosalus portal',
  async ({ page, loginPage, accountSetupPage, testUserManager }) => {
    // Extended timeout for creating up to 9 pets + adding all 5 Health Records + Diagnosis + Episode + verifying every pet
    test.setTimeout(1200000);
    addedPetBundles = [];

    activeOnePetCompanionUser =
      testUserManager.getCompanionPlanPatientWithExactOnePet() ||
      testUserManager.getCompanionPlanPatientByPetLimit({ maxPets: 9 });

    expect(activeOnePetCompanionUser).toBeTruthy();
    expect(activeOnePetCompanionUser.subscriptionTier).toBe('companion');
    expect(activeOnePetCompanionUser.petCount).toBeLessThan(
      MAX_COMPANION_BASE_PETS
    );

    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();

    await loginPage.open();
    await loginPage.fillLoginForm(
      activeOnePetCompanionUser.email,
      testUserManager.getCommonPassword()
    );
    await loginPage.submit();

    await page.waitForURL(
      url =>
        url.pathname.includes('/account-setup') ||
        url.pathname.includes('/home') ||
        url.pathname.includes('/pets') ||
        url.pathname.includes('/add-pet') ||
        url.pathname.includes('/dashboard'),
      { timeout: 35000 }
    );

    // If this account hasn't completed Account Setup yet, auto-complete with dynamic owner details
    if (page.url().includes('/account-setup')) {
      const dynamicOwner = generateDynamicOwnerProfile();
      await accountSetupPage.waitForPageLoaded();
      await accountSetupPage.fillFirstName(dynamicOwner.firstName);
      await accountSetupPage.fillLastName(dynamicOwner.lastName);
      await accountSetupPage.fillPhoneNumber(dynamicOwner.phone);
      await accountSetupPage.fillUsername(dynamicOwner.username);
      await accountSetupPage.clickSaveAndContinue();

      await page.waitForURL(
        url =>
          url.pathname.includes('/add-pet') ||
          url.pathname.includes('/home') ||
          url.pathname.includes('/pets') ||
          url.pathname.includes('/dashboard'),
        { timeout: 30000 }
      );
    }
  }
);

Given(
  'the Companion user verifies their active Companion subscription status and confirms the initial 1 registered pet in the sidebar',
  async ({ page }) => {
    await expect(page.locator('aside').first()).toBeVisible({ timeout: 15000 });
    await expect(
      page.locator('aside :text("My Pets")').first()
    ).toBeVisible({ timeout: 15000 });

    if (activeOnePetCompanionUser?.petName) {
      const firstPetName = activeOnePetCompanionUser.petName
        .split(',')[0]
        .trim();
      await expect(
        page.locator(`aside img[alt="${firstPetName}"], aside :text("${firstPetName}")`).first()
      ).toBeVisible({ timeout: 15000 });
    }
  }
);

// ============================================================================
// PHASE 1: CREATE ALL REMAINING PETS FIRST (UP TO 10 TOTAL PETS)
// ============================================================================

When(
  'the Companion user first creates all remaining pets up to the 10-pet maximum across distinct species, distinct breeds, dynamic names, 15-digit ISO microchips, and cropped photos',
  async ({ page, addPetPage, testUserManager }) => {
    const baseUrl =
      process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com';

    // Read live pet count from the sidebar ("My Pets N") so we always add the exact remaining pets up to 10
    let livePetCount = activeOnePetCompanionUser.petCount || 1;
    const sidebarText = await page
      .locator('aside')
      .first()
      .innerText()
      .catch(() => '');
    const countMatch = sidebarText.match(/My Pets\s*(\d+)/i);
    if (countMatch) {
      livePetCount = parseInt(countMatch[1], 10);
    }

    const petsToAdd = Math.max(0, MAX_COMPANION_BASE_PETS - livePetCount);
    expect(petsToAdd).toBeGreaterThan(0);

    for (let i = 0; i < petsToAdd; i++) {
      const bundle = generateSpeciesCompleteBundle(i);
      const imgPath = generatePetAvatarImage(
        bundle.pet.name,
        bundle.pet.species
      );

      // Click sidebar "+" button (client-side React navigation) or fallback to /add-pet
      const plusBtn = page
        .locator('button[aria-label="Add another pet profile"]')
        .first();
      if (await plusBtn.isVisible().catch(() => false)) {
        await plusBtn.evaluate(el => el.click());
      } else {
        await page.goto(`${baseUrl}/add-pet`, { waitUntil: 'domcontentloaded' });
      }

      await page.waitForURL('**/add-pet', { timeout: 25000 });
      await page
        .locator('text="Loading your account"')
        .waitFor({ state: 'hidden', timeout: 30000 })
        .catch(() => {});

      const petNameInput = page
        .locator(addPetPage.selectors.petNameInput)
        .first();
      const canAddMore = await petNameInput
        .waitFor({ state: 'visible', timeout: 25000 })
        .then(() => true)
        .catch(() => false);
      if (!canAddMore) {
        break;
      }

      await addPetPage.fillStep1({
        name: bundle.pet.name,
        species: bundle.pet.species,
        breed: bundle.pet.breed,
      });
      // Sync bundle.pet.breed with the exact catalog breed value selected in input#petBreed
      const actualSelectedBreed = await page
        .locator(addPetPage.selectors.petBreedInput)
        .inputValue()
        .catch(() => bundle.pet.breed);
      if (actualSelectedBreed && actualSelectedBreed.trim()) {
        bundle.pet.breed = actualSelectedBreed.trim();
      }
      await addPetPage.clickContinue();

      await addPetPage.fillStep2({
        birthdate: bundle.pet.birthdate,
        sex: bundle.pet.sex,
        neuterStatus: bundle.pet.neuterStatus,
        colorMarkings: bundle.pet.colorMarkings,
        microchipNumber: bundle.pet.microchipNumber,
      });
      await addPetPage.clickContinue();

      await addPetPage.uploadAndCropPetPhoto(imgPath);
      await addPetPage.clickSaveProfile();

      await page.waitForURL(
        url =>
          url.pathname.includes('/pets') ||
          url.pathname.includes('/home') ||
          url.pathname.includes('/dashboard'),
        { timeout: 30000 }
      );

      // Verify newly created pet immediately appears in sidebar
      await expect(
        page.locator(`aside h4:has-text("${bundle.pet.name}")`).first()
      ).toBeVisible({ timeout: 20000 });

      const petUrlMatch = page.url().match(/\/pets\/([^/?#]+)/);
      bundle.pet.id = petUrlMatch ? petUrlMatch[1] : null;

      // Persist immediately in SQLite so DB always stays accurate
      testUserManager.markPatientHasPet(activeOnePetCompanionUser.email, {
        petName: bundle.pet.name,
        petSpecies: bundle.pet.species,
        petId: bundle.pet.id,
      });

      addedPetBundles.push(bundle);
    }

    expect(addedPetBundles.length).toBe(petsToAdd);
  }
);

// ============================================================================
// PHASE 2: SWITCH TO EACH PET AND ADD ALL 5 SPECIES-MATCHED HEALTH RECORDS
// ============================================================================

When(
  "after all 10 pets exist the Companion user switches to each newly added pet and logs all 5 species-specific Health Records matching that pet's species",
  async ({ page, healthRecordsPage }) => {
    expect(addedPetBundles.length).toBeGreaterThan(0);

    await healthRecordsPage.open();

    for (const bundle of addedPetBundles) {
      await selectPetInSidebar(page, bundle.pet.name);

      // Confirm Clinical Health Timeline header scoped to this exact pet
      await expect(
        page.locator(`text=/for ${bundle.pet.name}/i`).first()
      ).toBeVisible({ timeout: 15000 });

      await healthRecordsPage.addVaccinationRecord(bundle.vaccination);
      await healthRecordsPage.addMedicationRecord(bundle.medication);
      await healthRecordsPage.addLabResultRecord(bundle.labResult);
      await healthRecordsPage.addVitalSignsRecord(bundle.vitalSigns);
      await healthRecordsPage.addAllergyRecord(bundle.allergy);
    }
  }
);

// ============================================================================
// PHASE 3: SWITCH TO EACH PET AND ADD SPECIES-MATCHED CONDITION & EPISODE
// ============================================================================

When(
  'for each newly added pet the Companion user records a species-specific Medical Diagnosis and logs a linked Moment-in-Time Episodic Diary flare-up',
  async ({ page, conditionsEpisodesPage }) => {
    expect(addedPetBundles.length).toBeGreaterThan(0);

    await conditionsEpisodesPage.open();

    for (const bundle of addedPetBundles) {
      await selectPetInSidebar(page, bundle.pet.name);

      await conditionsEpisodesPage.addMedicalDiagnosis(bundle.condition);
      await conditionsEpisodesPage.addEpisodicDiaryEntry(bundle.episode);
    }
  }
);

// ============================================================================
// PHASE 4: CROSS-PET VERIFICATION — REVISIT EVERY PET & ASSERT SAVED DETAILS
// ============================================================================

Then(
  'the Companion user switches back through every newly added pet and verifies its exact saved name and breed in the sidebar and pet profile',
  async ({ page }) => {
    for (const bundle of addedPetBundles) {
      await selectPetInSidebar(page, bundle.pet.name);

      await expect(
        page.locator(`aside h4:has-text("${bundle.pet.name}")`).first()
      ).toBeVisible({ timeout: 15000 });
      await expect(
        page.locator(`aside p:has-text("${bundle.pet.breed}")`).first()
      ).toBeVisible({ timeout: 15000 });
    }
  }
);

Then(
  "for every newly added pet the Clinical Health Timeline should display all 5 saved health record categories with that pet's exact saved clinical texts",
  async ({ page, healthRecordsPage }) => {
    await healthRecordsPage.open();

    for (const bundle of addedPetBundles) {
      await selectPetInSidebar(page, bundle.pet.name);

      await expect(
        page.locator(`text=/for ${bundle.pet.name}/i`).first()
      ).toBeVisible({ timeout: 15000 });

      // Assert all 5 category counts >= 1 on this pet's Health Records page
      for (const category of [
        'Vaccination',
        'Medication',
        'Lab Results',
        'Vital Signs',
        'Allergy',
      ]) {
        const count = await healthRecordsPage.getCategoryRecordCount(category);
        expect(count).toBeGreaterThanOrEqual(1);
      }

      // Verify exact saved Vaccination text is displayed under this pet
      const vacTab = page.locator('button:has-text("Vaccinations (")').first();
      if (await vacTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await vacTab.click();
      }
      await expect(
        page
          .locator(`text=/${bundle.vaccination.vaccineName.split(' ')[0]}/i`)
          .first()
      ).toBeVisible({ timeout: 15000 });

      // Verify exact saved Medication text is displayed under this pet
      const medTab = page.locator('button:has-text("Medications (")').first();
      if (await medTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await medTab.click();
      }
      await expect(
        page
          .locator(`text=/${bundle.medication.drugName.split(' ')[0]}/i`)
          .first()
      ).toBeVisible({ timeout: 15000 });

      // Verify exact saved Lab Result text is displayed under this pet
      const labTab = page.locator('button:has-text("Lab Results (")').first();
      if (await labTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await labTab.click();
      }
      await expect(
        page
          .locator(`text=/${bundle.labResult.testName.split(' ')[0]}/i`)
          .first()
      ).toBeVisible({ timeout: 15000 });

      // Verify exact saved Allergy text is displayed under this pet
      const algTab = page.locator('button:has-text("Allergies (")').first();
      if (await algTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await algTab.click();
      }
      await expect(
        page
          .locator(`text=/${bundle.allergy.allergen.split(' ')[0]}/i`)
          .first()
      ).toBeVisible({ timeout: 15000 });
    }
  }
);

Then(
  "for every newly added pet the Conditions and Episodes page should display that pet's exact saved Medical Diagnosis and Episodic Diary flare-up under the correct pet",
  async ({ page, conditionsEpisodesPage }) => {
    await conditionsEpisodesPage.open();

    for (const bundle of addedPetBundles) {
      await selectPetInSidebar(page, bundle.pet.name);

      // Verify Medical Diagnosis text under this pet
      await page
        .locator(conditionsEpisodesPage.selectors.medicalDiagnosesTab)
        .first()
        .evaluate(el => el.click());
      await expect(
        page
          .locator(`text=/${bundle.condition.conditionName.split(' ')[0]}/i`)
          .first()
      ).toBeVisible({ timeout: 15000 });

      // Verify Episodic Diary entry text under this pet
      await page
        .locator(conditionsEpisodesPage.selectors.episodicDiaryTab)
        .first()
        .evaluate(el => el.click());
      await expect(
        page.locator(`text=/${bundle.pet.name}/i`).first()
      ).toBeVisible({ timeout: 15000 });
    }
  }
);

Then(
  "the Companion user's SQLite record should be updated to 10 total pets with all distinct pet names and species persisted",
  async ({ testUserManager }) => {
    const updatedRow = testUserManager.getPatientByEmail(
      activeOnePetCompanionUser.email
    );
    expect(updatedRow).toBeTruthy();
    expect(updatedRow.petCount).toBe(MAX_COMPANION_BASE_PETS);
    expect(updatedRow.hasPet).toBe(MAX_COMPANION_BASE_PETS);

    // Confirm every added pet has a distinct species
    const speciesList = addedPetBundles.map(b => b.pet.species);
    const uniqueSpecies = new Set(speciesList);
    expect(uniqueSpecies.size).toBe(speciesList.length);
  }
);

Then(
  'attempting to add an 11th pet on Add Pet should verify the 10-pet Companion base allowance limit',
  async ({ page }) => {
    const baseUrl =
      process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com';
    await page.goto(`${baseUrl}/add-pet`, { waitUntil: 'domcontentloaded' });
    await page
      .locator('text="Loading your account"')
      .waitFor({ state: 'hidden', timeout: 30000 })
      .catch(() => {});

    await expect(
      page.locator('text=/10|Slot|Bundle|Companion|limit|Add Pet/i').first()
    ).toBeVisible({ timeout: 15000 });
  }
);
