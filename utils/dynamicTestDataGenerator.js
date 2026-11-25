/**
 * Dynamic Test Data Generator for Zosalus Regression Suite
 *
 * Generates unique, realistic, and clinically valid dynamic test data on every run for:
 * - Patient / Owner Account Setup & Profile Settings (names, usernames, valid US phones, addresses, emergency contacts)
 * - Pet Profiles (names, species, breeds, MM/DD/YYYY birthdates, color/markings, 15-digit ISO microchips)
 * - Clinical Health Records (Vaccinations, Medications, Lab Results, Vital Signs, Allergies)
 * - Medical Conditions (Diagnoses, ICD-10 codes, treatment notes) & Episodic Diary entries
 *
 * NOTE: Does NOT alter email or password credentials (those remain managed by TestUserManager & .env).
 */

const FIRST_NAMES = [
  'Clara',
  'Julian',
  'Maya',
  'Liam',
  'Sophia',
  'Noah',
  'Aria',
  'Ethan',
  'Harper',
  'Lucas',
  'Chloe',
  'Owen',
];

const LAST_NAMES = [
  'Thornton',
  'Mercer',
  'Kensington',
  'Calloway',
  'Sinclair',
  'Hawthorne',
  'Prescott',
  'Montgomery',
  'Whitaker',
  'aldridge',
  'Bennett',
  'Sullivan',
];

const US_ADDRESSES = [
  {
    street: '742 Evergreen Terrace',
    unit: 'Apt 4B',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
  },
  {
    street: '1280 Barton Springs Rd',
    unit: 'Suite 210',
    city: 'Austin',
    state: 'TX',
    zip: '78704',
  },
  {
    street: '450 Congress Ave',
    unit: 'Unit 9C',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
  },
  {
    street: '2910 South Lamar Blvd',
    unit: 'Apt 12A',
    city: 'Austin',
    state: 'TX',
    zip: '78704',
  },
  {
    street: '815 Brazos St',
    unit: 'Floor 5',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
  },
];

const VALID_US_AREA_CODES = ['512', '737', '214', '469', '713', '832', '210'];

const PET_CATALOG = [
  {
    species: 'Dog',
    names: ['Baxter', 'Milo', 'Koda', 'Atlas', 'Cooper', 'Finn', 'Ollie', 'jasper'],
    breeds: [
      'Golden Retriever',
      'Australian Shepherd',
      'Labrador Retriever',
      'Beagle',
      'Pembroke Welsh Corgi',
      'Bernese Mountain Dog',
    ],
    colors: [
      'Warm golden double coat with white chest',
      'Blue merle with tan and white markings',
      'Tricolor black, white, and rust coat',
      'Red and white sable markings',
    ],
  },
  {
    species: 'Cat',
    names: ['Luna', 'Cleo', 'Willow', 'Hazel', 'Nala', 'Mochi', 'Simba', 'Jasper'],
    breeds: [
      'Siamese',
      'British Shorthair',
      'Maine Coon',
      'Ragdoll',
      'Scottish Fold',
    ],
    colors: [
      'Cream body with seal brown points',
      'Blue-gray plush coat with amber eyes',
      'Silver classic tabby with white paws',
      'Seal bicolor with blue eyes',
    ],
  },
];

const VACCINE_POOL = [
  {
    name: 'Rabies 3-Year (Canine/Feline)',
    route: 'Subcutaneous',
    manufacturer: 'Zoetis',
  },
  {
    name: 'DHPPi-L 5-in-1 Core Booster',
    route: 'Subcutaneous',
    manufacturer: 'Merck Animal Health',
  },
  {
    name: 'Bordetella Bronchiseptica Intranasal',
    route: 'Intranasal',
    manufacturer: 'Elanco',
  },
  {
    name: 'Leptospirosis 4-Serovar Annual',
    route: 'Subcutaneous',
    manufacturer: 'Boehringer Ingelheim',
  },
];

const MEDICATION_POOL = [
  {
    drugName: 'Apoquel (Oclacitinib)',
    brandName: 'Apoquel',
    strength: '16 mg',
    formulation: 'Tablet',
    doseAmount: '1',
    doseUnit: 'tablet',
    frequency: 'Twice daily',
    route: 'Oral',
    pharmacy: 'Covetrus Veterinary Pharmacy',
  },
  {
    drugName: 'Carprofen Veterinary NSAID',
    brandName: 'Rimadyl',
    strength: '75 mg',
    formulation: 'Chewable',
    doseAmount: '1',
    doseUnit: 'tablet',
    frequency: 'Twice daily',
    route: 'Oral',
    pharmacy: 'Austin Vet Compounding Pharmacy',
  },
  {
    drugName: 'Gabapentin Neuropathic Capsule',
    brandName: 'Neurontin',
    strength: '100 mg',
    formulation: 'Capsule',
    doseAmount: '1',
    doseUnit: 'capsule',
    frequency: 'Every 8 hours',
    route: 'Oral',
    pharmacy: 'Chewy Veterinary Pharmacy',
  },
];

