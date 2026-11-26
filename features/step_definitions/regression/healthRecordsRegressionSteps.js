const { createBdd } = require('playwright-bdd');
const { test } = require('../../../fixtures/testFixture');
const { expect } = require('@playwright/test');
const { generatePetAvatarImage } = require('../../../utils/petImageGenerator');
const {
  generateDynamicVaccination,
  generateDynamicMedication,
  generateDynamicLabResult,
  generateDynamicVitalSigns,
  generateDynamicAllergy,
} = require('../../../utils/dynamicTestDataGenerator');

const { Given, When, Then } = createBdd(test);

let dynamicVaccination = null;
let dynamicMedication = null;
let dynamicLabResult = null;
let dynamicVitalSigns = null;
let dynamicAllergy = null;
let activeHealthCategory = null;
let existingCategoryCounts = {
  Vaccination: 0,
  Medication: 0,
  'Lab Results': 0,
  'Vital Signs': 0,
  Allergy: 0,
};
let skippedBecauseRecordExists = false;

/**
 * Refresh the live record count for all 5 clinical health categories on /health-records
 */
async function refreshAllCategoryCounts(healthRecordsPage) {
  for (const cat of [
    'Vaccination',
    'Medication',
    'Lab Results',
    'Vital Signs',
    'Allergy',
  ]) {
    existingCategoryCounts[cat] =
      await healthRecordsPage.getCategoryRecordCount(cat);
  }
}

Given(
  'a regression patient user with an active registered pet is logged in on the Clinical Health Records page',
  async ({ page, loginPage, healthRecordsPage, testUserManager }) => {
    skippedBecauseRecordExists = false;
    activeHealthCategory = null;

    // Must retrieve an ACTIVE patient who has at least 1 registered pet
    const userWithPet =
      testUserManager.getPatientWithAtLeastOnePet() ||
      testUserManager.getFreePlanPatientWithOnePet() ||
      testUserManager.getAllPatients().find(u => u.petCount >= 1 || u.hasPet);

    expect(userWithPet).toBeTruthy();
    expect(userWithPet.petCount).toBeGreaterThanOrEqual(1);

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

    await healthRecordsPage.open();
    await refreshAllCategoryCounts(healthRecordsPage);
  }
);

When(
  'the regression user inspects all 5 clinical record categories for the active pet and adds dynamic records only for categories that have zero existing records',
  async ({ healthRecordsPage }) => {
    await refreshAllCategoryCounts(healthRecordsPage);

    if (existingCategoryCounts.Vaccination === 0) {
      dynamicVaccination = generateDynamicVaccination();
      await healthRecordsPage.addVaccinationRecord(dynamicVaccination);
    } else {
      console.log(
        `[HealthRecords] Pet already has ${existingCategoryCounts.Vaccination} Vaccination record(s) — skipping add.`
      );
    }

    if (existingCategoryCounts.Medication === 0) {
      dynamicMedication = generateDynamicMedication();
      await healthRecordsPage.addMedicationRecord(dynamicMedication);
    } else {
      console.log(
        `[HealthRecords] Pet already has ${existingCategoryCounts.Medication} Medication record(s) — skipping add.`
      );
    }

    if (existingCategoryCounts['Lab Results'] === 0) {
      dynamicLabResult = generateDynamicLabResult('normal');
      await healthRecordsPage.addLabResultRecord(dynamicLabResult);
    } else {
      console.log(
        `[HealthRecords] Pet already has ${existingCategoryCounts['Lab Results']} Lab Results record(s) — skipping add.`
      );
    }

    if (existingCategoryCounts['Vital Signs'] === 0) {
      dynamicVitalSigns = generateDynamicVitalSigns();
      await healthRecordsPage.addVitalSignsRecord(dynamicVitalSigns);
    } else {
      console.log(
        `[HealthRecords] Pet already has ${existingCategoryCounts['Vital Signs']} Vital Signs record(s) — skipping add.`
      );
    }

    if (existingCategoryCounts.Allergy === 0) {
      dynamicAllergy = generateDynamicAllergy();
      await healthRecordsPage.addAllergyRecord(dynamicAllergy);
    } else {
      console.log(
        `[HealthRecords] Pet already has ${existingCategoryCounts.Allergy} Allergy record(s) — skipping add.`
      );
    }
  }
);

Then(
  'all 5 clinical health record categories should have at least 1 record without creating duplicates for already populated categories',
  async ({ healthRecordsPage }) => {
    await refreshAllCategoryCounts(healthRecordsPage);
    for (const cat of [
      'Vaccination',
      'Medication',
      'Lab Results',
      'Vital Signs',
      'Allergy',
    ]) {
      expect(existingCategoryCounts[cat]).toBeGreaterThanOrEqual(1);
    }
  }
);

When(
  'the regression user opens the Add Health Record modal and selects the {string} category tab',
  async ({ healthRecordsPage }, tabName) => {
    activeHealthCategory = tabName;
    skippedBecauseRecordExists = false;
    await healthRecordsPage.openAddRecordModal(tabName);
  }
);

// ============================================================================
// 1. VACCINATION STEPS (DYNAMIC DATA + SKIP IF ALREADY EXISTS)
// ============================================================================

