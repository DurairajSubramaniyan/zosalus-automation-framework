Feature: Three-Step Pet Onboarding Wizard, Field Validation, and Photo Upload Regression Suite
  As a Zosalus pet parent registering a pet profile
  I want the 3-step Add Pet wizard to validate dynamically generated pet names, species, breeds, dates of birth, sex, neuter status, 15-digit ISO microchips, and photo cropping
  So that every pet profile is saved with accurate veterinary identity details

  Background:
    Given a regression patient user with unlocked Add Pet access is logged in on the Add Pet wizard

  Scenario: RG-PET-CREATE-01 Verify complete 3-step pet creation with dynamically generated pet name, species pill, catalog breed, valid DOB, 15-digit microchip, and cropped photo
    When the regression user fills Add Pet Step 1 with a dynamically generated pet name, species pill, and catalog breed
    And the regression user clicks Continue on Add Pet Step 1
    And the regression user fills Add Pet Step 2 with a dynamically generated birthdate, sex, neuter status, color markings, and 15-digit ISO microchip
    And the regression user clicks Continue on Add Pet Step 2
    And the regression user uploads and crops a species-matched pet photo on Add Pet Step 3 and clicks Save Profile
    Then the newly created dynamic pet profile should be saved and displayed in the Zosalus portal

  Scenario: RG-PET-CREATE-02 Verify Step 1 pet creation with dynamically generated pet name and custom manual breed entry
    When the regression user fills Add Pet Step 1 with a dynamically generated pet name, species pill, and custom manual breed
    And the regression user clicks Continue on Add Pet Step 1
    Then Add Pet Step 2 should be displayed with heading referencing the dynamically generated pet name

  Scenario: RG-PET-CREATE-03 Verify Step 1 validation error when submitting with blank Pet Name and blank Species
    When the regression user clears Pet Name and leaves Species unselected on Add Pet Step 1
    And the regression user clicks Continue on Add Pet Step 1
    Then Add Pet Step 1 should display required field validation errors for Pet Name and Species

  Scenario: RG-PET-CREATE-04 Verify Step 1 validation error when Pet Name contains only whitespace characters
    When the regression user fills Add Pet Step 1 with a whitespace-only pet name and a dynamically selected species and breed
    And the regression user clicks Continue on Add Pet Step 1
    Then Add Pet Step 1 should reject the whitespace-only Pet Name and remain on Step 1

  Scenario: RG-PET-CREATE-05 Verify Step 2 auto-calculates Age when a valid dynamic MM/DD/YYYY Date of Birth is entered
    When the regression user completes Add Pet Step 1 with a dynamically generated pet identity
    And the regression user enters a dynamically generated past Date of Birth on Add Pet Step 2
    Then Add Pet Step 2 should automatically calculate and populate the pet Age field

  Scenario: RG-PET-CREATE-06 Verify Step 2 Approximate Date of Birth toggle switch behavior
    When the regression user completes Add Pet Step 1 with a dynamically generated pet identity
    And the regression user toggles the Approximate Date of Birth switch on Add Pet Step 2
    Then the Approximate Date of Birth switch should reflect the toggled state on Add Pet Step 2

  Scenario: RG-PET-CREATE-07 Verify Step 2 rejects a future Date of Birth in MM/DD/YYYY format
    When the regression user completes Add Pet Step 1 with a dynamically generated pet identity
    And the regression user fills Add Pet Step 2 with a dynamically generated future Date of Birth, sex, and neuter status
    And the regression user clicks Continue on Add Pet Step 2
    Then Add Pet Step 2 should reject the future Date of Birth and remain on Step 2

  Scenario: RG-PET-CREATE-08 Verify Step 2 required field validation when Date of Birth, Sex, and Neuter Status are left empty
    When the regression user completes Add Pet Step 1 with a dynamically generated pet identity
    And the regression user clicks Continue on Add Pet Step 2 without selecting Date of Birth, Sex, or Neuter Status
    Then Add Pet Step 2 should display required validation errors for Date of Birth, Sex, and Neuter Status

  Scenario: RG-PET-CREATE-09 Verify Step 2 rejects a Microchip Number with fewer than 15 digits
    When the regression user completes Add Pet Step 1 with a dynamically generated pet identity
    And the regression user fills Add Pet Step 2 with a dynamic birthdate, sex, neuter status, color, and an invalid short microchip number
    And the regression user clicks Continue on Add Pet Step 2
    Then Add Pet Step 2 should display a 15-digit ISO microchip validation error

  Scenario: RG-PET-CREATE-10 Verify Step 2 rejects non-numeric characters in the 15-digit Microchip Number field
    When the regression user completes Add Pet Step 1 with a dynamically generated pet identity
    And the regression user fills Add Pet Step 2 with a dynamic birthdate, sex, neuter status, color, and an alphanumeric invalid microchip
    And the regression user clicks Continue on Add Pet Step 2
    Then Add Pet Step 2 should reject the non-numeric microchip or sanitize invalid characters

  Scenario: RG-PET-CREATE-11 Verify Step 3 allows saving a dynamic pet profile without uploading a photo when photo is skipped
    When the regression user completes Add Pet Step 1 with a dynamically generated pet identity
    And the regression user fills Add Pet Step 2 with a dynamically generated birthdate, sex, neuter status, color markings, and 15-digit ISO microchip
    And the regression user clicks Continue on Add Pet Step 2
    And the regression user clicks Save Profile on Add Pet Step 3 without uploading a photo
    Then the newly created dynamic pet profile should be saved and displayed in the Zosalus portal

  Scenario: RG-PET-CREATE-12 Verify Step 3 Choose Different Photo button allows replacing the cropped photo before saving
    When the regression user completes Add Pet Step 1 with a dynamically generated pet identity
    And the regression user fills Add Pet Step 2 with a dynamically generated birthdate, sex, neuter status, color markings, and 15-digit ISO microchip
    And the regression user clicks Continue on Add Pet Step 2
    And the regression user uploads and crops a first pet photo on Add Pet Step 3
    Then the "Choose Different Photo" button should be visible on Add Pet Step 3

  Scenario: RG-PET-CREATE-13 Verify clicking Back from Step 2 to Step 1 retains the dynamically entered field values
    When the regression user fills Add Pet Step 1 with a dynamically generated pet name, species pill, and catalog breed
    And the regression user clicks Continue on Add Pet Step 1
    And the regression user clicks the Back button on Add Pet Step 2
    Then Add Pet Step 1 should retain the dynamically generated pet name

  Scenario: RG-PET-CREATE-14 Verify Free plan user who already has 1 active pet is blocked by the Companion upgrade gate on Add Pet
    When a Free plan regression user who already has 1 registered pet navigates to the Add Pet route
    Then the Add Pet route should display the Companion upgrade gate "Adding a second animal requires Companion"
