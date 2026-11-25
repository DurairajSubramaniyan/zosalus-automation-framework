const BasePage = require('./BasePage');

/**
 * HealthRecordsPage encapsulates all elements and actions for the Zosalus
 * Clinical Health Timeline page (/health-records) and its 5 clinical record modals:
 * Vaccinations, Medications, Lab Results, Vital Signs, and Allergies.
 */
class HealthRecordsPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.selectors = {
      // Sidebar & Header Navigation
      healthRecordsNavLink: 'a[href="/health-records"], button:has-text("Health Records")',
      pageHeading: 'h1:has-text("Clinical Health Timeline"), h2:has-text("Clinical Health Timeline")',
      addClinicalRecordBtn: 'button:has-text("Add Clinical Record"), button:has-text("Add First Entry")',

      // Modal Common Elements
      modalTitle: 'h3:has-text("Add Health Record")',
      closeModalBtn: 'button[aria-label="Close modal"]',

      // Modal Category Tabs (Vaccination, Medication, Lab Results, Vital Signs, Allergy)
      modalTabVaccination: 'div.grid.grid-cols-5 button:has-text("Vaccination")',
      modalTabMedication: 'div.grid.grid-cols-5 button:has-text("Medication")',
      modalTabLabResults: 'div.grid.grid-cols-5 button:has-text("Lab Results")',
      modalTabVitalSigns: 'div.grid.grid-cols-5 button:has-text("Vital Signs")',
      modalTabAllergy: 'div.grid.grid-cols-5 button:has-text("Allergy")',

      // 1. Vaccination Form Fields
      enterCustomVaccineBtn: 'button:has-text("Enter custom vaccine")',
      vaccineNameFreeTextInput: 'input#vaccine-name-free-text',
      vaccineDateAdministeredInput: 'input[name="dateAdministered"]',
      vaccineNextDueDateInput: 'input[name="nextDueDate"]',
      vaccineRouteSelect: 'button#vaccination-route-select',
      vaccineManufacturerInput: 'input[name="manufacturer"]',
      vaccineLotNumberInput: 'input[name="lotNumber"]',
      vaccineCostInput: 'input[name="costAmount"]',
      vaccineNotesTextarea: 'textarea#vaccination-notes',
      logVaccinationSubmitBtn: 'button[type="submit"]:has-text("Log Vaccination")',

      // 2. Medication Form Fields
      enterCustomMedicationBtn: 'button:has-text("Enter custom medication")',
      drugNameFreeTextInput: 'input#drug-name-free-text',
      medBrandNameInput: 'input[name="brandName"]',
      medStrengthInput: 'input[name="strength"]',
      medFormulationInput: 'input#med-formulation-select',
      medDoseAmountInput: 'input[name="doseAmount"]',
      medDoseUnitInput: 'input#med-dose-unit-select',
      medFrequencyInput: 'input#med-frequency-select',
      medRouteInput: 'input#med-route-select',
      medStartDateInput: 'input[name="startDate"]',
      medEndDateInput: 'input[name="endDate"]',
      medRxNumberInput: 'input[name="rxNumber"]',
      medPharmacyInput: 'input[name="pharmacyName"]',
      medRefillsInput: 'input[name="refillsRemaining"]',
      medCostInput: 'input[name="costAmount"]',
      medNotesInput: 'input[name="notes"]',
      logMedicationSubmitBtn: 'button[type="submit"]:has-text("Log Medication")',
      doseWarningSaveAnywayBtn: 'button:has-text("Save anyway")',

      // 3. Lab Results Form Fields
      enterCustomLabTestBtn: 'button:has-text("Enter custom test")',
      labTestNameInput: 'input#lab-test-name-input',
      labTestPanelInput: 'input#lab-test-panel-input',
      labMeasuredValueInput: 'input#lab-measured-value-input',
      labUnitInput: 'input#lab-unit-input',
      labRefLowInput: 'input#lab-ref-low-input',
      labRefHighInput: 'input#lab-ref-high-input',
      labTestDateInput: 'input[name="testDate"]',
      labFacilityNameInput: 'input#lab-facility-name-input',
      labClinicalNotesInput: 'input#lab-clinical-notes-input',
      labCostInput: 'input#lab-cost-amount-input',
      logLabResultSubmitBtn: 'button[type="submit"]:has-text("Log Diagnostic Result")',

