import { Given, When, Then } from '@cucumber/cucumber';
import { JobRolesPage } from '../pages/JobRolesPage';
import { APPLICANT_CREDENTIALS } from '../helpers/auth';
import { LoginPage } from '../pages/LoginPage';
import { JobRoleDetailPage } from '../pages/JobRoleDetailPage';

Given('I am on the login page', async function () {
  const login = new LoginPage(this.page);
  await login.goto();
});

When('I enter valid credentials', async function () {
  const login = new LoginPage(this.page);
  await login.login(APPLICANT_CREDENTIALS.email, APPLICANT_CREDENTIALS.password);
});

Then("I click the login button", async function () {
  const login = new LoginPage(this.page);
  await login.clickLoginButton();
});

Then('I should be redirected to the open job roles page', async function () {
  const roles = new JobRolesPage(this.page);
  await roles.waitForLoaded();
});

Then('I should see a list of active job roles', async function () {
  const roles = new JobRolesPage(this.page);
  await roles.waitForJobRoles();
});

When('I click on a job role', async function () {
  const roles = new JobRolesPage(this.page);
  await roles.openFirstRole();
});

Then('I should see the job role information details', async function () {
  const roleDetail = new JobRoleDetailPage(this.page);
  await roleDetail.waitForLoaded();
});