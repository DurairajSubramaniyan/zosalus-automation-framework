Feature: Patient Account Registration and Email Verification Regression Suite
  As a new pet parent visiting Zosalus
  I want the signup page to validate email, password, and confirm password rules thoroughly
  So that my account is created securely and prompts for email verification upon first portal login

  Background:
    Given the regression user opens the Zosalus Signup page

  Scenario: RG-SIGNUP-01 Verify successful registration with valid unique email and matching compliant password
    When the regression user enters a newly generated unique patient email on the signup form
    And the regression user enters password "Zosalus!123" and confirm password "Zosalus!123" on the signup form
    And the regression user clicks the Create Account submit button on the signup form
    Then the regression user should be redirected from signup to the Login page with a registration success notification
    And the newly registered regression account should be persisted in the local SQLite test database

  Scenario: RG-SIGNUP-02 Verify newly registered unverified user sees Verify your email REQUIRED banner after first login
    When the regression user registers a fresh unverified patient account and logs into the portal
    Then the portal should display the "Verify your email" banner with badge "REQUIRED"
    And the email verification banner should display the "Resend Link" button and "Settings" navigation link

  Scenario: RG-SIGNUP-03 Verify validation error messages when submitting an empty signup form
    When the regression user clicks the Create Account submit button on the signup form without entering any fields
    Then the signup email field should show a required validation error
    And the signup password field should show a required validation error
    And the signup confirm password field should show a required validation error

  Scenario: RG-SIGNUP-04 Verify validation error when email is missing the domain separator symbol
    When the regression user enters email "invalidpatientemail.com" on the signup form
    And the regression user enters password "Zosalus!123" and confirm password "Zosalus!123" on the signup form
    And the regression user clicks the Create Account submit button on the signup form
    Then the signup email field should show an invalid email format error message

  Scenario: RG-SIGNUP-05 Verify validation error when email has an incomplete top-level domain
    When the regression user enters an incomplete domain email address on the signup form
    And the regression user enters password "Zosalus!123" and confirm password "Zosalus!123" on the signup form
    And the regression user clicks the Create Account submit button on the signup form
    Then the signup email field should show an invalid email format error message

  Scenario: RG-SIGNUP-06 Verify server error banner when registering with an already registered email address
    When the regression user enters an existing active patient email from the SQLite database on the signup form
    And the regression user enters password "Zosalus!123" and confirm password "Zosalus!123" on the signup form
    And the regression user clicks the Create Account submit button on the signup form
    Then the signup page should display a duplicate account error alert and remain on the signup route

  Scenario: RG-SIGNUP-07 Verify password validation error when password is shorter than 8 characters
    When the regression user enters a newly generated unique patient email on the signup form
    And the regression user enters password "Zos!12" and confirm password "Zos!12" on the signup form
    And the regression user clicks the Create Account submit button on the signup form
    Then the signup password field should show a minimum length validation error

  Scenario: RG-SIGNUP-08 Verify password validation error when password lacks an uppercase character
    When the regression user enters a newly generated unique patient email on the signup form
    And the regression user enters password "zosalus!123" and confirm password "zosalus!123" on the signup form
    And the regression user clicks the Create Account submit button on the signup form
    Then the signup password field should show a complexity validation error

  Scenario: RG-SIGNUP-09 Verify password validation error when password lacks a lowercase character
    When the regression user enters a newly generated unique patient email on the signup form
    And the regression user enters password "ZOSALUS!123" and confirm password "ZOSALUS!123" on the signup form
    And the regression user clicks the Create Account submit button on the signup form
    Then the signup password field should show a complexity validation error

  Scenario: RG-SIGNUP-10 Verify password validation error when password lacks a numeric digit
    When the regression user enters a newly generated unique patient email on the signup form
    And the regression user enters password "ZosalusPassword!" and confirm password "ZosalusPassword!" on the signup form
    And the regression user clicks the Create Account submit button on the signup form
    Then the signup password field should show a complexity validation error

  Scenario: RG-SIGNUP-11 Verify password validation error when password lacks a special character
    When the regression user enters a newly generated unique patient email on the signup form
    And the regression user enters password "Zosalus12345" and confirm password "Zosalus12345" on the signup form
    And the regression user clicks the Create Account submit button on the signup form
    Then the signup password field should show a complexity validation error

  Scenario: RG-SIGNUP-12 Verify confirm password validation error when password and confirm password do not match
    When the regression user enters a newly generated unique patient email on the signup form
    And the regression user enters password "Zosalus!123" and confirm password "Zosalus!999" on the signup form
    And the regression user clicks the Create Account submit button on the signup form
    Then the signup confirm password field should show a password mismatch error message

  Scenario: RG-SIGNUP-13 Verify password and confirm password visibility toggle buttons unmask and re-mask inputs
    When the regression user enters password "Zosalus!123" and confirm password "Zosalus!123" on the signup form
    Then the signup password input type should be "password" and confirm password input type should be "password"
    When the regression user toggles both password and confirm password visibility buttons on the signup form
    Then the signup password input type should be "text" and confirm password input type should be "text"
    When the regression user toggles both password and confirm password visibility buttons on the signup form
    Then the signup password input type should be "password" and confirm password input type should be "password"

  Scenario: RG-SIGNUP-14 Verify leading and trailing whitespace in email is trimmed and whitespace-only password fails
    When the regression user enters a patient email with surrounding whitespace on the signup form
    And the regression user enters password "        " and confirm password "        " on the signup form
    And the regression user clicks the Create Account submit button on the signup form
    Then the signup password field should show a complexity or required validation error