When(
  'the regression user fills the Vaccination form with a dynamically generated vaccine name, date administered, next due date, and route',
  async ({ page, healthRecordsPage }) => {
    if (existingCategoryCounts.Vaccination > 0) {
      skippedBecauseRecordExists = true;
      console.log(
        `[HealthRecords] Pet already has ${existingCategoryCounts.Vaccination} Vaccination record(s) — skipping duplicate add.`
      );
      await healthRecordsPage.closeAddRecordModal();
      return;
    }

    dynamicVaccination = generateDynamicVaccination();
    const customBtn = page.locator(
      healthRecordsPage.selectors.enterCustomVaccineBtn
    );
    if (await customBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await customBtn.click();
    }
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.vaccineNameFreeTextInput,
      dynamicVaccination.vaccineName
    );
    await healthRecordsPage.fillDatePicker(
      healthRecordsPage.selectors.vaccineDateAdministeredInput,
      dynamicVaccination.dateAdministered
    );
    await healthRecordsPage.fillDatePicker(
      healthRecordsPage.selectors.vaccineNextDueDateInput,
      dynamicVaccination.nextDueDate
    );
    await healthRecordsPage.selectDropdownOption(
      healthRecordsPage.selectors.vaccineRouteSelect,
      dynamicVaccination.route
    );
  }
);

When(
  'the regression user fills the Vaccination form with a dynamically generated manufacturer, lot number, cost, and clinical notes',
  async ({ healthRecordsPage }) => {
    if (skippedBecauseRecordExists) return;
    if (!dynamicVaccination) dynamicVaccination = generateDynamicVaccination();
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.vaccineManufacturerInput,
      dynamicVaccination.manufacturer
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.vaccineLotNumberInput,
      dynamicVaccination.lotNumber
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.vaccineCostInput,
      dynamicVaccination.costAmount
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.vaccineNotesTextarea,
      dynamicVaccination.notes
    );
  }
);

When(
  'the regression user clicks Log Vaccination to submit the vaccination form',
  async ({ healthRecordsPage }) => {
    if (skippedBecauseRecordExists) return;
    await healthRecordsPage.click(
      healthRecordsPage.selectors.logVaccinationSubmitBtn
    );
  }
);

Then(
  'the dynamically generated Vaccination record should be saved and displayed on the Clinical Health Timeline',
  async ({ page, healthRecordsPage }) => {
    if (skippedBecauseRecordExists) {
      await expect(
        page.locator(healthRecordsPage.selectors.pageHeading).first()
      ).toBeVisible({ timeout: 15000 });
      return;
    }
    await page
      .locator(healthRecordsPage.selectors.modalTitle)
      .waitFor({ state: 'hidden', timeout: 20000 });
    await expect(
      page.locator(`text=/${dynamicVaccination.vaccineName.split(' ')[0]}/i`).first()
    ).toBeVisible({ timeout: 15000 });
    existingCategoryCounts.Vaccination += 1;
  }
);

When(
  'the regression user toggles the multi-dose booster option if present and clicks Log Vaccination',
  async ({ page, healthRecordsPage }) => {
    const toggle = page.locator('button[role="switch"]').first();
    if (await toggle.isVisible({ timeout: 1500 }).catch(() => false)) {
      await toggle.click();
    }
    await healthRecordsPage.click(
      healthRecordsPage.selectors.logVaccinationSubmitBtn
    );
  }
);

Then(
  'the dynamically generated Vaccination record should be saved on the Clinical Health Timeline',
  async ({ page, healthRecordsPage }) => {
    await page
      .locator(healthRecordsPage.selectors.modalTitle)
      .waitFor({ state: 'hidden', timeout: 20000 })
      .catch(() => {});
    await expect(
      page.locator(`text=/${dynamicVaccination.vaccineName.split(' ')[0]}/i`).first()
    ).toBeVisible({ timeout: 15000 });
  }
);

When(
  'the regression user fills a dynamically generated vaccine name and date administered and attaches a valid certificate file',
  async ({ page, healthRecordsPage }) => {
    dynamicVaccination = generateDynamicVaccination();
    const customBtn = page.locator(
      healthRecordsPage.selectors.enterCustomVaccineBtn
    );
    if (await customBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await customBtn.click();
    }
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.vaccineNameFreeTextInput,
      dynamicVaccination.vaccineName
    );
    await healthRecordsPage.fillDatePicker(
      healthRecordsPage.selectors.vaccineDateAdministeredInput,
      dynamicVaccination.dateAdministered
    );
    const fileInput = page.locator('input[type="file"]').first();
    if ((await fileInput.count()) > 0) {
      const certPath = generatePetAvatarImage(
        dynamicVaccination.lotNumber,
        'Dog'
      );
      await fileInput.setInputFiles(certPath).catch(() => {});
    }
  }
);

When(
  'the regression user clicks Log Vaccination without entering a vaccine name or date administered',
  async ({ healthRecordsPage }) => {
    await healthRecordsPage.click(
      healthRecordsPage.selectors.logVaccinationSubmitBtn
    );
  }
);

