Feature: Patient Account Setup Wizard and Profile Onboarding Regression Suite
  As a newly authenticated Zosalus patient landing on Account Setup
  I want to configure my dynamically generated personal details, contact preferences, home address, emergency contacts, timezone, and language
  So that my owner profile is accurately validated and saved before adding my first pet

  Background:
    Given a regression patient account is logged in and navigated to the Account Setup page

  Scenario: RG-SETUP-01 Verify complete profile setup save with dynamically generated personal, contact, address, emergency contact, timezone, and language fields
    When the regression user fills dynamically generated First Name, Last Name, valid US Phone, and Username on Account Setup
    And the regression user verifies the Email field on Account Setup is pre-filled with the authenticated account email
    And the regression user selects Preferred Contact Method "Phone" on Account Setup
    And the regression user fills a dynamically generated US Home Address with street, unit, city, state, and ZIP on Account Setup
    And the regression user adds a dynamically generated emergency contact with name, relationship, and phone on Account Setup
    And the regression user clicks Save and Continue on Account Setup
    Then the Account Setup submission should succeed and navigate to the Add Pet or Home portal page

  Scenario: RG-SETUP-02 Verify required field validation errors when submitting Account Setup with blank required inputs
    When the regression user clears First Name, Last Name, Phone Number, and Username on Account Setup
    And the regression user clicks Save and Continue on Account Setup
    Then Account Setup should display required validation errors for First Name, Last Name, Phone Number, and Username

  Scenario: RG-SETUP-03 Verify whitespace-only values in First Name, Last Name, and Username are rejected on Account Setup
    When the regression user fills whitespace-only First Name, Last Name, and Username with a valid dynamic US Phone on Account Setup
    And the regression user clicks Save and Continue on Account Setup
    Then Account Setup should display validation errors for blank or whitespace-only required fields

  Scenario: RG-SETUP-04 Verify invalid US phone number with fewer than 10 digits or unallocated exchange is rejected
    When the regression user fills dynamically generated First Name, Last Name, and Username with an invalid short phone number on Account Setup
    And the regression user clicks Save and Continue on Account Setup
    Then Account Setup should display a phone number format validation error

  Scenario: RG-SETUP-05 Verify invalid ZIP code format is rejected when Home Address is provided on Account Setup
    When the regression user fills dynamically generated First Name, Last Name, valid US Phone, and Username on Account Setup
    And the regression user fills a dynamically generated US Home Address with an invalid alphabetic ZIP code on Account Setup
    And the regression user clicks Save and Continue on Account Setup
    Then Account Setup should display a ZIP code validation error or remain on Account Setup

  Scenario: RG-SETUP-06 Verify switching Preferred Contact Method radio options across Phone, SMS Text, and Email
    When the regression user selects Preferred Contact Method "Phone" on Account Setup
    Then the "Phone" Preferred Contact Method radio option should be active on Account Setup
    When the regression user selects Preferred Contact Method "SMS / Text" on Account Setup
    Then the "SMS / Text" Preferred Contact Method radio option should be active on Account Setup
    When the regression user selects Preferred Contact Method "Email" on Account Setup
    Then the "Email" Preferred Contact Method radio option should be active on Account Setup

  Scenario: RG-SETUP-07 Verify adding two dynamically generated emergency contacts and enforcing the maximum limit of 2 emergency contacts
    When the regression user adds a first dynamically generated emergency contact on Account Setup
    And the regression user adds a second dynamically generated emergency contact on Account Setup
    Then Account Setup should display 2 configured emergency contacts and prevent adding a 3rd emergency contact

  Scenario: RG-SETUP-08 Verify removing a dynamically added emergency contact updates the emergency contacts list on Account Setup
    When the regression user adds a dynamically generated emergency contact with name, relationship, and phone on Account Setup
    And the regression user removes the dynamically added emergency contact on Account Setup
    Then the removed dynamic emergency contact should no longer appear on Account Setup

  Scenario: RG-SETUP-09 Verify Emergency Contact validation when contact name or phone number is missing
    When the regression user opens the Add Emergency Contact form on Account Setup and submits with blank contact fields
    Then Account Setup should require valid emergency contact name and phone details before saving the contact

  Scenario: RG-SETUP-10 Verify Timezone and Language preference selectors on Account Setup
    When the regression user inspects the Timezone and Language preference controls on Account Setup
    Then the Timezone selector and Language selector should be visible and interactive on Account Setup

  Scenario: RG-SETUP-11 Verify clicking Skip for now bypasses optional setup and navigates to Add Pet or Home
    When the regression user clicks the Skip for now button on Account Setup
    Then the browser should navigate from Account Setup to the Add Pet or Home portal page

  Scenario: RG-SETUP-12 Verify saved dynamic Account Setup profile details persist when visiting Account Settings and reloading
    When the regression user fills dynamically generated First Name, Last Name, valid US Phone, and Username on Account Setup
    And the regression user clicks Save and Continue on Account Setup
    And the regression user navigates to Account Settings and reloads the browser page
    Then Account Settings should display the dynamically saved owner name and phone number
