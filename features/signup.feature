@signup
Feature: Zosalus Signup Page

  Background:
    Given user navigates to the Signup page
  # ========================================================
  # POSITIVE SCENARIOS
  # ========================================================

  Scenario: TC-POS-01 Verify all Signup page UI elements are loaded and visible
    Then the page title should display "Create your account"
    And the Email input field should be visible
    And the Password input field should be visible
    And the Confirm Password input field should be visible
    And the "Continue with Google" button should be visible
    And the "Continue with Apple" button should be visible
    And the "Create Account" submit button should be visible
    And the password requirement helper text should be "Must be at least 10 characters and contain at least 1 number."
    And the "Sign in" link should be visible

  Scenario: TC-POS-02 Verify show and hide password toggle functionality
    When user inspects the password fields
    Then the password field type should be "password"
    And the confirm password field type should be "password"
    When user clicks the password visibility toggle
    Then the password field type should be "text"
    When user clicks the password visibility toggle again
    Then the password field type should be "password"
    When user clicks the confirm password visibility toggle
    Then the confirm password field type should be "text"
    When user clicks the confirm password visibility toggle again
    Then the confirm password field type should be "password"

  Scenario: TC-POS-03 Verify successful registration with valid credentials
    When user enters a unique valid email
    And user enters password "SecureP@ss12345!"
    And user enters confirm password "SecureP@ss12345!"
    And user clicks the "Create Account" button
    Then the signup API should return status code 201
    And user should be redirected to the login page

  Scenario: TC-POS-04 Verify registration with boundary password of exactly 10 characters and 1 number
    When user enters a unique valid email
    And user enters password "Pass123456"
    And user enters confirm password "Pass123456"
    And user clicks the "Create Account" button
    Then the signup API should return status code 201
    And user should be redirected to the login page

  Scenario: TC-POS-05 Verify navigation to Sign In page
    When user clicks the "Sign in" link
    Then user should be navigated to the login page
  # ========================================================
  # NEGATIVE SCENARIOS
  # ========================================================

  Scenario: TC-NEG-01 Verify validation errors on empty form submission
    When user clicks the Create Account button without entering any details
    Then the email error message should be "Please enter your email address"
    And the password error message should be "Password must be at least 10 characters"
    And the confirm password error message should be "Please confirm your password"
    And the email input should show error red border
    And the password input should show error red border
    And the confirm password input should show error red border

  Scenario: TC-NEG-02 Verify error when email is omitted
    When user enters password "ValidPassword123!"
    And user enters confirm password "ValidPassword123!"
    And user clicks the "Create Account" button
    Then the email error message should be "Please enter your email address"
    And the email input should show error red border

  Scenario Outline: TC-NEG-03 Verify error for invalid email format (<description>)
    When user enters email "<invalid_email>"
    And user enters password "ValidPassword123!"
    And user enters confirm password "ValidPassword123!"
    And user clicks the "Create Account" button
    Then the email error message should be "Please enter a valid email address"
    And the email input should show error red border

    Examples:
      | description      | invalid_email          |
      | missing @ symbol | invalidemailformat.com |
      | missing domain   | user@                  |
      | missing username | @domain.com            |
      | spaces in email  | user name@domain.com   |

  Scenario: TC-NEG-04 Verify error when password is shorter than 10 characters
    When user enters a unique valid email
    And user enters password "Short1"
    And user enters confirm password "Short1"
    And user clicks the "Create Account" button
    Then the password error message should be "Password must be at least 10 characters"
    And the password input should show error red border

  Scenario: TC-NEG-05 Verify error when password contains no numbers
    When user enters a unique valid email
    And user enters password "PasswordWithoutAnyNumber"
    And user enters confirm password "PasswordWithoutAnyNumber"
    And user clicks the "Create Account" button
    Then the password error message should be "Password must include at least 1 number"
    And the password input should show error red border

  Scenario: TC-NEG-06 Verify error when passwords do not match
    When user enters a unique valid email
    And user enters password "ValidPassword123!"
    And user enters confirm password "MismatchPassword456!"
    And user clicks the "Create Account" button
    Then the confirm password error message should be "Passwords do not match"
    And the confirm password input should show error red border

  Scenario: TC-NEG-07 Verify error when confirm password is blank
    When user enters a unique valid email
    And user enters password "ValidPassword123!"
    And user clicks the "Create Account" button
    Then the confirm password error message should be "Please confirm your password"
    And the confirm password input should show error red border

  Scenario: TC-NEG-08 Verify duplicate registration error for already registered email
    When user enters existing registered email "automation_test_existing@example.com"
    And user enters password "ValidPassword123!"
    And user enters confirm password "ValidPassword123!"
    And user clicks the "Create Account" button
    Then a server error banner should appear containing "An account with this email already exists. Please log in instead."
