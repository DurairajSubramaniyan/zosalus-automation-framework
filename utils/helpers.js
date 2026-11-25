require('dotenv').config();
const { testUserManager } = require('./TestUserManager');

/**
 * Generates a unique standardized email for Zosalus DEV registration tests:
 * Format: zosalus.patient.{uniqueId}@{TEST_EMAIL_DOMAIN}
 * @param {string} [testKey='login-patient']
 * @returns {string}
 */
function generateRandomEmail(testKey = 'login-patient') {
  const patient = testUserManager.generatePatient(testKey);
  return patient.email;
}

/**
 * Returns the configured common DEV test patient password from .env (TEST_PATIENT_PASSWORD)
 * @returns {string}
 */
function generateValidPassword() {
  return testUserManager.getCommonPassword();
}

module.exports = {
  generateRandomEmail,
  generateValidPassword,
};
