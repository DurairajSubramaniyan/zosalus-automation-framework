const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
require('dotenv').config();

const DB_DIR = path.resolve(__dirname, '..', 'database');
const DB_PATH = path.join(DB_DIR, 'zosalus-test.db');

/**
 * Supported standard test keys for reusable patient accounts across features
 */
const TEST_KEYS = {
  LOGIN: 'login-patient',
  MEDICATION: 'medication-patient',
  REMINDER: 'reminder-patient',
  VACCINATION: 'vaccination-patient',
  HEALTH_RECORD: 'health-record-patient',
};

/**
 * Synthetic patient name pool for DEV environment test accounts
 */
const SYNTHETIC_PATIENTS = {
  'login-patient': { firstName: 'Eleanor', lastName: 'Vance' },
  'medication-patient': { firstName: 'Marcus', lastName: 'Holloway' },
  'reminder-patient': { firstName: 'Clara', lastName: 'Oswald' },
  'vaccination-patient': { firstName: 'Arthur', lastName: 'Pendelton' },
  'health-record-patient': { firstName: 'Julian', lastName: 'Bashir' },
  default: { firstName: 'Jordan', lastName: 'Taylor' },
};

class TestUserManager {
  constructor() {
    this.dbPath = DB_PATH;
    this.db = null;
    this._initDatabase();
  }

  /**
   * Initialize local SQLite database and required tables with WAL concurrency protection
   */
  _initDatabase() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    this.db = new Database(this.dbPath);
    // Prevent race conditions during parallel / multi-worker execution
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('busy_timeout = 5000');
    this.db.pragma('foreign_keys = ON');

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS test_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_key TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        patient_id TEXT,
        role TEXT NOT NULL DEFAULT 'patient',
        account_status TEXT NOT NULL DEFAULT 'ACTIVE',
        created_date TEXT NOT NULL,
        last_updated_date TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS email_sequence (
        id INTEGER PRIMARY KEY CHECK (id IN (1, 2)),
        current_seq INTEGER NOT NULL DEFAULT 0
      );

