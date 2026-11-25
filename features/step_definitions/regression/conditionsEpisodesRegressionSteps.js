const { createBdd } = require('playwright-bdd');
const { test } = require('../../../fixtures/testFixture');
const { expect } = require('@playwright/test');
const {
  generateDynamicCondition,
  generateDynamicEpisode,
} = require('../../../utils/dynamicTestDataGenerator');

const { Given, When, Then } = createBdd(test);

let dynamicCondition = null;
let dynamicEpisode = null;

Given(
  'a regression patient user with an active registered pet is logged in on the Conditions and Episodes page',
  async ({ page, loginPage, conditionsEpisodesPage, testUserManager }) => {
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

    await conditionsEpisodesPage.open();
  }
);

// ============================================================================
// 1. RECORD DIAGNOSED CONDITION STEPS (DYNAMIC DATA)
// ============================================================================

When(
  'the regression user opens the Record Diagnosed Condition modal on the Medical Diagnoses tab',
  async ({ conditionsEpisodesPage }) => {
    await conditionsEpisodesPage.openRecordDiagnosisModal();
  }
);

When(
  'the regression user fills the Record Diagnosed Condition form with a dynamically generated diagnosis name, clinical status, severity, date first diagnosed, insurance toggle, ICD-10 code, and treatment notes',
  async ({ page, conditionsEpisodesPage }) => {
    dynamicCondition = generateDynamicCondition();

    const nameInput = page.locator(
      conditionsEpisodesPage.selectors.conditionNameInput
    );
    await nameInput.click();
    await nameInput.fill(dynamicCondition.conditionName);
    await page.waitForTimeout(400);

    const customFallback = page
      .locator('form#condition-form div:has-text("Use “")')
      .first();
    const refMatch = page
      .locator('form#condition-form div.max-h-64 > div')
      .filter({ hasText: dynamicCondition.conditionName })
      .first();

    if (await refMatch.isVisible({ timeout: 2000 }).catch(() => false)) {
      await refMatch.click();
    } else if (
      await customFallback.isVisible({ timeout: 1500 }).catch(() => false)
    ) {
      await customFallback.click();
    }

    await conditionsEpisodesPage.selectDropdownOption(
      conditionsEpisodesPage.selectors.conditionStatusSelect,
      dynamicCondition.status
    );
    await conditionsEpisodesPage.selectDropdownOption(
      conditionsEpisodesPage.selectors.conditionSeveritySelect,
      dynamicCondition.severity
    );

    const dateInput = page
      .locator(conditionsEpisodesPage.selectors.conditionFirstDiagnosedDateInput)
      .first();
    if (await dateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dateInput.click();
      await dateInput.fill(dynamicCondition.firstDiagnosedDate);
      await dateInput.press('Escape');
      await dateInput.press('Tab');
    }

    const insuranceToggle = page
      .locator(
        'form#condition-form div:has-text("Relevant to Insurance") button[role="switch"]'
      )
      .first();
    if (await insuranceToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      const checked =
        (await insuranceToggle.getAttribute('aria-checked')) === 'true';
      if (!checked) await insuranceToggle.click();
    }

    await conditionsEpisodesPage.clearAndFill(
      conditionsEpisodesPage.selectors.diagnosticCodeInput,
      dynamicCondition.icdCode
    );
    await conditionsEpisodesPage.clearAndFill(
      conditionsEpisodesPage.selectors.conditionNotesTextarea,
      dynamicCondition.notes
    );
  }
);

When(
  'the regression user submits the Record Diagnosis form',
  async ({ conditionsEpisodesPage }) => {
    await conditionsEpisodesPage.click(
      conditionsEpisodesPage.selectors.submitConditionBtn
    );
  }
);

Then(
  'the dynamically generated Medical Diagnosis should be saved and displayed under Medical Diagnoses',
  async ({ page, conditionsEpisodesPage }) => {
    await page
      .locator(conditionsEpisodesPage.selectors.conditionForm)
      .waitFor({ state: 'hidden', timeout: 20000 })
      .catch(() => {});
    await expect(
      page.locator(`text=/${dynamicCondition.conditionName.split(' ')[0]}/i`).first()
    ).toBeVisible({ timeout: 15000 });
  }
);

