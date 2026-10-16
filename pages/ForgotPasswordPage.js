const BasePage = require('./BasePage');

/**
 * ForgotPasswordPage encapsulates all elements and actions for the Zosalus Forgot/Reset Password page.
 * Supports both Stage 1 (Request Reset Code) and Stage 2 (OTP & Password Reset from screenshot).
 * Strictly uses CSS selectors for all locators.
 */
class ForgotPasswordPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // ==========================================
    // CSS SELECTORS ONLY
    // ==========================================
    this.selectors = {
      // Common Elements
      pageHeading: 'h1',
      subtitle: 'h1 + div.text-stone',
      form: 'form',

      // Stage 1 - Email Request
      emailInput: 'input#email',
      emailLabel: 'label[for="email"]',
      sendResetCodeBtn: 'form button[type="submit"]',
      rememberPasswordText: 'div:has(> a[href="/login"])',
      signInLink: 'a[href="/login"]',

      // Stage 2 - 6-Character OTP & New Password (From User Screenshot)
      otpInput: 'input#otp',
      otpLabel: 'label[for="otp"]',
      newPasswordInput: 'input#new-password',
      confirmPasswordInput: 'input#confirm-password',
      newPasswordToggleBtn: 'div.relative:has(> input#new-password) button[type="button"]',
      confirmPasswordToggleBtn: 'div.relative:has(> input#confirm-password) button[type="button"]',
      passwordHelperText: 'p.text-xs.text-stone.mt-1',
      codeSentBanner: 'p.text-mid-green',
      resendButton: 'button:has-text("Resend")',
      resetPasswordBtn: 'button[type="submit"]',

      // Error messages / Banners
      errorBanner: 'div.bg-red-50, div.text-error-red, p.text-error-red',
    };
  }

  /**
   * Navigate to the Forgot Password page
   */
  async open() {
    await this.navigate('/forgot-password');
    await this.waitForSelector(this.selectors.form, 'visible');
  }

  /**
   * Fill Email field in Stage 1
   * @param {string} email
   */
  async fillEmail(email) {
    await this.clearAndFill(this.selectors.emailInput, email);
  }

  /**
   * Click Send Reset Code button
   */
  async clickSendResetCode() {
    await this.click(this.selectors.sendResetCodeBtn);
  }

  /**
   * Fill 6-character OTP reset code
   * @param {string} otp
   */
  async fillOtp(otp) {
    await this.clearAndFill(this.selectors.otpInput, otp);
  }

  /**
   * Fill New Password
   * @param {string} newPassword
   */
  async fillNewPassword(newPassword) {
    await this.clearAndFill(this.selectors.newPasswordInput, newPassword);
  }

  /**
   * Fill Confirm Password
   * @param {string} confirmPassword
   */
  async fillConfirmPassword(confirmPassword) {
    await this.clearAndFill(this.selectors.confirmPasswordInput, confirmPassword);
  }

  /**
   * Click Reset Password submit button
   */
  async clickResetPassword() {
    await this.click(this.selectors.resetPasswordBtn);
  }

  /**
   * Toggle New Password visibility
   */
  async toggleNewPasswordVisibility() {
    await this.click(this.selectors.newPasswordToggleBtn);
  }

  /**
   * Toggle Confirm Password visibility
   */
  async toggleConfirmPasswordVisibility() {
    await this.click(this.selectors.confirmPasswordToggleBtn);
  }

  /**
   * Get attribute 'type' of new password input
   * @returns {Promise<string|null>}
   */
  async getNewPasswordType() {
    return await this.getAttribute(this.selectors.newPasswordInput, 'type');
  }

  /**
   * Get attribute 'type' of confirm password input
   * @returns {Promise<string|null>}
   */
  async getConfirmPasswordType() {
    return await this.getAttribute(this.selectors.confirmPasswordInput, 'type');
  }

  /**
   * Click the "Sign in" link to go back to login
   */
  async clickSignIn() {
    await this.click(this.selectors.signInLink);
  }

  /**
   * Get alert or error message banner
   * @returns {Promise<string>}
   */
  async getErrorMessage() {
    if (await this.isVisible(this.selectors.errorBanner, 4000)) {
      return await this.getText(this.selectors.errorBanner);
    }
    return '';
  }

  /**
   * Check if Stage 2 (OTP code screen) is visible
   * @returns {Promise<boolean>}
   */
  async isOtpScreenVisible() {
    return await this.isVisible(this.selectors.otpInput, 6000);
  }
}

module.exports = ForgotPasswordPage;