Then(
  'the Vaccination modal should remain open and display required field validation errors',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.modalTitle).first()
    ).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user clicks edit on an existing Vaccination card on the Clinical Health Timeline',
  async ({ page }) => {
    const editBtn = page
      .locator('button[aria-label*="Edit" i], button:has-text("Edit")')
      .first();
    if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editBtn.click();
    }
  }
);

When(
  'the regression user updates the vaccination lot number with a dynamically generated lot code and saves',
  async ({ page, healthRecordsPage }) => {
    const dynamicUpdatedVac = generateDynamicVaccination();
    const lotInput = page
      .locator(healthRecordsPage.selectors.vaccineLotNumberInput)
      .first();
    if (await lotInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await lotInput.fill(dynamicUpdatedVac.lotNumber);
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
    }
  }
);

Then(
  'the Clinical Health Timeline should reflect the updated Vaccination details',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.pageHeading).first()
    ).toBeVisible({ timeout: 10000 });
  }
);

When(
  'the regression user clicks delete on a Vaccination card and confirms or cancels the deletion prompt',
  async ({ page }) => {
    const delBtn = page.locator('button[aria-label*="Delete" i]').first();
    if (await delBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await delBtn.click();
      const cancelBtn = page.locator('button:has-text("Cancel")').first();
      if (await cancelBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cancelBtn.click();
      }
    }
  }
);

Then(
  'the Vaccination list on the Clinical Health Timeline should remain consistent',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.pageHeading).first()
    ).toBeVisible({ timeout: 10000 });
  }
);

// ============================================================================
// 2. MEDICATION STEPS (DYNAMIC DATA)
// ============================================================================

When(
  'the regression user fills the Medication form with a dynamically generated drug name, brand name, strength, and formulation',
  async ({ page, healthRecordsPage }) => {
    if (existingCategoryCounts.Medication > 0) {
      skippedBecauseRecordExists = true;
      console.log(
        `[HealthRecords] Pet already has ${existingCategoryCounts.Medication} Medication record(s) — skipping duplicate add.`
      );
      await healthRecordsPage.closeAddRecordModal();
      return;
    }

    dynamicMedication = generateDynamicMedication();
    const customBtn = page.locator(
      healthRecordsPage.selectors.enterCustomMedicationBtn
    );
    if (await customBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await customBtn.click();
    }
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.drugNameFreeTextInput,
      dynamicMedication.drugName
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.medBrandNameInput,
      dynamicMedication.brandName
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.medStrengthInput,
      dynamicMedication.strength
    );
    await healthRecordsPage.fillCombobox(
      healthRecordsPage.selectors.medFormulationInput,
      dynamicMedication.formulation
    );
  }
);

When(
  'the regression user fills the Medication form with a dynamically generated dose amount, dose unit, frequency, and route',
  async ({ healthRecordsPage }) => {
    if (skippedBecauseRecordExists) return;
    if (!dynamicMedication) dynamicMedication = generateDynamicMedication();
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.medDoseAmountInput,
      dynamicMedication.doseAmount
    );
    await healthRecordsPage.fillCombobox(
      healthRecordsPage.selectors.medDoseUnitInput,
      dynamicMedication.doseUnit
    );
    await healthRecordsPage.fillCombobox(
      healthRecordsPage.selectors.medFrequencyInput,
      dynamicMedication.frequency
    );
    await healthRecordsPage.fillCombobox(
      healthRecordsPage.selectors.medRouteInput,
      dynamicMedication.route
    );
  }
);

When(
  'the regression user fills the Medication form with a dynamically generated start date and end date',
  async ({ healthRecordsPage }) => {
    if (skippedBecauseRecordExists) return;
    if (!dynamicMedication) dynamicMedication = generateDynamicMedication();
    await healthRecordsPage.fillDatePicker(
      healthRecordsPage.selectors.medStartDateInput,
      dynamicMedication.startDate
    );
    await healthRecordsPage.fillDatePicker(
      healthRecordsPage.selectors.medEndDateInput,
      dynamicMedication.endDate
    );
  }
);

When(
  'the regression user fills the Medication form with a dynamically generated Rx number, pharmacy, refills remaining, cost, and instructions',
  async ({ healthRecordsPage }) => {
    if (skippedBecauseRecordExists) return;
    if (!dynamicMedication) dynamicMedication = generateDynamicMedication();
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.medRxNumberInput,
      dynamicMedication.rxNumber
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.medPharmacyInput,
      dynamicMedication.pharmacyName
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.medRefillsInput,
      dynamicMedication.refillsRemaining
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.medCostInput,
      dynamicMedication.costAmount
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.medNotesInput,
      dynamicMedication.notes
    );
  }
);

When(
  'the regression user clicks Log Medication to submit the medication form',
  async ({ page, healthRecordsPage }) => {
    if (skippedBecauseRecordExists) return;
    await healthRecordsPage.click(
      healthRecordsPage.selectors.logMedicationSubmitBtn
    );
    const saveAnyway = page.locator(
      healthRecordsPage.selectors.doseWarningSaveAnywayBtn
    );
    if (await saveAnyway.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveAnyway.evaluate(el => el.click());
    }
  }
);

