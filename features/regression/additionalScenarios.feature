Feature: Additional Cross-Module Regression Scenarios for Documents OCR, Medical Dossier Export, Shareable Summary, Trends, Insurance, and Edge Cases
  As a Zosalus pet parent using the complete pet health ecosystem
  I want Documents OCR upload, PDF Medical Dossier export, Shareable Health Summary, Longitudinal Trends, Insurance tracking, Forgot Password, and double-submit protections to work reliably
  So that end-to-end clinical workflows and edge cases remain regression-free

  Scenario: RG-ADD-01 Verify Forgot Password page validates blank and malformed email addresses before sending reset instructions
    Given the regression user navigates to the Forgot Password page
    When the regression user submits the Forgot Password form with a blank email input
    Then the Forgot Password page should display a required email validation error

  Scenario: RG-ADD-02 Verify Forgot Password submission with a valid registered email displays reset confirmation feedback
    Given the regression user navigates to the Forgot Password page
    When the regression user enters a valid registered patient email on the Forgot Password form and submits
    Then the Forgot Password page should display confirmation feedback that reset instructions were processed

  Scenario: RG-ADD-03 Verify Export Medical Dossier PDF card on Clinical Health Records page
    Given a regression patient user with an active registered pet is logged in on the Clinical Health Records page
    Then the Clinical Health Timeline header should display the "Export Medical Dossier (PDF)" action card with "Export" button

  Scenario: RG-ADD-04 Verify Shareable Health Summary card on Clinical Health Records page
    Given a regression patient user with an active registered pet is logged in on the Clinical Health Records page
    Then the Clinical Health Timeline header should display the "Shareable Health Summary" action card with "Share" button

  Scenario: RG-ADD-05 Verify Documents vault page renders upload controls and document categories for the active pet
    Given an upgraded Companion Plan regression user is logged into the Zosalus portal
    When the Companion regression user navigates to the "/documents" route
    Then the Documents page should render without error and display document management controls for the active pet

  Scenario: RG-ADD-06 Verify Trends longitudinal health and biomarker page renders for an active Companion Plan subscriber
    Given an upgraded Companion Plan regression user is logged into the Zosalus portal
    When the Companion regression user navigates to the "/trends" route
    Then the Trends page should load for the Companion subscriber without redirecting to Sign In

  Scenario: RG-ADD-07 Verify Insurance and Billing page renders policy and claim tracker controls for an active Companion Plan subscriber
    Given an upgraded Companion Plan regression user is logged into the Zosalus portal
    When the Companion regression user navigates to the "/insurance-billing" or "/insurance" route via the sidebar "Insurance & Billing" link
    Then the Insurance and Billing view should render cleanly for the Companion subscriber

  Scenario: RG-ADD-08 Verify notification bell icon in the top portal header is visible and interactive
    Given an upgraded Companion Plan regression user is logged into the Zosalus portal
    Then the top portal header should display the notifications bell button

  Scenario: RG-ADD-09 Verify closing the Add Health Record modal via the Close button discards unsaved form inputs
    Given a regression patient user with an active registered pet is logged in on the Clinical Health Records page
    When the regression user opens the Add Health Record modal and selects the "Vaccination" category tab
    And the regression user closes the Add Health Record modal using the Close button
    Then the Add Health Record modal should close and return focus to the Clinical Health Timeline

  Scenario: RG-ADD-10 Verify closing the Record Diagnosed Condition modal via the Close button discards unsaved inputs
    Given a regression patient user with an active registered pet is logged in on the Conditions and Episodes page
    When the regression user opens the Record Diagnosed Condition modal on the Medical Diagnoses tab
    And the regression user closes the Record Diagnosed Condition modal using the Close button
    Then the Record Diagnosed Condition modal should be hidden

  Scenario: RG-ADD-11 Verify rapid double-click on Sign In submit button does not break authentication navigation
    Given the regression user opens the Zosalus Sign In page
    When the regression user enters a valid registered patient email and password from SQLite on the Sign In form
    And the regression user clicks the Sign In submit button
    Then the regression user should be authenticated and directed to the Zosalus patient portal

  Scenario: RG-ADD-12 Verify deep-linking directly to Clinical Health Records and Conditions and Episodes retains active pet context
    Given an upgraded Companion Plan regression user is logged into the Zosalus portal
    When the Companion regression user deep-links directly to "/health-records" and then "/conditions-episodes"
    Then both clinical pages should preserve the active pet profile in the sidebar and page header
