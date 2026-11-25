/**
 * Stripe Checkout Test Card Scenarios and Companion Plan Test Data for Zosalus
 */
module.exports = {
  billingOwner: {
    cardholderName: 'Eleanor Vance',
    country: 'IN',
    postalCode: '78701',
  },

  secondPet: {
    name: 'Luna',
    species: 'Cat',
    breed: 'Siamese',
    birthdate: '08/10/2024',
    sex: 'Female',
    neuterStatus: 'Neutered / Spayed',
    colorMarkings: 'Cream body with seal brown points',
    microchipNumber: '985112004561239',
  },

  stripeTestCards: {
    standardSuccess: {
      scenario: 'Standard Success',
      cardNumber: '4242 4242 4242 4242',
      expiry: '12/28',
      cvc: '123',
      expectedOutcome: 'Success (trialing / active)',
    },
    cardDeclined: {
      scenario: 'Card Declined',
      cardNumber: '4000 0000 0000 0002',
      expiry: '12/28',
      cvc: '123',
      expectedOutcome: 'Generic decline (card_declined)',
      expectedErrorPattern: /declined/i,
    },
    insufficientFunds: {
      scenario: 'Insufficient Funds',
      cardNumber: '4000 0000 0000 0127',
      expiry: '12/28',
      cvc: '123',
      expectedOutcome: 'Fails with insufficient_funds',
      expectedErrorPattern: /insufficient funds|declined/i,
    },
    expiredCard: {
      scenario: 'Expired Card',
      cardNumber: '4000 0000 0000 0069',
      expiry: '12/28',
      cvc: '123',
      expectedOutcome: 'Fails with expired_card',
      expectedErrorPattern: /expired|declined/i,
    },
    incorrectCvc: {
      scenario: 'Incorrect CVC',
      cardNumber: '4000 0000 0000 0119',
      expiry: '12/28',
      cvc: '123',
      expectedOutcome: 'Fails with incorrect_cvc',
      expectedErrorPattern: /security code|cvc|declined/i,
    },
    threeDSecureOtp: {
      scenario: '3D Secure OTP',
      cardNumber: '4000 0000 0000 3155',
      expiry: '12/28',
      cvc: '123',
      expectedOutcome: 'Prompts 3DS authentication modal',
    },
  },
};
