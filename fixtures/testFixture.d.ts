import { TestType, PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions } from '@playwright/test';
import { BddTestFixtures, BddWorkerFixtures } from 'playwright-bdd';
import SignupPage from '../pages/SignupPage';
import LoginPage from '../pages/LoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import AccountSetupPage from '../pages/AccountSetupPage';
import AddPetPage from '../pages/AddPetPage';
import HealthRecordsPage from '../pages/HealthRecordsPage';
import ConditionsEpisodesPage from '../pages/ConditionsEpisodesPage';
import SubscriptionPage from '../pages/SubscriptionPage';
import BasePage from '../pages/BasePage';
import { TestUserManager } from '../utils/TestUserManager';

export interface CustomFixtures {
  basePage: BasePage;
  signupPage: SignupPage;
  loginPage: LoginPage;
  forgotPasswordPage: ForgotPasswordPage;
  accountSetupPage: AccountSetupPage;
  addPetPage: AddPetPage;
  healthRecordsPage: HealthRecordsPage;
  conditionsEpisodesPage: ConditionsEpisodesPage;
  subscriptionPage: SubscriptionPage;
  testUserManager: TestUserManager;
}

export type CustomTestArgs = PlaywrightTestArgs & PlaywrightTestOptions & BddTestFixtures & CustomFixtures;
export type CustomWorkerArgs = PlaywrightWorkerArgs & PlaywrightWorkerOptions & BddWorkerFixtures;

export declare const test: TestType<CustomTestArgs, CustomWorkerArgs>;
export declare const expect: typeof import('@playwright/test').expect;
