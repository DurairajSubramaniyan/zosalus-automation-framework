const BasePage = require('./BasePage');

/**
 * AccountSetupPage encapsulates elements and interactions on the Zosalus Profile Setup page (/account-setup).
 * Strictly uses CSS selectors for all locators.
 */
class AccountSetupPage extends BasePage {
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
      subtitle: 'div:has-text("Quick setup"), p:has-text("Quick setup")',
      form: 'form',

      // Profile Photo
      profilePhotoContainer: 'div.rounded-full',
      profilePhotoUploadBtn: 'button:has(> svg)',

      // Required Input Fields
      firstNameInput: 'input#firstName',
      lastNameInput: 'input#lastName',
      emailInput: 'input#email',
      countryCodeBtn: 'div:has(> input#phoneNumber) button',
      phoneNumberInput: 'input#phoneNumber',
      usernameInput: 'input#username',

      // Preferred Contact Method Radio Inputs & Labels
      prefContactPhoneRadio: 'input#setup-pref-phone',
      prefContactTextRadio: 'input#setup-pref-text',
      prefContactEmailRadio: 'input#setup-pref-email',
      prefContactPhoneLabel: 'label[for="setup-pref-phone"]',
      prefContactTextLabel: 'label[for="setup-pref-text"]',
      prefContactEmailLabel: 'label[for="setup-pref-email"]',

      // Optional Home Address Fields
      addressLine1Input: 'input#addressLine1',
      addressLine2Input: 'input#addressLine2',
      cityInput: 'input#city',
      stateInput: 'input#state',
      zipInput: 'input#zip',

      // Emergency Contacts
      addEmergencyContactBtn: 'button:has-text("Add Contact")',
      addEmergencyContactLink: 'button:has-text("Add an emergency contact")',

      // Preferences Dropdowns / Buttons
      timezoneBtn: 'button#timezone',
      languageBtn: 'button#language',

      // Form Action Buttons
      saveAndContinueBtn: 'form button[type="submit"]',
      skipForNowBtn: 'button:has-text("Skip for now")',

      // Validation Errors
      firstNameError: 'p:has-text("First name is required")',
      lastNameError: 'p:has-text("Last name is required")',
      phoneNumberError: 'p:has-text("Phone number is required")',
      usernameError: 'p:has-text("Username is required")',
      generalErrors: 'p.text-error-red, p[class*="text-error-red"]',

      // Success Toast Alert on Login Page
      loginSuccessToast: 'li[data-type="success"] div[data-title], div[data-title*="User created successfully"]',

      // Next Page Elements (/add-pet)
      addPetHeader: 'h1, h2:has-text("Add Pet")',
      addPetTitle: 'h2:has-text("Tell us about your pet")',
      petNameInput: 'input[placeholder*="Luna"], input#petName, input[name="petName"]',
      continueBtn: 'button:has-text("Continue")',
    };
  }

  /**
   * Navigate directly to Account Setup page
   */
  async open() {
    await this.navigate('/account-setup');
  }

  /**
   * Wait for Account Setup page form to be visible
   */
  async waitForPageLoaded() {
    await this.page.locator(this.selectors.firstNameInput).waitFor({ state: 'visible', timeout: 25000 });
  }

  /**
   * Get page heading text
   * @returns {Promise<string>}
   */
  async getHeadingText() {
    return await this.getText(this.selectors.pageHeading);
  }

  /**
   * Get page subtitle text
   * @returns {Promise<string>}
   */
  async getSubtitleText() {
    return await this.getText(this.selectors.subtitle);
  }

  /**
   * Fill First Name field
   * @param {string} firstName
   */
  async fillFirstName(firstName) {
    await this.clearAndFill(this.selectors.firstNameInput, firstName);
  }

  /**
   * Fill Last Name field
   * @param {string} lastName
   */
  async fillLastName(lastName) {
    await this.clearAndFill(this.selectors.lastNameInput, lastName);
  }

  /**
   * Get Email field value
   * @returns {Promise<string>}
   */
  async getEmailValue() {
    return await this.getAttribute(this.selectors.emailInput, 'value');
  }

  /**
   * Fill Phone Number field
   * @param {string} phone
   */
  async fillPhoneNumber(phone) {
    await this.clearAndFill(this.selectors.phoneNumberInput, phone);
  }

  /**
   * Fill Username field
   * @param {string} username
   */
  async fillUsername(username) {
    await this.clearAndFill(this.selectors.usernameInput, username);
  }

  /**
   * Select Preferred Contact Method
   * @param {'Phone' | 'SMS / Text' | 'Email'} method
   */
  async selectPreferredContactMethod(method) {
    const methodLower = method.toLowerCase();
    if (methodLower.includes('phone')) {
      await this.click(this.selectors.prefContactPhoneLabel);
    } else if (methodLower.includes('sms') || methodLower.includes('text')) {
      await this.click(this.selectors.prefContactTextLabel);
    } else if (methodLower.includes('email')) {
      await this.click(this.selectors.prefContactEmailLabel);
    }
  }

  /**
   * Fill Address fields
   * @param {Object} address
   * @param {string} address.street
   * @param {string} [address.unit]
   * @param {string} address.city
   * @param {string} address.state
   * @param {string} address.zip
   */
  async fillAddress({ street, unit, city, state, zip }) {
    if (street) await this.clearAndFill(this.selectors.addressLine1Input, street);
    if (unit) await this.clearAndFill(this.selectors.addressLine2Input, unit);
    if (city) await this.clearAndFill(this.selectors.cityInput, city);
    if (state) await this.clearAndFill(this.selectors.stateInput, state);
    if (zip) await this.clearAndFill(this.selectors.zipInput, zip);
  }

  /**
   * Click Save & Continue submit button
   */
  async clickSaveAndContinue() {
    await this.click(this.selectors.saveAndContinueBtn);
  }

  /**
   * Click Skip for now button
   */
  async clickSkipForNow() {
    await this.click(this.selectors.skipForNowBtn);
  }

  /**
   * Check if First Name error is visible
   * @returns {Promise<boolean>}
   */
  async isFirstNameErrorVisible() {
    return await this.isVisible(this.selectors.firstNameError, 3000);
  }

  /**
   * Check if Last Name error is visible
   * @returns {Promise<boolean>}
   */
  async isLastNameErrorVisible() {
    return await this.isVisible(this.selectors.lastNameError, 3000);
  }

  /**
   * Check if Phone Number error is visible
   * @returns {Promise<boolean>}
   */
  async isPhoneNumberErrorVisible() {
    return await this.isVisible(this.selectors.phoneNumberError, 3000);
  }

  /**
   * Check if Username error is visible
   * @returns {Promise<boolean>}
   */
  async isUsernameErrorVisible() {
    return await this.isVisible(this.selectors.usernameError, 3000);
  }

  /**
   * Check if input has error border CSS class
   * @param {string} inputSelector
   * @returns {Promise<boolean>}
   */
  async hasErrorBorder(inputSelector) {
    const input = this.page.locator(inputSelector);
    const classes = (await input.getAttribute('class')) || '';
    return classes.includes('border-error-red') || classes.includes('border-red');
  }
}

module.exports = AccountSetupPage;
