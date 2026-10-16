@login
Feature: Zosalus Login Page

  Background:
    Given user navigates to the Login page

  # ========================================================
  # POSITIVE SCENARIOS
  # ========================================================

  Scenario: TC-LOG-POS-01 Verify all Login page UI elements are loaded and visible
    Then the login page title should display "Welcome back"
    And the login subtitle should display "Sign in to your account."
    And the login "Continue with Google" button should be visible
    And the login "Continue with Apple" button should be visible
    And the login Email input field should be visible
    And the login Password input field should be visible
    And the login "Sign In" submit button should be visible
    And the login "Forgot password?" link should be visible
    And the login "Create one" link should be visible

  Scenario: TC-LOG-POS-02 Verify show and hide password toggle functionality on Login page
    When user inspects the login password field
    Then the login password field type should be "password"
    When user clicks the login password visibility toggle
    Then the login password field type should be "text"
    When user clicks the login password visibility toggle again
    Then the login password field type should be "password"

  Scenario: TC-LOG-POS-03 Verify navigation to Forgot Password page
    When user clicks the login "Forgot password?" link
    Then user should be navigated to the forgot password page
    Then user should see "Reset your password" title
    And user should see "Type your email address and we’ll send you a message to reset it."
    And user should see "Email" title
    And user should see email field
    And user should enter valid email in email field
    And user should see the "Remember your password?" title
    Then user clicks the login "Sign In" button

  Scenario: TC-LOG-POS-04 Verify navigation to Signup page from Login
    When user clicks the login "Create one" link
    Then user should be navigated to the signup page

  Scenario: TC-LOG-POS-05 Verify successful login with valid credentials
    When user creates a new registered account with valid credentials
    And user enters the registered login email
    And user enters the registered login password
    And user clicks the login "Sign In" button
    Then the login API should return status code 200
    And user should be redirected to the account dashboard or setup page

  # ========================================================
  # NEGATIVE SCENARIOS
  # ========================================================

  Scenario: TC-LOG-NEG-01 Verify validation errors on empty form submission
    When user clicks the Sign In button without entering any details
    Then the login email error message should be "Please enter your email address"
    And the login password error message should be "Please enter your password"
    And the login email input should show error red border
    And the login password input should show error red border

  Scenario: TC-LOG-NEG-02 Verify validation error when email is omitted
    When user enters login password "ValidPassword123!"
    And user clicks the login "Sign In" button
    Then the login email error message should be "Please enter your email address"
    And the login email input should show error red border

  Scenario: TC-LOG-NEG-03 Verify validation error when password is omitted
    When user enters login email "valid_user@example.com"
    And user clicks the login "Sign In" button
    Then the login password error message should be "Please enter your password"
    And the login password input should show error red border

  Scenario Outline: TC-LOG-NEG-04 Verify error for invalid email format (<description>)
    When user enters login email "<invalid_email>"
    And user enters login password "ValidPassword123!"
    And user clicks the login "Sign In" button
    Then the login email error message should be "Please enter a valid email address"
    And the login email input should show error red border

    Examples:
      | description      | invalid_email          |
      | missing @ symbol | invalidemailformat.com |
      | missing domain   | user@                  |
      | missing username | @domain.com            |
      | spaces in email  | user name@domain.com   |

  Scenario: TC-LOG-NEG-05 Verify error banner for incorrect password with registered email
    When user enters login email "automation_test_existing@example.com"
    And user enters login password "WrongPassword999!"
    And user clicks the login "Sign In" button
    Then a login server error banner should appear containing "Invalid email or password."

  Scenario: TC-LOG-NEG-06 Verify error banner for non-existent account
    When user enters login email "nonexistent_account_998877@example.com"
    And user enters login password "Password12345!"
    And user clicks the login "Sign In" button
    Then a login server error banner should appear containing "Invalid email or password."
