const BasePage = require('./BasePage');

/**
 * ConditionsEpisodesPage encapsulates all elements and actions for the Zosalus
 * Medical Conditions & Episodic Diary page (/conditions-episodes), including
 * the Record Diagnosed Condition modal and Log Moment-in-Time Episode modal.
 */
class ConditionsEpisodesPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.selectors = {
      // Navigation & Sub-tabs
      conditionsNavLink: 'a[href="/conditions-episodes"], button:has-text("Conditions & Episodes")',
      medicalDiagnosesTab: 'button:has-text("Medical Diagnoses")',
      episodicDiaryTab: 'button:has-text("Episodic Diary")',

      // Action Buttons
      recordDiagnosisBtn: 'button:has-text("Record Diagnosis"), button:has-text("Record First Diagnosis")',
      logEpisodeBtn: 'button:has-text("Log Episode"), button:has-text("Log First Episode")',
      closeModalBtn: 'button[aria-label="Close modal"]',

      // 1. Record Diagnosed Condition Modal (#condition-form)
      conditionForm: 'form#condition-form',
      conditionModalHeading: 'h2:has-text("Record Diagnosed Condition")',
      conditionNameInput: 'form#condition-form input[placeholder*="Atopic Dermatitis"]',
      conditionStatusSelect: 'button#condition-status',
      conditionSeveritySelect: 'button#condition-severity',
      conditionFirstDiagnosedDateInput: 'form#condition-form input[name="firstDiagnosedDate"]',
      diagnosticCodeInput: 'input#modal-diagnostic-code',
      conditionNotesTextarea: 'textarea#condition-treatment-notes',
      submitConditionBtn: 'button[form="condition-form"][type="submit"]:has-text("Record Diagnosis")',