const LAB_POOL = [
  {
    testName: 'Alanine Aminotransferase (ALT)',
    panel: 'Comprehensive Hepatic & Renal Panel',
    normalValue: '54',
    highValue: '168',
    lowValue: '6',
    unit: 'U/L',
    refLow: '10',
    refHigh: '100',
    labName: 'IDEXX Reference Laboratories',
  },
  {
    testName: 'Blood Urea Nitrogen (BUN)',
    panel: 'Renal Chemistry Profile',
    normalValue: '18',
    highValue: '52',
    lowValue: '4',
    unit: 'mg/dL',
    refLow: '7',
    refHigh: '27',
    labName: 'Antech Diagnostics',
  },
  {
    testName: 'Serum Creatinine',
    panel: 'Renal Function Panel',
    normalValue: '1.1',
    highValue: '2.9',
    lowValue: '0.3',
    unit: 'mg/dL',
    refLow: '0.5',
    refHigh: '1.8',
    labName: 'Texas A&M Veterinary Medical Diagnostic Lab',
  },
];

const ALLERGY_POOL = [
  {
    allergen: 'Poultry Protein & Storage Mites',
    allergenType: 'Food / Dietary',
    severity: 'Moderate',
    reaction: 'Interdigital erythema, paw licking, and recurrent otitis externa',
  },
  {
    allergen: 'Ragweed & Oak Tree Pollen',
    allergenType: 'Food / Dietary',
    severity: 'Moderate',
    reaction: 'Seasonal periocular pruritus and ventral abdominal rash',
  },
  {
    allergen: 'Amoxicillin Beta-Lactam Group',
    allergenType: 'Food / Dietary',
    severity: 'Severe',
    reaction: 'Acute facial angioedema and urticaria within 30 minutes of dose',
  },
];

const CONDITION_POOL = [
  {
    conditionName: 'Canine Atopic Dermatitis',
    status: 'Chronic',
    severity: 'Moderate',
    icdCode: 'L20.89',
  },
  {
    conditionName: 'Coxofemoral Osteoarthritis',
    status: 'Active',
    severity: 'Moderate',
    icdCode: 'M16.9',
  },
  {
    conditionName: 'Chronic Enteropathy / IBD',
    status: 'Chronic',
    severity: 'Moderate',
    icdCode: 'K52.9',
  },
];

/**
 * Pick a random item from an array
 * @template T
 * @param {T[]} arr
 * @returns {T}
 */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate a random integer in [min, max]
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a short unique alphanumeric suffix
 * @returns {string}
 */
function uniqueSuffix() {
  return `${Date.now().toString().slice(-4)}${randomInt(10, 99)}`;
}

/**
 * Generate a valid 10-digit US phone number (passes libphonenumber-js strict validation)
 * @returns {string}
 */
function generateValidUsPhone() {
  const area = pickRandom(VALID_US_AREA_CODES);
  const exchange = randomInt(210, 899);
  const subscriber = randomInt(1000, 9999);
  return `${area}${exchange}${subscriber}`;
}

/**
 * Generate a valid 15-digit ISO 11784/11785 numeric microchip number
 * @returns {string}
 */
function generateIsoMicrochip15() {
  let digits = '985141';
  while (digits.length < 15) {
    digits += String(randomInt(0, 9));
  }
  return digits.slice(0, 15);
}

/**
 * Generate a dynamic past date in MM/DD/YYYY format within the given year
 * @param {number} [year=2025]
 * @returns {string}
 */
function generatePastDateMmDdYyyy(year = 2025) {
  const month = String(randomInt(1, 5)).padStart(2, '0');
  const day = String(randomInt(1, 20)).padStart(2, '0');
  return `${month}/${day}/${year}`;
}

/**
 * Generate a complete dynamic owner profile for Account Setup and Account Settings
 */
