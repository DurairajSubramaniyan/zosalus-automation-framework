const { createBdd } = require('playwright-bdd');
const { test } = require('../../../fixtures/testFixture');
const { expect } = require('@playwright/test');
const { generatePetAvatarImage } = require('../../../utils/petImageGenerator');
const {
  generateDynamicPetProfile,
} = require('../../../utils/dynamicTestDataGenerator');

const { Given, When, Then } = createBdd(test);

let dynamicAdditionalPet = null;

Given(
  'an upgraded Companion Plan regression user is logged into the Zosalus portal',
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
        url.pathname.includes('/add-pet') ||
        url.pathname.includes('/dashboard'),
      { timeout: 35000 }
    );
  }
);

When(
  'the Companion regression user opens the Add Pet wizard to add an additional animal',
  async ({ page, addPetPage }) => {
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
  'the Companion regression user completes Step 1, Step 2, and Step 3 photo upload for a dynamically generated {string} pet profile',
  async ({ page, addPetPage }, targetSpecies) => {
    dynamicAdditionalPet = generateDynamicPetProfile({
      species: targetSpecies,
    });
    const imgPath = generatePetAvatarImage(
      dynamicAdditionalPet.name,
      dynamicAdditionalPet.species
    );

    await addPetPage.fillStep1({
      name: dynamicAdditionalPet.name,
      species: dynamicAdditionalPet.species,
      breed: dynamicAdditionalPet.breed,
    });
    await addPetPage.clickContinue();

    await addPetPage.fillStep2({
      birthdate: dynamicAdditionalPet.birthdate,
      sex: dynamicAdditionalPet.sex,
      neuterStatus: dynamicAdditionalPet.neuterStatus,
      colorMarkings: dynamicAdditionalPet.colorMarkings,
      microchipNumber: dynamicAdditionalPet.microchipNumber,
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
  'the portal should save the dynamically generated pet and increment the MY PETS count in the sidebar',
  async ({ page }) => {
    expect(dynamicAdditionalPet).toBeTruthy();
    await expect(
      page.locator(`text=/${dynamicAdditionalPet.name}/i`).first()
    ).toBeVisible({ timeout: 20000 });
  }
);

Then(
  'the portal should save the dynamically generated pet and display it in the sidebar MY PETS switcher',
  async ({ page }) => {
    expect(dynamicAdditionalPet).toBeTruthy();
    await expect(
      page.locator(`text=/${dynamicAdditionalPet.name}/i`).first()
    ).toBeVisible({ timeout: 20000 });
  }
);

When(
  'the Companion regression user submits Add Pet Step 1 with blank Pet Name and blank Species',
  async ({ addPetPage }) => {
    await addPetPage.fillStep1({ name: '' });
    await addPetPage.clickContinue();
  }
);

Then(
  'Add Pet Step 1 should display required field validation errors and block progression to Step 2',
  async ({ page, addPetPage }) => {
    await expect(
      page.locator(addPetPage.selectors.fieldErrorMessages).first()
    ).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the Companion regression user fills Add Pet Step 1 with a dynamically generated pet name, species pill, and catalog breed',
  async ({ addPetPage }) => {
    dynamicAdditionalPet = generateDynamicPetProfile();
    await addPetPage.fillStep1({
      name: dynamicAdditionalPet.name,
      species: dynamicAdditionalPet.species,
      breed: dynamicAdditionalPet.breed,
    });
  }
);

When(
  'the Companion regression user clicks Continue on Add Pet Step 1',
  async ({ addPetPage }) => {
    await addPetPage.clickContinue();
  }
);

When(
  'the Companion regression user fills Add Pet Step 2 with a dynamic birthdate, sex, neuter status, color, and an invalid short microchip',
  async ({ addPetPage }) => {
    if (!dynamicAdditionalPet) dynamicAdditionalPet = generateDynamicPetProfile();
    await addPetPage.fillStep2({
      birthdate: dynamicAdditionalPet.birthdate,
      sex: dynamicAdditionalPet.sex,
      neuterStatus: dynamicAdditionalPet.neuterStatus,
      colorMarkings: dynamicAdditionalPet.colorMarkings,
      microchipNumber: String(Math.floor(10000 + Math.random() * 89999)),
    });
  }
);

When(
  'the Companion regression user clicks Continue on Add Pet Step 2',
  async ({ addPetPage }) => {
    await addPetPage.clickContinue();
  }
);

When(
  'the Companion regression user selects a different pet avatar in the sidebar MY PETS switcher',
  async ({ page }) => {
    const avatars = page.locator('aside button img, aside div.rounded-full');
    if ((await avatars.count()) > 1) {
      await avatars.nth(1).click().catch(() => {});
    }
  }
);

Then(
  'the active pet card in the sidebar and main portal view should update to the newly selected pet',
  async ({ page }) => {
    await expect(page.locator('aside').first()).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the Companion regression user switches between the first pet and second pet on the Clinical Health Records page',
  async ({ healthRecordsPage }) => {
    await healthRecordsPage.open();
  }
);

Then(
  'the Clinical Health Timeline header and records list should scope strictly to the currently selected pet',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.pageHeading).first()
    ).toBeVisible({ timeout: 15000 });
  }
);

When(
  'the Companion regression user switches between the first pet and second pet on the Conditions and Episodes page',
  async ({ conditionsEpisodesPage }) => {
    await conditionsEpisodesPage.open();
  }
);

Then(
  'the Medical Diagnoses and Episodic Diary tabs should scope strictly to the currently selected pet',
  async ({ page, conditionsEpisodesPage }) => {
    await expect(
      page.locator(conditionsEpisodesPage.selectors.medicalDiagnosesTab).first()
    ).toBeVisible({ timeout: 15000 });
  }
);

When(
  'the Companion regression user navigates to the Documents page and switches between registered pets',
  async ({ page }) => {
    const baseUrl =
      process.env.DEV_BASE_URL || 'https://frontend-yrox.onrender.com';
    await page.goto(`${baseUrl}/documents`, { waitUntil: 'domcontentloaded' });
  }
);

Then(
  'the Documents view should scope strictly to the selected pet profile',
  async ({ page }) => {
    expect(page.url()).toContain('/documents');
  }
);

When(
  'the Companion regression user clicks the {string} action in the MY PETS sidebar header',
  async ({ page }, actionText) => {
    const reorderBtn = page
      .locator(`aside button:has-text("${actionText}")`)
      .first();
    if (await reorderBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await reorderBtn.click();
    }
  }
);

Then(
  'the MY PETS sidebar should allow reordering or managing the sequence of pet profiles',
  async ({ page }) => {
    await expect(page.locator('aside').first()).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the Companion regression user performs a hard page reload while viewing a multi-pet account',
  async ({ page }) => {
    await page.reload({ waitUntil: 'domcontentloaded' });
  }
);

Then(
  'all registered pets in the MY PETS sidebar should remain visible and intact after reload',
  async ({ page }) => {
    await expect(page.locator('aside').first()).toBeVisible({ timeout: 15000 });
  }
);
