Feature: Free Plan Onboarding, Full Subscription Content Validation, Locked Companion Features, and Second Pet Upgrade Gate
  As a brand-new Zosalus Pet Parent on the Free Plan
  I want to register a new account, log in, complete my profile setup, and verify every Free Plan experience with and without a pet
  So that all Free Tier and Companion Plan content, locked Trends and Insurance & Billing gates, and the second-pet Companion upgrade gate are validated end-to-end

  Scenario: RG-FREE-01 Create a new user, complete profile setup, and validate full Free Tier and Companion Plan content on Subscription and Plan Comparison pages
    Given a brand-new Free plan user creates an account, logs in, and completes dynamic profile setup
    When the Free plan user navigates to the Subscription and Plans page
    Then the My Subscription tab should display full expected Free Tier active plan and add-on content for 0 registered pets
    When the Free plan user switches to the Plan Comparison tab
    Then the Plan Comparison header and billing toggles should match all expected content
    And the Free Tier plan card should display all expected pricing, description, feature bullets, and Stay on Free button
    And the Companion Plan card should display all expected Annual billing pricing, 15-day free trial badges, feature bullets, and Upgrade CTA
    When the Free plan user toggles to Monthly Billing on Plan Comparison
    Then the Companion Plan card should update to display Monthly Billing pricing at $9.99 per month
    And the Feature-by-Feature Comparison table should display all expected rows, Free Tier limits, Companion Plan benefits, and Permanent Health Record Guarantee

  Scenario: RG-FREE-02 End-to-end Free Plan lifecycle without a pet, with 1 pet, and verifying Companion upgrade gate when attempting to add a 2nd pet
    Given a brand-new Free plan user creates an account, logs in, and completes dynamic profile setup
    Then the Free plan user with 0 pets should see the empty-pet sidebar, Dashboard empty state, and locked Trends and Insurance & Billing navigation items
    And Account Settings should display the Free plan badge and "Free Plan · 1 pet slot" billing summary
    When the Free plan user registers 1 dynamic pet on the Free plan
    Then the sidebar should display 1 active pet profile with the pet's saved name and breed while keeping Trends and Insurance & Billing locked
    And the My Subscription tab should reflect Free Tier active status with 1 of 1 living pet registered
    When the Free plan user attempts to add a second pet on the Free plan
    Then the Add Pet route should display the complete Companion upgrade gate content blocking the second pet

  Scenario: RG-FREE-03 Free Plan without adding a pet validates all portal empty-state content and verifies Trends and Insurance & Billing are locked
    Given a brand-new Free plan user creates an account, logs in, and completes dynamic profile setup
    Then the Free plan sidebar without a pet should display "No Pets Added", "Register a pet to unlock full health logs", and "Add First Pet"
    And the Dashboard page without a pet should display full expected empty-state content and the unverified email notice
    And the Health Records page without a pet should display full expected empty-state content
    And the Conditions and Episodes page without a pet should display full expected 0-count summary cards and empty-state content
    And the Documents page without a pet should display full expected Document Library empty-state content
    And both "Trends" and "Insurance & Billing" sidebar links should display the Companion Feature lock icon
    When the Free plan user clicks the locked "Trends" sidebar link
    Then the Health Trends page should display the complete Companion Tier Feature lock screen content
    When the Free plan user clicks the locked "Insurance & Billing" sidebar link
    Then the Insurance and Billing page should display the complete Companion Plan Exclusive lock screen content

  Scenario: RG-FREE-04 Free Plan with 1 registered pet validates active Free Plan content across portal and verifies Trends and Insurance & Billing remain locked
    Given a brand-new Free plan user creates an account, logs in, and completes dynamic profile setup
    When the Free plan user registers 1 dynamic pet on the Free plan
    Then the sidebar should display 1 active pet profile with the pet's saved name and breed while keeping Trends and Insurance & Billing locked
    And Account Settings should display the dynamic owner profile, the Free plan badge, and "Free Plan · 1 pet slot" billing summary
    And the My Subscription tab should reflect Free Tier active status with 1 of 1 living pet registered
    And both "Trends" and "Insurance & Billing" sidebar links should display the Companion Feature lock icon
    When the Free plan user clicks the locked "Trends" sidebar link
    Then the Health Trends page should display the complete Companion Tier Feature lock screen content
    When the Free plan user clicks the locked "Insurance & Billing" sidebar link
    Then the Insurance and Billing page should display the complete Companion Plan Exclusive lock screen content

  Scenario: RG-FREE-05 Free Plan user with 1 pet attempting to add a 2nd pet validates all Companion upgrade gate content, Stay on Free, and Upgrade navigation
    Given a brand-new Free plan user creates an account, logs in, and completes dynamic profile setup
    When the Free plan user registers 1 dynamic pet on the Free plan
    And the Free plan user attempts to add a second pet on the Free plan
    Then the Add Pet route should display the complete Companion upgrade gate content blocking the second pet
    When the Free plan user clicks "Stay on Free" on the second pet upgrade gate
    Then the Free plan user should return to the portal without upgrading and remain on the Free plan
    When the Free plan user attempts to add a second pet on the Free plan
    And the Free plan user clicks "Upgrade to Companion (15-Day Free Trial)" on the second pet upgrade gate
    Then the browser should navigate to the Subscription Plan Comparison view displaying both Free Tier and Companion Plan full content
