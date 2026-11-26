const {
  generateFeatureScenarioReport,
} = require('./generateFeatureScenarioReport');

/**
 * Custom Playwright Reporter that automatically regenerates the Master-Detail
 * Feature -> Scenario HTML dashboard after every test run and syncs it to Jenkins.
 */
class ZosalusFeatureReporter {
  onEnd() {
    try {
      generateFeatureScenarioReport();
    } catch (err) {
      console.error('Failed to generate Zosalus Feature Scenario Report:', err);
    }
  }
}

module.exports = ZosalusFeatureReporter;
