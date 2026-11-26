const BasePage = require('./BasePage');

/**
 * AddPetPage encapsulates all elements and actions for the Dashboard Empty-Pet State
 * and the 3-step Add Pet Wizard (/add-pet), including species photo upload and cropping.
 */
class AddPetPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.selectors = {
      // Dashboard Empty Pet State (/home)
      noPetsHeading: 'h2:has-text("No pets registered yet")',
      noPetsSidebarText: 'text="No Pets Added"',
      addFirstPetMainBtn: 'button:has-text("Add Your First Pet")',
      addFirstPetSidebarBtn: 'button:has-text("Add First Pet")',

      // Step 1: Name, Species, Breed
      step1Heading: 'h2:has-text("Tell us about your pet")',
      petNameInput: 'input#petName',
      petSpeciesInput: 'input#petSpecies',
      petBreedInput: 'input#petBreed',
      continueBtn: 'form button[type="submit"]:has-text("Continue")',

      // Step 2: Birthdate, Age, Sex, Neuter Status, Color, Microchip
      step2Heading: 'h2:has-text("More about")',
      petBirthdateInput: 'input#petBirthdate',
      petAgeInput: 'input#petAge',
      approxDobSwitch: 'button[role="switch"]',
      petSexTrigger: 'button#petSex',
      neuterStatusTrigger: 'button#neuterStatus',
      colorMarkingsInput: 'input#colorMarkings',
      microchipNumberInput: 'input#microchipNumber',
      backBtn: 'button:has-text("Back")',

      // Step 3: Photo Upload & Crop Modal
      step3Heading: 'h2:has-text("Add a photo of")',
      photoFileInput: 'input#step3-pet-photo-file-input',
      uploadFromDeviceBtn: 'button:has-text("Upload from Device")',
      chooseDifferentPhotoBtn: 'button:has-text("Choose Different Photo")',
      applyCropBtn: 'button:has-text("Apply Crop")',
      saveProfileBtn: 'form button[type="submit"]:has-text("Save Profile")',

