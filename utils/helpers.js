/**
 * Generates a unique random email for registration tests
 * @param {string} prefix
 * @returns {string}
 */
function generateRandomEmail(prefix = 'testuser') {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  return `${prefix}_${timestamp}_${randomSuffix}@example.com`;
}

/**
 * Generates a valid password meeting requirements (10+ characters, at least 1 number)
 * @returns {string}
 */
function generateValidPassword() {
  return `TestPass12345!`;
}

module.exports = {
  generateRandomEmail,
  generateValidPassword,
};
