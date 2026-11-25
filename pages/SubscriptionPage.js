const BasePage = require('./BasePage');

/**
 * SubscriptionPage encapsulates all elements and actions for:
 * 1. Account Settings (/account) Free plan badge check
 * 2. Second Pet Upgrade Gate on /add-pet ("Adding a second animal requires Companion")
 * 3. Subscription & Plans page (/subscription?tab=plans and /subscription)
 * 4. Stripe Hosted Checkout (checkout.stripe.com/c/pay or checkout.stripe.com/g/pay iframe)
 *    payment form, error messages, 3DS modal, and success redirect (/subscription/success)
 */
class SubscriptionPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.selectors = {
      // Sidebar Add Second Pet (+) button
      addAnotherPetSidebarBtn: 'button[aria-label="Add another pet profile"]',

      // Account Settings (/account)
      freePlanBadge: 'span:has-text("Free plan")',
      companionPlanBadge: 'span:has-text("Companion")',

      // Second Pet Upgrade Gate on /add-pet (Screenshot 2)
      secondPetGateHeading:
        'h4:has-text("Adding a second animal requires Companion"), h3:has-text("Adding a second animal requires Companion")',
      secondPetGateDescription:
        'p:has-text("The Free tier includes 1 active pet profile.")',
      stayOnFreeGateBtn: 'button:has-text("Stay on Free")',
      upgradeToCompanionGateBtn:
        'button:has-text("Upgrade to Companion (15-Day Free Trial)")',

      // Subscription & Plans Page (/subscription?tab=plans - Screenshot 3)
      mySubscriptionTab: 'button:has-text("My Subscription")',
      planComparisonTab: 'button:has-text("Plan Comparison")',
      plansHeading:
        'h2:has-text("Choose the right care plan for your animal family")',
      monthlyBillingToggle: 'button:has-text("Monthly Billing")',
      annualBillingToggle: 'button:has-text("Annual Billing")',
      freeTierCardHeading: 'h3:has-text("Free Tier")',
      companionPlanCardHeading: 'h3:has-text("Companion Plan")',
      upgradeToCompanionPlanBtn:
        'button:has-text("Upgrade to Companion"), button:has-text("Start 15-Day Free Trial")',

      // Stripe Hosted Checkout Page (direct or inside checkout.stripe.com/g/pay iframe - Screenshot 4)
      stripeCardNumberInput:
        'input#cardNumber, input[name="cardNumber"], input[autocomplete="cc-number"], input[aria-label="Card number"]',
      stripeCardExpiryInput:
        'input#cardExpiry, input[name="cardExpiry"], input[autocomplete="cc-exp"], input[aria-label*="Expiration"]',
      stripeCardCvcInput:
        'input#cardCvc, input[name="cardCvc"], input[autocomplete="cc-csc"], input[aria-label="Security code"]',
      stripeBillingNameInput:
        'input#billingName, input[name="billingName"], input[autocomplete="cc-name"], input[aria-label="Name on card"]',
      stripeBillingCountrySelect:
        'select#billingCountry, select[name="billingCountry"], select[aria-label="Country"]',
      stripeBillingPostalInput:
        'input#billingPostalCode, input[name="billingPostalCode"], input[autocomplete="postal-code"], input[aria-label*="ZIP"], input[aria-label*="Postal"]',
      stripeSubmitBtn:
        'button[type="submit"].SubmitButton, button[data-testid="hosted-payment-submit-button"], button:has-text("Start trial"), button:has-text("Subscribe"), form button[type="submit"]',
      stripeErrorText:
        '[role="alert"], .FieldError, .Notice--error, div[class*="Error"], span[class*="Error"]',

      // Post-Checkout Success Page (/subscription/success)
      welcomeCompanionHeading: 'h1:has-text("Welcome to Zosalus Companion!")',
      companionTierActiveBadge: 'span:has-text("Companion Tier Active")',
      goToDashboardBtn: 'button:has-text("Go to Dashboard")',
    };
  }

  /**
   * Resolve the Frame (or top-level Page) that renders the Stripe Checkout form inputs.
   * Stripe Global Checkout (/g/pay/cs_test_...) renders the checkout form inside a child iframe,
   * whereas Standard Checkout (/c/pay/cs_test_...) renders it in the main frame.
   * @param {number} [timeoutMs=30000]
   * @returns {Promise<import('@playwright/test').Page | import('@playwright/test').Frame>}
   */
  async getStripeCheckoutFrame(timeoutMs = 30000) {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      for (const frame of this.page.frames()) {
        const cardInput = frame
          .locator(this.selectors.stripeCardNumberInput)
          .first();
        const isVisible = await cardInput
          .isVisible({ timeout: 300 })
          .catch(() => false);
        if (isVisible) {
          return frame;
        }
      }
      await this.page.waitForTimeout(400);
    }

    throw new Error(
      `Stripe Checkout card input did not become visible within ${timeoutMs}ms on ${this.page.url()}`
    );
  }

  /**
   * Navigate to Account Settings (/account)
   */
  async openAccountSettings() {
    await this.navigate('/account');
    await this.page.waitForURL('**/account', { timeout: 15000 });
  }

  /**
   * Trigger adding a second pet via the sidebar "+" button or navigating to /add-pet
   */
  async triggerAddSecondPet() {
    const plusBtn = this.page
      .locator(this.selectors.addAnotherPetSidebarBtn)
      .first();
    if (await plusBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await plusBtn.evaluate(el => el.click());
    } else {
      await this.navigate('/add-pet');
    }
    await this.page.waitForURL('**/add-pet', { timeout: 15000 });
  }

  /**
   * Click "Upgrade to Companion (15-Day Free Trial) →" on the /add-pet second-animal gate
   */
  async clickUpgradeFromSecondPetGate() {
    const btn = this.page
      .locator(this.selectors.upgradeToCompanionGateBtn)
      .first();
    await btn.waitFor({ state: 'visible', timeout: 15000 });
    await btn.click();
    await this.page.waitForURL('**/subscription**', { timeout: 15000 });
  }

  /**
   * Click "Upgrade to Companion →" on /subscription?tab=plans and wait for Stripe Hosted Checkout to load
   */
  async clickUpgradeOnPlansPageAndWaitForStripe() {
    await this.page
      .locator(this.selectors.companionPlanCardHeading)
      .first()
      .waitFor({
        state: 'visible',
        timeout: 15000,
      });

    const upgradeBtn = this.page
      .locator('button:has-text("Upgrade to Companion")')
      .first();
    await upgradeBtn.waitFor({ state: 'visible', timeout: 10000 });
    await upgradeBtn.click();

    await this.page.waitForURL(
      url =>
        url.hostname.includes('checkout.stripe.com') ||
        url.pathname.includes('/subscription/success'),
      { timeout: 45000 }
    );

    if (this.page.url().includes('checkout.stripe.com')) {
      await this.getStripeCheckoutFrame(35000);
    }
  }
}

module.exports = SubscriptionPage;
