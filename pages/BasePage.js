/**
 * BasePage provides reusable actions and common operations using CSS selectors.
 */
class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a relative or absolute URL
   * @param {string} path
   */
  async navigate(path = '') {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Click an element identified by a CSS selector
   * @param {string} cssSelector
   */
  async click(cssSelector) {
    await this.page.locator(cssSelector).waitFor({ state: 'visible' });
    await this.page.locator(cssSelector).click();
  }

  /**
   * Fill an input field identified by a CSS selector
   * @param {string} cssSelector
   * @param {string} text
   */
  async fill(cssSelector, text) {
    await this.page.locator(cssSelector).waitFor({ state: 'visible' });
    await this.page.locator(cssSelector).fill(text);
  }

  /**
   * Clear and fill an input field
   * @param {string} cssSelector
   * @param {string} text
   */
  async clearAndFill(cssSelector, text) {
    await this.page.locator(cssSelector).waitFor({ state: 'visible' });
    await this.page.locator(cssSelector).clear();
    await this.page.locator(cssSelector).fill(text);
  }

  /**
   * Get text content from an element identified by CSS selector
   * @param {string} cssSelector
   * @returns {Promise<string>}
   */
  async getText(cssSelector) {
    await this.page.locator(cssSelector).waitFor({ state: 'visible' });
    const text = await this.page.locator(cssSelector).textContent();
    return text ? text.trim() : '';
  }

  /**
   * Get input value from an element
   * @param {string} cssSelector
   * @returns {Promise<string>}
   */
  async getInputValue(cssSelector) {
    return await this.page.locator(cssSelector).inputValue();
  }

  /**
   * Get attribute value of an element
   * @param {string} cssSelector
   * @param {string} attributeName
   * @returns {Promise<string|null>}
   */
  async getAttribute(cssSelector, attributeName) {
    return await this.page.locator(cssSelector).getAttribute(attributeName);
  }

  /**
   * Check if an element is visible
   * @param {string} cssSelector
   * @param {number} [timeout=3000]
   * @returns {Promise<boolean>}
   */
  async isVisible(cssSelector, timeout = 3000) {
    try {
      await this.page.locator(cssSelector).waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for a CSS selector to be in a given state ('visible', 'hidden', 'attached')
   * @param {string} cssSelector
   * @param {'visible'|'hidden'|'attached'|'detached'} state
   * @param {number} [timeout=5000]
   */
  async waitForSelector(cssSelector, state = 'visible', timeout = 5000) {
    await this.page.locator(cssSelector).waitFor({ state, timeout });
  }

  /**
   * Get count of matching elements for a CSS selector
   * @param {string} cssSelector
   * @returns {Promise<number>}
   */
  async getElementCount(cssSelector) {
    return await this.page.locator(cssSelector).count();
  }

  /**
   * Take screenshot
   * @param {string} name
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }
}

module.exports = BasePage;