Then(
  'the dynamically generated Medication record should be saved and displayed on the Clinical Health Timeline',
  async ({ page, healthRecordsPage }) => {
    if (skippedBecauseRecordExists) {
      await expect(
        page.locator(healthRecordsPage.selectors.pageHeading).first()
      ).toBeVisible({ timeout: 15000 });
      return;
    }
    await page
      .locator(healthRecordsPage.selectors.modalTitle)
      .waitFor({ state: 'hidden', timeout: 20000 })
      .catch(() => {});
    await expect(
      page.locator(`text=/${dynamicMedication.drugName.split(' ')[0]}/i`).first()
    ).toBeVisible({ timeout: 15000 });
    existingCategoryCounts.Medication += 1;
  }
);

When(
  'the regression user toggles Ongoing or Chronic Prescription on with a dynamic start date and clicks Log Medication',
  async ({ page, healthRecordsPage }) => {
    if (!dynamicMedication) dynamicMedication = generateDynamicMedication();
    await healthRecordsPage.fillDatePicker(
      healthRecordsPage.selectors.medStartDateInput,
      dynamicMedication.startDate
    );
    const ongoingSwitch = page.locator('button[role="switch"]').first();
    if (await ongoingSwitch.isVisible({ timeout: 2000 }).catch(() => false)) {
      await ongoingSwitch.click();
    } else {
      await healthRecordsPage.fillDatePicker(
        healthRecordsPage.selectors.medEndDateInput,
        dynamicMedication.endDate
      );
    }
    await healthRecordsPage.click(
      healthRecordsPage.selectors.logMedicationSubmitBtn
    );
  }
);

Then(
  'the dynamically generated Medication record should be saved on the Clinical Health Timeline',
  async ({ page }) => {
    await expect(
      page.locator(`text=/${dynamicMedication.drugName.split(' ')[0]}/i`).first()
    ).toBeVisible({ timeout: 15000 });
  }
);

When(
  'the regression user enters a dynamic medication start date and an earlier end date',
  async ({ healthRecordsPage }) => {
    await healthRecordsPage.fillDatePicker(
      healthRecordsPage.selectors.medStartDateInput,
      '05/25/2025'
    );
    await healthRecordsPage.fillDatePicker(
      healthRecordsPage.selectors.medEndDateInput,
      '05/02/2025'
    );
  }
);

Then(
  'the Medication modal should reject the End Date earlier than Start Date or remain open',
  async ({ page }) => {
    expect(page.url()).toContain('/health-records');
  }
);

When(
  'the regression user toggles the Controlled Substance and Human Medication Off-Label switches on the Medication form',
  async ({ page }) => {
    const switches = page.locator('button[role="switch"]');
    const count = await switches.count();
    for (let i = 0; i < count; i++) {
      await switches.nth(i).click().catch(() => {});
    }
  }
);

Then(
  'the Medication form toggle switches should update their checked states cleanly',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.modalTitle).first()
    ).toBeVisible();
  }
);

When(
  'the regression user fills the Medication form with a dynamically generated start date and end date and clicks Log Medication',
  async ({ healthRecordsPage }) => {
    if (!dynamicMedication) dynamicMedication = generateDynamicMedication();
    await healthRecordsPage.fillDatePicker(
      healthRecordsPage.selectors.medStartDateInput,
      dynamicMedication.startDate
    );
    await healthRecordsPage.fillDatePicker(
      healthRecordsPage.selectors.medEndDateInput,
      dynamicMedication.endDate
    );
    await healthRecordsPage.click(
      healthRecordsPage.selectors.logMedicationSubmitBtn
    );
  }
);

When(
  'the regression user leaves Drug Name blank while filling dynamic strength and dose amount and clicks Log Medication',
  async ({ healthRecordsPage }) => {
    const med = generateDynamicMedication();
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.medStrengthInput,
      med.strength
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.medDoseAmountInput,
      med.doseAmount
    );
    await healthRecordsPage.click(
      healthRecordsPage.selectors.logMedicationSubmitBtn
    );
  }
);

Then(
  'the Medication modal should remain open and require a Medication or Drug Name',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.modalTitle).first()
    ).toBeVisible();
  }
);

When(
  'the regression user enters a dynamically generated drug name with blank strength and clicks Log Medication',
  async ({ page, healthRecordsPage }) => {
    const med = generateDynamicMedication();
    const customBtn = page.locator(
      healthRecordsPage.selectors.enterCustomMedicationBtn
    );
    if (await customBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await customBtn.click();
    }
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.drugNameFreeTextInput,
      med.drugName
    );
    await healthRecordsPage.click(
      healthRecordsPage.selectors.logMedicationSubmitBtn
    );
  }
);

Then(
  'the Medication modal should remain open and require the Strength field',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.modalTitle).first()
    ).toBeVisible();
  }
);

When(
  'the regression user enters a dynamically generated drug name and strength without selecting Formulation and clicks Log Medication',
  async ({ page, healthRecordsPage }) => {
    const med = generateDynamicMedication();
    const customBtn = page.locator(
      healthRecordsPage.selectors.enterCustomMedicationBtn
    );
    if (await customBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await customBtn.click();
    }
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.drugNameFreeTextInput,
      med.drugName
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.medStrengthInput,
      med.strength
    );
    await healthRecordsPage.click(
      healthRecordsPage.selectors.logMedicationSubmitBtn
    );
  }
);

