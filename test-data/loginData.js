const loginData = {
  positive: {
    standardUser: {
      email: 'valid_user@example.com',
      password: 'ValidPassword123!',
    },
  },

  negative: {
    emptyFields: {
      email: '',
      password: '',
      expectedEmailError: 'Please enter your email address',
      expectedPasswordError: 'Please enter your password',
    },
    missingEmail: {
      email: '',
      password: 'ValidPassword123!',
      expectedEmailError: 'Please enter your email address',
    },
    missingPassword: {
      email: 'valid_user@example.com',
      password: '',
      expectedPasswordError: 'Please enter your password',
    },
    invalidEmails: [
      {
        description: 'missing @ symbol',
        email: 'invalidemailformat.com',
      },
      {
        description: 'missing domain',
        email: 'user@',
      },
      {
        description: 'missing username',
        email: '@domain.com',
      },
      {
        description: 'spaces in email',
        email: 'user name@domain.com',
      },
    ],
    invalidCredentials: {
      nonExistentUser: {
        email: 'nonexistent_account_98765@example.com',
        password: 'RandomPassword123!',
        expectedBanner: 'Invalid email or password.',
      },
      wrongPassword: {
        email: 'automation_test_existing@example.com',
        password: 'IncorrectPassword999!',
        expectedBanner: 'Invalid email or password.',
      },
    },
  },
};

module.exports = loginData;
