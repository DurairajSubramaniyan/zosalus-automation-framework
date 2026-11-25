const { testUserManager } = require('./TestUserManager');

console.log('==============================================================');
console.log('📊 ZOSALUS LOCAL SQLITE TEST USER DATABASE (database/zosalus-test.db)');
console.log('==============================================================');

const users = testUserManager.getAllPatients();

if (users.length === 0) {
  console.log('No patient accounts saved yet. Run "npm run test:signup:persist" first.');
} else {
  console.table(users);
}