      // 4. Vital Signs Form Fields
      vitalWeightInput: 'input#vital-weight-input',
      vitalTempInput: 'input#vital-temp-input',
      vitalHeartRateInput: 'input#vital-heart-rate-input',
      vitalRespRateInput: 'input#vital-resp-rate-input',
      vitalMembraneColourSelect: 'button#vital-membrane-colour-select',
      vitalSystolicInput: 'input#vital-systolic-input',
      vitalDiastolicInput: 'input#vital-diastolic-input',
      vitalCrtInput: 'input#vital-crt-input',
      vitalSpo2Input: 'input#vital-spo2-input',
      vitalRecordedAtInput: 'input[name="recordedAt"]',
      vitalNotesTextarea: 'textarea#vital-notes-textarea',
      saveVitalSignsSubmitBtn: 'button[type="submit"]:has-text("Save Vital Signs")',

      // 5. Allergy Form Fields
      allergySubstanceInput: 'input#allergy-substance-input',
      allergyTypeSelect: 'button#allergy-type-select',
      allergySeveritySelect: 'button#allergy-severity-select',
      allergyReactionTextarea: 'textarea#allergy-reaction-input',
      allergyConfirmedDateInput: 'input[name="confirmedDate"]',
      allergyNotesTextarea: 'textarea#allergy-notes-input',
      logAllergySubmitBtn: 'button[type="submit"]:has-text("Log Allergy")',
    };
  }

  /**
   * Navigate to the Clinical Health Records page (/health-records)
   */
  async open() {
    const link = this.page.locator(this.selectors.healthRecordsNavLink).first();
    if (await link.isVisible({ timeout: 3000 }).catch(() => false)) {
      await link.click();
    } else {
      await this.navigate('/health-records');
    }
    await this.page.waitForURL('**/health-records', { timeout: 15000 });
    await this.page.locator(this.selectors.addClinicalRecordBtn).first().waitFor({ state: 'visible', timeout: 15000 });
    await this.page
      .locator('text="Loading health timeline..."')
      .waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});
  }

  /**
   * Open the "+ Add Clinical Record" modal and select the desired record type tab
   * @param {'Vaccination'|'Medication'|'Lab Results'|'Vital Signs'|'Allergy'} tabName
   */
  async openAddRecordModal(tabName = 'Vaccination') {
    const modalHeading = this.page.locator(this.selectors.modalTitle);
    if (!(await modalHeading.isVisible().catch(() => false))) {
      const btn = this.page.locator(this.selectors.addClinicalRecordBtn).first();
      await btn.waitFor({ state: 'visible', timeout: 15000 });
      await btn.evaluate(el => el.click());
      await modalHeading.waitFor({ state: 'visible', timeout: 10000 });
    }

    const tabMap = {
      Vaccination: this.selectors.modalTabVaccination,
      Medication: this.selectors.modalTabMedication,
      'Lab Results': this.selectors.modalTabLabResults,
      'Vital Signs': this.selectors.modalTabVitalSigns,
      Allergy: this.selectors.modalTabAllergy,
    };

    const tabSelector = tabMap[tabName];
    if (tabSelector) {
      await this.page.locator(tabSelector).evaluate(el => el.click());
      await this.page.waitForTimeout(300);
    }
  }

  /**
   *Close the Add Health Record modal if open
   */
  async closeAddRecordModal() {
    const closeBtn = this.page.locator(this.selectors.closeModalBtn);
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.click();
    }
  }

  /**
   * Helper to select an option from a Zosalus custom select button
   * @param {string} triggerSelector
   * @param {string} optionText
   */
  async selectDropdownOption(triggerSelector, optionText) {
    const trigger = this.page.locator(triggerSelector);
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();

    const menuId = triggerSelector.replace(/^.*#/, '') + '-menu';
    const option = this.page
      .locator(`#${menuId} [role="option"], [role="listbox"] [role="option"]`)
      .filter({ hasText: optionText })
      .first();

    if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
      await option.click();
    } else {
      await this.page.locator(`[role="option"]:has-text("${optionText}")`).first().click();
    }
  }

  /**
   * Helper to fill a Zosalus combobox input (allows typing or picking option)
   * @param {string} inputSelector
   * @param {string} value
   */
  async fillCombobox(inputSelector, value) {
    const input = this.page.locator(inputSelector);
    await input.scrollIntoViewIfNeeded();
    await input.click();
    await input.fill(value);
    const menuId = inputSelector.replace(/^.*#/, '') + '-menu';
    const option = this.page.locator(`#${menuId} [role="option"]`).filter({ hasText: value }).first();
    if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
      await option.click();
    } else {
      await input.press('Escape');
    }
  }

  /**
   * Helper to set a Zosalus DatePicker input (MM/DD/YYYY) and blur so it commits YYYY-MM-DD
   * @param {string} inputSelector
   * @param {string} dateStr
   */
  async fillDatePicker(inputSelector, dateStr) {
    if (!dateStr) return;
    const input = this.page.locator(inputSelector).first();
    await input.scrollIntoViewIfNeeded();
    await input.click();
    await input.fill(dateStr);
    await input.press('Escape');
    await input.press('Tab');
  }

  /**
   * Fill and submit a Vaccination record for the active pet
   * @param {Object} data
   */
  async addVaccinationRecord(data) {
    await this.openAddRecordModal('Vaccination');

    const customBtn = this.page.locator(this.selectors.enterCustomVaccineBtn);
    if (await customBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await customBtn.click();
    }

    await this.clearAndFill(this.selectors.vaccineNameFreeTextInput, data.vaccineName);

    if (data.dateAdministered) {
      await this.fillDatePicker(this.selectors.vaccineDateAdministeredInput, data.dateAdministered);
    }

    if (data.nextDueDate) {
      await this.fillDatePicker(this.selectors.vaccineNextDueDateInput, data.nextDueDate);
    }

    if (data.route) {
      await this.selectDropdownOption(this.selectors.vaccineRouteSelect, data.route);
    }

    if (data.manufacturer) {
      await this.clearAndFill(this.selectors.vaccineManufacturerInput, data.manufacturer);
    }

    if (data.lotNumber) {
      await this.clearAndFill(this.selectors.vaccineLotNumberInput, data.lotNumber);
    }

    if (data.costAmount) {
      await this.clearAndFill(this.selectors.vaccineCostInput, data.costAmount);
    }

    if (data.notes) {
      await this.clearAndFill(this.selectors.vaccineNotesTextarea, data.notes);
    }

    await this.click(this.selectors.logVaccinationSubmitBtn);
    await this.page.locator(this.selectors.modalTitle).waitFor({ state: 'hidden', timeout: 20000 });
  }

  /**
   * Fill and submit a Medication record for the active pet
   * @param {Object} data
   */
  async addMedicationRecord(data) {
    await this.openAddRecordModal('Medication');

    const customBtn = this.page.locator(this.selectors.enterCustomMedicationBtn);
    if (await customBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await customBtn.click();
    }

    await this.clearAndFill(this.selectors.drugNameFreeTextInput, data.drugName);
    if (data.brandName) await this.clearAndFill(this.selectors.medBrandNameInput, data.brandName);
    if (data.strength) await this.clearAndFill(this.selectors.medStrengthInput, data.strength);
    if (data.formulation) await this.fillCombobox(this.selectors.medFormulationInput, data.formulation);
    if (data.doseAmount) await this.clearAndFill(this.selectors.medDoseAmountInput, data.doseAmount);
    if (data.doseUnit) await this.fillCombobox(this.selectors.medDoseUnitInput, data.doseUnit);
    if (data.frequency) await this.fillCombobox(this.selectors.medFrequencyInput, data.frequency);
    if (data.route) await this.fillCombobox(this.selectors.medRouteInput, data.route);
    await this.fillDatePicker(this.selectors.medStartDateInput, data.startDate || '05/15/2025');
    await this.fillDatePicker(this.selectors.medEndDateInput, data.endDate || '05/29/2025');
    if (data.rxNumber) await this.clearAndFill(this.selectors.medRxNumberInput, data.rxNumber);
    if (data.pharmacyName) await this.clearAndFill(this.selectors.medPharmacyInput, data.pharmacyName);
    if (data.refillsRemaining) await this.clearAndFill(this.selectors.medRefillsInput, data.refillsRemaining);
    if (data.costAmount) await this.clearAndFill(this.selectors.medCostInput, data.costAmount);
    if (data.notes) await this.clearAndFill(this.selectors.medNotesInput, data.notes);

    await this.click(this.selectors.logMedicationSubmitBtn);

    // Handle optional veterinary dose-range confirmation toast if triggered
    const saveAnywayBtn = this.page.locator(this.selectors.doseWarningSaveAnywayBtn);
    if (await saveAnywayBtn.isVisible({ timeout: 3500 }).catch(() => false)) {
      await saveAnywayBtn.evaluate(el => el.click());
    }

    await this.page.locator(this.selectors.modalTitle).waitFor({ state: 'hidden', timeout: 20000 });
  }

  /**
   * Fill and submit a Lab Result record for the active pet
   * @param {Object} data
   */
  async addLabResultRecord(data) {
    await this.openAddRecordModal('Lab Results');

    const customBtn = this.page.locator(this.selectors.enterCustomLabTestBtn);
    if (await customBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await customBtn.click();
    }

    await this.clearAndFill(this.selectors.labTestNameInput, data.testName);
    if (data.testPanel) await this.clearAndFill(this.selectors.labTestPanelInput, data.testPanel);
    await this.clearAndFill(this.selectors.labMeasuredValueInput, data.value);
    if (data.unit) await this.clearAndFill(this.selectors.labUnitInput, data.unit);
    if (data.referenceLow) await this.clearAndFill(this.selectors.labRefLowInput, data.referenceLow);
    if (data.referenceHigh) await this.clearAndFill(this.selectors.labRefHighInput, data.referenceHigh);
    await this.fillDatePicker(this.selectors.labTestDateInput, data.testDate || '05/16/2025');
    if (data.labName) await this.clearAndFill(this.selectors.labFacilityNameInput, data.labName);
    if (data.notes) await this.clearAndFill(this.selectors.labClinicalNotesInput, data.notes);
    if (data.costAmount) await this.clearAndFill(this.selectors.labCostInput, data.costAmount);

    await this.click(this.selectors.logLabResultSubmitBtn);
    await this.page.locator(this.selectors.modalTitle).waitFor({ state: 'hidden', timeout: 20000 });
  }

  /**
   * Fill and submit a Vital Signs record for the active pet
   * @param {Object} data
   */
  async addVitalSignsRecord(data) {
    await this.openAddRecordModal('Vital Signs');

    await this.clearAndFill(this.selectors.vitalWeightInput, data.weightKg);
    await this.clearAndFill(this.selectors.vitalTempInput, data.temperatureC);
    await this.clearAndFill(this.selectors.vitalHeartRateInput, data.heartRateBpm);
    await this.clearAndFill(this.selectors.vitalRespRateInput, data.respiratoryRateBpm);

    if (data.mucousMembraneColour) {
      await this.selectDropdownOption(
        this.selectors.vitalMembraneColourSelect,
        data.mucousMembraneColour
      );
    }

    await this.clearAndFill(this.selectors.vitalSystolicInput, data.systolicBp);
    await this.clearAndFill(this.selectors.vitalDiastolicInput, data.diastolicBp);
    await this.clearAndFill(this.selectors.vitalCrtInput, data.crtSeconds);
    await this.clearAndFill(this.selectors.vitalSpo2Input, data.spo2Percent);
    await this.fillDatePicker(this.selectors.vitalRecordedAtInput, data.recordedAt || '05/17/2025');

    if (data.notes) {
      await this.clearAndFill(this.selectors.vitalNotesTextarea, data.notes);
    }

    await this.click(this.selectors.saveVitalSignsSubmitBtn);
    await this.page.locator(this.selectors.modalTitle).waitFor({ state: 'hidden', timeout: 20000 });
  }

  /**
   * Fill and submit an Allergy record for the active pet
   * @param {Object} data
   */
  async addAllergyRecord(data) {
    await this.openAddRecordModal('Allergy');

    await this.clearAndFill(this.selectors.allergySubstanceInput, data.allergen);
    await this.selectDropdownOption(this.selectors.allergyTypeSelect, data.allergenType);
    await this.selectDropdownOption(this.selectors.allergySeveritySelect, data.severity);
    await this.clearAndFill(this.selectors.allergyReactionTextarea, data.reaction);
    await this.fillDatePicker(this.selectors.allergyConfirmedDateInput, data.confirmedDate || '05/18/2025');

    if (data.notes) {
      await this.clearAndFill(this.selectors.allergyNotesTextarea, data.notes);
    }

    await this.click(this.selectors.logAllergySubmitBtn);
    await this.page.locator(this.selectors.modalTitle).waitFor({ state: 'hidden', timeout: 20000 });
  }
}

module.exports = HealthRecordsPage;