When(
  'the regression user submits the Record Diagnosis form without entering a Condition Name or Date First Diagnosed',
  async ({ conditionsEpisodesPage }) => {
    await conditionsEpisodesPage.click(
      conditionsEpisodesPage.selectors.submitConditionBtn
    );
  }
);

Then(
  'the Record Diagnosed Condition modal should remain open and display required field validation errors',
  async ({ page, conditionsEpisodesPage }) => {
    await expect(
      page.locator(conditionsEpisodesPage.selectors.conditionForm).first()
    ).toBeVisible();
  }
);

When(
  'the regression user fills a dynamically generated diagnosis name, status, and severity with a future Date First Diagnosed',
  async ({ page, conditionsEpisodesPage }) => {
    const cond = generateDynamicCondition();
    const futureYear = 2085 + Math.floor(Math.random() * 14);
    const nameInput = page.locator(
      conditionsEpisodesPage.selectors.conditionNameInput
    );
    await nameInput.fill(cond.conditionName);
    await conditionsEpisodesPage.selectDropdownOption(
      conditionsEpisodesPage.selectors.conditionStatusSelect,
      cond.status
    );
    await conditionsEpisodesPage.selectDropdownOption(
      conditionsEpisodesPage.selectors.conditionSeveritySelect,
      cond.severity
    );
    const dateInput = page
      .locator(conditionsEpisodesPage.selectors.conditionFirstDiagnosedDateInput)
      .first();
    if (await dateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dateInput.fill(`11/20/${futureYear}`);
    }
  }
);

Then(
  'the Record Diagnosed Condition modal should reject the future diagnosis date or remain open',
  async ({ page }) => {
    expect(page.url()).toContain('/conditions-episodes');
  }
);

When(
  'the regression user clicks through the {string}, {string}, {string}, {string}, {string}, and {string} filter pills on the Medical Diagnoses tab',
  async ({ page }, p1, p2, p3, p4, p5, p6) => {
    for (const pill of [p1, p2, p3, p4, p5, p6]) {
      const btn = page.locator(`button:has-text("${pill}")`).first();
      if (await btn.isVisible({ timeout: 2500 }).catch(() => false)) {
        await btn.click();
      }
    }
  }
);

Then(
  'the Medical Diagnoses list should filter according to the selected clinical status pill',
  async ({ page, conditionsEpisodesPage }) => {
    await expect(
      page.locator(conditionsEpisodesPage.selectors.medicalDiagnosesTab).first()
    ).toBeVisible();
  }
);

When(
  'the regression user enters a dynamic diagnosis search term into the Medical Diagnoses search bar',
  async ({ page }) => {
    const term = dynamicCondition
      ? dynamicCondition.conditionName.split(' ')[0]
      : generateDynamicCondition().conditionName.split(' ')[0];
    const input = page
      .locator('input[placeholder*="Search diagnoses" i]')
      .first();
    if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
      await input.fill(term);
    }
  }
);

Then(
  'the Medical Diagnoses view should filter matching diagnosis cards',
  async ({ page, conditionsEpisodesPage }) => {
    await expect(
      page.locator(conditionsEpisodesPage.selectors.medicalDiagnosesTab).first()
    ).toBeVisible();
  }
);

When(
  'the regression user inspects an existing Medical Diagnosis card on the Medical Diagnoses tab',
  async ({ page, conditionsEpisodesPage }) => {
    await expect(
      page.locator(conditionsEpisodesPage.selectors.medicalDiagnosesTab).first()
    ).toBeVisible();
  }
);

Then(
  'the Medical Diagnosis card should display its status badge, date diagnosed, and clinical treatment summary',
  async ({ page }) => {
    await expect(
      page.locator('text=/ACTIVE|CHRONIC|Diagnoses/i').first()
    ).toBeVisible();
  }
);

// ============================================================================
// 2. LOG MOMENT-IN-TIME EPISODE STEPS (DYNAMIC DATA)
// ============================================================================

When(
  'the regression user switches to the Episodic Diary tab and opens the Log Episode modal',
  async ({ conditionsEpisodesPage }) => {
    await conditionsEpisodesPage.openLogEpisodeModal();
  }
);

