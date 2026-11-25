Feature: Companion Plan Subscription Gates, Stripe Checkout Card Matrix, and Tier Activation Regression Suite
  As a Zosalus Free Tier Pet Parent with one registered pet
  I want all Companion PRO feature gates and Stripe Hosted Checkout card scenarios to function accurately with dynamic billing details
  So that declined, expired, insufficient funds, incorrect CVC, and 3DS cards are handled properly and valid checkout unlocks Companion features

  Scenario: RG-SUB-01 Verify Free plan user with 1 pet sees Free plan badge on Account Settings and second pet gate on Add Pet
    Given a regression Free plan user with one registered pet is retrieved from SQLite and logged in
    When the regression Free plan user opens Account Settings
    Then Account Settings should display the "Free plan" badge in the profile header
    When the regression Free plan user clicks the sidebar add pet button to add a second animal
    Then the Add Pet route should render the upgrade gate heading "Adding a second animal requires Companion"

  Scenario: RG-SUB-02 Verify clicking Stay on Free on the second pet upgrade gate returns the Free user to the portal without upgrading
    Given a regression Free plan user with one registered pet is retrieved from SQLite and logged in
    When the regression Free plan user clicks the sidebar add pet button to add a second animal
    And the regression Free plan user clicks the "Stay on Free" button on the second pet upgrade gate
    Then the user should remain on the Free plan and return to the portal dashboard or pet view

  Scenario: RG-SUB-03 Verify Free plan PRO gate on Trends navigation item in the sidebar
    Given a regression Free plan user with one registered pet is retrieved from SQLite and logged in
    When the regression Free plan user clicks the "Trends" item in the left navigation sidebar
    Then the portal should display a Companion upgrade prompt or PRO feature gate for Trends

  Scenario: RG-SUB-04 Verify Free plan PRO gate on Insurance and Billing navigation item in the sidebar
    Given a regression Free plan user with one registered pet is retrieved from SQLite and logged in
    When the regression Free plan user clicks the "Insurance & Billing" item in the left navigation sidebar
    Then the portal should display a Companion upgrade prompt or PRO feature gate for Insurance and Billing

  Scenario: RG-SUB-05 Verify navigating from the second pet upgrade gate to Plan Comparison displays Free Tier and Companion Plan cards
    Given a regression Free plan user with one registered pet is retrieved from SQLite and logged in
    When the regression Free plan user clicks the sidebar add pet button to add a second animal
    And the regression Free plan user clicks "Upgrade to Companion (15-Day Free Trial)" on the upgrade gate
    Then the Subscription Plans page should display "Choose the right care plan for your animal family"
    And the Plan Comparison view should display both "Free Tier" and "Companion Plan" with 15-day free trial badge

  Scenario: RG-SUB-06 Verify Stripe Hosted Checkout generic decline with card 4000 0000 0000 0002
    Given the regression Free plan user launches a Companion Plan Stripe Hosted Checkout session
    When the regression user enters Stripe card "4000 0000 0000 0002", expiry "12/28", CVC "123", and a dynamically generated cardholder name
    And the regression user clicks Start trial on Stripe Hosted Checkout
    Then Stripe Hosted Checkout should reject the payment with a decline alert for code "card_declined"

  Scenario: RG-SUB-07 Verify Stripe Hosted Checkout rejection for insufficient funds with card 4000 0000 0000 0127
    Given the regression Free plan user launches a Companion Plan Stripe Hosted Checkout session
    When the regression user enters Stripe card "4000 0000 0000 0127", expiry "12/28", CVC "123", and a dynamically generated cardholder name
    And the regression user clicks Start trial on Stripe Hosted Checkout
    Then Stripe Hosted Checkout should reject the payment with a decline alert for code "insufficient_funds"

  Scenario: RG-SUB-08 Verify Stripe Hosted Checkout rejection for expired card with card 4000 0000 0000 0069
    Given the regression Free plan user launches a Companion Plan Stripe Hosted Checkout session
    When the regression user enters Stripe card "4000 0000 0000 0069", expiry "12/28", CVC "123", and a dynamically generated cardholder name
    And the regression user clicks Start trial on Stripe Hosted Checkout
    Then Stripe Hosted Checkout should reject the payment with a decline alert for code "expired_card"

  Scenario: RG-SUB-09 Verify Stripe Hosted Checkout rejection for incorrect CVC with card 4000 0000 0000 0119
    Given the regression Free plan user launches a Companion Plan Stripe Hosted Checkout session
    When the regression user enters Stripe card "4000 0000 0000 0119", expiry "12/28", CVC "123", and a dynamically generated cardholder name
    And the regression user clicks Start trial on Stripe Hosted Checkout
    Then Stripe Hosted Checkout should reject the payment with a decline alert for code "incorrect_cvc"

  Scenario: RG-SUB-10 Verify Stripe Hosted Checkout triggers 3D Secure authentication modal with card 4000 0000 0000 3155
    Given the regression Free plan user launches a Companion Plan Stripe Hosted Checkout session
    When the regression user enters Stripe card "4000 0000 0000 3155", expiry "12/28", CVC "123", and a dynamically generated cardholder name
    And the regression user clicks Start trial on Stripe Hosted Checkout
    Then Stripe Hosted Checkout should display the 3D Secure OTP authentication challenge frame

  Scenario: RG-SUB-11 Verify abandoning or cancelling Stripe Hosted Checkout keeps the user on the Free plan
    Given the regression Free plan user launches a Companion Plan Stripe Hosted Checkout session
    When the regression user navigates back from Stripe Hosted Checkout to Zosalus without completing payment
    Then the user should remain on the Free plan and still see the Companion upgrade gate on Add Pet

  Scenario: RG-SUB-12 Verify Standard Success card 4242 4242 4242 4242 activates Companion Plan and unlocks PRO routes and second pet creation
    Given the regression Free plan user launches a Companion Plan Stripe Hosted Checkout session
    When the regression user enters Stripe card "4242 4242 4242 4242", expiry "12/28", CVC "123", and a dynamically generated cardholder name
    And the regression user clicks Start trial on Stripe Hosted Checkout
    Then the Companion Plan subscription should activate and update the user tier to "companion" in SQLite
    And the Add Pet wizard should be unlocked for adding a second pet without the upgrade gate

  Scenario: RG-SUB-13 Verify an already active Companion Plan subscriber is not gated when visiting Add Pet or Subscription Plans
    Given an active Companion Plan subscriber from SQLite is logged into the Zosalus portal
    When the active Companion subscriber navigates to the Add Pet wizard
    Then the Add Pet Step 1 form should be immediately unlocked without displaying the Free tier upgrade gate
