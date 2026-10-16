const signupData = {
  positive: {
    standardUser: {
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    },
    boundary10CharPassword: {
      password: 'Pass123456', // Exactly 10 chars, has numbers
      confirmPassword: 'Pass123456',
    },
    complexPassword: {
      password: 'V3ry$tr0ng!P@ssw0rd#2026',
      confirmPassword: 'V3ry$tr0ng!P@ssw0rd#2026',
    },
    emailWithSubaddress: {
      emailPrefix: 'pet_owner+care',
      password: 'ValidPassword2026!',
      confirmPassword: 'ValidPassword2026!',
    },
  },

  negative: {
    emptyFields: {
      email: '',
      password: '',
      confirmPassword: '',
      expectedError: 'Required field',
    },
    missingEmail: {
      email: '',
      password: 'ValidPassword123!',
      confirmPassword: 'ValidPassword123!',
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
    missingPassword: {
      email: 'valid_user@example.com',
      password: '',
      confirmPassword: '',
    },
    shortPassword: {
      password: 'Pass1', // less than 10 characters
      confirmPassword: 'Pass1',
      expectedRequirement: 'Must be at least 10 characters',
    },
    passwordWithoutNumber: {
      password: 'PasswordWithoutAnyNumber', // 10+ chars but no numbers
      confirmPassword: 'PasswordWithoutAnyNumber',
      expectedRequirement: 'contain at least 1 number',
    },
    passwordMismatch: {
      password: 'FirstPassword123!',
      confirmPassword: 'DifferentPassword123!',
      expectedError: 'Passwords do not match',
    },
    missingConfirmPassword: {
      password: 'ValidPassword123!',
      confirmPassword: '',
    },
  },
};

module.exports = signupData;
