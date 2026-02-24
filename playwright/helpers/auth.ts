import type { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import dotenv from 'dotenv';

dotenv.config();

export const ADMIN_CREDENTIALS = {
  email: process.env.TEST_ADMIN_CREDENTIALS ? JSON.parse(process.env.TEST_ADMIN_CREDENTIALS).email : 'test.admin@example.com',
  password: process.env.TEST_ADMIN_CREDENTIALS ? JSON.parse(process.env.TEST_ADMIN_CREDENTIALS).password : 'Test123!',
};

export const APPLICANT_CREDENTIALS = {
  email: process.env.TEST_CREDENTIALS ? JSON.parse(process.env.TEST_CREDENTIALS).email : 'tom@kainos.com',
  password: process.env.TEST_CREDENTIALS ? JSON.parse(process.env.TEST_CREDENTIALS).password : 'Password123!',
};

export async function login(page: Page, email: string, password: string) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);
}

export async function loginAsAdmin(page: Page) {
  await login(page, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
}

export async function loginAsApplicant(page: Page) {
  await login(page, APPLICANT_CREDENTIALS.email, APPLICANT_CREDENTIALS.password);
}
