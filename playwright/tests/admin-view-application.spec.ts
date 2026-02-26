import { expect, test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { JobRolesPage } from '../pages/JobRolesPage';
import { JobRoleDetailPage } from '../pages/JobRoleDetailPage';
import { JobRoleAdminPage } from '../pages/JobRoleAdminPage';
import { HeaderNav } from '../pages/HeaderNav';
import { ADMIN_CREDENTIALS } from '../helpers/auth';

test('admin can view a users application', async ({ page }) => {
    const home = new HomePage(page);
    const login = new LoginPage(page);
    const roles = new JobRolesPage(page);
    const roleDetail = new JobRoleDetailPage(page);
    const adminView = new JobRoleAdminPage(page);
    const nav = new HeaderNav(page);

    await home.goto();
    await home.waitForLoaded();
    await login.goto();
    await login.login(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
    await login.clickLoginButton();
    await nav.waitForLoggedInNav();

    await roles.waitForLoaded();
    await roles.openFirstRole();
    await roleDetail.waitForLoaded();

    expect(await roleDetail.hasApplyLink()).toBe(false);
    expect(await adminView.hasApplications()).toBe(true);
    expect(await adminView.checkApplicationLinkExists()).toBe(true);

    await roleDetail.backToJobRoles();
    await nav.logout();
    await home.waitForLoaded();

});
