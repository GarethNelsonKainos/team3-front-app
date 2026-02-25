import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { JobRolesPage } from '../pages/JobRolesPage';
import { JobRoleDetailPage } from '../pages/JobRoleDetailPage';
import { ApplyPage } from '../pages/ApplyPage';
import { APPLICANT_CREDENTIALS } from '../helpers/auth';

test('applicant can open a role apply page', async ({ page }) => {
  const login = new LoginPage(page);
  const roles = new JobRolesPage(page);
  const roleDetail = new JobRoleDetailPage(page);
  const apply = new ApplyPage(page);

  await login.goto();
  await login.login(APPLICANT_CREDENTIALS.email, APPLICANT_CREDENTIALS.password);
  await roles.waitForLoaded();

  await roles.openFirstRole();
  await roleDetail.goToApply();

  await apply.waitForLoaded();
  await apply.waitForSubmitReady();
});