      // Validation Error Messages
      fieldErrorMessages: 'p.text-error-red, p[class*="text-error-red"], p.text-red-600',
    };
  }

  /**
   * Check if current authenticated user has zero pets on /home
   * @returns {Promise<boolean>}
   */
  async hasNoPetsRegistered() {
    const emptyMain = await this.isVisible(this.selectors.noPetsHeading, 5000);
    if (emptyMain) return true;
    return await this.isVisible(this.selectors.addFirstPetSidebarBtn, 3000);
  }

  /**
   * Click "+ Add Your First Pet" button from /home empty state or navigate to /add-pet
   */
  async clickAddFirstPet() {
    if (await this.isVisible(this.selectors.addFirstPetMainBtn, 4000)) {
      await this.click(this.selectors.addFirstPetMainBtn);
    } else if (await this.isVisible(this.selectors.addFirstPetSidebarBtn, 3000)) {
      await this.click(this.selectors.addFirstPetSidebarBtn);
    } else {
      await this.navigate('/add-pet');
    }
    await this.page.locator(this.selectors.petNameInput).waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Fill Step 1: Pet Name, Species, and Breed
   * @param {Object} details
   * @param {string} details.name
   * @param {string} details.species
   * @param {string} details.breed
   */
  async fillStep1({ name, species, breed }) {
    if (name !== undefined) {
      await this.clearAndFill(this.selectors.petNameInput, name);
    }

    if (species !== undefined) {
      // Wait for species catalog loading spinner to settle if present
      await this.page.waitForTimeout(400);
      // Expand "+12 more species" button if present so all 20 species pills are visible
      const expandMoreBtn = this.page
        .locator('button:has-text("more species")')
        .first();
      if (await expandMoreBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await expandMoreBtn.click();
        await this.page.waitForTimeout(300);
      }
      const quickChip = this.page
        .locator(`button:text-is("${species}"), button:has-text("${species}")`)
        .first();
      if (await quickChip.isVisible().catch(() => false)) {
        await quickChip.click();
      } else {
        const speciesInput = this.page.locator(this.selectors.petSpeciesInput);
        await speciesInput.click();
        await speciesInput.fill(species);
        const option = this.page.locator(`#petSpecies-menu [role="option"]:has-text("${species}")`).first();
        if (await option.isVisible({ timeout: 2500 }).catch(() => false)) {
          await option.click();
        } else {
          await speciesInput.press('Enter');
        }
      }
    }

    if (breed !== undefined) {
      // Wait briefly for breed catalog for the selected species to load
      await this.page.waitForTimeout(800);
      const breedInput = this.page.locator(this.selectors.petBreedInput);
      await breedInput.click();
      await breedInput.fill(breed);
      await this.page.waitForTimeout(300);

      const exactOption = this.page
        .locator(`#petBreed-menu [role="option"]`)
        .filter({ hasText: breed })
        .first();

      if (await exactOption.isVisible({ timeout: 2500 }).catch(() => false)) {
        await exactOption.click();
      } else {
        // Fallback: clear filter and pick the first valid catalog breed for this species
        await breedInput.fill('');
        await this.page.waitForTimeout(400);
        const firstCatalogOpt = this.page
          .locator('#petBreed-menu [role="option"]')
          .first();
        if (await firstCatalogOpt.isVisible({ timeout: 2500 }).catch(() => false)) {
          await firstCatalogOpt.click();
        } else {
          await breedInput.fill(breed);
          await breedInput.press('Enter');
        }
      }
    }
  }

  /**
   * Click Continue button on Step 1 or Step 2
   */
  async clickContinue() {
    await this.click(this.selectors.continueBtn);
  }

  /**
   * Select an option from a custom Zosalus listbox trigger button (e.g. #petSex, #neuterStatus)
   * @param {string} triggerSelector
   * @param {string} optionText
   */
  async selectCustomOption(triggerSelector, optionText) {
    const trigger = this.page.locator(triggerSelector);
    await trigger.waitFor({ state: 'visible', timeout: 10000 });
    await trigger.click();

    const menuId = triggerSelector.replace(/^.*#/, '') + '-menu';
    const menuOption = this.page
      .locator(`#${menuId} [role="option"], [role="listbox"] [role="option"], div[role="option"]`)
      .filter({ hasText: optionText })
      .first();

    if (await menuOption.isVisible({ timeout: 4000 }).catch(() => false)) {
      await menuOption.click();
    } else {
      await this.page.locator(`text="${optionText}"`).first().click();
    }
  }

  /**
   * Fill Step 2: Date of Birth, Sex, Neuter/Spay Status, Color & Markings, Microchip Number
   * @param {Object} details
   * @param {string} details.birthdate
   * @param {string} details.sex
   * @param {string} details.neuterStatus
   * @param {string} [details.colorMarkings]
   * @param {string} [details.microchipNumber]
   */
  async fillStep2({ birthdate, sex, neuterStatus, colorMarkings, microchipNumber }) {
    await this.page.locator(this.selectors.petBirthdateInput).waitFor({ state: 'visible', timeout: 10000 });

    if (birthdate !== undefined) {
      const dobInput = this.page.locator(this.selectors.petBirthdateInput);
      await dobInput.click();
      await dobInput.fill(birthdate);
      await dobInput.press('Escape');
      // Blur so DatePicker validates and commits YYYY-MM-DD
      await this.page.locator(this.selectors.step2Heading).click();
    }

    if (sex !== undefined) {
      await this.selectCustomOption(this.selectors.petSexTrigger, sex);
    }

    if (neuterStatus !== undefined) {
      await this.selectCustomOption(this.selectors.neuterStatusTrigger, neuterStatus);
    }

    if (colorMarkings !== undefined) {
      await this.clearAndFill(this.selectors.colorMarkingsInput, colorMarkings);
    }

    if (microchipNumber !== undefined) {
      await this.clearAndFill(this.selectors.microchipNumberInput, microchipNumber);
    }
  }

  /**
   * Upload pet avatar photo on Step 3 and confirm the Crop Modal
   * @param {string} filePath Absolute path to PNG/JPG image
   */
  async uploadAndCropPetPhoto(filePath) {
    await this.page.locator(this.selectors.step3Heading).waitFor({ state: 'visible', timeout: 10000 });
    await this.page.locator(this.selectors.photoFileInput).setInputFiles(filePath);

    const applyCrop = this.page.locator(this.selectors.applyCropBtn);
    await applyCrop.waitFor({ state: 'visible', timeout: 10000 });
    await applyCrop.click();

    await this.page.locator(this.selectors.chooseDifferentPhotoBtn).waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Submit Step 3 ("Save Profile") to create the pet
   */
  async clickSaveProfile() {
    await this.click(this.selectors.saveProfileBtn);
  }
}

module.exports = AddPetPage;
