Feature: Patient Sign In, Session Persistence, and Route Guard Regression Suite
  As a registered Zosalus pet parent
  I want the Sign In page to authenticate valid credentials, reject invalid inputs, and maintain or terminate sessions securely
  So that my pet health records remain protected across reloads, navigation, and logout

  Background:
    Given the regression user opens the Zosalus Sign In page

  Scenario: RG-SIGNIN-01 Verify successful sign in with an active registered patient account from SQLite
    When the regression user enters a valid registered patient email and password from SQLite on the Sign In form
    And the regression user clicks the Sign In submit button
    Then the regression user should be authenticated and directed to the Zosalus patient portal

  Scenario: RG-SIGNIN-02 Verify sign in with an unverified email account succeeds and displays email verification reminder
    When the regression user signs in with an unverified patient account from SQLite
    Then the regression user should be authenticated and directed to the Zosalus patient portal
    And the portal should show the email verification status indicator for the signed-in account

  Scenario: RG-SIGNIN-03 Verify required field validation errors when submitting Sign In with empty email and password
    When the regression user clicks the Sign In submit button with empty credentials
    Then the Sign In email field should display a required field validation error
    And the Sign In password field should display a required field validation error

  Scenario: RG-SIGNIN-04 Verify validation error when submitting Sign In with empty password only
    When the regression user enters a valid registered patient email and leaves password blank on the Sign In form
    And the regression user clicks the Sign In submit button
    Then the Sign In password field should display a required field validation error

  Scenario: RG-SIGNIN-05 Verify validation error when submitting Sign In with malformed email address
    When the regression user enters malformed email "not-an-email-address" and password "Zosalus!123" on the Sign In form
    And the regression user clicks the Sign In submit button
    Then the Sign In email field should display an invalid email validation error

  Scenario: RG-SIGNIN-06 Verify authentication rejection banner when signing in with an unregistered email address
    When the regression user enters an unregistered patient email and password "Zosalus!123" on the Sign In form
    And the regression user clicks the Sign In submit button
    Then the Sign In page should display an invalid credentials error alert and remain on the Sign In route

  Scenario: RG-SIGNIN-07 Verify authentication rejection banner when signing in with a valid email and wrong password
    When the regression user enters a valid registered patient email with wrong password "WrongPassword!999" on the Sign In form
    And the regression user clicks the Sign In submit button
    Then the Sign In page should display an invalid credentials error alert and remain on the Sign In route

  Scenario: RG-SIGNIN-08 Verify case-insensitive email handling during patient Sign In
    When the regression user enters a valid registered patient email in uppercase characters with valid password on the Sign In form
    And the regression user clicks the Sign In submit button
    Then the regression user should be authenticated and directed to the Zosalus patient portal

  Scenario: RG-SIGNIN-09 Verify Sign In password visibility toggle button switches input between masked and plain text
    When the regression user types password "Zosalus!123" into the Sign In password field
    Then the Sign In password field type attribute should be "password"
    When the regression user clicks the password show hide toggle button on the Sign In form
    Then the Sign In password field type attribute should be "text"
    When the regression user clicks the password show hide toggle button on the Sign In form
    Then the Sign In password field type attribute should be "password"

  Scenario: RG-SIGNIN-10 Verify authenticated patient session persists across a hard browser page reload
    When the regression user signs into the portal with a valid registered account
    And the regression user performs a hard page reload in the browser
    Then the regression user should remain authenticated inside the patient portal without being redirected to Sign In

  Scenario: RG-SIGNIN-11 Verify authenticated patient session persists across internal navigation between Dashboard, Health Records, and Account Settings
    When the regression user signs into the portal with a valid registered account
    And the regression user navigates sequentially across Dashboard, Health Records, Conditions and Episodes, and Account Settings
    Then each protected portal route should render cleanly without losing the authenticated session

  Scenario: RG-SIGNIN-12 Verify signing out clears session storage and redirects to Sign In
    When the regression user signs into the portal with a valid registered account
    And the regression user signs out from the patient portal
    Then the browser should redirect to the Sign In page

  Scenario: RG-SIGNIN-13 Verify unauthenticated access to protected routes redirects to Sign In
    When the unauthenticated regression user attempts to open protected route "/health-records" directly
    Then the browser should redirect the unauthenticated user to the Sign In page

  Scenario: RG-SIGNIN-14 Verify clicking browser Back button after signing out does not restore protected portal access
    When the regression user signs into the portal with a valid registered account
    And the regression user signs out from the patient portal
    And the regression user clicks the browser Back button after logout
    Then the regression user should remain gated by authentication and not regain access to protected data