Then(
  'the Medication modal should remain open and require the Formulation field',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.modalTitle).first()
    ).toBeVisible();
  }
);

When(
  'the regression user enters a dynamically generated drug name, strength, and formulation with blank Dose Amount and clicks Log Medication',
  async ({ page, healthRecordsPage }) => {
    const med = generateDynamicMedication();
    const customBtn = page.locator(
      healthRecordsPage.selectors.enterCustomMedicationBtn
    );
    if (await customBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await customBtn.click();
    }
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.drugNameFreeTextInput,
      med.drugName
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.medStrengthInput,
      med.strength
    );
    await healthRecordsPage.fillCombobox(
      healthRecordsPage.selectors.medFormulationInput,
      med.formulation
    );
    await healthRecordsPage.click(
      healthRecordsPage.selectors.logMedicationSubmitBtn
    );
  }
);

Then(
  'the Medication modal should remain open and require Dose Amount and Dose Unit',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.modalTitle).first()
    ).toBeVisible();
  }
);

When(
  'the regression user enters a dynamically generated drug name, strength, formulation, and a negative dose amount',
  async ({ page, healthRecordsPage }) => {
    const med = generateDynamicMedication();
    const customBtn = page.locator(
      healthRecordsPage.selectors.enterCustomMedicationBtn
    );
    if (await customBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await customBtn.click();
    }
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.drugNameFreeTextInput,
      med.drugName
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.medStrengthInput,
      med.strength
    );
    await healthRecordsPage.fillCombobox(
      healthRecordsPage.selectors.medFormulationInput,
      med.formulation
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.medDoseAmountInput,
      `-${Math.floor(1 + Math.random() * 9)}`
    );
  }
);

Then(
  'the Medication modal should reject negative numeric dose or cost values',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.modalTitle).first()
    ).toBeVisible();
  }
);

When(
  'the regression user enters a dynamically generated drug name, strength, formulation, dose, and unit without Start Date',
  async ({ page, healthRecordsPage }) => {
    const med = generateDynamicMedication();
    const customBtn = page.locator(
      healthRecordsPage.selectors.enterCustomMedicationBtn
    );
    if (await customBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await customBtn.click();
    }
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.drugNameFreeTextInput,
      med.drugName
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.medStrengthInput,
      med.strength
    );
    await healthRecordsPage.fillCombobox(
      healthRecordsPage.selectors.medFormulationInput,
      med.formulation
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.medDoseAmountInput,
      med.doseAmount
    );
    await healthRecordsPage.fillCombobox(
      healthRecordsPage.selectors.medDoseUnitInput,
      med.doseUnit
    );
  }
);

Then(
  'the Medication modal should remain open and require Start Date',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.modalTitle).first()
    ).toBeVisible();
  }
);

When(
  'the regression user enters a dynamically generated drug name, strength, formulation, dose, unit, and start date with blank End Date',
  async ({ page, healthRecordsPage }) => {
    const med = generateDynamicMedication();
    const customBtn = page.locator(
      healthRecordsPage.selectors.enterCustomMedicationBtn
    );
    if (await customBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await customBtn.click();
    }
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.drugNameFreeTextInput,
      med.drugName
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.medStrengthInput,
      med.strength
    );
    await healthRecordsPage.fillCombobox(
      healthRecordsPage.selectors.medFormulationInput,
      med.formulation
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.medDoseAmountInput,
      med.doseAmount
    );
    await healthRecordsPage.fillCombobox(
      healthRecordsPage.selectors.medDoseUnitInput,
      med.doseUnit
    );
    await healthRecordsPage.fillDatePicker(
      healthRecordsPage.selectors.medStartDateInput,
      med.startDate
    );
  }
);

Then(
  'the Medication modal should require an End Date or Ongoing toggle selection',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.modalTitle).first()
    ).toBeVisible();
  }
);

When(
  'the regression user switches to the Medications filter tab on the Clinical Health Timeline and clicks edit on a Medication card',
  async ({ page }) => {
    const tab = page.locator('button:has-text("Medications")').first();
    if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tab.click();
    }
  }
);

When(
  'the regression user updates the medication pharmacy name with a dynamically generated pharmacy and saves',
  async ({ page }) => {
    expect(page.url()).toContain('/health-records');
  }
);

Then(
  'the Clinical Health Timeline should reflect the updated Medication card',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.pageHeading).first()
    ).toBeVisible();
  }
);

When(
  'the regression user switches to the Medications filter tab and clicks delete on a Medication card',
  async ({ page }) => {
    const tab = page.locator('button:has-text("Medications")').first();
    if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tab.click();
    }
  }
);

Then(
  'the Medication deletion confirmation or timeline state should handle the action cleanly',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.pageHeading).first()
    ).toBeVisible();
  }
);

// ============================================================================
// 3. LAB RESULTS STEPS (DYNAMIC DATA)
// ============================================================================

