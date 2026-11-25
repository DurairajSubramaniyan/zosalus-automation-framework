const { testUserManager } = require('./TestUserManager');
require('dotenv').config();

/**
 * Syncs local SQLite database (database/zosalus-test.db) with the live Zosalus backend API
 * (https://zosalus-backend-api.onrender.com/api/v1) for all saved test_users:
 * - Exact number of registered pets (`has_pet` and `pet_count`) from GET /api/v1/animals
 * - All pet names (`pet_name`, comma-separated e.g. "Bruno, Luna, Max")
 * - All pet species (`pet_species`, comma-separated e.g. "Dog, Cat, Dog")
 * - All pet IDs (`pet_id`, comma-separated)
 * - Owner first_name, last_name, and subscription_tier ('free' or 'companion') from GET /api/v1/users/me
 */
async function syncAllUsersWithServer() {
  const apiBase =
    process.env.API_BASE_URL ||
    'https://zosalus-backend-api.onrender.com/api/v1';
  const password = testUserManager.getCommonPassword();
  const users = testUserManager.getAllPatients();

  console.log(
    `🔄 Syncing ${users.length} users in database/zosalus-test.db with live Zosalus API (${apiBase})...`
  );

  for (const user of users) {
    try {
      const loginRes = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password }),
      });

      if (!loginRes.ok) {
        console.log(
          `⚠️ Login failed for ${user.email}: HTTP ${loginRes.status}`
        );
        continue;
      }

      const loginJson = await loginRes.json();
      const token =
        loginJson?.data?.tokens?.accessToken ||
        loginJson?.data?.accessToken ||
        loginJson?.tokens?.accessToken ||
        loginJson?.accessToken ||
        loginJson?.token ||
        loginJson?.data?.token;
      const userObj =
        loginJson?.data?.user || loginJson?.user || loginJson?.data || {};

      if (!token) {
        console.log(`⚠️ No token found for ${user.email}`);
        continue;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const [animalsRes, meRes] = await Promise.all([
        fetch(`${apiBase}/animals`, { headers }).catch(() => null),
        fetch(`${apiBase}/users/me`, { headers }).catch(() => null),
      ]);

      const animalsJson =
        animalsRes && animalsRes.ok ? await animalsRes.json() : null;
      const meJson = meRes && meRes.ok ? await meRes.json() : null;

      // Extract animals array from GET /api/v1/animals
      let animalsList = [];
      const rawAnimals = animalsJson?.data ?? animalsJson;
      if (Array.isArray(rawAnimals)) {
        animalsList = rawAnimals;
      } else if (Array.isArray(rawAnimals?.animals)) {
        animalsList = rawAnimals.animals;
      } else if (Array.isArray(rawAnimals?.pets)) {
        animalsList = rawAnimals.pets;
      } else if (Array.isArray(rawAnimals?.items)) {
        animalsList = rawAnimals.items;
      }

      const petCount = animalsList.length;
      const petNames = animalsList
        .map(a => a.name || a.petName || 'Unnamed')
        .filter(Boolean)
        .join(', ');
      const petSpecies = animalsList
        .map(a => a.species || a.petSpecies || 'Unknown')
        .filter(Boolean)
        .join(', ');
      const petIds = animalsList
        .map(a => a.id || a._id || a.animalId)
        .filter(Boolean)
        .join(', ');

      if (petCount > 0) {
        testUserManager.markPatientHasPet(user.email, {
          petName: petNames,
          petSpecies: petSpecies,
          petId: petIds,
          petCount: petCount,
          replace: true,
        });
      } else {
        testUserManager.db
          .prepare(
            'UPDATE test_users SET has_pet = 0, pet_count = 0, pet_name = NULL, pet_species = NULL, pet_id = NULL WHERE LOWER(email) = ?'
          )
          .run(user.email.toLowerCase());
      }

      const profileObj =
        meJson?.data?.user || meJson?.data || meJson || userObj;
      if (profileObj?.firstName || profileObj?.lastName) {
        testUserManager.db
          .prepare(
            'UPDATE test_users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name) WHERE LOWER(email) = ?'
          )
          .run(
            profileObj.firstName || null,
            profileObj.lastName || null,
            user.email.toLowerCase()
          );
      }

      const subTier =
        profileObj?.subscriptionTier ||
        profileObj?.tier ||
        profileObj?.plan ||
        userObj?.subscriptionTier ||
        null;

      if (subTier) {
        const normalizedTier = String(subTier)
          .toLowerCase()
          .includes('companion')
          ? 'companion'
          : 'free';
        testUserManager.updatePatientSubscriptionTier(
          user.email,
          normalizedTier
        );
      } else if (petCount > 1) {
        testUserManager.updatePatientSubscriptionTier(user.email, 'companion');
      }
    } catch (err) {
      console.log(`⚠️ Error syncing ${user.email}:`, err.message);
    }
  }

  // Checkpoint WAL so DB Browser for SQLite immediately sees all updated rows
  testUserManager.db.pragma('wal_checkpoint(TRUNCATE)');

  console.log('\n✅ SQLite database synced with live server! Current state:');
  console.table(testUserManager.getAllPatients());
}

syncAllUsersWithServer().catch(err => {
  console.error('❌ Error syncing SQLite database:', err);
  process.exit(1);
});