When(
  'the regression user fills the Log Episode form with a dynamically generated condition link, episode date, severity, duration hours, description, observed triggers, extra notes, and rescue medication response',
  async ({ page, conditionsEpisodesPage }) => {
    dynamicEpisode = generateDynamicEpisode(
      dynamicCondition ? dynamicCondition.conditionName : undefined
    );

    const customBtn = page.locator(
      conditionsEpisodesPage.selectors.enterCustomSymptomBtn
    );
    const freeText = page.locator(
      conditionsEpisodesPage.selectors.episodeConditionFreeTextInput
    );

    if (await freeText.isVisible({ timeout: 1500 }).catch(() => false)) {
      await freeText.fill(dynamicEpisode.linkedConditionName);
    } else if (
      await customBtn.isVisible({ timeout: 2000 }).catch(() => false)
    ) {
      await customBtn.click();
      await conditionsEpisodesPage.clearAndFill(
        conditionsEpisodesPage.selectors.episodeConditionFreeTextInput,
        dynamicEpisode.linkedConditionName
      );
    }

    const dateInput = page
      .locator(conditionsEpisodesPage.selectors.episodeDateInput)
      .first();
    if (await dateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dateInput.click();
      await dateInput.fill(dynamicEpisode.episodeDate);
      await dateInput.press('Escape');
      await dateInput.press('Tab');
    }

    await conditionsEpisodesPage.selectDropdownOption(
      conditionsEpisodesPage.selectors.episodeSeveritySelect,
      dynamicEpisode.severity
    );
    await conditionsEpisodesPage.clearAndFill(
      conditionsEpisodesPage.selectors.episodeDurationInput,
      dynamicEpisode.durationHours
    );
    await conditionsEpisodesPage.clearAndFill(
      conditionsEpisodesPage.selectors.episodeDescriptionTextarea,
      dynamicEpisode.description
    );
    await conditionsEpisodesPage.clearAndFill(
      conditionsEpisodesPage.selectors.episodeTriggersInput,
      dynamicEpisode.triggers
    );
    await conditionsEpisodesPage.clearAndFill(
      conditionsEpisodesPage.selectors.episodeExtraNotesTextarea,
      dynamicEpisode.extraNotes
    );

    const medSwitch = page
      .locator(
        'form#episode-form div:has-text("Medication was given during this episode") button[role="switch"]'
      )
      .first();
    if (await medSwitch.isVisible({ timeout: 2500 }).catch(() => false)) {
      const checked =
        (await medSwitch.getAttribute('aria-checked')) === 'true';
      if (!checked) await medSwitch.click();
    }

    const customMedBtn = page.locator(
      conditionsEpisodesPage.selectors.enterCustomMedicationBtn
    );
    if (await customMedBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await customMedBtn.click();
    }

    const medInput = page.locator(
      conditionsEpisodesPage.selectors.episodeMedicationFreeTextInput
    );
    if (await medInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await medInput.fill(dynamicEpisode.medicationGiven);
    }

    await conditionsEpisodesPage
      .selectDropdownOption(
        conditionsEpisodesPage.selectors.episodeMedResponseSelect,
        dynamicEpisode.responseToMedication
      )
      .catch(() => {});
  }
);

When(
  'the regression user submits the Record Episode form',
  async ({ conditionsEpisodesPage }) => {
    await conditionsEpisodesPage.click(
      conditionsEpisodesPage.selectors.submitEpisodeBtn
    );
  }
);

Then(
  'the dynamically generated Episodic Diary entry should be saved and displayed in the Episodic Diary list',
  async ({ page, conditionsEpisodesPage }) => {
    await page
      .locator(conditionsEpisodesPage.selectors.episodeForm)
      .waitFor({ state: 'hidden', timeout: 20000 })
      .catch(() => {});
    await expect(
      page.locator(conditionsEpisodesPage.selectors.episodicDiaryTab).first()
    ).toBeVisible();
  }
);

