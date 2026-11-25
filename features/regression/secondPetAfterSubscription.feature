Feature: Multi-Pet Creation After Companion Subscription, Pet Switching Isolation, and Reorder Regression Suite
  As a Zosalus Companion Plan subscriber
  I want to add 2nd, 3rd, 4th, and 5th pets with dynamically generated names, species, breeds, DOBs, 15-digit microchips, and photos and switch or reorder them seamlessly
  So that each animal profile maintains isolated health records, conditions, and documents under my Companion account

  Background:
    Given an upgraded Companion Plan regression user is logged into the Zosalus portal

  Scenario: RG-MULTIPET-01 Verify Companion Plan subscriber can register a 2nd pet profile with dynamically generated Cat details and cropped photo
    When the Companion regression user opens the Add Pet wizard to add an additional animal
    And the Companion regression user completes Step 1, Step 2, and Step 3 photo upload for a dynamically generated "Cat" pet profile
    Then the portal should save the dynamically generated pet and increment the MY PETS count in the sidebar

  Scenario: RG-MULTIPET-02 Verify Companion Plan subscriber can register a 3rd pet profile with dynamically generated Dog details and distinct 15-digit microchip
    When the Companion regression user opens the Add Pet wizard to add an additional animal
    And the Companion regression user completes Step 1, Step 2, and Step 3 photo upload for a dynamically generated "Dog" pet profile
    Then the portal should save the dynamically generated pet and display it in the sidebar MY PETS switcher

  Scenario: RG-MULTIPET-03 Verify Companion Plan subscriber can register a 4th pet profile with dynamically generated Cat details
    When the Companion regression user opens the Add Pet wizard to add an additional animal
    And the Companion regression user completes Step 1, Step 2, and Step 3 photo upload for a dynamically generated "Cat" pet profile
    Then the portal should save the dynamically generated pet and display it in the sidebar MY PETS switcher

  Scenario: RG-MULTIPET-04 Verify Companion Plan subscriber can register a 5th pet profile under the 10-pet Companion base allowance
    When the Companion regression user opens the Add Pet wizard to add an additional animal
    And the Companion regression user completes Step 1, Step 2, and Step 3 photo upload for a dynamically generated "Dog" pet profile
    Then the portal should save the dynamically generated pet and display it in the sidebar MY PETS switcher

  Scenario: RG-MULTIPET-05 Verify Step 1 required field validations still enforce Pet Name and Species on subsequent pets after subscription
    When the Companion regression user opens the Add Pet wizard to add an additional animal
    And the Companion regression user submits Add Pet Step 1 with blank Pet Name and blank Species
    Then Add Pet Step 1 should display required field validation errors and block progression to Step 2

  Scenario: RG-MULTIPET-06 Verify Step 2 required field and 15-digit microchip validations enforce rules on subsequent pets
    When the Companion regression user opens the Add Pet wizard to add an additional animal
    And the Companion regression user fills Add Pet Step 1 with a dynamically generated pet name, species pill, and catalog breed
    And the Companion regression user clicks Continue on Add Pet Step 1
    And the Companion regression user fills Add Pet Step 2 with a dynamic birthdate, sex, neuter status, color, and an invalid short microchip
    And the Companion regression user clicks Continue on Add Pet Step 2
    Then Add Pet Step 2 should display a 15-digit ISO microchip validation error

  Scenario: RG-MULTIPET-07 Verify switching active pet in the MY PETS sidebar updates the active Pet Card and Dashboard context
    When the Companion regression user selects a different pet avatar in the sidebar MY PETS switcher
    Then the active pet card in the sidebar and main portal view should update to the newly selected pet

  Scenario: RG-MULTIPET-08 Verify clinical Health Records data isolation when switching between the 1st pet and 2nd pet
    When the Companion regression user switches between the first pet and second pet on the Clinical Health Records page
    Then the Clinical Health Timeline header and records list should scope strictly to the currently selected pet

  Scenario: RG-MULTIPET-09 Verify Medical Conditions and Episodic Diary data isolation when switching between pets
    When the Companion regression user switches between the first pet and second pet on the Conditions and Episodes page
    Then the Medical Diagnoses and Episodic Diary tabs should scope strictly to the currently selected pet

  Scenario: RG-MULTIPET-10 Verify Documents vault data isolation when switching between multiple pets
    When the Companion regression user navigates to the Documents page and switches between registered pets
    Then the Documents view should scope strictly to the selected pet profile

  Scenario: RG-MULTIPET-11 Verify clicking Reorder in the MY PETS sidebar opens or toggles pet profile reordering controls
    When the Companion regression user clicks the "Reorder" action in the MY PETS sidebar header
    Then the MY PETS sidebar should allow reordering or managing the sequence of pet profiles

  Scenario: RG-MULTIPET-12 Verify active selected pet and multi-pet sidebar roster persist across a hard browser reload
    When the Companion regression user performs a hard page reload while viewing a multi-pet account
    Then all registered pets in the MY PETS sidebar should remain visible and intact after reload
