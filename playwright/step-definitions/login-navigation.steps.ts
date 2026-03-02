import { Given, Then, When } from '@cucumber/cucumber';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';

Given('I am on the home page', async function () {
  const home = new HomePage(this.page);
  await home.goto();
  await home.waitForLoaded();
});

When('I click the login link', async function () {
  const home = new HomePage(this.page);
  await home.clickLogin();
});

Then('I should see the login page', async function () {
  const login = new LoginPage(this.page);
  await login.waitForLoaded();
});
