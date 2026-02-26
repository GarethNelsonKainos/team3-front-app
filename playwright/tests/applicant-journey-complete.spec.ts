import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { JobRolesPage } from '../pages/JobRolesPage';
import { HeaderNav } from '../pages/HeaderNav';
import { JobRoleDetailPage } from '../pages/JobRoleDetailPage';
import { ApplyPage } from '../pages/ApplyPage';

test('complete applicant journey: registration to application submission', async ({ page }) => {
  const home = new HomePage(page);
  const register = new RegisterPage(page);
  const login = new LoginPage(page);
  const roles = new JobRolesPage(page);
  const nav = new HeaderNav(page);
  const roleDetail = new JobRoleDetailPage(page);
  const apply = new ApplyPage(page);

  await home.goto();
  await home.waitForLoaded();

  await register.goto();
  await register.waitForLoaded();

  const uniqueEmail = `testuser${Date.now()}@example.com`;
  await register.fillRegisterInfo(uniqueEmail, 'ValidPassword123!');
  await register.clickSignUp();

  await register.waitForLoginReady();

  await login.login(uniqueEmail, 'ValidPassword123!');

  await roles.waitForLoaded();
  await nav.waitForLoggedInNav();

  await roles.openFirstRole();
  await roleDetail.waitForLoaded();

  await roleDetail.goToApply();
  await apply.waitForLoaded();
  await apply.waitForSubmitReady();

  await apply.uploadCv();

  await apply.submit();

  await apply.waitForSubmissionComplete();

  await apply.backToRole();
  await roleDetail.waitForLoaded();
});
