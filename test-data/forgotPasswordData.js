const forgotPasswordData = {
  validEmail: 'durairaj3330@gmail.com',
  newPassword: 'SecureP@ssw0rd123!',
  mismatchPassword: 'DifferentPassword456!',
  invalidOtp: '8F2A9K',
  expectedTexts: {
    pageTitle: 'Reset your password',
    stage1Subtitle: "Enter your email address and we'll send a 6-character reset code.",
    stage2Subtitle: 'Enter the 6-character code sent to your email and create a new password.',
    passwordHelper: 'Password must be at least 10 characters and contain at least 1 number.',
    rememberPasswordText: 'Remember your password?',
    invalidOtpError: 'Invalid password reset code.',
    passwordMismatchError: 'Passwords do not match',
  },
};

module.exports = forgotPasswordData;