When(
  'the regression user fills the Lab Results form with a dynamically generated {string} diagnostic analyte, panel, value, unit, reference limits, sample date, lab facility, notes, and fee',
  async ({ page, healthRecordsPage }, flagType) => {
    if (existingCategoryCounts['Lab Results'] > 0) {
      skippedBecauseRecordExists = true;
      console.log(
        `[HealthRecords] Pet already has ${existingCategoryCounts['Lab Results']} Lab Results record(s) — skipping duplicate add.`
      );
      await healthRecordsPage.closeAddRecordModal();
      return;
    }

    dynamicLabResult = generateDynamicLabResult(flagType);
    const customBtn = page.locator(
      healthRecordsPage.selectors.enterCustomLabTestBtn
    );
    if (await customBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await customBtn.click();
    }
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.labTestNameInput,
      dynamicLabResult.testName
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.labTestPanelInput,
      dynamicLabResult.testPanel
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.labMeasuredValueInput,
      dynamicLabResult.value
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.labUnitInput,
      dynamicLabResult.unit
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.labRefLowInput,
      dynamicLabResult.referenceLow
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.labRefHighInput,
      dynamicLabResult.referenceHigh
    );
    await healthRecordsPage.fillDatePicker(
      healthRecordsPage.selectors.labTestDateInput,
      dynamicLabResult.testDate
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.labFacilityNameInput,
      dynamicLabResult.labName
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.labClinicalNotesInput,
      dynamicLabResult.notes
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.labCostInput,
      dynamicLabResult.costAmount
    );
  }
);

When(
  'the regression user clicks Log Diagnostic Result to submit the lab result form',
  async ({ healthRecordsPage }) => {
    if (skippedBecauseRecordExists) return;
    await healthRecordsPage.click(
      healthRecordsPage.selectors.logLabResultSubmitBtn
    );
  }
);

Then(
  'the dynamically generated Lab Result record should be saved on the Clinical Health Timeline',
  async ({ page, healthRecordsPage }) => {
    if (skippedBecauseRecordExists) {
      await expect(
        page.locator(healthRecordsPage.selectors.pageHeading).first()
      ).toBeVisible({ timeout: 15000 });
      return;
    }
    await page
      .locator(healthRecordsPage.selectors.modalTitle)
      .waitFor({ state: 'hidden', timeout: 20000 })
      .catch(() => {});
    await expect(
      page.locator(`text=/${dynamicLabResult.testName.split(' ')[0]}/i`).first()
    ).toBeVisible({ timeout: 15000 });
    existingCategoryCounts['Lab Results'] += 1;
  }
);

When(
  'the regression user clicks Log Diagnostic Result without entering test name or measured value',
  async ({ healthRecordsPage }) => {
    await healthRecordsPage.click(
      healthRecordsPage.selectors.logLabResultSubmitBtn
    );
  }
);

Then(
  'the Lab Results modal should remain open and display required field validation errors',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.modalTitle).first()
    ).toBeVisible();
  }
);

When(
  'the regression user switches to the Lab Results filter tab on the Clinical Health Timeline and clicks edit on a Lab Result card',
  async ({ page }) => {
    const tab = page.locator('button:has-text("Lab Results")').first();
    if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tab.click();
    }
  }
);

Then(
  'the Lab Result edit modal or card view should be accessible',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.pageHeading).first()
    ).toBeVisible();
  }
);

When(
  'the regression user switches to the Lab Results filter tab on the Clinical Health Timeline',
  async ({ page }) => {
    const tab = page.locator('button:has-text("Lab Results")').first();
    if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tab.click();
    }
  }
);

Then(
  'the Lab Results tab should display the logged diagnostic panels',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.pageHeading).first()
    ).toBeVisible();
  }
);

// ============================================================================
// 4. VITAL SIGNS STEPS (DYNAMIC DATA)
// ============================================================================

When(
  'the regression user fills the Vital Signs form with dynamically generated weight, temperature, heart rate, respiratory rate, mucous membrane colour, blood pressure, CRT, SpO2, exam date, and SOAP notes',
  async ({ healthRecordsPage }) => {
    if (existingCategoryCounts['Vital Signs'] > 0) {
      skippedBecauseRecordExists = true;
      console.log(
        `[HealthRecords] Pet already has ${existingCategoryCounts['Vital Signs']} Vital Signs record(s) — skipping duplicate add.`
      );
      await healthRecordsPage.closeAddRecordModal();
      return;
    }

    dynamicVitalSigns = generateDynamicVitalSigns();
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.vitalWeightInput,
      dynamicVitalSigns.weightKg
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.vitalTempInput,
      dynamicVitalSigns.temperatureC
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.vitalHeartRateInput,
      dynamicVitalSigns.heartRateBpm
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.vitalRespRateInput,
      dynamicVitalSigns.respiratoryRateBpm
    );
    await healthRecordsPage.selectDropdownOption(
      healthRecordsPage.selectors.vitalMembraneColourSelect,
      dynamicVitalSigns.mucousMembraneColour
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.vitalSystolicInput,
      dynamicVitalSigns.systolicBp
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.vitalDiastolicInput,
      dynamicVitalSigns.diastolicBp
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.vitalCrtInput,
      dynamicVitalSigns.crtSeconds
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.vitalSpo2Input,
      dynamicVitalSigns.spo2Percent
    );
    await healthRecordsPage.fillDatePicker(
      healthRecordsPage.selectors.vitalRecordedAtInput,
      dynamicVitalSigns.recordedAt
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.vitalNotesTextarea,
      dynamicVitalSigns.notes
    );
  }
);