function generateDynamicOwnerProfile() {
  const firstName = pickRandom(FIRST_NAMES);
  const lastName = `${pickRandom(LAST_NAMES)}${randomInt(10, 99)}`;
  const phone = generateValidUsPhone();
  const username = `${firstName.toLowerCase()}${uniqueSuffix()}`;
  const address = generateDynamicAddress();
  const emergencyContact = generateDynamicEmergencyContact();

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    phone,
    formattedPhone: `+1${phone}`,
    username,
    preferredContactMethod: pickRandom(['Phone', 'SMS / Text', 'Email']),
    address,
    emergencyContact,
  };
}

/**
 * Generate a dynamic US Home Address
 */
function generateDynamicAddress() {
  const base = pickRandom(US_ADDRESSES);
  const houseNum = randomInt(100, 9999);
  const streetName = base.street.replace(/^\d+\s*/, '');
  return {
    street: `${houseNum} ${streetName}`,
    unit: `Suite ${randomInt(100, 599)}`,
    city: base.city,
    state: base.state,
    zip: base.zip,
  };
}

/**
 * Generate a dynamic Emergency Contact
 */
function generateDynamicEmergencyContact() {
  const first = pickRandom(FIRST_NAMES);
  const last = pickRandom(LAST_NAMES);
  return {
    name: `${first} ${last}`,
    relationship: pickRandom(['Spouse', 'Sister', 'Brother', 'Parent', 'Partner']),
    phone: generateValidUsPhone(),
  };
}

/**
 * Generate a complete dynamic Pet Profile
 * @param {Object} [overrides]
 * @param {string} [overrides.species]
 */
function generateDynamicPetProfile(overrides = {}) {
  const catalogEntry = overrides.species
    ? PET_CATALOG.find(
        c => c.species.toLowerCase() === overrides.species.toLowerCase()
      ) || pickRandom(PET_CATALOG)
    : pickRandom(PET_CATALOG);

  const baseName = pickRandom(catalogEntry.names);
  const dynamicName = `${baseName}${randomInt(10, 99)}`;
  const breed = overrides.breed || pickRandom(catalogEntry.breeds);
  const month = String(randomInt(1, 11)).padStart(2, '0');
  const day = String(randomInt(1, 25)).padStart(2, '0');
  const year = randomInt(2021, 2024);

  return {
    name: overrides.name || dynamicName,
    species: catalogEntry.species,
    breed,
    customBreed: `${breed} Hybrid ${randomInt(10, 99)}`,
    birthdate: overrides.birthdate || `${month}/${day}/${year}`,
    sex: overrides.sex || pickRandom(['Male', 'Female']),
    neuterStatus:
      overrides.neuterStatus ||
      pickRandom(['Neutered / Spayed', 'Intact / Unneutered']),
    colorMarkings: overrides.colorMarkings || pickRandom(catalogEntry.colors),
    microchipNumber: overrides.microchipNumber || generateIsoMicrochip15(),
  };
}

/**
 * Generate a dynamic Vaccination record
 */
function generateDynamicVaccination() {
  const template = pickRandom(VACCINE_POOL);
  const sfx = uniqueSuffix();
  return {
    vaccineName: `${template.name} #${sfx}`,
    dateAdministered: generatePastDateMmDdYyyy(2025),
    nextDueDate: generatePastDateMmDdYyyy(2027),
    route: template.route,
    manufacturer: template.manufacturer,
    lotNumber: `LOT-${sfx}`,
    costAmount: `${randomInt(45, 115)}.00`,
    notes: `Dynamic regression immunization logged (${sfx}). No adverse reaction observed.`,
  };
}

/**
 * Generate a dynamic Medication record
 */
function generateDynamicMedication() {
  const template = pickRandom(MEDICATION_POOL);
  const sfx = uniqueSuffix();
  return {
    drugName: `${template.drugName} ${sfx}`,
    brandName: `${template.brandName}-${randomInt(10, 99)}`,
    strength: template.strength,
    formulation: template.formulation,
    doseAmount: template.doseAmount,
    doseUnit: template.doseUnit,
    frequency: template.frequency,
    route: template.route,
    startDate: '05/05/2025',
    endDate: '05/22/2025',
    rxNumber: `RX-${sfx}-VET`,
    pharmacyName: `${template.pharmacy} #${randomInt(10, 99)}`,
    refillsRemaining: String(randomInt(1, 5)),
    costAmount: `${randomInt(55, 145)}.50`,
    notes: `Dynamic prescription instructions (${sfx}): Administer with meals and monitor appetite.`,
  };
}

/**
 * Generate a dynamic Lab Result record
 * @param {'normal'|'high'|'low'} [flag='normal']
 */
