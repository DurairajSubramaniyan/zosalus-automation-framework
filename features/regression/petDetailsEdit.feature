Feature: Pet Profile Details Edit, Microchip Validation, Photo Replacement, and Reload Persistence Regression Suite
  As a Zosalus pet parent with an existing registered pet
  I want to edit my pet's name, species, breed, date of birth, sex, neuter status, color markings, 15-digit microchip, and profile photo with dynamically generated values
  So that updates are reflected in the sidebar and pet profile header while invalid edits or cancelled changes are prevented

  Background:
    Given a regression patient user with an existing registered pet is logged in and opens the Pet Profile Details page

  Scenario: RG-PET-EDIT-01 Verify editing Pet Name with a dynamically generated pet name updates both the Pet Profile header and Sidebar MY PETS list
    When the regression user opens the Edit Pet Profile form for the active pet
    And the regression user updates the pet name with a dynamically generated pet name and saves the pet profile changes
    Then the Pet Profile header and sidebar MY PETS list should display the dynamically updated pet name

  Scenario: RG-PET-EDIT-02 Verify editing Pet Breed and Color Markings with dynamic values persists on the Pet Profile
    When the regression user opens the Edit Pet Profile form for the active pet
    And the regression user updates the pet breed and color markings with dynamically generated values and saves
    Then the Pet Profile page should display the dynamically updated breed or color markings details

  Scenario: RG-PET-EDIT-03 Verify updating Pet Date of Birth with a dynamic MM/DD/YYYY date recalculates the displayed Pet Age
    When the regression user opens the Edit Pet Profile form for the active pet
    And the regression user updates the pet Date of Birth with a dynamically generated past date and saves
    Then the Pet Profile page should reflect the updated Date of Birth and recalculated age

  Scenario: RG-PET-EDIT-04 Verify toggling Approximate Date of Birth during Pet Profile edit
    When the regression user opens the Edit Pet Profile form for the active pet
    And the regression user toggles the Approximate Date of Birth option on the Edit Pet Profile form and saves
    Then the Pet Profile changes should save cleanly without errors

  Scenario: RG-PET-EDIT-05 Verify rejecting a dynamically generated future Date of Birth when editing an existing Pet Profile
    When the regression user opens the Edit Pet Profile form for the active pet
    And the regression user enters a dynamically generated future Date of Birth on the Edit Pet Profile form and attempts to save
    Then the Edit Pet Profile form should reject the future Date of Birth

  Scenario: RG-PET-EDIT-06 Verify updating Pet Sex and Neuter or Spay Status with dynamic selections on the Pet Profile
    When the regression user opens the Edit Pet Profile form for the active pet
    And the regression user updates Neuter Status with a dynamic selection on the Edit Pet Profile form and saves
    Then the Pet Profile page should display the updated Neuter Status

  Scenario: RG-PET-EDIT-07 Verify updating the 15-digit ISO Microchip Number with a dynamically generated valid 15-digit number
    When the regression user opens the Edit Pet Profile form for the active pet
    And the regression user updates the Microchip Number with a dynamically generated 15-digit ISO microchip and saves
    Then the Pet Profile page should save the updated 15-digit Microchip Number

  Scenario: RG-PET-EDIT-08 Verify validation error when updating Microchip Number with an invalid short numeric value
    When the regression user opens the Edit Pet Profile form for the active pet
    And the regression user enters a dynamically generated invalid short Microchip Number and attempts to save
    Then the Edit Pet Profile form should reject the invalid Microchip Number length

  Scenario: RG-PET-EDIT-09 Verify replacing the Pet Profile Avatar Photo with a dynamically generated pet image
    When the regression user initiates Pet Profile photo replacement and uploads a newly generated pet avatar image
    Then the Pet Profile avatar photo should update cleanly

  Scenario: RG-PET-EDIT-10 Verify validation error when clearing the required Pet Name field during Pet Profile edit
    When the regression user opens the Edit Pet Profile form for the active pet
    And the regression user clears the required Pet Name field and attempts to save
    Then the Edit Pet Profile form should prevent saving an empty Pet Name

  Scenario: RG-PET-EDIT-11 Verify clicking Cancel or Close on the Edit Pet Profile form discards unsaved dynamic modifications
    When the regression user opens the Edit Pet Profile form for the active pet
    And the regression user types an unsaved dynamic pet name and clicks Cancel without saving
    Then the Pet Profile header should not display the discarded dynamic pet name

  Scenario: RG-PET-EDIT-12 Verify saved dynamic Pet Profile edits persist after a hard browser page reload
    When the regression user opens the Edit Pet Profile form for the active pet
    And the regression user updates the pet name with a dynamically generated pet name and saves the pet profile changes
    And the regression user performs a hard browser reload on the Pet Profile page
    Then the Pet Profile header should still display the dynamically updated pet name after reload