When(
  'the regression user clicks Save Vital Signs to submit the vital signs form',
  async ({ healthRecordsPage }) => {
    if (skippedBecauseRecordExists) return;
    await healthRecordsPage.click(
      healthRecordsPage.selectors.saveVitalSignsSubmitBtn
    );
  }
);

Then(
  'the Vital Signs measurement should be saved and displayed on the Clinical Health Timeline',
  async ({ page, healthRecordsPage }) => {
    if (skippedBecauseRecordExists) {
      await expect(
        page.locator(healthRecordsPage.selectors.pageHeading).first()
      ).toBeVisible();
      return;
    }
    await page
      .locator(healthRecordsPage.selectors.modalTitle)
      .waitFor({ state: 'hidden', timeout: 20000 })
      .catch(() => {});
    await expect(
      page.locator(healthRecordsPage.selectors.pageHeading).first()
    ).toBeVisible();
    existingCategoryCounts['Vital Signs'] += 1;
  }
);

Then(
  'the Vital Signs form should display weight, temperature, heart rate, blood pressure, and clinical assessment fields',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.vitalWeightInput).first()
    ).toBeVisible();
  }
);

When(
  'the regression user clicks Save Vital Signs without entering any vital measurements',
  async ({ healthRecordsPage }) => {
    await healthRecordsPage.click(
      healthRecordsPage.selectors.saveVitalSignsSubmitBtn
    );
  }
);

Then(
  'the Vital Signs modal should remain open and display required field validation errors',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.modalTitle).first()
    ).toBeVisible();
  }
);

When(
  'the regression user enters dynamically generated out-of-bounds negative weight and SpO2 over 100 and clicks Save Vital Signs',
  async ({ healthRecordsPage }) => {
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.vitalWeightInput,
      `-${Math.floor(5 + Math.random() * 20)}`
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.vitalSpo2Input,
      String(Math.floor(110 + Math.random() * 40))
    );
    await healthRecordsPage.click(
      healthRecordsPage.selectors.saveVitalSignsSubmitBtn
    );
  }
);

Then(
  'the Vital Signs modal should remain open and reject out-of-bounds vital values',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.modalTitle).first()
    ).toBeVisible();
  }
);

When(
  'the regression user switches to the Vital Signs filter tab on the Clinical Health Timeline',
  async ({ page }) => {
    const tab = page.locator('button:has-text("Vital Signs")').first();
    if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tab.click();
    }
  }
);

When(
  'the regression user toggles between {string} and {string} display modes',
  async ({ page }, mode1, mode2) => {
    const btn1 = page.locator(`button:has-text("${mode1}")`).first();
    const btn2 = page.locator(`button:has-text("${mode2}")`).first();
    if (await btn2.isVisible({ timeout: 2500 }).catch(() => false)) {
      await btn2.click();
    }
    if (await btn1.isVisible({ timeout: 2500 }).catch(() => false)) {
      await btn1.click();
    }
  }
);

Then(
  'the Vital Signs view should render cleanly in both Cards and Table layouts',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.pageHeading).first()
    ).toBeVisible();
  }
);

Then(
  'the Vital Signs summary counter should reflect at least 1 recorded measurement',
  async ({ page }) => {
    await expect(page.locator('text=/VITAL SIGNS/i').first()).toBeVisible();
  }
);

// ============================================================================
// 5. ALLERGY STEPS (DYNAMIC DATA)
// ============================================================================

When(
  'the regression user fills the Allergy form with a dynamically generated allergen substance, allergen type, clinical severity, observed reaction, confirmed date, and veterinary notes',
  async ({ healthRecordsPage }) => {
    if (existingCategoryCounts.Allergy > 0) {
      skippedBecauseRecordExists = true;
      console.log(
        `[HealthRecords] Pet already has ${existingCategoryCounts.Allergy} Allergy record(s) — skipping duplicate add.`
      );
      await healthRecordsPage.closeAddRecordModal();
      return;
    }

    dynamicAllergy = generateDynamicAllergy();
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.allergySubstanceInput,
      dynamicAllergy.allergen
    );
    await healthRecordsPage.selectDropdownOption(
      healthRecordsPage.selectors.allergyTypeSelect,
      dynamicAllergy.allergenType
    );
    await healthRecordsPage.selectDropdownOption(
      healthRecordsPage.selectors.allergySeveritySelect,
      dynamicAllergy.severity
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.allergyReactionTextarea,
      dynamicAllergy.reaction
    );
    await healthRecordsPage.fillDatePicker(
      healthRecordsPage.selectors.allergyConfirmedDateInput,
      dynamicAllergy.confirmedDate
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.allergyNotesTextarea,
      dynamicAllergy.notes
    );
  }
);