function generateDynamicLabResult(flag = 'normal') {
  const template = pickRandom(LAB_POOL);
  const sfx = uniqueSuffix();
  const value =
    flag === 'high'
      ? template.highValue
      : flag === 'low'
        ? template.lowValue
        : template.normalValue;

  return {
    testName: `${template.testName} [${sfx}]`,
    testPanel: `${template.panel} #${randomInt(10, 99)}`,
    value,
    unit: template.unit,
    referenceLow: template.refLow,
    referenceHigh: template.refHigh,
    testDate: generatePastDateMmDdYyyy(2025),
    labName: template.labName,
    notes: `Dynamic diagnostic panel (${flag.toUpperCase()} - ${sfx}) verified by pathologist.`,
    costAmount: `${randomInt(85, 220)}.00`,
  };
}

/**
 * Generate a dynamic Vital Signs record
 */
function generateDynamicVitalSigns() {
  const sfx = uniqueSuffix();
  return {
    weightKg: `${randomInt(12, 34)}.${randomInt(1, 9)}`,
    temperatureC: `38.${randomInt(2, 8)}`,
    heartRateBpm: String(randomInt(72, 118)),
    respiratoryRateBpm: String(randomInt(18, 28)),
    mucousMembraneColour: 'Pink & Moist (Normal)',
    systolicBp: String(randomInt(115, 135)),
    diastolicBp: String(randomInt(70, 86)),
    crtSeconds: '1.5',
    spo2Percent: String(randomInt(96, 99)),
    recordedAt: generatePastDateMmDdYyyy(2025),
    notes: `Dynamic SOAP vital examination (${sfx}): BAR, hydrated, normal auscultation.`,
  };
}

/**
 * Generate a dynamic Allergy record
 */
function generateDynamicAllergy() {
  const template = pickRandom(ALLERGY_POOL);
  const sfx = uniqueSuffix();
  return {
    allergen: `${template.allergen} (${sfx})`,
    allergenType: template.allergenType,
    severity: template.severity,
    reaction: `${template.reaction} [Case ${sfx}]`,
    confirmedDate: generatePastDateMmDdYyyy(2025),
    notes: `Dynamic allergy contraindication note (${sfx}): Avoid exposure and keep rescue antihistamine on hand.`,
  };
}

/**
 * Generate a dynamic Medical Diagnosis Condition record
 */
function generateDynamicCondition() {
  const template = pickRandom(CONDITION_POOL);
  const sfx = uniqueSuffix();
  return {
    conditionName: `${template.conditionName} ${sfx}`,
    status: template.status,
    severity: template.severity,
    firstDiagnosedDate: generatePastDateMmDdYyyy(2025),
    isInsuranceRelevant: true,
    icdCode: `${template.icdCode}`,
    notes: `Dynamic longitudinal treatment summary (${sfx}): Managed with targeted therapy and periodic re-evaluations.`,
  };
}

/**
 * Generate a dynamic Moment-in-Time Episode record
 * @param {string} [linkedConditionName]
 */
function generateDynamicEpisode(linkedConditionName) {
  const sfx = uniqueSuffix();
  return {
    linkedConditionName:
      linkedConditionName || `Dynamic Pruritic Flare-Up ${sfx}`,
    customSymptomFallback: `Acute Symptom Flare ${sfx}`,
    episodeDate: generatePastDateMmDdYyyy(2025),
    severity: pickRandom(['Moderate', 'Mild']),
    durationHours: String(pickRandom(['1', '1.5', '2'])),
    description: `Dynamic episodic flare-up observation (${sfx}) following outdoor exposure.`,
    triggers: `High environmental pollen & humidity (${sfx})`,
    extraNotes: `Dynamic owner care note (${sfx}): Applied soothing compress and monitored recovery.`,
    wasMedicationGiven: true,
    medicationGiven: `Apoquel Rescue Dose ${sfx}`,
    medicationRoute: 'Oral',
    responseToMedication: 'Significant Improvement',
  };
}

module.exports = {
  generateValidUsPhone,
  generateIsoMicrochip15,
  generatePastDateMmDdYyyy,
  generateDynamicOwnerProfile,
  generateDynamicAddress,
  generateDynamicEmergencyContact,
  generateDynamicPetProfile,
  generateDynamicVaccination,
  generateDynamicMedication,
  generateDynamicLabResult,
  generateDynamicVitalSigns,
  generateDynamicAllergy,
  generateDynamicCondition,
  generateDynamicEpisode,
};
