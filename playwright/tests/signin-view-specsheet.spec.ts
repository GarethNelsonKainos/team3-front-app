import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { JobRolesPage } from '../pages/JobRolesPage';
import { JobRoleDetailPage } from '../pages/JobRoleDetailPage';
import { APPLICANT_CREDENTIALS } from '../helpers/auth';

test('applicant can sign in and view a job role information page', async ({ page }) => {
  const login = new LoginPage(page);
  const roles = new JobRolesPage(page);
  const roleDetail = new JobRoleDetailPage(page);

  await login.goto();
  await login.login(APPLICANT_CREDENTIALS.email, APPLICANT_CREDENTIALS.password);
  await login.clickLoginButton();
  await roles.waitForLoaded();

  await roles.openFirstRole();
  await roleDetail.waitForLoaded();
  await roleDetail.waitForBackToJobRolesLink();
});