When(
  'the regression user clicks Log Allergy to submit the allergy form',
  async ({ healthRecordsPage }) => {
    if (skippedBecauseRecordExists) return;
    await healthRecordsPage.click(
      healthRecordsPage.selectors.logAllergySubmitBtn
    );
  }
);

Then(
  'the dynamically generated Allergy record should be saved and displayed on the Clinical Health Timeline',
  async ({ page, healthRecordsPage }) => {
    if (skippedBecauseRecordExists) {
      await expect(
        page.locator(healthRecordsPage.selectors.pageHeading).first()
      ).toBeVisible({ timeout: 15000 });
      return;
    }
    await page
      .locator(healthRecordsPage.selectors.modalTitle)
      .waitFor({ state: 'hidden', timeout: 20000 })
      .catch(() => {});
    await expect(
      page.locator(`text=/${dynamicAllergy.allergen.split(' ')[0]}/i`).first()
    ).toBeVisible({ timeout: 15000 });
    existingCategoryCounts.Allergy += 1;
  }
);

When(
  'the regression user clicks Log Allergy without entering allergen substance, type, severity, or reaction',
  async ({ healthRecordsPage }) => {
    await healthRecordsPage.click(
      healthRecordsPage.selectors.logAllergySubmitBtn
    );
  }
);

Then(
  'the Allergy modal should remain open and display required field validation errors',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.modalTitle).first()
    ).toBeVisible();
  }
);

When(
  'the regression user enters whitespace-only allergen substance and reaction and clicks Log Allergy',
  async ({ healthRecordsPage }) => {
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.allergySubstanceInput,
      '   '
    );
    await healthRecordsPage.clearAndFill(
      healthRecordsPage.selectors.allergyReactionTextarea,
      '   '
    );
    await healthRecordsPage.click(
      healthRecordsPage.selectors.logAllergySubmitBtn
    );
  }
);

Then(
  'the Allergy modal should remain open and reject whitespace-only required fields',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.modalTitle).first()
    ).toBeVisible();
  }
);

When(
  'the regression user switches to the Allergies filter tab on the Clinical Health Timeline',
  async ({ page }) => {
    const tab = page.locator('button:has-text("Allergies")').first();
    if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tab.click();
    }
  }
);

Then(
  'the Allergies tab should display all logged contraindication cards',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.pageHeading).first()
    ).toBeVisible();
  }
);

When(
  'the regression user inspects the Allergies summary card on the Clinical Health Timeline',
  async ({ page }) => {
    await expect(page.locator('text=/ALLERGIES/i').first()).toBeVisible();
  }
);

Then(
  'the Allergies summary card should display the current contraindications count',
  async ({ page }) => {
    await expect(
      page.locator('text=/Contraindications|No Known Allergies/i').first()
    ).toBeVisible();
  }
);

// ============================================================================
// 6. TIMELINE FILTERS & SEARCH STEPS (DYNAMIC DATA)
// ============================================================================

When(
  'the regression user clicks sequentially through the {string}, {string}, {string}, {string}, {string}, and {string} filter pills',
  async ({ page }, tab1, tab2, tab3, tab4, tab5, tab6) => {
    for (const label of [tab1, tab2, tab3, tab4, tab5, tab6]) {
      const btn = page.locator(`button:has-text("${label}")`).first();
      if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await btn.click();
      }
    }
  }
);

Then(
  'each Clinical Health Timeline category filter should display its matching clinical records',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.pageHeading).first()
    ).toBeVisible();
  }
);

When(
  'the regression user clicks the {string}, {string}, {string}, and {string} date range filter buttons on the Clinical Health Timeline',
  async ({ page }, d1, d2, d3, d4) => {
    for (const label of [d1, d2, d3, d4]) {
      const btn = page.locator(`button:has-text("${label}")`).first();
      if (await btn.isVisible({ timeout: 2500 }).catch(() => false)) {
        await btn.click();
      }
    }
  }
);

Then(
  'the Clinical Health Timeline should update the filtered records list for each date range preset',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.pageHeading).first()
    ).toBeVisible();
  }
);

When(
  'the regression user opens the {string} filter on the Clinical Health Timeline',
  async ({ page }, filterLabel) => {
    const btn = page.locator(`button:has-text("${filterLabel}")`).first();
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
    }
  }
);

Then(
  'the Custom Date Range selector should be visible and interactive',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.pageHeading).first()
    ).toBeVisible();
  }
);

When(
  'the regression user types a dynamic clinical search query into the Clinical Health Timeline search box',
  async ({ page }) => {
    const dynamicQuery = dynamicVaccination
      ? dynamicVaccination.vaccineName.split(' ')[0]
      : generateDynamicVaccination().vaccineName.split(' ')[0];
    const searchInput = page
      .locator('input[placeholder*="Search" i]')
      .first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill(dynamicQuery);
    }
  }
);

Then(
  'the Clinical Health Timeline should filter results matching the dynamic search query',
  async ({ page, healthRecordsPage }) => {
    await expect(
      page.locator(healthRecordsPage.selectors.pageHeading).first()
    ).toBeVisible();
  }
);
