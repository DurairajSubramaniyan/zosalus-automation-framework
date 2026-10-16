@forgot-password
Feature: Zosalus Forgot & Reset Password Flow

  Background:
    Given user navigates to the Forgot Password page

  # ========================================================
  # POSITIVE SCENARIOS
  # ========================================================

  Scenario: TC-FP-POS-01 Verify initial Forgot Password page UI elements (Stage 1)
    Then the forgot password page title should display "Reset your password"
    And the forgot password subtitle should be visible
    And the forgot password Email input field should be visible
    And the "Send Reset Code" button should be visible on forgot password page
    And the "Remember your password? Sign in" link should be visible on forgot password page

  Scenario: TC-FP-POS-02 Verify entering email advances to 6-character reset code OTP screen (Image Flow)
    When user enters email "durairaj3330@gmail.com" on the forgot password page
    And user clicks the "Send Reset Code" button on forgot password page
    Then the 6-character reset code OTP screen should be displayed
    And the prefilled email should be "durairaj3330@gmail.com"
    And the reset screen subtitle should display "Enter the 6-character code sent to your email and create a new password."
    And the 6-character OTP input field should be visible
    And the New Password input field should be visible on reset screen
    And the Confirm Password input field should be visible on reset screen
    And the password requirement helper text on reset screen should be "Password must be at least 10 characters and contain at least 1 number."
    And the "Reset Password" button should be visible on reset screen
    And the Resend code timer button should be visible

  Scenario: TC-FP-POS-03 Verify show and hide password toggle on New Password and Confirm Password fields
    When user enters email "durairaj3330@gmail.com" on the forgot password page
    And user clicks the "Send Reset Code" button on forgot password page
    Then the 6-character reset code OTP screen should be displayed
    When user clicks the new password visibility toggle
    Then the new password field type should be "text"
    When user clicks the new password visibility toggle again
    Then the new password field type should be "password"
    When user clicks the confirm password visibility toggle on reset screen
    Then the confirm password field type on reset screen should be "text"
    When user clicks the confirm password visibility toggle on reset screen again
    Then the confirm password field type on reset screen should be "password"

  Scenario: TC-FP-POS-04 Verify navigation back to Sign In page from Forgot Password
    When user clicks the "Sign in" link on forgot password page
    Then user should be navigated to the login page

  # ========================================================
  # NEGATIVE SCENARIOS
  # ========================================================

  Scenario: TC-FP-NEG-01 Verify error message when password and confirm password do not match
    When user enters email "durairaj3330@gmail.com" on the forgot password page
    And user clicks the "Send Reset Code" button on forgot password page
    Then the 6-character reset code OTP screen should be displayed
    When user enters reset code "8F2A9K"
    And user enters new password "ValidPass123!"
    And user enters confirm password "MismatchPass456!" on reset screen
    And user clicks the "Reset Password" button on reset screen
    Then an error message on reset screen should appear containing "Passwords do not match"

  Scenario: TC-FP-NEG-02 Verify error message with invalid OTP reset code
    When user enters email "durairaj3330@gmail.com" on the forgot password page
    And user clicks the "Send Reset Code" button on forgot password page
    Then the 6-character reset code OTP screen should be displayed
    When user enters reset code "INVALID"
    And user enters new password "ValidPass123!"
    And user enters confirm password "ValidPass123!" on reset screen
    And user clicks the "Reset Password" button on reset screen
    Then an error message on reset screen should appear containing "Invalid password reset code."
