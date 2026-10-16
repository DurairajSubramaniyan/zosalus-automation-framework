import { TestType, PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions } from '@playwright/test';
import { BddTestFixtures, BddWorkerFixtures } from 'playwright-bdd';
import SignupPage from '../pages/SignupPage';
import LoginPage from '../pages/LoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import AccountSetupPage from '../pages/AccountSetupPage';
import BasePage from '../pages/BasePage';

export interface CustomFixtures {
  basePage: BasePage;
  signupPage: SignupPage;
  loginPage: LoginPage;
  forgotPasswordPage: ForgotPasswordPage;
  accountSetupPage: AccountSetupPage;
}

export type CustomTestArgs = PlaywrightTestArgs & PlaywrightTestOptions & BddTestFixtures & CustomFixtures;
export type CustomWorkerArgs = PlaywrightWorkerArgs & PlaywrightWorkerOptions & BddWorkerFixtures;

export declare const test: TestType<CustomTestArgs, CustomWorkerArgs>;
export declare const expect: typeof import('@playwright/test').expect;
