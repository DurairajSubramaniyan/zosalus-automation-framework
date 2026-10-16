const BasePage = require('./BasePage');

/**
 * SignupPage encapsulates all elements and actions for the Zosalus Signup page.
 * Strictly uses CSS selectors for all locators.
 */
class SignupPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // ==========================================
    // CSS SELECTORS ONLY
    // ==========================================
    this.selectors = {
      // Main Page Elements
      pageHeading: 'h1.text-2xl',
      form: 'form.space-y-4',

      // Input Fields
      emailInput: 'input#email',
      passwordInput: 'input#password',
      confirmPasswordInput: 'input#confirmPassword',

      // Field Labels
      emailLabel: 'label[for="email"]',
      passwordLabel: 'label[for="password"]',
      confirmPasswordLabel: 'label[for="confirmPassword"]',

      // Toggle Password Visibility Buttons
      passwordToggleBtn: 'div.relative:has(> input#password) > button[type="button"]',
      confirmPasswordToggleBtn: 'div.relative:has(> input#confirmPassword) > button[type="button"]',

      // Helper Text
      passwordHelperText: 'p.text-xs.text-stone.mt-1',
      termsNoticeText: 'p.text-xs.pt-1',

      // Action Buttons
      submitButton: 'form.space-y-4 button[type="submit"]',
      googleSignUpButton: 'div.space-y-3 > button:nth-of-type(1)',
      appleSignUpButton: 'div.space-y-3 > button:nth-of-type(2)',

      // Field Validation Error Messages
      emailError: 'form.space-y-4 > div:nth-of-type(1) p.text-error-red',
      passwordError: 'form.space-y-4 > div:nth-of-type(2) p.text-error-red',
      confirmPasswordError: 'form.space-y-4 > div:nth-of-type(3) p.text-error-red',

      // General / Server Alert Banner
      serverErrorBanner: 'div.bg-red-50, div.text-error-red.font-medium',

      // Navigation Links
      logoLink: 'a[aria-label="Zosalus Home"]',
      signInLink: 'a.text-vital-green[href="/login"]',
      termsLink: 'a[href*="#terms"]',
      privacyLink: 'a[href*="#privacy"]',
    };
  }

  /**
   * Navigate to the Signup page
   */
  async open() {
    const signupPath = process.env.SIGNUP_PATH || '/signup';
    await this.navigate(signupPath);
    await this.waitForSelector(this.selectors.form, 'visible');
  }

  /**
   * Fill the Email field
   * @param {string} email
   */
  async fillEmail(email) {
    await this.clearAndFill(this.selectors.emailInput, email);
  }

  /**
   * Fill the Password field
   * @param {string} password
   */
  async fillPassword(password) {
    await this.clearAndFill(this.selectors.passwordInput, password);
  }

  /**
   * Fill the Confirm Password field
   * @param {string} confirmPassword
   */
  async fillConfirmPassword(confirmPassword) {
    await this.clearAndFill(this.selectors.confirmPasswordInput, confirmPassword);
  }

  /**
   * Fill all signup form fields in one call
   * @param {string} email
   * @param {string} password
   * @param {string} confirmPassword
   */
  async fillRegistrationForm(email, password, confirmPassword) {
    if (email !== undefined) await this.fillEmail(email);
    if (password !== undefined) await this.fillPassword(password);
    if (confirmPassword !== undefined) await this.fillConfirmPassword(confirmPassword);
  }

  /**
   * Click the Create Account submit button
   */
  async submit() {
    await this.click(this.selectors.submitButton);
  }

  /**
   * Toggle visibility of the password field
   */
  async togglePasswordVisibility() {
    await this.click(this.selectors.passwordToggleBtn);
  }

  /**
   * Toggle visibility of the confirm password field
   */
  async toggleConfirmPasswordVisibility() {
    await this.click(this.selectors.confirmPasswordToggleBtn);
  }

  /**
   * Get current type attribute of password input ('password' or 'text')
   * @returns {Promise<string|null>}
   */
  async getPasswordType() {
    return await this.getAttribute(this.selectors.passwordInput, 'type');
  }

  /**
   * Get current type attribute of confirm password input ('password' or 'text')
   * @returns {Promise<string|null>}
   */
  async getConfirmPasswordType() {
    return await this.getAttribute(this.selectors.confirmPasswordInput, 'type');
  }

  /**
   * Click the "Sign in" link
   */
  async clickSignIn() {
    await this.click(this.selectors.signInLink);
  }

  /**
   * Get email field error message
   * @returns {Promise<string>}
   */
  async getEmailErrorMessage() {
    if (await this.isVisible(this.selectors.emailError, 2000)) {
      return await this.getText(this.selectors.emailError);
    }
    return '';
  }

  /**
   * Get password field error message
   * @returns {Promise<string>}
   */
  async getPasswordErrorMessage() {
    if (await this.isVisible(this.selectors.passwordError, 2000)) {
      return await this.getText(this.selectors.passwordError);
    }
    return '';
  }

  /**
   * Get confirm password field error message
   * @returns {Promise<string>}
   */
  async getConfirmPasswordErrorMessage() {
    if (await this.isVisible(this.selectors.confirmPasswordError, 2000)) {
      return await this.getText(this.selectors.confirmPasswordError);
    }
    return '';
  }

  /**
   * Get server/banner error message (e.g., existing account)
   * @returns {Promise<string>}
   */
  async getServerErrorMessage() {
    if (await this.isVisible(this.selectors.serverErrorBanner, 4000)) {
      return await this.getText(this.selectors.serverErrorBanner);
    }
    return '';
  }

  /**
   * Check if email input has error CSS styling (border-error-red)
   * @returns {Promise<boolean>}
   */
  async isEmailInputInErrorState() {
    return await this.isVisible('input#email.border-error-red', 2000);
  }

  /**
   * Check if password input has error CSS styling
   * @returns {Promise<boolean>}
   */
  async isPasswordInputInErrorState() {
    return await this.isVisible('input#password.border-error-red', 2000);
  }

  /**
   * Check if confirm password input has error CSS styling
   * @returns {Promise<boolean>}
   */
  async isConfirmPasswordInErrorState() {
    return await this.isVisible('input#confirmPassword.border-error-red', 2000);
  }
}

module.exports = SignupPage;
