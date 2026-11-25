Feature: Medical Conditions and Episodic Diary Complete Regression Suite
  As a Zosalus pet parent tracking standing medical diagnoses and symptom flare-up episodes
  I want to record dynamically generated diagnosed conditions with ICD-10 codes and insurance flags, and log dynamic moment-in-time episodes with duration presets, triggers, and acute medication responses
  So that my pet's longitudinal condition history and insurance claims log remain complete and validated

  Background:
    Given a regression patient user with an active registered pet is logged in on the Conditions and Episodes page

  # ============================================================================
  # 1. RECORD DIAGNOSED CONDITION (7 SCENARIOS)
  # ============================================================================

  Scenario: RG-COND-01 Verify recording a complete Medical Diagnosis with dynamically generated condition name, clinical status, severity, date first diagnosed, insurance relevance toggle, ICD-10 code, and treatment notes
    When the regression user opens the Record Diagnosed Condition modal on the Medical Diagnoses tab
    And the regression user fills the Record Diagnosed Condition form with a dynamically generated diagnosis name, clinical status, severity, date first diagnosed, insurance toggle, ICD-10 code, and treatment notes
    And the regression user submits the Record Diagnosis form
    Then the dynamically generated Medical Diagnosis should be saved and displayed under Medical Diagnoses

  Scenario: RG-COND-02 Verify recording a second Active dynamic Medical Diagnosis on the Medical Diagnoses tab
    When the regression user opens the Record Diagnosed Condition modal on the Medical Diagnoses tab
    And the regression user fills the Record Diagnosed Condition form with a dynamically generated diagnosis name, clinical status, severity, date first diagnosed, insurance toggle, ICD-10 code, and treatment notes
    And the regression user submits the Record Diagnosis form
    Then the dynamically generated Medical Diagnosis should be saved and displayed under Medical Diagnoses

  Scenario: RG-COND-03 Verify required field validation errors when submitting an empty Record Diagnosed Condition form
    When the regression user opens the Record Diagnosed Condition modal on the Medical Diagnoses tab
    And the regression user submits the Record Diagnosis form without entering a Condition Name or Date First Diagnosed
    Then the Record Diagnosed Condition modal should remain open and display required field validation errors

  Scenario: RG-COND-04 Verify rejecting a dynamically generated future Date First Diagnosed on the Record Diagnosed Condition form
    When the regression user opens the Record Diagnosed Condition modal on the Medical Diagnoses tab
    And the regression user fills a dynamically generated diagnosis name, status, and severity with a future Date First Diagnosed
    And the regression user submits the Record Diagnosis form
    Then the Record Diagnosed Condition modal should reject the future diagnosis date or remain open

  Scenario: RG-COND-05 Verify filtering Medical Diagnoses across All Diagnoses, Active, Chronic, Recurrent, Resolved, and Insurance status pills
    When the regression user clicks through the "All Diagnoses", "Active", "Chronic", "Recurrent", "Resolved", and "Insurance" filter pills on the Medical Diagnoses tab
    Then the Medical Diagnoses list should filter according to the selected clinical status pill

  Scenario: RG-COND-06 Verify searching Medical Diagnoses by dynamic diagnosis keyword or ICD code
    When the regression user enters a dynamic diagnosis search term into the Medical Diagnoses search bar
    Then the Medical Diagnoses view should filter matching diagnosis cards

  Scenario: RG-COND-07 Verify inspecting an existing Medical Diagnosis status and treatment notes
    When the regression user inspects an existing Medical Diagnosis card on the Medical Diagnoses tab
    Then the Medical Diagnosis card should display its status badge, date diagnosed, and clinical treatment summary

  # ============================================================================
  # 2. LOG MOMENT-IN-TIME EPISODE (7 SCENARIOS)
  # ============================================================================

  Scenario: RG-EPIS-01 Verify logging a complete Moment-in-Time Episode with dynamically generated symptom link, date, severity, duration, description, triggers, extra notes, and rescue medication response
    When the regression user switches to the Episodic Diary tab and opens the Log Episode modal
    And the regression user fills the Log Episode form with a dynamically generated condition link, episode date, severity, duration hours, description, observed triggers, extra notes, and rescue medication response
    And the regression user submits the Record Episode form
    Then the dynamically generated Episodic Diary entry should be saved and displayed in the Episodic Diary list

  Scenario: RG-EPIS-02 Verify logging a Moment-in-Time Episode using a dynamically generated custom free-text symptom and duration
    When the regression user switches to the Episodic Diary tab and opens the Log Episode modal
    And the regression user fills a dynamically generated custom symptom, episode date, severity, duration, and episode description and submits the Record Episode form
    Then the dynamically generated Episodic Diary entry should be saved in the Episodic Diary list

  Scenario: RG-EPIS-03 Verify Recurrence, Vet Contacted, and Emergency Care toggles on the Log Moment-in-Time Episode form
    When the regression user switches to the Episodic Diary tab and opens the Log Episode modal
    Then the Log Moment-in-Time Episode form should display severity, duration, description, triggers, and clinical escalation fields

  Scenario: RG-EPIS-04 Verify required field validation errors when submitting Log Moment-in-Time Episode without condition or description
    When the regression user switches to the Episodic Diary tab and opens the Log Episode modal
    And the regression user submits the Record Episode form without entering an episode description
    Then the Log Moment-in-Time Episode modal should remain open and display required field validation errors

  Scenario: RG-EPIS-05 Verify filtering Episodic Diary entries by Emergency, Severe, Moderate, and Mild summary cards and condition dropdown
    When the regression user switches to the Episodic Diary tab on the Conditions and Episodes page
    Then the Episodic Diary tab should display the "EMERGENCY", "SEVERE", "MODERATE", and "MILD" summary counter cards

  Scenario: RG-EPIS-06 Verify searching Episodic Diary entries by dynamic symptom description or trigger keyword
    When the regression user switches to the Episodic Diary tab and types a dynamic episode keyword into the episode search input
    Then the Episodic Diary list should filter episodes matching the search query

  Scenario: RG-EPIS-07 Verify Export Claims Log action button on the Episodic Diary tab
    When the regression user switches to the Episodic Diary tab on the Conditions and Episodes page
    Then the "Export Claims Log" button should be visible and accessible on the Episodic Diary header
