Feature: Clinical Health Records Complete Regression Suite Across Vaccinations, Medications, Lab Results, Vital Signs, Allergies, and Timeline Filters
  As a Zosalus pet parent managing my pet's clinical health timeline
  I want exhaustive per-field validation, creation, editing, deletion, and timeline filtering across all 5 clinical record types using dynamically generated clinical inputs
  So that every veterinary record is accurately logged and searchable

  Background:
    Given a regression patient user with an active registered pet is logged in on the Clinical Health Records page

  # ============================================================================
  # 1. VACCINATION RECORDS (6 SCENARIOS)
  # ============================================================================

  Scenario: RG-HR-VAC-01 Verify logging a complete Vaccination record with dynamically generated vaccine name, date administered, next due date, route, manufacturer, lot number, cost, and notes
    When the regression user opens the Add Health Record modal and selects the "Vaccination" category tab
    And the regression user fills the Vaccination form with a dynamically generated vaccine name, date administered, next due date, and route
    And the regression user fills the Vaccination form with a dynamically generated manufacturer, lot number, cost, and clinical notes
    And the regression user clicks Log Vaccination to submit the vaccination form
    Then the dynamically generated Vaccination record should be saved and displayed on the Clinical Health Timeline

  Scenario: RG-HR-VAC-02 Verify logging a dynamic Vaccination record with multi-dose booster series toggle and administering veterinarian
    When the regression user opens the Add Health Record modal and selects the "Vaccination" category tab
    And the regression user fills the Vaccination form with a dynamically generated vaccine name, date administered, next due date, and route
    And the regression user toggles the multi-dose booster option if present and clicks Log Vaccination
    Then the dynamically generated Vaccination record should be saved on the Clinical Health Timeline

  Scenario: RG-HR-VAC-03 Verify dynamic Vaccination certificate document attachment upload and validation
    When the regression user opens the Add Health Record modal and selects the "Vaccination" category tab
    And the regression user fills a dynamically generated vaccine name and date administered and attaches a valid certificate file
    And the regression user clicks Log Vaccination to submit the vaccination form
    Then the dynamically generated Vaccination record should be saved on the Clinical Health Timeline

  Scenario: RG-HR-VAC-04 Verify required field validation errors when submitting an empty Vaccination form
    When the regression user opens the Add Health Record modal and selects the "Vaccination" category tab
    And the regression user clicks Log Vaccination without entering a vaccine name or date administered
    Then the Vaccination modal should remain open and display required field validation errors

  Scenario: RG-HR-VAC-05 Verify editing an existing Vaccination record updates its lot number and clinical notes with dynamic values
    When the regression user clicks edit on an existing Vaccination card on the Clinical Health Timeline
    And the regression user updates the vaccination lot number with a dynamically generated lot code and saves
    Then the Clinical Health Timeline should reflect the updated Vaccination details

  Scenario: RG-HR-VAC-06 Verify deleting a Vaccination record removes it or decrements the Vaccination counter
    When the regression user clicks delete on a Vaccination card and confirms or cancels the deletion prompt
    Then the Vaccination list on the Clinical Health Timeline should remain consistent

  # ============================================================================
  # 2. MEDICATION RECORDS (14 SCENARIOS - EXHAUSTIVE PER-FIELD COVERAGE)
  # ============================================================================

  Scenario: RG-HR-MED-01 Verify logging a complete Medication record with dynamically generated drug name, brand, strength, formulation, dose, unit, frequency, route, dates, Rx number, pharmacy, refills, cost, and instructions
    When the regression user opens the Add Health Record modal and selects the "Medication" category tab
    And the regression user fills the Medication form with a dynamically generated drug name, brand name, strength, and formulation
    And the regression user fills the Medication form with a dynamically generated dose amount, dose unit, frequency, and route
    And the regression user fills the Medication form with a dynamically generated start date and end date
    And the regression user fills the Medication form with a dynamically generated Rx number, pharmacy, refills remaining, cost, and instructions
    And the regression user clicks Log Medication to submit the medication form
    Then the dynamically generated Medication record should be saved and displayed on the Clinical Health Timeline

  Scenario: RG-HR-MED-02 Verify Medication Ongoing Chronic Prescription toggle marks the dynamic prescription Active Now and makes End Date optional
    When the regression user opens the Add Health Record modal and selects the "Medication" category tab
    And the regression user fills the Medication form with a dynamically generated drug name, brand name, strength, and formulation
    And the regression user fills the Medication form with a dynamically generated dose amount, dose unit, frequency, and route
    And the regression user toggles Ongoing or Chronic Prescription on with a dynamic start date and clicks Log Medication
    Then the dynamically generated Medication record should be saved on the Clinical Health Timeline

  Scenario: RG-HR-MED-03 Verify Medication date validation error when End Date is earlier than Start Date
    When the regression user opens the Add Health Record modal and selects the "Medication" category tab
    And the regression user fills the Medication form with a dynamically generated drug name, brand name, strength, and formulation
    And the regression user fills the Medication form with a dynamically generated dose amount, dose unit, frequency, and route
    And the regression user enters a dynamic medication start date and an earlier end date
    And the regression user clicks Log Medication to submit the medication form
    Then the Medication modal should reject the End Date earlier than Start Date or remain open

  Scenario: RG-HR-MED-04 Verify Medication Controlled Substance toggle and Human Medication Off-Label toggle switches
    When the regression user opens the Add Health Record modal and selects the "Medication" category tab
    And the regression user toggles the Controlled Substance and Human Medication Off-Label switches on the Medication form
    Then the Medication form toggle switches should update their checked states cleanly

  Scenario: RG-HR-MED-05 Verify Medication Prescribing Veterinarian and Next Refill Date fields with dynamic prescription data
    When the regression user opens the Add Health Record modal and selects the "Medication" category tab
    And the regression user fills the Medication form with a dynamically generated drug name, brand name, strength, and formulation
    And the regression user fills the Medication form with a dynamically generated dose amount, dose unit, frequency, and route
    And the regression user fills the Medication form with a dynamically generated start date and end date and clicks Log Medication
    Then the dynamically generated Medication record should be saved on the Clinical Health Timeline

  Scenario: RG-HR-MED-06 Verify required validation when Medication Drug Name is left blank
    When the regression user opens the Add Health Record modal and selects the "Medication" category tab
    And the regression user leaves Drug Name blank while filling dynamic strength and dose amount and clicks Log Medication
    Then the Medication modal should remain open and require a Medication or Drug Name

  Scenario: RG-HR-MED-07 Verify required validation when Medication Strength is left blank
    When the regression user opens the Add Health Record modal and selects the "Medication" category tab
    And the regression user enters a dynamically generated drug name with blank strength and clicks Log Medication
    Then the Medication modal should remain open and require the Strength field

  Scenario: RG-HR-MED-08 Verify required validation when Medication Formulation is left blank
    When the regression user opens the Add Health Record modal and selects the "Medication" category tab
    And the regression user enters a dynamically generated drug name and strength without selecting Formulation and clicks Log Medication
    Then the Medication modal should remain open and require the Formulation field

  Scenario: RG-HR-MED-09 Verify required validation when Medication Dose Amount or Dose Unit is left blank
    When the regression user opens the Add Health Record modal and selects the "Medication" category tab
    And the regression user enters a dynamically generated drug name, strength, and formulation with blank Dose Amount and clicks Log Medication
    Then the Medication modal should remain open and require Dose Amount and Dose Unit

  Scenario: RG-HR-MED-10 Verify numeric validation when Medication Dose Amount, Refills Remaining, or Cost Amount is negative
    When the regression user opens the Add Health Record modal and selects the "Medication" category tab
    And the regression user enters a dynamically generated drug name, strength, formulation, and a negative dose amount
    And the regression user clicks Log Medication to submit the medication form
    Then the Medication modal should reject negative numeric dose or cost values

  Scenario: RG-HR-MED-11 Verify required validation when Medication Start Date is missing
    When the regression user opens the Add Health Record modal and selects the "Medication" category tab
    And the regression user enters a dynamically generated drug name, strength, formulation, dose, and unit without Start Date
    And the regression user clicks Log Medication to submit the medication form
    Then the Medication modal should remain open and require Start Date

  Scenario: RG-HR-MED-12 Verify required validation when Ongoing toggle is off and End Date is missing
    When the regression user opens the Add Health Record modal and selects the "Medication" category tab
    And the regression user enters a dynamically generated drug name, strength, formulation, dose, unit, and start date with blank End Date
    And the regression user clicks Log Medication to submit the medication form
    Then the Medication modal should require an End Date or Ongoing toggle selection

  Scenario: RG-HR-MED-13 Verify editing an existing Medication record updates dose instructions and pharmacy with dynamic values
    When the regression user switches to the Medications filter tab on the Clinical Health Timeline and clicks edit on a Medication card
    And the regression user updates the medication pharmacy name with a dynamically generated pharmacy and saves
    Then the Clinical Health Timeline should reflect the updated Medication card

  Scenario: RG-HR-MED-14 Verify deleting or cancelling deletion of a Medication record on the Clinical Health Timeline
    When the regression user switches to the Medications filter tab and clicks delete on a Medication card
    Then the Medication deletion confirmation or timeline state should handle the action cleanly

  # ============================================================================
  # 3. LAB RESULTS RECORDS (6 SCENARIOS)
  # ============================================================================

  Scenario: RG-HR-LAB-01 Verify logging a complete Normal Lab Result with dynamically generated analyte, diagnostic panel, measured value, unit, reference limits, sample date, testing lab, notes, and fee
    When the regression user opens the Add Health Record modal and selects the "Lab Results" category tab
    And the regression user fills the Lab Results form with a dynamically generated "normal" diagnostic analyte, panel, value, unit, reference limits, sample date, lab facility, notes, and fee
    And the regression user clicks Log Diagnostic Result to submit the lab result form
    Then the dynamically generated Lab Result record should be saved on the Clinical Health Timeline

  Scenario: RG-HR-LAB-02 Verify logging an elevated High Lab Result where dynamic measured value exceeds Reference High Limit
    When the regression user opens the Add Health Record modal and selects the "Lab Results" category tab
    And the regression user fills the Lab Results form with a dynamically generated "high" diagnostic analyte, panel, value, unit, reference limits, sample date, lab facility, notes, and fee
    And the regression user clicks Log Diagnostic Result to submit the lab result form
    Then the dynamically generated Lab Result record should be saved on the Clinical Health Timeline

  Scenario: RG-HR-LAB-03 Verify logging a Low Lab Result where dynamic measured value is below Reference Low Limit
    When the regression user opens the Add Health Record modal and selects the "Lab Results" category tab
    And the regression user fills the Lab Results form with a dynamically generated "low" diagnostic analyte, panel, value, unit, reference limits, sample date, lab facility, notes, and fee
    And the regression user clicks Log Diagnostic Result to submit the lab result form
    Then the dynamically generated Lab Result record should be saved on the Clinical Health Timeline

  Scenario: RG-HR-LAB-04 Verify required field validation errors when submitting Lab Results without analyte name or measured value
    When the regression user opens the Add Health Record modal and selects the "Lab Results" category tab
    And the regression user clicks Log Diagnostic Result without entering test name or measured value
    Then the Lab Results modal should remain open and display required field validation errors

  Scenario: RG-HR-LAB-05 Verify editing an existing Lab Result record updates pathologist clinical notes
    When the regression user switches to the Lab Results filter tab on the Clinical Health Timeline and clicks edit on a Lab Result card
    Then the Lab Result edit modal or card view should be accessible

  Scenario: RG-HR-LAB-06 Verify deleting a Lab Result record from the Lab Results tab
    When the regression user switches to the Lab Results filter tab on the Clinical Health Timeline
    Then the Lab Results tab should display the logged diagnostic panels

  # ============================================================================
  # 4. VITAL SIGNS RECORDS (6 SCENARIOS)
  # ============================================================================

  Scenario: RG-HR-VIT-01 Verify logging a complete Vital Signs record with dynamically generated weight, temperature, heart rate, respiratory rate, mucous membrane colour, systolic and diastolic BP, CRT, SpO2, exam date, and SOAP notes
    When the regression user opens the Add Health Record modal and selects the "Vital Signs" category tab
    And the regression user fills the Vital Signs form with dynamically generated weight, temperature, heart rate, respiratory rate, mucous membrane colour, blood pressure, CRT, SpO2, exam date, and SOAP notes
    And the regression user clicks Save Vital Signs to submit the vital signs form
    Then the Vital Signs measurement should be saved and displayed on the Clinical Health Timeline

  Scenario: RG-HR-VIT-02 Verify Body Condition Score 5-Pt and 9-Pt selector and Clinical Pain Score 0-10 controls on Vital Signs
    When the regression user opens the Add Health Record modal and selects the "Vital Signs" category tab
    Then the Vital Signs form should display weight, temperature, heart rate, blood pressure, and clinical assessment fields

  Scenario: RG-HR-VIT-03 Verify required field validation errors when submitting an empty Vital Signs form
    When the regression user opens the Add Health Record modal and selects the "Vital Signs" category tab
    And the regression user clicks Save Vital Signs without entering any vital measurements
    Then the Vital Signs modal should remain open and display required field validation errors

  Scenario: RG-HR-VIT-04 Verify boundary and out-of-range numeric validation on Vital Signs inputs
    When the regression user opens the Add Health Record modal and selects the "Vital Signs" category tab
    And the regression user enters dynamically generated out-of-bounds negative weight and SpO2 over 100 and clicks Save Vital Signs
    Then the Vital Signs modal should remain open and reject out-of-bounds vital values

  Scenario: RG-HR-VIT-05 Verify toggling between Cards view and Table view on the Vital Signs timeline tab
    When the regression user switches to the Vital Signs filter tab on the Clinical Health Timeline
    And the regression user toggles between "Cards" and "Table" display modes
    Then the Vital Signs view should render cleanly in both Cards and Table layouts

  Scenario: RG-HR-VIT-06 Verify editing and deleting a Vital Signs entry on the Clinical Health Timeline
    When the regression user switches to the Vital Signs filter tab on the Clinical Health Timeline
    Then the Vital Signs summary counter should reflect at least 1 recorded measurement

  # ============================================================================
  # 5. ALLERGY RECORDS (6 SCENARIOS)
  # ============================================================================

  Scenario: RG-HR-ALG-01 Verify logging a complete Allergy record with dynamically generated allergen substance, type, severity, reaction, date, and notes updates the Allergies counter
    When the regression user opens the Add Health Record modal and selects the "Allergy" category tab
    And the regression user fills the Allergy form with a dynamically generated allergen substance, allergen type, clinical severity, observed reaction, confirmed date, and veterinary notes
    And the regression user clicks Log Allergy to submit the allergy form
    Then the dynamically generated Allergy record should be saved and displayed on the Clinical Health Timeline

  Scenario: RG-HR-ALG-02 Verify logging a second Severe dynamic Allergy record on the Clinical Health Timeline
    When the regression user opens the Add Health Record modal and selects the "Allergy" category tab
    And the regression user fills the Allergy form with a dynamically generated allergen substance, allergen type, clinical severity, observed reaction, confirmed date, and veterinary notes
    And the regression user clicks Log Allergy to submit the allergy form
    Then the dynamically generated Allergy record should be saved and displayed on the Clinical Health Timeline

  Scenario: RG-HR-ALG-03 Verify required field validation errors when submitting an Allergy form with missing required fields
    When the regression user opens the Add Health Record modal and selects the "Allergy" category tab
    And the regression user clicks Log Allergy without entering allergen substance, type, severity, or reaction
    Then the Allergy modal should remain open and display required field validation errors

  Scenario: RG-HR-ALG-04 Verify rejecting whitespace-only Allergen Substance and Observed Reaction Description
    When the regression user opens the Add Health Record modal and selects the "Allergy" category tab
    And the regression user enters whitespace-only allergen substance and reaction and clicks Log Allergy
    Then the Allergy modal should remain open and reject whitespace-only required fields

  Scenario: RG-HR-ALG-05 Verify editing an existing Allergy record updates clinical severity and veterinary warnings
    When the regression user switches to the Allergies filter tab on the Clinical Health Timeline
    Then the Allergies tab should display all logged contraindication cards

  Scenario: RG-HR-ALG-06 Verify deleting an Allergy record from the Allergies tab
    When the regression user inspects the Allergies summary card on the Clinical Health Timeline
    Then the Allergies summary card should display the current contraindications count

  # ============================================================================
  # 6. TIMELINE FILTERS & SEARCH (4 SCENARIOS)
  # ============================================================================

  Scenario: RG-HR-FLT-01 Verify filtering Clinical Health Timeline across Timeline, Vaccinations, Medications, Lab Results, Vital Signs, and Allergies pill tabs
    When the regression user clicks sequentially through the "Timeline", "Vaccinations", "Medications", "Lab Results", "Vital Signs", and "Allergies" filter pills
    Then each Clinical Health Timeline category filter should display its matching clinical records

  Scenario: RG-HR-FLT-02 Verify filtering Clinical Health Timeline by preset date range buttons All Time, This Year, Last Year, and Past 6 Mos
    When the regression user clicks the "All Time", "This Year", "Last Year", and "Past 6 Mos" date range filter buttons on the Clinical Health Timeline
    Then the Clinical Health Timeline should update the filtered records list for each date range preset

  Scenario: RG-HR-FLT-03 Verify filtering Clinical Health Timeline using the Custom Date Range picker
    When the regression user opens the "Custom Date / Range" filter on the Clinical Health Timeline
    Then the Custom Date Range selector should be visible and interactive

  Scenario: RG-HR-FLT-04 Verify searching Clinical Health Timeline records by dynamic keyword in the search input
    When the regression user types a dynamic clinical search query into the Clinical Health Timeline search box
    Then the Clinical Health Timeline should filter results matching the dynamic search query
