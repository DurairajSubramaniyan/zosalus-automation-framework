const BasePage = require('./BasePage');

/**
 * LoginPage encapsulates all elements and actions for the Zosalus Login page.
 * Strictly uses CSS selectors for all locators.
 */
class LoginPage extends BasePage {
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
      pageHeading: 'h1',
      subtitle: 'h1 + div.text-stone',
      form: 'form',

      // Input Fields
      emailInput: 'input#email',
      passwordInput: 'input#password',

      // Field Labels
      emailLabel: 'label[for="email"]',
      passwordLabel: 'label[for="password"]',

      // Password Visibility Toggle Button
      passwordToggleBtn: 'button[aria-label*="password"], button.absolute.inset-y-0.right-0',

      // Action Buttons
      submitButton: 'form button[type="submit"]',
      googleSignInButton: 'button:has-text("Continue with Google")',
      appleSignInButton: 'button:has-text("Continue with Apple")',

      // Navigation Links
      forgotPasswordLink: 'a[href="/forgot-password"]',
      createAccountLink: 'a[href="/signup"]',

      // Validation Error Messages
      emailError: 'div:has(> input#email) + p.text-error-red',
      passwordError: 'div:has(> input#password) + p.text-error-red',

      // Server / Alert Error Banner
      serverErrorBanner: 'div.bg-red-50.text-error-red, div.text-error-red.font-medium',
    };
  }

  /**
   * Navigate to the Login page
   */
  async open() {
    const loginPath = process.env.LOGIN_PATH || '/login';
    await this.navigate(loginPath);
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
   * Fill both login credentials
   * @param {string} email
   * @param {string} password
   */
  async fillLoginForm(email, password) {
    if (email !== undefined) await this.fillEmail(email);
    if (password !== undefined) await this.fillPassword(password);
  }

  /**
   * Click the Sign In submit button
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
   * Get current type attribute of password input ('password' or 'text')
   * @returns {Promise<string|null>}
   */
  async getPasswordType() {
    return await this.getAttribute(this.selectors.passwordInput, 'type');
  }

  /**
   * Click the "Forgot password?" link
   */
  async clickForgotPassword() {
    await this.click(this.selectors.forgotPasswordLink);
  }

  /**
   * Click the "Create one" link
   */
  async clickCreateAccount() {
    await this.click(this.selectors.createAccountLink);
  }

  /**
   * Get email field validation error message
   * @returns {Promise<string>}
   */
  async getEmailErrorMessage() {
    if (await this.isVisible(this.selectors.emailError, 2000)) {
      return await this.getText(this.selectors.emailError);
    }
    return '';
  }

  /**
   * Get password field validation error message
   * @returns {Promise<string>}
   */
  async getPasswordErrorMessage() {
    if (await this.isVisible(this.selectors.passwordError, 2000)) {
      return await this.getText(this.selectors.passwordError);
    }
    return '';
  }

  /**
   * Get server/banner error message (e.g. Invalid email or password)
   * @returns {Promise<string>}
   */
  async getServerErrorMessage() {
    if (await this.isVisible(this.selectors.serverErrorBanner, 10000)) {
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
   * Check if password input has error CSS styling (border-error-red)
   * @returns {Promise<boolean>}
   */
  async isPasswordInputInErrorState() {
    return await this.isVisible('input#password.border-error-red', 2000);
  }
}

module.exports = LoginPage;
