# Zosalus Test Automation Framework (Playwright + JavaScript + BDD Cucumber)

A complete, production-grade test automation framework built for the **Zosalus** application using **Playwright** with **JavaScript**, **BDD Gherkin Feature Files** (`playwright-bdd`), following the **Page Object Model (POM)** design pattern with **strict CSS selectors**.

---

## 📁 Framework Architecture

```
Zosalus/
├── .env                               # Environment configuration (Base URL, timeouts, etc.)
├── .env.example                       # Template for environment settings
├── .gitignore                         # Files excluded from git
├── package.json                       # Dependencies and execution scripts
├── playwright.config.js               # Playwright configuration with BDD support
├── jsconfig.json                      # VS Code JavaScript editor configuration
├── features/
│   ├── signup.feature                 # 🥒 Signup Gherkin Feature file
│   ├── login.feature                  # 🥒 Login Gherkin Feature file
│   ├── forgotPassword.feature         # 🥒 Forgot & Reset Password Gherkin Feature file
│   └── step_definitions/
│       ├── signupSteps.js             # ✍️ Signup BDD Step definitions
│       ├── loginSteps.js              # ✍️ Login BDD Step definitions
│       └── forgotPasswordSteps.js     # ✍️ Forgot Password BDD Step definitions
├── fixtures/
│   ├── testFixture.js                 # Custom Playwright-BDD test fixture injecting Page Objects
│   └── testFixture.d.ts               # Type definitions for custom fixtures & autocomplete
├── pages/
│   ├── BasePage.js                    # Base page with reusable CSS selector actions
│   ├── SignupPage.js                  # Signup Page Object Model (100% CSS selectors)
│   ├── LoginPage.js                   # Login Page Object Model (100% CSS selectors)
│   └── ForgotPasswordPage.js          # Forgot & Reset Password Page Object Model (100% CSS)
├── test-data/
│   ├── signupData.js                  # Test datasets for signup scenarios
│   ├── loginData.js                   # Test datasets for login scenarios
│   └── forgotPasswordData.js          # Test datasets for forgot password scenarios
└── utils/
    └── helpers.js                     # Test utilities (dynamic email generator, helpers)
```

---

## ✍️ How You Write New Tests

You only ever touch two files when adding or updating test cases:
1. **Plain English scenarios** in [`features/*.feature`](file:///Users/durairaj/Desktop/Zosalus/features/signup.feature)
2. **JavaScript glue code** in [`features/step_definitions/*.js`](file:///Users/durairaj/Desktop/Zosalus/features/step_definitions/signupSteps.js) calling Page Object methods in [`pages/`](file:///Users/durairaj/Desktop/Zosalus/pages/)

---

## 🥒 Gherkin Feature File (`features/signup.feature`)

```gherkin
@signup
Feature: Zosalus Signup Page Automation

  Background:
    Given user navigates to the Signup page

  # Positive Scenarios
  @positive @ui @smoke
  Scenario: TC-POS-01 Verify all Signup page UI elements are loaded and visible
    Then the page title should display "Create your account"
    And the Email input field should be visible
    And the Password input field should be visible
    And the Confirm Password input field should be visible
    And the "Continue with Google" button should be visible
    And the "Continue with Apple" button should be visible
    And the "Create Account" submit button should be visible
    ...

  # Negative Scenarios
  @negative @validation
  Scenario: TC-NEG-01 Verify validation errors on empty form submission
    When user clicks the Create Account button without entering any details
    Then the email error message should be "Please enter your email address"
    And the password error message should be "Password must be at least 10 characters"
    And the confirm password error message should be "Please confirm your password"
    And the email input should show error red border
    ...
```

---

## 🎯 Test Scenarios Covered

### 🟢 Positive Scenarios
| Test ID | Scenario Description |
|---|---|
| **TC-POS-01** | Verify all Signup page UI elements (heading, inputs, SSO buttons, labels, submit button) are loaded and visible |
| **TC-POS-02** | Verify show/hide password toggle button changes input type (`password` ↔ `text`) for both fields |
| **TC-POS-03** | Verify successful user registration with valid credentials and redirection to `/login` |
| **TC-POS-04** | Verify user registration with boundary password (exactly 10 characters with 1 number) |
| **TC-POS-05** | Verify navigation to the "Sign in" page from the signup footer link |

### 🔴 Negative Scenarios
| Test ID | Scenario Description |
|---|---|
| **TC-NEG-01** | Verify validation errors on submitting an empty form (checks all 3 field messages & red border styling) |
| **TC-NEG-02** | Verify validation error when Email is omitted but passwords are provided |
| **TC-NEG-03a**| Verify validation error for invalid email: missing `@` symbol (`invalidemailformat.com`) |
| **TC-NEG-03b**| Verify validation error for invalid email: missing domain (`user@`) |
| **TC-NEG-03c**| Verify validation error for invalid email: missing username (`@domain.com`) |
| **TC-NEG-03d**| Verify validation error for invalid email: spaces in email (`user name@domain.com`) |
| **TC-NEG-04** | Verify validation error when password is shorter than 10 characters |
| **TC-NEG-05** | Verify validation error when password has 10+ characters but contains no number |
| **TC-NEG-06** | Verify validation error when Confirm Password does not match Password |
| **TC-NEG-07** | Verify validation error when Confirm Password field is left blank |
| **TC-NEG-08** | Verify server banner alert for duplicate account registration with an existing email |

---

## 🎨 Strictly CSS Selectors Used

All selectors adhere strictly to CSS:
- **Email Input**: `input#email`
- **Password Input**: `input#password`
- **Confirm Password Input**: `input#confirmPassword`
- **Password Toggle**: `div.relative:has(> input#password) > button[type="button"]`
- **Confirm Password Toggle**: `div.relative:has(> input#confirmPassword) > button[type="button"]`
- **Submit Button**: `form.space-y-4 button[type="submit"]`
- **Google SSO**: `div.space-y-3 > button:nth-of-type(1)`
- **Apple SSO**: `div.space-y-3 > button:nth-of-type(2)`
- **Field Error Messages**: `form.space-y-4 > div:nth-of-type(n) p.text-error-red`
- **Field Error Border**: `input#email.border-error-red`
- **Server Banner Alert**: `div.bg-red-50, div.text-error-red.font-medium`
- **Sign In Link**: `a.text-vital-green[href="/login"]`

---

## 🚀 How to Run the Tests

### 1. Run all BDD Feature tests (headless):
```bash
npm test
```

### 2. Run BDD tests with browser open (headed):
```bash
npm run test:headed
```

### 3. Run with Interactive Playwright UI mode:
```bash
npm run test:ui
```

### 4. Run tests by Cucumber tags:
```bash
npx bddgen && npx playwright test --grep "@smoke"
npx bddgen && npx playwright test --grep "@negative"
```

### 5. View the HTML Test Report:
```bash
npm run test:report
```
