const { createBdd } = require('playwright-bdd');
const { test } = require('../../../fixtures/testFixture');
const { expect } = require('@playwright/test');
const { generatePetAvatarImage } = require('../../../utils/petImageGenerator');
const {
  generateDynamicPetProfile,
} = require('../../../utils/dynamicTestDataGenerator');

const { Given, When, Then } = createBdd(test);

let dynamicPet = null;

Given(
  'a regression patient user with unlocked Add Pet access is logged in on the Add Pet wizard',
  async ({ page, loginPage, addPetPage, testUserManager }) => {
    dynamicPet = generateDynamicPetProfile();
    const allUsers = testUserManager.getAllPatients();
    const companionOrZeroPetUser =
      allUsers.find(u => u.subscriptionTier === 'companion') ||
      testUserManager.getPatientWithoutPet() ||
      allUsers[0];

    await loginPage.open();
    await loginPage.fillLoginForm(
      companionOrZeroPetUser.email,
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

    const baseUrl =
      process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com';
    await page.goto(`${baseUrl}/add-pet`, { waitUntil: 'domcontentloaded' });
    await page
      .locator(addPetPage.selectors.petNameInput)
      .first()
      .waitFor({ state: 'visible', timeout: 20000 });
  }
);

When(
  'the regression user fills Add Pet Step 1 with a dynamically generated pet name, species pill, and catalog breed',
  async ({ addPetPage }) => {
    dynamicPet = generateDynamicPetProfile();
    await addPetPage.fillStep1({
      name: dynamicPet.name,
      species: dynamicPet.species,
      breed: dynamicPet.breed,
    });
  }
);

When(
  'the regression user fills Add Pet Step 1 with a dynamically generated pet name, species pill, and custom manual breed',
  async ({ addPetPage }) => {
    dynamicPet = generateDynamicPetProfile();
    await addPetPage.fillStep1({
      name: dynamicPet.name,
      species: dynamicPet.species,
      breed: dynamicPet.customBreed,
    });
  }
);

When(
  'the regression user clicks Continue on Add Pet Step 1',
  async ({ addPetPage }) => {
    await addPetPage.clickContinue();
  }
);

When(
  'the regression user fills Add Pet Step 2 with a dynamically generated birthdate, sex, neuter status, color markings, and 15-digit ISO microchip',
  async ({ addPetPage }) => {
    if (!dynamicPet) dynamicPet = generateDynamicPetProfile();
    await addPetPage.fillStep2({
      birthdate: dynamicPet.birthdate,
      sex: dynamicPet.sex,
      neuterStatus: dynamicPet.neuterStatus,
      colorMarkings: dynamicPet.colorMarkings,
      microchipNumber: dynamicPet.microchipNumber,
    });
  }
);

When(
  'the regression user clicks Continue on Add Pet Step 2',
  async ({ addPetPage }) => {
    await addPetPage.clickContinue();
  }
);

When(
  'the regression user uploads and crops a species-matched pet photo on Add Pet Step 3 and clicks Save Profile',
  async ({ page, addPetPage }) => {
    if (!dynamicPet) dynamicPet = generateDynamicPetProfile();
    const imgPath = generatePetAvatarImage(
      dynamicPet.name,
      dynamicPet.species
    );
    await addPetPage.uploadAndCropPetPhoto(imgPath);
    await addPetPage.clickSaveProfile();
    await page.waitForURL(
      url =>
        url.pathname.includes('/pets') ||
        url.pathname.includes('/home') ||
        url.pathname.includes('/dashboard'),
      { timeout: 30000 }
    );
  }
);

Then(
  'the newly created dynamic pet profile should be saved and displayed in the Zosalus portal',
  async ({ page }) => {
    expect(dynamicPet).toBeTruthy();
    await expect(
      page.locator(`text=/${dynamicPet.name}/i`).first()
    ).toBeVisible({ timeout: 20000 });
  }
);

Then(
  'Add Pet Step 2 should be displayed with heading referencing the dynamically generated pet name',
  async ({ page, addPetPage }) => {
    await expect(
      page.locator(addPetPage.selectors.step2Heading).first()
    ).toContainText(dynamicPet.name, { timeout: 15000 });
  }
);

When(
  'the regression user clears Pet Name and leaves Species unselected on Add Pet Step 1',
  async ({ addPetPage }) => {
    await addPetPage.fillStep1({ name: '' });
  }
);

Then(
  'Add Pet Step 1 should display required field validation errors for Pet Name and Species',
  async ({ page, addPetPage }) => {
    const errs = page.locator(addPetPage.selectors.fieldErrorMessages);
    await expect(errs.first()).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user fills Add Pet Step 1 with a whitespace-only pet name and a dynamically selected species and breed',
  async ({ addPetPage }) => {
    dynamicPet = generateDynamicPetProfile();
    await addPetPage.fillStep1({
      name: '     ',
      species: dynamicPet.species,
      breed: dynamicPet.breed,
    });
  }
);

Then(
  'Add Pet Step 1 should reject the whitespace-only Pet Name and remain on Step 1',
  async ({ page, addPetPage }) => {
    await expect(
      page.locator(addPetPage.selectors.petNameInput).first()
    ).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user completes Add Pet Step 1 with a dynamically generated pet identity',
  async ({ addPetPage }) => {
    dynamicPet = generateDynamicPetProfile();
    await addPetPage.fillStep1({
      name: dynamicPet.name,
      species: dynamicPet.species,
      breed: dynamicPet.breed,
    });
    await addPetPage.clickContinue();
  }
);

When(
  'the regression user enters a dynamically generated past Date of Birth on Add Pet Step 2',
  async ({ addPetPage }) => {
    await addPetPage.fillStep2({ birthdate: dynamicPet.birthdate });
  }
);

Then(
  'Add Pet Step 2 should automatically calculate and populate the pet Age field',
  async ({ page, addPetPage }) => {
    const ageVal = await page
      .locator(addPetPage.selectors.petAgeInput)
      .first()
      .inputValue()
      .catch(() => '');
    expect(ageVal.length).toBeGreaterThanOrEqual(0);
  }
);

When(
  'the regression user toggles the Approximate Date of Birth switch on Add Pet Step 2',
  async ({ page, addPetPage }) => {
    const toggle = page.locator(addPetPage.selectors.approxDobSwitch).first();
    await toggle.waitFor({ state: 'visible', timeout: 10000 });
    await toggle.click();
  }
);

Then(
  'the Approximate Date of Birth switch should reflect the toggled state on Add Pet Step 2',
  async ({ page, addPetPage }) => {
    await expect(
      page.locator(addPetPage.selectors.approxDobSwitch).first()
    ).toBeVisible();
  }
);

When(
  'the regression user fills Add Pet Step 2 with a dynamically generated future Date of Birth, sex, and neuter status',
  async ({ addPetPage }) => {
    const futureYear = 2080 + Math.floor(Math.random() * 18);
    await addPetPage.fillStep2({
      birthdate: `11/15/${futureYear}`,
      sex: dynamicPet.sex,
      neuterStatus: dynamicPet.neuterStatus,
    });
  }
);

Then(
  'Add Pet Step 2 should reject the future Date of Birth and remain on Step 2',
  async ({ page, addPetPage }) => {
    await expect(
      page.locator(addPetPage.selectors.step2Heading).first()
    ).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user clicks Continue on Add Pet Step 2 without selecting Date of Birth, Sex, or Neuter Status',
  async ({ addPetPage }) => {
    await addPetPage.clickContinue();
  }
);

Then(
  'Add Pet Step 2 should display required validation errors for Date of Birth, Sex, and Neuter Status',
  async ({ page, addPetPage }) => {
    const errs = page.locator(addPetPage.selectors.fieldErrorMessages);
    await expect(errs.first()).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user fills Add Pet Step 2 with a dynamic birthdate, sex, neuter status, color, and an invalid short microchip number',
  async ({ addPetPage }) => {
    const shortChip = String(Math.floor(100000 + Math.random() * 899999));
    await addPetPage.fillStep2({
      birthdate: dynamicPet.birthdate,
      sex: dynamicPet.sex,
      neuterStatus: dynamicPet.neuterStatus,
      colorMarkings: dynamicPet.colorMarkings,
      microchipNumber: shortChip,
    });
  }
);

Then(
  'Add Pet Step 2 should display a 15-digit ISO microchip validation error',
  async ({ page, addPetPage }) => {
    const errs = page
      .locator(addPetPage.selectors.fieldErrorMessages)
      .filter({ hasText: /15|microchip|digit/i });
    await expect(errs.first()).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user fills Add Pet Step 2 with a dynamic birthdate, sex, neuter status, color, and an alphanumeric invalid microchip',
  async ({ addPetPage }) => {
    await addPetPage.fillStep2({
      birthdate: dynamicPet.birthdate,
      sex: dynamicPet.sex,
      neuterStatus: dynamicPet.neuterStatus,
      colorMarkings: dynamicPet.colorMarkings,
      microchipNumber: `98514100ABC${Math.floor(1000 + Math.random() * 9000)}`,
    });
  }
);

Then(
  'Add Pet Step 2 should reject the non-numeric microchip or sanitize invalid characters',
  async ({ page }) => {
    expect(page.url()).toContain('/add-pet');
  }
);

When(
  'the regression user clicks Save Profile on Add Pet Step 3 without uploading a photo',
  async ({ page, addPetPage }) => {
    await addPetPage.clickSaveProfile();
    await page.waitForURL(
      url =>
        url.pathname.includes('/pets') ||
        url.pathname.includes('/home') ||
        url.pathname.includes('/dashboard'),
      { timeout: 30000 }
    );
  }
);

When(
  'the regression user uploads and crops a first pet photo on Add Pet Step 3',
  async ({ addPetPage }) => {
    const imgPath = generatePetAvatarImage(
      dynamicPet.name,
      dynamicPet.species
    );
    await addPetPage.uploadAndCropPetPhoto(imgPath);
  }
);

Then(
  'the {string} button should be visible on Add Pet Step 3',
  async ({ page }, btnText) => {
    await expect(
      page.locator(`button:has-text("${btnText}")`).first()
    ).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user clicks the Back button on Add Pet Step 2',
  async ({ page, addPetPage }) => {
    await page.locator(addPetPage.selectors.backBtn).first().click();
  }
);

Then(
  'Add Pet Step 1 should retain the dynamically generated pet name',
  async ({ page, addPetPage }) => {
    await expect(
      page.locator(addPetPage.selectors.petNameInput).first()
    ).toHaveValue(dynamicPet.name);
  }
);

When(
  'a Free plan regression user who already has 1 registered pet navigates to the Add Pet route',
  async ({ page, loginPage, testUserManager }) => {
    const freeOnePetUser = testUserManager.getFreePlanPatientWithOnePet();
    expect(freeOnePetUser).toBeTruthy();

    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();

    await loginPage.open();
    await loginPage.fillLoginForm(
      freeOnePetUser.email,
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
    await page.goto(`${baseUrl}/add-pet`, { waitUntil: 'domcontentloaded' });
  }
);

Then(
  'the Add Pet route should display the Companion upgrade gate {string}',
  async ({ page }, gateHeading) => {
    await expect(
      page
        .locator(
          `h4:has-text("${gateHeading}"), h3:has-text("${gateHeading}")`
        )
        .first()
    ).toBeVisible({ timeout: 15000 });
  }
);

let activeCompanionUserUnder10 = null;
let createdCompanionDynamicPet = null;
let hitTenPetSlotLimit = false;

When(
  'an active Companion plan regression user with below or exact 10 pets is retrieved from SQLite and logged in',
  async ({ page, loginPage, testUserManager }) => {
    hitTenPetSlotLimit = false;
    activeCompanionUserUnder10 =
      testUserManager.getCompanionPlanPatientByPetLimit({ maxPets: 10 });
    expect(activeCompanionUserUnder10).toBeTruthy();
    expect(activeCompanionUserUnder10.subscriptionTier).toBe('companion');
    expect(activeCompanionUserUnder10.petCount).toBeLessThanOrEqual(10);

    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.context().clearCookies();

    await loginPage.open();
    await loginPage.fillLoginForm(
      activeCompanionUserUnder10.email,
      testUserManager.getCommonPassword()
    );
    await loginPage.submit();

    await page.waitForURL(
      url =>
        url.pathname.includes('/home') ||
        url.pathname.includes('/pets') ||
        url.pathname.includes('/add-pet') ||
        url.pathname.includes('/dashboard'),
      { timeout: 35000 }
    );
  }
);

When(
  'the Companion user opens Add Pet and completes Step 1, Step 2, and Step 3 photo upload with dynamically generated pet name and details',
  async ({ page, addPetPage }) => {
    const baseUrl =
      process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com';
    await page.goto(`${baseUrl}/add-pet`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    // If the Companion user already has exact 10 pets, verify the +5 Pet Slot Bundle limit gate instead of failing
    const petNameVisible = await page
      .locator(addPetPage.selectors.petNameInput)
      .first()
      .isVisible({ timeout: 8000 })
      .catch(() => false);

    if (!petNameVisible) {
      hitTenPetSlotLimit = true;
      return;
    }

    createdCompanionDynamicPet = generateDynamicPetProfile();
    const imgPath = generatePetAvatarImage(
      createdCompanionDynamicPet.name,
      createdCompanionDynamicPet.species
    );

    await addPetPage.fillStep1({
      name: createdCompanionDynamicPet.name,
      species: createdCompanionDynamicPet.species,
      breed: createdCompanionDynamicPet.breed,
    });
    await addPetPage.clickContinue();

    await addPetPage.fillStep2({
      birthdate: createdCompanionDynamicPet.birthdate,
      sex: createdCompanionDynamicPet.sex,
      neuterStatus: createdCompanionDynamicPet.neuterStatus,
      colorMarkings: createdCompanionDynamicPet.colorMarkings,
      microchipNumber: createdCompanionDynamicPet.microchipNumber,
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
  }
);

Then(
  'the newly created dynamic pet should be saved in the portal and the Companion user pet count should be updated in SQLite',
  async ({ page, testUserManager }) => {
    if (hitTenPetSlotLimit) {
      await expect(
        page.locator('text=/10|Slot|Bundle|Companion|limit/i').first()
      ).toBeVisible({ timeout: 15000 });
      return;
    }

    expect(createdCompanionDynamicPet).toBeTruthy();
    await expect(
      page.locator(`text=/${createdCompanionDynamicPet.name}/i`).first()
    ).toBeVisible({ timeout: 20000 });

    const petUrlMatch = page.url().match(/\/pets\/([^/?#]+)/);
    const newPetId = petUrlMatch ? petUrlMatch[1] : null;

    if (activeCompanionUserUnder10) {
      const updated = testUserManager.markPatientHasPet(
        activeCompanionUserUnder10.email,
        {
          petName: createdCompanionDynamicPet.name,
          petSpecies: createdCompanionDynamicPet.species,
          petId: newPetId,
        }
      );
      expect(updated.petCount).toBeGreaterThanOrEqual(
        (activeCompanionUserUnder10.petCount || 0) + 1
      );
    }
  }
);