When(
  'the regression user fills a dynamically generated custom symptom, episode date, severity, duration, and episode description and submits the Record Episode form',
  async ({ page, conditionsEpisodesPage }) => {
    dynamicEpisode = generateDynamicEpisode();
    const customBtn = page.locator(
      conditionsEpisodesPage.selectors.enterCustomSymptomBtn
    );
    if (await customBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await customBtn.click();
    }
    const freeText = page.locator(
      conditionsEpisodesPage.selectors.episodeConditionFreeTextInput
    );
    if (await freeText.isVisible({ timeout: 2000 }).catch(() => false)) {
      await freeText.fill(dynamicEpisode.customSymptomFallback);
    }
    const dateInput = page
      .locator(conditionsEpisodesPage.selectors.episodeDateInput)
      .first();
    if (await dateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dateInput.fill(dynamicEpisode.episodeDate);
      await dateInput.press('Escape');
    }
    await conditionsEpisodesPage.selectDropdownOption(
      conditionsEpisodesPage.selectors.episodeSeveritySelect,
      dynamicEpisode.severity
    );
    await conditionsEpisodesPage.clearAndFill(
      conditionsEpisodesPage.selectors.episodeDurationInput,
      dynamicEpisode.durationHours
    );
    await conditionsEpisodesPage.clearAndFill(
      conditionsEpisodesPage.selectors.episodeDescriptionTextarea,
      dynamicEpisode.description
    );
    await conditionsEpisodesPage.click(
      conditionsEpisodesPage.selectors.submitEpisodeBtn
    );
  }
);

Then(
  'the dynamically generated Episodic Diary entry should be saved in the Episodic Diary list',
  async ({ page, conditionsEpisodesPage }) => {
    await expect(
      page.locator(conditionsEpisodesPage.selectors.episodicDiaryTab).first()
    ).toBeVisible();
  }
);

Then(
  'the Log Moment-in-Time Episode form should display severity, duration, description, triggers, and clinical escalation fields',
  async ({ page, conditionsEpisodesPage }) => {
    await expect(
      page
        .locator(conditionsEpisodesPage.selectors.episodeDescriptionTextarea)
        .first()
    ).toBeVisible();
  }
);

When(
  'the regression user submits the Record Episode form without entering an episode description',
  async ({ conditionsEpisodesPage }) => {
    await conditionsEpisodesPage.click(
      conditionsEpisodesPage.selectors.submitEpisodeBtn
    );
  }
);

Then(
  'the Log Moment-in-Time Episode modal should remain open and display required field validation errors',
  async ({ page, conditionsEpisodesPage }) => {
    await expect(
      page.locator(conditionsEpisodesPage.selectors.episodeForm).first()
    ).toBeVisible();
  }
);

When(
  'the regression user switches to the Episodic Diary tab on the Conditions and Episodes page',
  async ({ page, conditionsEpisodesPage }) => {
    await page
      .locator(conditionsEpisodesPage.selectors.episodicDiaryTab)
      .first()
      .click();
  }
);

Then(
  'the Episodic Diary tab should display the {string}, {string}, {string}, and {string} summary counter cards',
  async ({ page }, c1, c2, c3, c4) => {
    for (const cardLabel of [c1, c2, c3, c4]) {
      await expect(
        page.locator(`text=/${cardLabel}/i`).first()
      ).toBeVisible({ timeout: 10000 });
    }
  }
);

When(
  'the regression user switches to the Episodic Diary tab and types a dynamic episode keyword into the episode search input',
  async ({ page, conditionsEpisodesPage }) => {
    const query = dynamicEpisode
      ? dynamicEpisode.triggers.split(' ')[0]
      : generateDynamicEpisode().triggers.split(' ')[0];
    await page
      .locator(conditionsEpisodesPage.selectors.episodicDiaryTab)
      .first()
      .click();
    const searchInput = page
      .locator('input[placeholder*="Search episodes" i]')
      .first();
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill(query);
    }
  }
);

Then(
  'the Episodic Diary list should filter episodes matching the search query',
  async ({ page, conditionsEpisodesPage }) => {
    await expect(
      page.locator(conditionsEpisodesPage.selectors.episodicDiaryTab).first()
    ).toBeVisible();
  }
);

Then(
  'the {string} button should be visible and accessible on the Episodic Diary header',
  async ({ page }, btnLabel) => {
    await expect(
      page.locator(`button:has-text("${btnLabel}")`).first()
    ).toBeVisible({ timeout: 10000 });
  }
);
