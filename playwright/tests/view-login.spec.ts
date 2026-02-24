import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';

test('home page renders with expected title', async ({ page }) => {
  const home = new HomePage(page);

  await home.goto();
  await home.waitForLoaded();
});

test('user can navigate from home to login page', async ({ page }) => {
  const home = new HomePage(page);
  const login = new LoginPage(page);

  await home.goto();
  await home.clickLogin();
  await login.waitForLoaded();
});