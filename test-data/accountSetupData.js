/**
 * Test data definitions for Account Creation, Login, and Profile Setup workflows.
 */
module.exports = {
  validProfile: {
    firstName: 'Sarah',
    lastName: 'Connor',
    phoneNumber: '5552345678',
    preferredContact: 'Email',
    address: {
      street: '100 Congress Ave',
      unit: 'Apt 4B',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
    },
  },

  minimalProfile: {
    firstName: 'Alex',
    lastName: 'Morgan',
    phoneNumber: '5559876543',
  },

  edgeCaseProfiles: {
    specialCharacterNames: {
      firstName: "Jean-Luc",
      lastName: "O'Connor",
      phoneNumber: '5553334444',
    },
    longName: {
      firstName: 'Christopher-Alexander',
      lastName: 'Montgomery-Fitzgerald',
      phoneNumber: '5558889999',
    },
    alphanumericUsername: {
      usernameSuffix: '_vet2026',
    },
  },

  errorMessages: {
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    phoneRequired: 'Phone number is required',
    usernameRequired: 'Username is required',
    invalidLogin: 'Invalid email or password.',
    userCreatedToast: 'User created successfully. Please check your email for the verification link.',
  },
};
