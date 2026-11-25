/**
 * Realistic, species-consistent veterinary test data for Pet Onboarding,
 * Clinical Health Timeline (Vaccination, Medication, Lab Results, Vital Signs, Allergies),
 * and Medical Conditions & Episodic Diary.
 */
module.exports = {
  petProfile: {
    name: 'Bruno',
    species: 'Dog',
    breed: 'Golden Retriever',
    birthdate: '05/14/2023',
    sex: 'Male',
    neuterStatus: 'Neutered / Spayed',
    colorMarkings: 'Golden coat with light cream chest patch',
    microchipNumber: '985112009876543',
  },

  healthRecords: {
    vaccination: {
      vaccineName: 'Rabies (canine) 3-Year Booster',
      dateAdministered: '05/14/2025',
      nextDueDate: '05/14/2028',
      route: 'Subcutaneous (SQ)',
      manufacturer: 'Zoetis',
      lotNumber: 'LOT-Z88391A',
      costAmount: '65.00',
      notes:
        'Well tolerated by Bruno. No swelling, lethargy, or immediate hypersensitivity reaction observed during 15-minute post-injection window.',
    },
    medication: {
      drugName: 'Apoquel (Oclacitinib)',
      brandName: 'Apoquel',
      strength: '16mg',
      formulation: 'Tablet',
      doseAmount: '1',
      doseUnit: 'tablet',
      frequency: 'Twice daily',
      route: 'Oral',
      startDate: '05/15/2025',
      endDate: '05/29/2025',
      rxNumber: 'RX-449821',
      pharmacyName: 'Austin Animal Hospital Pharmacy',
      refillsRemaining: '3',
      costAmount: '88.50',
      notes:
        "Administer 1 tablet orally twice daily with meals for Bruno's seasonal pruritus.",
    },
    labResult: {
      testName: 'Alanine Aminotransferase (ALT)',
      testPanel: 'Comprehensive Canine Chemistry Profile',
      value: '42.5',
      unit: 'U/L',
      referenceLow: '10.0',
      referenceHigh: '100.0',
      testDate: '05/16/2025',
      labName: 'IDEXX Reference Laboratories',
      costAmount: '95.00',
      notes:
        'Hepatic enzyme activity within normal canine reference interval for adult Golden Retriever.',
    },
    vitalSigns: {
      weightKg: '31.40',
      temperatureC: '38.5',
      heartRateBpm: '88',
      respiratoryRateBpm: '22',
      mucousMembraneColour: 'Pink',
      systolicBp: '124',
      diastolicBp: '78',
      crtSeconds: '1.5',
      spo2Percent: '98.5',
      recordedAt: '05/17/2025',
      notes:
        'Bruno is bright, alert, and responsive. Ideal adult Golden Retriever body condition score (5/9).',
    },
    allergy: {
      allergen: 'Chicken Protein & Poultry By-Products',
      allergenType: 'Food',
      severity: 'Moderate',
      confirmedDate: '05/18/2025',
      reaction:
        'Pruritus, paw licking, and mild erythematous rash along ventral abdomen within 4 hours of ingestion.',
      notes:
        'Maintain Bruno on hydrolyzed salmon or novel venison diet; avoid poultry-flavored chewable medications.',
    },
  },

  conditionsAndEpisodes: {
    diagnosis: {
      conditionName: 'Canine Atopic Dermatitis',
      status: 'Chronic',
      severity: 'Moderate',
      firstDiagnosedDate: '05/15/2025',
      isInsuranceRelevant: true,
      icdCode: 'L20.89',
      notes:
        'Managed with Apoquel 16mg during spring/summer pollen seasons, medicated chlorhexidine baths every 2 weeks, and omega-3 fatty acid supplementation.',
    },
    episode: {
      linkedConditionName: 'Canine Atopic Dermatitis',
      customSymptomFallback: 'Acute interdigital paw pruritus and erythema',
      episodeDate: '05/20/2025',
      severity: 'Moderate',
      durationHours: '1.5',
      description:
        'Acute flare-up of interdigital erythema and scratching on both front paws after morning walk through tall grass at Zilker Park.',
      isRecurrence: true,
      vetContacted: true,
      triggers: 'High ragweed pollen count and damp morning grass exposure',
      extraNotes:
        'Cleaned paws with antiseptic wipes and administered prescribed relief dose. Scratching subsided within 90 minutes.',
      wasMedicationGiven: true,
      medicationGiven: 'Apoquel 16mg',
      medicationRoute: 'Oral',
      responseToMedication: 'Improved',
    },
  },
};
