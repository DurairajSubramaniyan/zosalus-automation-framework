Feature: Companion Plan Maximum 10 Pets Multi-Species Onboarding with Phased Health Records, Conditions, Episodes, and Cross-Pet Verification Suite
  As a Zosalus Companion Plan pet parent who currently has only 1 registered pet
  I want to first create all remaining pets up to the 10-pet Companion base maximum across distinct species and breeds
  Then switch to each pet to add species-matched Health Records, Medical Conditions, and Episodic Diary entries
  And finally revisit every pet's page to verify that all saved pet details and clinical records are stored and displayed under the correct pet

  Scenario: RG-ADDPETS-01 Verify Companion user with 1 pet creates all 10 distinct-species pets first, then adds species-matched health records, conditions, and episodes for each pet, and verifies every saved detail under the correct pet page
    Given an active Companion plan user who currently has only 1 registered pet is retrieved from SQLite and logged into the Zosalus portal
    And the Companion user verifies their active Companion subscription status and confirms the initial 1 registered pet in the sidebar
    When the Companion user first creates all remaining pets up to the 10-pet maximum across distinct species, distinct breeds, dynamic names, 15-digit ISO microchips, and cropped photos
    And after all 10 pets exist the Companion user switches to each newly added pet and logs all 5 species-specific Health Records matching that pet's species
    And for each newly added pet the Companion user records a species-specific Medical Diagnosis and logs a linked Moment-in-Time Episodic Diary flare-up
    Then the Companion user switches back through every newly added pet and verifies its exact saved name and breed in the sidebar and pet profile
    And for every newly added pet the Clinical Health Timeline should display all 5 saved health record categories with that pet's exact saved clinical texts
    And for every newly added pet the Conditions and Episodes page should display that pet's exact saved Medical Diagnosis and Episodic Diary flare-up under the correct pet
    And the Companion user's SQLite record should be updated to 10 total pets with all distinct pet names and species persisted
    And attempting to add an 11th pet on Add Pet should verify the 10-pet Companion base allowance limit
