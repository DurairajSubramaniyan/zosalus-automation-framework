@accountSetup @regression
Feature: Zosalus Account Creation, Login, and Profile Setup Flow

  # ========================================================
  # POSITIVE SCENARIOS
  # ========================================================

  @positive @smoke
  Scenario: TC-SET-POS-01 Verify End-to-End Account Creation, Login, and Profile Setup UI Elements
    Given user creates a new account on the Signup page
    Then a registration success toast should display "User created successfully. Please check your email for the verification link."
    When user logs in with the newly created account credentials
    Then user should be redirected to the account setup page
    And the setup page heading should display "Set up your profile"
    And the setup page subtitle should display "Quick setup — takes about 30 seconds."
    And the First Name input field should be visible
    And the Last Name input field should be visible
    And the Email input field should be prefilled with the registered email
    And the Phone Number input field with country code should be visible
    And the Username input field should be visible
    And the Preferred Contact Method options should be visible
    And the Home Address input fields should be visible
    And the Timezone selector should display "(GMT+00:00) UTC"
    And the Language selector should display "English (US)"
    And the setup "Save & Continue" button should be visible
    And the setup "Skip for now" button should be visible

  @positive
  Scenario: TC-SET-POS-02 Verify complete Profile Setup submission with full details
    Given user is authenticated and on the account setup page
    When user enters profile first name "Sarah"
    And user enters profile last name "Connor"
    And user enters profile phone number "5552345678"
    And user enters a unique profile username
    And user selects preferred contact method "Email"
    And user enters street address "100 Congress Ave"
    And user enters apartment suite "Apt 4B"
    And user enters city "Austin"
    And user enters state "TX"
    And user enters zip code "78701"
    And user clicks the setup "Save & Continue" button
    Then user should be redirected to the add pet page

  @positive
  Scenario: TC-SET-POS-03 Verify Profile Setup submission with only required fields
    Given user is authenticated and on the account setup page
    When user enters profile first name "Alex"
    And user enters profile last name "Morgan"
    And user enters profile phone number "5559876543"
    And user enters a unique profile username
    And user clicks the setup "Save & Continue" button
    Then user should be redirected to the add pet page

  @positive
  Scenario: TC-SET-POS-04 Verify skipping account setup navigates directly to Add Pet
    Given user is authenticated and on the account setup page
    When user clicks the setup "Skip for now" button
    Then user should be redirected to the add pet page

  @positive
  Scenario: TC-SET-POS-05 Verify toggle between Preferred Contact Methods
    Given user is authenticated and on the account setup page
    When user selects preferred contact method "Phone"
    Then the "Phone" contact method should be selected
    When user selects preferred contact method "SMS / Text"
    Then the "SMS / Text" contact method should be selected
    When user selects preferred contact method "Email"
    Then the "Email" contact method should be selected

  @positive
  Scenario: TC-SET-POS-06 Verify Emergency Contacts action buttons are visible and active
    Given user is authenticated and on the account setup page
    Then the setup "Add Contact" button should be visible
    And the setup "Add an emergency contact" button should be visible

  @positive @persistence
  Scenario: TC-SET-POS-07 Verify that skipping profile setup causes the setup page to reappear on subsequent login
    Given user creates a new account on the Signup page
    When user logs in with the newly created account credentials
    Then user should be redirected to the account setup page
    When user clicks the setup "Skip for now" button
    Then user should be redirected to the add pet page
    When user logs out of the application
    And user logs in again with the same account credentials
    Then user should be redirected to the account setup page

  @positive @persistence
  Scenario: TC-SET-POS-08 Verify that completing profile setup prevents the setup page from appearing on subsequent login
    Given user is authenticated and on the account setup page
    When user enters profile first name "Robert"
    And user enters profile last name "Smith"
    And user enters profile phone number "5554445555"
    And user enters a unique profile username
    And user clicks the setup "Save & Continue" button
    Then user should be redirected to the add pet page
    When user logs out of the application
    And user logs in again with the same account credentials
    Then user should be redirected to the dashboard or home page
    And user should not see the account setup page

  # ========================================================
  # NEGATIVE SCENARIOS
  # ========================================================

  @negative @validation
  Scenario: TC-SET-NEG-01 Verify validation errors on submitting empty profile setup form
    Given user is authenticated and on the account setup page
    When user clicks the setup "Save & Continue" button without entering required details
    Then the first name error message should be "First name is required"
    And the last name error message should be "Last name is required"
    And the phone number error message should be "Phone number is required"
    And the username error message should be "Username is required"

  @negative @validation
  Scenario: TC-SET-NEG-02 Verify validation error when First Name is omitted
    Given user is authenticated and on the account setup page
    When user enters profile last name "Connor"
    And user enters profile phone number "5552345678"
    And user enters a unique profile username
    And user clicks the setup "Save & Continue" button
    Then the first name error message should be "First name is required"

  @negative @validation
  Scenario: TC-SET-NEG-03 Verify validation error when Last Name is omitted
    Given user is authenticated and on the account setup page
    When user enters profile first name "Sarah"
    And user enters profile phone number "5552345678"
    And user enters a unique profile username
    And user clicks the setup "Save & Continue" button
    Then the last name error message should be "Last name is required"

  @negative @validation
  Scenario: TC-SET-NEG-04 Verify validation error when Phone Number is omitted
    Given user is authenticated and on the account setup page
    When user enters profile first name "Sarah"
    And user enters profile last name "Connor"
    And user enters a unique profile username
    And user clicks the setup "Save & Continue" button
    Then the phone number error message should be "Phone number is required"

  @negative @validation
  Scenario: TC-SET-NEG-05 Verify validation error when Username is omitted
    Given user is authenticated and on the account setup page
    When user enters profile first name "Sarah"
    And user enters profile last name "Connor"
    And user enters profile phone number "5552345678"
    And user clicks the setup "Save & Continue" button
    Then the username error message should be "Username is required"

  @negative
  Scenario: TC-SET-NEG-06 Verify login failure when using newly created account with incorrect password
    Given user creates a new account on the Signup page
    When user enters login email for the newly created account
    And user enters login password "WrongPassword999!"
    And user clicks the login "Sign In" button
    Then a login server error banner should appear containing "Invalid email or password."

  @negative @validation
  Scenario: TC-SET-NEG-07 Verify validation error when Username contains invalid special characters
    Given user is authenticated and on the account setup page
    When user enters profile first name "Sarah"
    And user enters profile last name "Connor"
    And user enters profile phone number "5552345678"
    And user enters profile username "user_invalid#!"
    And user clicks the setup "Save & Continue" button
    Then the username error message should be "Username must contain only letters and numbers."

  # ========================================================
  # EDGE CASES
  # ========================================================

  @edge
  Scenario Outline: TC-SET-EDGE-01 Verify profile creation with special characters and boundary names (<caseType>)
    Given user is authenticated and on the account setup page
    When user enters profile first name "<firstName>"
    And user enters profile last name "<lastName>"
    And user enters profile phone number "5553334444"
    And user enters a unique profile username
    And user clicks the setup "Save & Continue" button
    Then user should be redirected to the add pet page

    Examples:
      | caseType            | firstName              | lastName               |
      | hyphenated names    | Jean-Luc               | Picard-Smith           |
      | apostrophe in name  | John                   | O'Connor               |
      | long boundary name  | Christopher-Alexander  | Montgomery-Fitzgerald  |

  @edge
  Scenario: TC-SET-EDGE-02 Verify unauthenticated user cannot directly access account setup page
    Given user navigates directly to the account setup page without authentication
    Then user should be redirected to the login page