      INSERT OR IGNORE INTO email_sequence (id, current_seq) VALUES (1, 0);
      INSERT OR IGNORE INTO email_sequence (id, current_seq) VALUES (2, 0);
    `);

    // Ensure email_sequence allows id=2 for the zosalus+test{seq}@gmail.com sequence
    const seqTableSql = this.db
      .prepare(
        "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'email_sequence'"
      )
      .get();
    if (
      seqTableSql &&
      seqTableSql.sql &&
      seqTableSql.sql.includes('CHECK (id = 1)')
    ) {
      this.db.exec(`
        BEGIN IMMEDIATE;
        CREATE TABLE email_sequence_new (
          id INTEGER PRIMARY KEY,
          current_seq INTEGER NOT NULL DEFAULT 0
        );
        INSERT INTO email_sequence_new (id, current_seq) SELECT id, current_seq FROM email_sequence;
        INSERT OR IGNORE INTO email_sequence_new (id, current_seq) VALUES (2, 0);
        DROP TABLE email_sequence;
        ALTER TABLE email_sequence_new RENAME TO email_sequence;
        COMMIT;
      `);
    }

    // Migrate earlier UNIQUE constraint on test_key if present so all created accounts are retained
    const tableSqlRow = this.db
      .prepare(
        "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'test_users'"
      )
      .get();

    if (
      tableSqlRow &&
      tableSqlRow.sql &&
      tableSqlRow.sql.includes('test_key TEXT UNIQUE')
    ) {
      this.db.exec(`
        BEGIN IMMEDIATE;
        CREATE TABLE test_users_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          test_key TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          patient_id TEXT,
          role TEXT NOT NULL DEFAULT 'patient',
          account_status TEXT NOT NULL DEFAULT 'ACTIVE',
          created_date TEXT NOT NULL,
          last_updated_date TEXT NOT NULL
        );
        INSERT INTO test_users_new (id, test_key, first_name, last_name, email, patient_id, role, account_status, created_date, last_updated_date)
        SELECT id, test_key, first_name, last_name, email, patient_id, role, account_status, created_date, last_updated_date FROM test_users;
        DROP TABLE test_users;
        ALTER TABLE test_users_new RENAME TO test_users;
        COMMIT;
      `);
    }

    // Add pet tracking columns (has_pet, pet_count, pet_name, pet_species, pet_id, subscription_tier)
    const columns = this.db
      .prepare('PRAGMA table_info(test_users)')
      .all()
      .map(c => c.name);

    if (!columns.includes('has_pet')) {
      this.db.exec(`
        ALTER TABLE test_users ADD COLUMN has_pet INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE test_users ADD COLUMN pet_name TEXT;
        ALTER TABLE test_users ADD COLUMN pet_species TEXT;
        ALTER TABLE test_users ADD COLUMN pet_id TEXT;
      `);
    }

    if (!columns.includes('pet_count')) {
      this.db.exec(`
        ALTER TABLE test_users ADD COLUMN pet_count INTEGER NOT NULL DEFAULT 0;
      `);
    }

    if (!columns.includes('subscription_tier')) {
      this.db.exec(`
        ALTER TABLE test_users ADD COLUMN subscription_tier TEXT NOT NULL DEFAULT 'free';
      `);
    }

    // Backfill pet_count and has_pet so both reflect the exact number of pets listed in pet_name
    const allRows = this.db.prepare('SELECT * FROM test_users').all();
    for (const r of allRows) {
      if (r.pet_name) {
        const names = r.pet_name
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        const computedCount = Math.max(names.length, r.pet_count || 0, r.has_pet || 0);
        if (r.has_pet !== computedCount || r.pet_count !== computedCount) {
          this.db
            .prepare(
              'UPDATE test_users SET has_pet = ?, pet_count = ? WHERE id = ?'
            )
            .run(computedCount, computedCount, r.id);
        }
      }
    }
  }

  /**
   * Resolve effective test key taking parallel worker isolation into account when configured
   * @param {string} testKey
   * @returns {string}
   */
  resolveTestKey(testKey = TEST_KEYS.LOGIN) {
    const normalized = (testKey || TEST_KEYS.LOGIN).trim().toLowerCase();
    const workerIndex = process.env.TEST_PARALLEL_INDEX;
    if (
      process.env.ISOLATE_PARALLEL_WORKERS === 'true' &&
      workerIndex !== undefined &&
      workerIndex !== '0'
    ) {
      return `${normalized}-worker-${workerIndex}`;
    }
    return normalized;
  }

  /**
   * Read the common DEV test patient password from environment variables (.env).
   * Never stores plaintext passwords in SQLite or logs them.
   * @returns {string}
   */
  getCommonPassword() {
    const password = process.env.TEST_PATIENT_PASSWORD;
    if (!password) {
      throw new Error(
        '[TestUserManager] TEST_PATIENT_PASSWORD is not configured in .env. Please set TEST_PATIENT_PASSWORD in your .env file.'
      );
    }
    return password;
  }

  /**
   * Atomically allocate the next sequence number from SQLite to avoid duplicate emails
   * @param {boolean} [rawNumber=false] If true, uses sequence slot 2 (1, 2, 3...) without zero-padding
   * @returns {string} Formatted uniqueId (e.g., '1', '2' or '001', '002')
   */
  _nextEmailSequenceId(rawNumber = false) {
    const slotId = rawNumber ? 2 : 1;
    const allocateTx = this.db.transaction(() => {
      this.db
        .prepare(
          'UPDATE email_sequence SET current_seq = current_seq + 1 WHERE id = ?'
        )
        .run(slotId);
      const row = this.db
        .prepare('SELECT current_seq FROM email_sequence WHERE id = ?')
        .get(slotId);
      return row.current_seq;
    });

    const seqNum = allocateTx();
    return rawNumber ? String(seqNum) : String(seqNum).padStart(3, '0');
  }

  /**
   * Generate unique patient details and standardized email.
   * Supports TEST_EMAIL_PATTERN (e.g. zosalus+test{seq}@gmail.com) or zosalus.patient.{uniqueId}@{domain}
   *
   * @param {string} [testKey='login-patient']
   * @param {Object} [overrides={}]
   * @returns {Object} Generated patient object (not yet saved as ACTIVE in SQLite)
   */
  generatePatient(testKey = TEST_KEYS.LOGIN, overrides = {}) {
    const effectiveKey = this.resolveTestKey(testKey);
    const domain = (process.env.TEST_EMAIL_DOMAIN || 'gmail.com').trim();
    const pattern = (
      process.env.TEST_EMAIL_PATTERN || 'zosalus+test{seq}@gmail.com'
    ).trim();

    let email = overrides.email;
    if (!email) {
      if (pattern && pattern.includes('{seq}')) {
        const seqId = overrides.uniqueId || this._nextEmailSequenceId(true);
        email = pattern.replace('{seq}', seqId).replace('{domain}', domain);
      } else {
        const uniqueId = overrides.uniqueId || this._nextEmailSequenceId(false);
        email = `zosalus.patient.${uniqueId}@${domain}`;
      }
    }

    const baseProfile =
      SYNTHETIC_PATIENTS[effectiveKey] || SYNTHETIC_PATIENTS.default;
    const firstName =
      overrides.firstName ||
      baseProfile.firstName.charAt(0).toUpperCase() +
        baseProfile.firstName.slice(1);
    const lastName = overrides.lastName || baseProfile.lastName;
    const role = overrides.role || 'patient';
    const now = new Date().toISOString();

    const patient = {
      testKey: effectiveKey,
      firstName,
      lastName,
      email,
      patientId: overrides.patientId || null,
      role,
      accountStatus: 'PENDING_SIGNUP',
      createdDate: now,
      lastUpdatedDate: now,
    };

    this._log('Patient account generated', {
      testKey: patient.testKey,
      email: patient.email,
      firstName: patient.firstName,
      lastName: patient.lastName,
      role: patient.role,
      accountStatus: patient.accountStatus,
    });

    return patient;
  }

  /**
   * Save a successfully registered patient account to SQLite database.
   * Preserves all previously created patient accounts and inserts a new row for each new email.
   *
   * @param {Object} patientData
   * @returns {Object} The persisted row mapped to camelCase
   */
  savePatient(patientData) {
    if (!patientData || !patientData.email) {
      throw new Error(
        '[TestUserManager] Cannot save patient: email is required.'
      );
    }

    const status = (patientData.accountStatus || 'ACTIVE').toUpperCase();
    if (status === 'FAILED' || status === 'PENDING_SIGNUP') {
      this._log(
        'Signup failure or incomplete registration — refusing to save account as ACTIVE',
        {
          testKey: patientData.testKey,
          email: patientData.email,
          accountStatus: status,
        }
      );
      return null;
    }

    const effectiveKey = this.resolveTestKey(
      patientData.testKey || TEST_KEYS.LOGIN
    );
    const firstName = patientData.firstName || 'Jordan';
    const lastName = patientData.lastName || 'Taylor';
    const email = patientData.email.trim().toLowerCase();
    const patientId =
      patientData.patientId || `PAT-DEV-${Date.now().toString().slice(-6)}`;
    const role = patientData.role || 'patient';
    const now = new Date().toISOString();

    const saveTx = this.db.transaction(() => {
      const existingByEmail = this.db
        .prepare('SELECT * FROM test_users WHERE LOWER(email) = ?')
        .get(email);

      if (existingByEmail) {
        this.db
          .prepare(
            `UPDATE test_users
             SET test_key = ?,
                 first_name = ?,
                 last_name = ?,
                 patient_id = ?,
                 role = ?,
                 account_status = ?,
                 last_updated_date = ?
             WHERE id = ?`
          )
          .run(
            effectiveKey,
            firstName,
            lastName,
            patientId,
            role,
            status,
            now,
            existingByEmail.id
          );

        return this.db
          .prepare('SELECT * FROM test_users WHERE id = ?')
          .get(existingByEmail.id);
      }

      const info = this.db
        .prepare(
          `INSERT INTO test_users (
             test_key,
             first_name,
             last_name,
             email,
             patient_id,
             role,
             account_status,
             created_date,
             last_updated_date
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          effectiveKey,
          firstName,
          lastName,
          email,
          patientId,
          role,
          status,
          patientData.createdDate || now,
          now
        );

      return this.db
        .prepare('SELECT * FROM test_users WHERE id = ?')
        .get(info.lastInsertRowid);
    });

    const savedRow = saveTx();
    const mapped = this._mapRow(savedRow);

    this._log('Account saved to local database', {
      id: mapped.id,
      testKey: mapped.testKey,
      patientId: mapped.patientId,
      email: mapped.email,
      firstName: mapped.firstName,
      lastName: mapped.lastName,
      role: mapped.role,
      accountStatus: mapped.accountStatus,
    });

    return mapped;
  }

  /**
   * Retrieve a saved patient account from SQLite by testKey.
   *
   * @param {string} [testKey='login-patient']
   * @param {Object} [options={}]
   * @returns {Object|null}
   */
  getPatient(testKey = TEST_KEYS.LOGIN, options = {}) {
    const {
      fallbackToShared = true,
      requireActive = false,
      destructive = false,
    } = options;
    const effectiveKey = this.resolveTestKey(testKey);

    if (destructive && !effectiveKey.includes('destructive')) {
      throw new Error(
        `[TestUserManager] Destructive test blocked from reusing standard patient account (${effectiveKey}). Configure an explicit destructive test key.`
      );
    }

    let row = this.db
      .prepare(
        "SELECT * FROM test_users WHERE test_key = ? AND account_status = 'ACTIVE' ORDER BY id DESC LIMIT 1"
      )
      .get(effectiveKey);

    if (!row && fallbackToShared) {
      row =
        this.db
          .prepare(
            "SELECT * FROM test_users WHERE test_key = ? AND account_status = 'ACTIVE' ORDER BY id DESC LIMIT 1"
          )
          .get(TEST_KEYS.LOGIN) ||
        this.db
          .prepare(
            "SELECT * FROM test_users WHERE account_status = 'ACTIVE' ORDER BY id DESC LIMIT 1"
          )
          .get();
    }

    if (!row) {
      if (requireActive) {
        throw new Error(
          `[TestUserManager] Required active patient account for test key "${effectiveKey}" does not exist in local SQLite database (${this.dbPath}).`
        );
      }
      return null;
    }

    const mapped = this._mapRow(row);
    this._log('Existing account retrieved', {
      requestedTestKey: effectiveKey,
      resolvedTestKey: mapped.testKey,
      patientId: mapped.patientId,
      email: mapped.email,
      accountStatus: mapped.accountStatus,
    });

    return mapped;
  }

  /**
   * Retrieve a saved patient account from SQLite by email address.
   * @param {string} email
   * @returns {Object|null}
   */
  getPatientByEmail(email) {
    if (!email) return null;
    const normalizedEmail = email.trim().toLowerCase();
    const row = this.db
      .prepare('SELECT * FROM test_users WHERE LOWER(email) = ?')
      .get(normalizedEmail);

    if (!row) return null;

    const mapped = this._mapRow(row);
    this._log('Existing account retrieved by email', {
      testKey: mapped.testKey,
      patientId: mapped.patientId,
      email: mapped.email,
      accountStatus: mapped.accountStatus,
    });
    return mapped;
  }

  /**
   * Update fields of the latest patient record for testKey in SQLite.
   * @param {string} testKey
   * @param {Object} updates
   * @returns {Object|null}
   */
  updatePatient(testKey, updates = {}) {
    const effectiveKey = this.resolveTestKey(testKey);
    const existing = this.db
      .prepare(
        'SELECT * FROM test_users WHERE test_key = ? ORDER BY id DESC LIMIT 1'
      )
      .get(effectiveKey);

    if (!existing) {
      return null;
    }

    const firstName = updates.firstName ?? existing.first_name;
    const lastName = updates.lastName ?? existing.last_name;
    const email = updates.email
      ? updates.email.trim().toLowerCase()
      : existing.email;
    const patientId = updates.patientId ?? existing.patient_id;
    const role = updates.role ?? existing.role;
    const accountStatus = updates.accountStatus
      ? updates.accountStatus.toUpperCase()
      : existing.account_status;
    const now = new Date().toISOString();

    this.db
      .prepare(
        `UPDATE test_users
         SET first_name = ?,
             last_name = ?,
             email = ?,
             patient_id = ?,
             role = ?,
             account_status = ?,
             last_updated_date = ?
         WHERE id = ?`
      )
      .run(
        firstName,
        lastName,
        email,
        patientId,
        role,
        accountStatus,
        now,
        existing.id
      );

    const updated = this._mapRow(
      this.db.prepare('SELECT * FROM test_users WHERE id = ?').get(existing.id)
    );

    this._log('Patient account updated in local database', {
      id: updated.id,
      testKey: updated.testKey,
      patientId: updated.patientId,
      email: updated.email,
      accountStatus: updated.accountStatus,
    });

    return updated;
  }

  /**
   * Update the account_status of an existing patient record.
   * @param {string} testKey
   * @param {string} status
   * @returns {Object|null}
   */
  updatePatientStatus(testKey, status) {
    return this.updatePatient(testKey, { accountStatus: status });
  }

  /**
   * Retrieve an existing ACTIVE patient account for testKey, or invoke the UI creation callback
   * to register and persist a new patient account if none exists.
   *
   * @param {string} testKey
   * @param {Function} [createViaUiFn]
   * @param {Object} [options={}]
   * @returns {Promise<Object>}
   */
  async getOrCreatePatient(
    testKey = TEST_KEYS.LOGIN,
    createViaUiFn,
    options = {}
  ) {
    const existing = this.getPatient(testKey, {
      fallbackToShared: options.fallbackToShared ?? false,
      requireActive: false,
    });

    if (existing && existing.accountStatus === 'ACTIVE') {
      return existing;
    }

    if (typeof createViaUiFn !== 'function') {
      throw new Error(
        `[TestUserManager] Account for test key "${testKey}" was not found in SQLite and no UI creation callback was provided. Execute Signup first.`
      );
    }

    const password = this.getCommonPassword();
    const candidate = this.generatePatient(testKey, options);

    try {
      const result = await createViaUiFn(candidate, password);
      if (!result || result.success === false) {
        this._log('Signup failure — account was not saved to SQLite', {
          testKey: candidate.testKey,
          email: candidate.email,
          accountStatus: 'FAILED',
        });
        throw new Error(
          `[TestUserManager] UI Signup failed for test key "${candidate.testKey}" (${candidate.email}).`
        );
      }

      this._log('Signup success', {
        testKey: candidate.testKey,
        email: candidate.email,
        patientId: result.patientId || candidate.patientId || 'PENDING_ID',
        accountStatus: 'ACTIVE',
      });

      return this.savePatient({
        ...candidate,
        firstName: result.firstName || candidate.firstName,
        lastName: result.lastName || candidate.lastName,
        email: result.email || candidate.email,
        patientId: result.patientId || candidate.patientId,
        accountStatus: 'ACTIVE',
      });
    } catch (error) {
      this._log('Signup failure', {
        testKey: candidate.testKey,
        email: candidate.email,
        accountStatus: 'FAILED',
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Retrieve an ACTIVE patient account from SQLite that does NOT have any pet yet (has_pet = 0).
   *
   * @param {Object} [options={}]
   * @param {Array<string>} [options.excludeEmails=[]]
   * @returns {Object|null}
   */
  getPatientWithoutPet(options = {}) {
    const { excludeEmails = [] } = options;
    const normalizedExcluded = excludeEmails.map(e => e.toLowerCase());

    const rows = this.db
      .prepare(
        "SELECT * FROM test_users WHERE account_status = 'ACTIVE' AND (has_pet = 0 OR has_pet IS NULL) ORDER BY id DESC"
      )
      .all();

    const match = rows.find(
      r => !normalizedExcluded.includes(r.email.toLowerCase())
    );
    if (!match) {
      return null;
    }

    const mapped = this._mapRow(match);
    this._log('Retrieved active account without pet from SQLite', {
      id: mapped.id,
      testKey: mapped.testKey,
      email: mapped.email,
      hasPet: mapped.hasPet,
      petCount: mapped.petCount,
    });
    return mapped;
  }

  /**
   * Update a patient's pet ownership in SQLite.
   * Automatically tracks the exact number of pets in BOTH `has_pet` and `pet_count`
   * (so `has_pet` in SQLite displays the exact count of pets: 0, 1, 2, 5, etc.)
   * and appends or sets `pet_name`, `pet_species`, and `pet_id`.
   *
   * @param {string} email
   * @param {Object} petDetails
   * @param {string} [petDetails.petName]
   * @param {string} [petDetails.petSpecies]
   * @param {string} [petDetails.petId]
   * @param {number} [petDetails.petCount]
   * @param {boolean} [petDetails.replace=false] If true, overwrites existing pet list instead of appending
   * @returns {Object|null}
   */
  markPatientHasPet(email, petDetails = {}) {
    if (!email) return null;
    const normalizedEmail = email.trim().toLowerCase();
    const existing = this.db
      .prepare('SELECT * FROM test_users WHERE LOWER(email) = ?')
      .get(normalizedEmail);
    if (!existing) return null;

    const now = new Date().toISOString();

    // Merge or replace pet names
    let mergedNames = [];
    if (!petDetails.replace && existing.pet_name && existing.pet_name !== 'ExistingPet') {
      mergedNames = existing.pet_name
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }
    if (petDetails.petName) {
      const incomingNames = petDetails.petName
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      for (const n of incomingNames) {
        if (!mergedNames.includes(n)) {
          mergedNames.push(n);
        }
      }
    }

    // Merge or replace species
    let mergedSpecies = [];
    if (!petDetails.replace && existing.pet_species) {
      mergedSpecies = existing.pet_species
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }
    if (petDetails.petSpecies) {
      const incomingSpecies = petDetails.petSpecies
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (petDetails.replace) {
        mergedSpecies = incomingSpecies;
      } else {
        for (const sp of incomingSpecies) {
          mergedSpecies.push(sp);
        }
      }
    }

    // Merge or replace pet IDs
    let mergedIds = [];
    if (!petDetails.replace && existing.pet_id) {
      mergedIds = existing.pet_id
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }
    if (petDetails.petId) {
      const incomingIds = petDetails.petId
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      for (const pid of incomingIds) {
        if (!mergedIds.includes(pid)) {
          mergedIds.push(pid);
        }
      }
    }

    const finalPetName =
      mergedNames.length > 0 ? mergedNames.join(', ') : existing.pet_name;
    const finalPetSpecies =
      mergedSpecies.length > 0 ? mergedSpecies.join(', ') : existing.pet_species;
    const finalPetId =
      mergedIds.length > 0 ? mergedIds.join(', ') : existing.pet_id;

    const exactCount =
      petDetails.petCount !== undefined
        ? Number(petDetails.petCount)
        : Math.max(mergedNames.length, mergedIds.length, 1);

    this.db
      .prepare(
        `UPDATE test_users
         SET has_pet = ?,
             pet_count = ?,
             pet_name = ?,
             pet_species = ?,
             pet_id = ?,
             last_updated_date = ?
         WHERE LOWER(email) = ?`
      )
      .run(
        exactCount,
        exactCount,
        finalPetName || null,
        finalPetSpecies || null,
        finalPetId || null,
        now,
        normalizedEmail
      );

    const row = this.db
      .prepare('SELECT * FROM test_users WHERE LOWER(email) = ?')
      .get(normalizedEmail);
    const mapped = this._mapRow(row);
    this._log('Updated patient pet ownership in SQLite', {
      id: mapped?.id,
      email: mapped?.email,
      hasPet: mapped?.hasPet,
      petCount: mapped?.petCount,
      petName: mapped?.petName,
      petSpecies: mapped?.petSpecies,
      petId: mapped?.petId,
    });
    return mapped;
  }

  /**
   * Retrieve an ACTIVE Free-plan patient account from SQLite that already has at least 1 registered pet
   * (has_pet >= 1 AND subscription_tier = 'free').
   *
   * @param {Object} [options={}]
   * @param {Array<string>} [options.excludeEmails=[]]
   * @returns {Object|null}
   */
  getFreePlanPatientWithOnePet(options = {}) {
    const { excludeEmails = [] } = options;
    const normalizedExcluded = excludeEmails.map(e => e.toLowerCase());

    const rows = this.db
      .prepare(
        "SELECT * FROM test_users WHERE account_status = 'ACTIVE' AND has_pet >= 1 AND (subscription_tier = 'free' OR subscription_tier IS NULL) ORDER BY id DESC"
      )
      .all();

    const match = rows.find(
      r => !normalizedExcluded.includes(r.email.toLowerCase())
    );
    if (!match) return null;

    const mapped = this._mapRow(match);
    this._log('Retrieved Free-plan account with pet from SQLite', {
      id: mapped.id,
      email: mapped.email,
      hasPet: mapped.hasPet,
      petCount: mapped.petCount,
      petName: mapped.petName,
      subscriptionTier: mapped.subscriptionTier,
    });
    return mapped;
  }

  /**
   * Update a patient's subscription_tier ('free' or 'companion') in SQLite.
   *
   * @param {string} email
   * @param {string} tier
   * @returns {Object|null}
   */
  updatePatientSubscriptionTier(email, tier = 'companion') {
    if (!email) return null;
    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date().toISOString();

    this.db
      .prepare(
        `UPDATE test_users
         SET subscription_tier = ?,
             last_updated_date = ?
         WHERE LOWER(email) = ?`
      )
      .run(tier.toLowerCase(), now, normalizedEmail);

    const row = this.db
      .prepare('SELECT * FROM test_users WHERE LOWER(email) = ?')
      .get(normalizedEmail);
    const mapped = this._mapRow(row);
    this._log('Updated patient subscription tier in SQLite', {
      id: mapped?.id,
      email: mapped?.email,
      subscriptionTier: mapped?.subscriptionTier,
    });
    return mapped;
  }

  /**
   * List all saved test user records in SQLite (for inspection & verification)
   * @returns {Array<Object>}
   */
  getAllPatients() {
    const rows = this.db
      .prepare('SELECT * FROM test_users ORDER BY id ASC')
      .all();
    return rows.map(r => this._mapRow(r));
  }

  /**
   * Map SQLite snake_case column names to camelCase properties
   * @param {Object} row
   * @returns {Object}
   */
  _mapRow(row) {
    if (!row) return null;
    const petCount = Number(row.pet_count ?? row.has_pet ?? 0);
    return {
      id: row.id,
      testKey: row.test_key,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      patientId: row.patient_id,
      role: row.role,
      accountStatus: row.account_status,
      hasPet: petCount,
      petCount,
      petName: row.pet_name || null,
      petSpecies: row.pet_species || null,
      petId: row.pet_id || null,
      subscriptionTier: row.subscription_tier || 'free',
      createdDate: row.created_date,
      lastUpdatedDate: row.last_updated_date,
    };
  }

  /**
   * Structured audit logger that strips any sensitive fields (never logs passwords or OTPs)
   * @param {string} event
   * @param {Object} details
   */
  _log(event, details = {}) {
    const safeDetails = { ...details };
    delete safeDetails.password;
    delete safeDetails.confirmPassword;
    delete safeDetails.otp;
    console.log(
      `[TestUserManager] ${event} | ${JSON.stringify(safeDetails)}`
    );
  }

  // Backward-compatible aliases
  generateTestUser(testKey = TEST_KEYS.LOGIN, overrides = {}) {
    return this.generatePatient(testKey, overrides);
  }
  saveTestUser(userData) {
    return this.savePatient(userData);
  }
  getActiveUser(testKey = TEST_KEYS.LOGIN, options = {}) {
    return this.getPatient(testKey, options);
  }
  getActivePatient(testKey = TEST_KEYS.LOGIN, options = {}) {
    return this.getPatient(testKey, options);
  }
  updateUserStatus(testKey, status) {
    return this.updatePatientStatus(testKey, status);
  }
  async getOrCreateActiveUser(
    testKey = TEST_KEYS.LOGIN,
    createViaUiFn,
    options = {}
  ) {
    return this.getOrCreatePatient(testKey, createViaUiFn, options);
  }
  getAllUsers() {
    return this.getAllPatients();
  }
}

const testUserManager = new TestUserManager();

module.exports = {
  TestUserManager,
  testUserManager,
  TEST_KEYS,
};
