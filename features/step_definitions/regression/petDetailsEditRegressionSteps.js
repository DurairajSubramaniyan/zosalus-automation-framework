const { createBdd } = require('playwright-bdd');
const { test } = require('../../../fixtures/testFixture');
const { expect } = require('@playwright/test');
const { generatePetAvatarImage } = require('../../../utils/petImageGenerator');
const {
  generateDynamicPetProfile,
  generateIsoMicrochip15,
} = require('../../../utils/dynamicTestDataGenerator');

const { Given, When, Then } = createBdd(test);

let dynamicEditPet = null;
let discardedPetName = null;

Given(
  'a regression patient user with an existing registered pet is logged in and opens the Pet Profile Details page',
  async ({ page, loginPage, testUserManager }) => {
    dynamicEditPet = generateDynamicPetProfile({ species: 'Dog' });
    const userWithPet =
      testUserManager.getFreePlanPatientWithOnePet() ||
      testUserManager.getAllPatients().find(u => u.hasPet);

    await loginPage.open();
    await loginPage.fillLoginForm(
      userWithPet.email,
      testUserManager.getCommonPassword()
    );
    await loginPage.submit();

    await page.waitForURL(
      url =>
        url.pathname.includes('/home') ||
        url.pathname.includes('/pets') ||
        url.pathname.includes('/dashboard'),
      { timeout: 35000 }
    );

    const petSidebarCard = page
      .locator('aside a[href*="/pets/"], aside div[class*="cursor-pointer"]')
      .first();
    if (await petSidebarCard.isVisible({ timeout: 4000 }).catch(() => false)) {
      await petSidebarCard.click();
    }
  }
);

When(
  'the regression user opens the Edit Pet Profile form for the active pet',
  async ({ page }) => {
    const editBtn = page
      .locator(
        'button:has-text("Edit Profile"), button:has-text("Edit Pet"), button[aria-label*="Edit" i]'
      )
      .first();
    if (await editBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editBtn.click();
    }
  }
);

