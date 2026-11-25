Feature: Profile Settings, Account Preferences, and Subscription Management Regression Suite
  As an authenticated Zosalus pet parent
  I want to view and update my personal profile, contact preferences, home address, emergency contacts, security settings, and subscription plan using dynamically generated inputs
  So that changes to my account and Companion subscription are validated and persisted across sessions

  Background:
    Given a regression patient account is logged in and opens the Account Settings page

  Scenario: RG-SETTINGS-01 Verify Account Settings displays Profile, Contact, Address, Emergency Contacts, and Subscription sections
    Then Account Settings should display the owner header card with display name and current plan badge
    And Account Settings should display the Profile, Contact, Address, and Emergency Contacts sections

  Scenario: RG-SETTINGS-02 Verify editing Name and Display Name with dynamic owner details in Account Settings updates the profile header
    When the regression user clicks edit on Name and Display Name in Account Settings
    And the regression user updates First Name and Last Name with dynamically generated owner names in Account Settings
    And the regression user saves the Name and Display Name changes in Account Settings
    Then Account Settings should display the dynamically updated owner name

  Scenario: RG-SETTINGS-03 Verify validation error when clearing required First Name or Last Name in Account Settings
    When the regression user clicks edit on Name and Display Name in Account Settings
    And the regression user clears the First Name input in Account Settings and attempts to save
    Then Account Settings should prevent saving an empty First Name and display a validation message

  Scenario: RG-SETTINGS-04 Verify editing Phone Number with dynamic US phone and validation of invalid phone number format in Account Settings
    When the regression user clicks edit on Phone in Account Settings
    And the regression user enters an invalid short phone number in Account Settings and attempts to save
    Then Account Settings should reject the invalid phone number format
    When the regression user enters a dynamically generated valid US phone number in Account Settings and saves
    Then Account Settings should display the dynamically updated phone number

  Scenario: RG-SETTINGS-05 Verify updating Preferred Contact Method across Phone Call, SMS Text, and Email in Account Settings
    When the regression user edits Preferred Contact Method in Account Settings and selects a dynamic contact preference
    Then Account Settings should display the newly selected Preferred Contact Method

  Scenario: RG-SETTINGS-06 Verify editing and saving a dynamically generated Home Address in Account Settings
    When the regression user edits Home Address in Account Settings with a dynamically generated street, city, state, and ZIP
    Then Account Settings should display the dynamically saved Home Address

  Scenario: RG-SETTINGS-07 Verify adding and updating a dynamically generated Emergency Contact in Account Settings
    When the regression user opens Emergency Contacts edit in Account Settings
    And the regression user configures a dynamically generated emergency contact name and phone in Account Settings
    Then Account Settings should display the configured emergency contact details

  Scenario: RG-SETTINGS-08 Verify unverified Email badge and Verify Now or Resend Link action in Account Settings
    Then Account Settings Contact section should display the account email address and verification status action

  Scenario: RG-SETTINGS-09 Verify viewing current subscription tier and opening Subscription and Plans from Account Settings
    When the regression user navigates from Account Settings to the Subscription and Plans page
    Then the Subscription and Plans page should display the "My Subscription" tab and "Plan Comparison" tab

  Scenario: RG-SETTINGS-10 Verify toggling between Monthly Billing and Annual Billing on Plan Comparison
    When the regression user opens the "Plan Comparison" tab on the Subscription and Plans page
    And the regression user toggles between "Monthly Billing" and "Annual Billing"
    Then the Companion Plan pricing display should update between monthly and annual billing tiers

  Scenario: RG-SETTINGS-11 Verify initiating Companion Plan upgrade from Subscription Settings redirects to Stripe Hosted Checkout
    When a Free tier regression user clicks "Upgrade to Companion" on the Subscription and Plans page
    Then the browser should redirect to a valid Stripe Hosted Checkout session URL

  Scenario: RG-SETTINGS-12 Verify active Companion Plan subscriber sees active plan status and billing management controls
    When a Companion tier regression user from SQLite logs in and opens the Subscription page
    Then the Subscription page should reflect the active Companion tier status

  Scenario: RG-SETTINGS-13 Verify dynamically edited profile settings persist across hard reload and logout-login cycle
    When the regression user updates their profile details in Account Settings and performs a logout and login cycle
    And the regression user re-opens Account Settings
    Then Account Settings should retain the dynamically updated profile information