      // 2. Log Moment-in-Time Episode Modal (#episode-form)
      episodeForm: 'form#episode-form',
      episodeModalHeading: 'h2:has-text("Log Moment-in-Time Episode")',
      enterCustomSymptomBtn: 'form#episode-form button:has-text("Enter custom symptom")',
      episodeConditionFreeTextInput: 'input#episode-condition-free-text',
      episodeConditionDropdown: 'button#episode-condition-dropdown, input#episode-condition-dropdown',
      episodeDateInput: 'input#episode-date-picker',
      episodeSeveritySelect: 'button#episode-severity-dropdown',
      episodeDurationInput: 'input#episode-duration-input',
      episodeDescriptionTextarea: 'textarea#episode-description-input',
      episodeTriggersInput: 'input#episode-triggers-input',
      episodeExtraNotesTextarea: 'textarea#episode-extra-notes',
      enterCustomMedicationBtn: 'form#episode-form button:has-text("Enter custom / OTC medication")',
      episodeMedicationFreeTextInput: 'input#episode-medication-free-text',
      episodeMedRouteInput: 'input#episode-med-route-dropdown, button#episode-med-route-dropdown',
      episodeMedResponseSelect: 'button#episode-med-response-dropdown',
      submitEpisodeBtn: 'button[form="episode-form"][type="submit"]:has-text("Record Episode")',
    };
  }

  /**
   * Navigate to the Medical Conditions & Episodic Diary page (/conditions-episodes)
   */
  async open() {
    const link = this.page.locator(this.selectors.conditionsNavLink).first();
    if (await link.isVisible({ timeout: 3000 }).catch(() => false)) {
      await link.click();
    } else {
      await this.navigate('/conditions-episodes');
    }
    await this.page.waitForURL('**/conditions-episodes', { timeout: 15000 });
    await this.page.locator(this.selectors.medicalDiagnosesTab).first().waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Select option from a custom dropdown button
   * @param {string} triggerSelector
   * @param {string} optionText
   */
  async selectDropdownOption(triggerSelector, optionText) {
    const trigger = this.page.locator(triggerSelector).first();
    if (!(await trigger.isVisible({ timeout: 3000 }).catch(() => false))) {
      return;
    }
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();

    const allOptions = this.page.locator(
      '[role="listbox"] [role="option"], div[role="option"]'
    );

    const exactOption = allOptions.filter({ hasText: optionText }).first();
    if (await exactOption.isVisible({ timeout: 2500 }).catch(() => false)) {
      await exactOption.click();
      return;
    }

    const firstWord = String(optionText || '').split(/[\s/&(]+/)[0];
    if (firstWord) {
      const partialOption = allOptions.filter({ hasText: firstWord }).first();
      if (await partialOption.isVisible({ timeout: 1500 }).catch(() => false)) {
        await partialOption.click();
        return;
      }
    }

    const fallbackFirst = allOptions.first();
    if (await fallbackFirst.isVisible({ timeout: 1500 }).catch(() => false)) {
      await fallbackFirst.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
  }

  /**
   * Open the "+ Record Diagnosis" modal on the Medical Diagnoses tab
   */
  async openRecordDiagnosisModal() {
    await this.page.locator(this.selectors.medicalDiagnosesTab).first().evaluate(el => el.click());
    await this.page.waitForTimeout(300);
    const btn = this.page.locator(this.selectors.recordDiagnosisBtn).first();
    await btn.waitFor({ state: 'visible', timeout: 10000 });
    await btn.evaluate(el => el.click());
    await this.page.locator(this.selectors.conditionForm).waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Fill and submit a Medical Diagnosis for the active pet
   * @param {Object} data
   */
  async addMedicalDiagnosis(data) {
    await this.openRecordDiagnosisModal();

    const nameInput = this.page.locator(this.selectors.conditionNameInput);
    await nameInput.click();
    await nameInput.fill(data.conditionName);
    await this.page.waitForTimeout(500);

    // Click reference match or custom fallback in the autocomplete dropdown
    const customFallback = this.page.locator('form#condition-form div:has-text("Use “")').first();
    const refMatch = this.page
      .locator('form#condition-form div.max-h-64 > div')
      .filter({ hasText: data.conditionName })
      .first();

    if (await refMatch.isVisible({ timeout: 2500 }).catch(() => false)) {
      await refMatch.click();
    } else if (await customFallback.isVisible({ timeout: 2000 }).catch(() => false)) {
      await customFallback.click();
    }

    await this.selectDropdownOption(this.selectors.conditionStatusSelect, data.status);
    await this.selectDropdownOption(this.selectors.conditionSeveritySelect, data.severity);

    const diagDateInput = this.page.locator(this.selectors.conditionFirstDiagnosedDateInput).first();
    if (await diagDateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await diagDateInput.click();
      await diagDateInput.fill(data.firstDiagnosedDate || '05/15/2025');
      await diagDateInput.press('Escape');
      await diagDateInput.press('Tab');
    }

    if (data.isInsuranceRelevant) {
      const insuranceToggle = this.page
        .locator('form#condition-form div:has-text("Relevant to Insurance") button[role="switch"]')
        .first();
      if (await insuranceToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
        const isChecked = (await insuranceToggle.getAttribute('aria-checked')) === 'true';
        if (!isChecked) await insuranceToggle.click();
      }
    }

    if (data.icdCode) {
      await this.clearAndFill(this.selectors.diagnosticCodeInput, data.icdCode);
    }

    if (data.notes) {
      await this.clearAndFill(this.selectors.conditionNotesTextarea, data.notes);
    }

    await this.click(this.selectors.submitConditionBtn);
    await this.page.locator(this.selectors.conditionForm).waitFor({ state: 'hidden', timeout: 20000 });
  }

  /**
   * Switch to the Episodic Diary tab and open the "+ Log Episode" modal
   */
  async openLogEpisodeModal() {
    await this.page.locator(this.selectors.episodicDiaryTab).first().evaluate(el => el.click());
    await this.page.waitForTimeout(400);
    const btn = this.page.locator(this.selectors.logEpisodeBtn).first();
    await btn.waitFor({ state: 'visible', timeout: 10000 });
    await btn.evaluate(el => el.click());
    await this.page.locator(this.selectors.episodeForm).waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Fill and submit an Episodic Diary flare-up entry for the active pet
   * @param {Object} data
   */
  async addEpisodicDiaryEntry(data) {
    await this.openLogEpisodeModal();

    // Link to diagnosed condition if available, or enter custom symptom
    const customSymptomBtn = this.page.locator(this.selectors.enterCustomSymptomBtn);
    const freeTextInput = this.page.locator(this.selectors.episodeConditionFreeTextInput);

    if (await freeTextInput.isVisible({ timeout: 1500 }).catch(() => false)) {
      await freeTextInput.fill(data.linkedConditionName || data.customSymptomFallback);
    } else {
      const condTrigger = this.page.locator(this.selectors.episodeConditionDropdown).first();
      await condTrigger.click();
      const matchedOpt = this.page
        .locator('[role="option"]')
        .filter({ hasText: data.linkedConditionName })
        .first();
      if (await matchedOpt.isVisible({ timeout: 2500 }).catch(() => false)) {
        await matchedOpt.click();
      } else if (await customSymptomBtn.isVisible().catch(() => false)) {
        await customSymptomBtn.click();
        await this.clearAndFill(
          this.selectors.episodeConditionFreeTextInput,
          data.customSymptomFallback || data.linkedConditionName
        );
      }
    }

    const epDateInput = this.page.locator(this.selectors.episodeDateInput).first();
    if (await epDateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await epDateInput.click();
      await epDateInput.fill(data.episodeDate || '05/20/2025');
      await epDateInput.press('Escape');
      await epDateInput.press('Tab');
    }

    await this.selectDropdownOption(this.selectors.episodeSeveritySelect, data.severity);

    if (data.durationHours) {
      await this.clearAndFill(this.selectors.episodeDurationInput, data.durationHours);
    }

    await this.clearAndFill(this.selectors.episodeDescriptionTextarea, data.description);

    if (data.triggers) {
      await this.clearAndFill(this.selectors.episodeTriggersInput, data.triggers);
    }

    if (data.extraNotes) {
      await this.clearAndFill(this.selectors.episodeExtraNotesTextarea, data.extraNotes);
    }

    if (data.wasMedicationGiven) {
      const medSwitch = this.page
        .locator(
          'form#episode-form div:has-text("Medication was given during this episode") button[role="switch"]'
        )
        .first();
      if (await medSwitch.isVisible({ timeout: 3000 }).catch(() => false)) {
        const checked = (await medSwitch.getAttribute('aria-checked')) === 'true';
        if (!checked) await medSwitch.click();
      }

      const customMedBtn = this.page.locator(this.selectors.enterCustomMedicationBtn);
      if (await customMedBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await customMedBtn.click();
      }

      if (await this.isVisible(this.selectors.episodeMedicationFreeTextInput, 2500)) {
        await this.clearAndFill(
          this.selectors.episodeMedicationFreeTextInput,
          data.medicationGiven
        );
      }

      if (data.medicationRoute) {
        const routeEl = this.page.locator(this.selectors.episodeMedRouteInput).first();
        await routeEl.scrollIntoViewIfNeeded();
        await routeEl.click();
        const routeOpt = this.page
          .locator('[role="option"]')
          .filter({ hasText: data.medicationRoute })
          .first();
        if (await routeOpt.isVisible({ timeout: 2500 }).catch(() => false)) {
          await routeOpt.click();
        }
      }

      if (data.responseToMedication) {
        await this.selectDropdownOption(
          this.selectors.episodeMedResponseSelect,
          data.responseToMedication
        );
      }
    }

    await this.click(this.selectors.submitEpisodeBtn);
    await this.page.locator(this.selectors.episodeForm).waitFor({ state: 'hidden', timeout: 20000 });
  }
}

module.exports = ConditionsEpisodesPage;