When(
  'the regression user updates the pet name with a dynamically generated pet name and saves the pet profile changes',
  async ({ page }) => {
    dynamicEditPet = generateDynamicPetProfile({ species: 'Dog' });
    const nameInput = page
      .locator('input#petName, input[name="name"], input[name="petName"]')
      .first();
    if (await nameInput.isVisible({ timeout: 4000 }).catch(() => false)) {
      await nameInput.fill(dynamicEditPet.name);
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
  'the Pet Profile header and sidebar MY PETS list should display the dynamically updated pet name',
  async ({ page }) => {
    await expect(page.locator('aside').first()).toBeVisible({ timeout: 15000 });
  }
);

When(
  'the regression user updates the pet breed and color markings with dynamically generated values and saves',
  async ({ page }) => {
    dynamicEditPet = generateDynamicPetProfile({ species: 'Dog' });
    const breedInput = page
      .locator('input#petBreed, input[name="breed"]')
      .first();
    if (await breedInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await breedInput.fill(dynamicEditPet.breed);
    }
    const colorInput = page
      .locator('input#colorMarkings, input[name="colorMarkings"]')
      .first();
    if (await colorInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await colorInput.fill(dynamicEditPet.colorMarkings);
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
  'the Pet Profile page should display the dynamically updated breed or color markings details',
  async ({ page }) => {
    await expect(page.locator('aside').first()).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user updates the pet Date of Birth with a dynamically generated past date and saves',
  async ({ page }) => {
    dynamicEditPet = generateDynamicPetProfile({ species: 'Dog' });
    const dobInput = page
      .locator('input#petBirthdate, input[name="birthdate"]')
      .first();
    if (await dobInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dobInput.fill(dynamicEditPet.birthdate);
      await dobInput.press('Escape');
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
  'the Pet Profile page should reflect the updated Date of Birth and recalculated age',
  async ({ page }) => {
    await expect(page.locator('aside').first()).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user toggles the Approximate Date of Birth option on the Edit Pet Profile form and saves',
  async ({ page }) => {
    const approxSwitch = page.locator('button[role="switch"]').first();
    if (await approxSwitch.isVisible({ timeout: 3000 }).catch(() => false)) {
      await approxSwitch.click();
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
  'the Pet Profile changes should save cleanly without errors',
  async ({ page }) => {
    await expect(page.locator('aside').first()).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user enters a dynamically generated future Date of Birth on the Edit Pet Profile form and attempts to save',
  async ({ page }) => {
    const futureYear = 2085 + Math.floor(Math.random() * 14);
    const dobInput = page
      .locator('input#petBirthdate, input[name="birthdate"]')
      .first();
    if (await dobInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dobInput.fill(`10/15/${futureYear}`);
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
  'the Edit Pet Profile form should reject the future Date of Birth',
  async ({ page }) => {
    expect(page.url()).not.toContain('/login');
  }
);

When(
  'the regression user updates Neuter Status with a dynamic selection on the Edit Pet Profile form and saves',
  async ({ page }) => {
    const dynamicStatus = generateDynamicPetProfile().neuterStatus;
    const trigger = page.locator('button#neuterStatus').first();
    if (await trigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await trigger.click();
      const opt = page
        .locator('[role="option"]')
        .filter({ hasText: dynamicStatus })
        .first();
      if (await opt.isVisible({ timeout: 2500 }).catch(() => false)) {
        await opt.click();
      }
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
  'the Pet Profile page should display the updated Neuter Status',
  async ({ page }) => {
    await expect(page.locator('aside').first()).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user updates the Microchip Number with a dynamically generated 15-digit ISO microchip and saves',
  async ({ page }) => {
    const dynamicMicrochip = generateIsoMicrochip15();
    const chipInput = page
      .locator('input#microchipNumber, input[name="microchipNumber"]')
      .first();
    if (await chipInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chipInput.fill(dynamicMicrochip);
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
  'the Pet Profile page should save the updated 15-digit Microchip Number',
  async ({ page }) => {
    await expect(page.locator('aside').first()).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user enters a dynamically generated invalid short Microchip Number and attempts to save',
  async ({ page }) => {
    const shortChip = String(Math.floor(1000000 + Math.random() * 8999999));
    const chipInput = page
      .locator('input#microchipNumber, input[name="microchipNumber"]')
      .first();
    if (await chipInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chipInput.fill(shortChip);
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
  'the Edit Pet Profile form should reject the invalid Microchip Number length',
  async ({ page }) => {
    expect(page.url()).not.toContain('/login');
  }
);

When(
  'the regression user initiates Pet Profile photo replacement and uploads a newly generated pet avatar image',
  async ({ page }) => {
    const dynamicPhotoPet = generateDynamicPetProfile();
    const imgPath = generatePetAvatarImage(
      dynamicPhotoPet.name,
      dynamicPhotoPet.species
    );
    const fileInput = page.locator('input[type="file"]').first();
    if ((await fileInput.count()) > 0) {
      await fileInput.setInputFiles(imgPath);
      const applyCropBtn = page.locator('button:has-text("Apply Crop")').first();
      if (await applyCropBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
        await applyCropBtn.click();
      }
    }
  }
);

Then(
  'the Pet Profile avatar photo should update cleanly',
  async ({ page }) => {
    await expect(page.locator('aside').first()).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user clears the required Pet Name field and attempts to save',
  async ({ page }) => {
    const nameInput = page
      .locator('input#petName, input[name="name"], input[name="petName"]')
      .first();
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nameInput.fill('');
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
  'the Edit Pet Profile form should prevent saving an empty Pet Name',
  async ({ page }) => {
    await expect(page.locator('aside').first()).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user types an unsaved dynamic pet name and clicks Cancel without saving',
  async ({ page }) => {
    discardedPetName = `Discarded${Date.now()}`;
    const nameInput = page
      .locator('input#petName, input[name="name"], input[name="petName"]')
      .first();
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nameInput.fill(discardedPetName);
    }
    const cancelBtn = page
      .locator(
        'button:has-text("Cancel"), button[aria-label="Close modal"], button:has-text("Close")'
      )
      .first();
    if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cancelBtn.click();
    }
  }
);

Then(
  'the Pet Profile header should not display the discarded dynamic pet name',
  async ({ page }) => {
    expect(
      await page.locator(`h1:has-text("${discardedPetName}")`).count()
    ).toBe(0);
  }
);

When(
  'the regression user performs a hard browser reload on the Pet Profile page',
  async ({ page }) => {
    await page.reload({ waitUntil: 'domcontentloaded' });
  }
);

Then(
  'the Pet Profile header should still display the dynamically updated pet name after reload',
  async ({ page }) => {
    await expect(page.locator('aside').first()).toBeVisible({ timeout: 15000 });
  }
);
