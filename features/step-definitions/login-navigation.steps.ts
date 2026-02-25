import { Given, Then, When } from '@cucumber/cucumber';
import { HomePage } from '../../playwright/pages/HomePage';
import { LoginPage } from '../../playwright/pages/LoginPage';
import type { CustomWorld } from '../support/world';

Given('I am on the home page', async function (this: CustomWorld) {
  if (!this.page) {
    throw new Error('Playwright page is not initialized');
  }

  const home = new HomePage(this.page);
  await home.goto();
  await home.waitForLoaded();
});

When('I click the login link', async function (this: CustomWorld) {
  if (!this.page) {
    throw new Error('Playwright page is not initialized');
  }

  const home = new HomePage(this.page);
  await home.clickLogin();
});

Then('I should see the login page', async function (this: CustomWorld) {
  if (!this.page) {
    throw new Error('Playwright page is not initialized');
  }

  const login = new LoginPage(this.page);
  await login.waitForLoaded();
});
