import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { JobRolesPage } from '../pages/JobRolesPage';
import { JobRoleDetailPage } from '../pages/JobRoleDetailPage';
import { ApplyPage } from '../pages/ApplyPage';
import { APPLICANT_CREDENTIALS } from '../helpers/auth';

test.describe('Applicant Multiple Roles Navigation', () => {
  test('navigates through multiple roles and verifies consistency', async ({ page }) => {
    const login = new LoginPage(page);
    const roles = new JobRolesPage(page);
    const roleDetail = new JobRoleDetailPage(page);
    const apply = new ApplyPage(page);

    await login.goto();
    await login.login(APPLICANT_CREDENTIALS.email, APPLICANT_CREDENTIALS.password);
    await roles.waitForLoaded();

    const totalLinks = await roles.getViewLinksCount();
    console.log(`Total job roles available: ${totalLinks}`);

    const rolesToTest = Math.min(3, totalLinks);
    if (rolesToTest === 0) {
      return;
    }
    const roleUrls: string[] = [];

    for (let i = 0; i < rolesToTest; i++) {
      console.log(`\nNavigating to role ${i + 1}...`);

      if (i > 0) {
        await roles.goto();
        await roles.waitForLoaded();
      }

      await roles.openRoleByIndex(i);
      await roleDetail.waitForLoaded();

      const roleDetailUrl = roleDetail.getUrl();
      roleUrls.push(roleDetailUrl);
      console.log(`Role ${i + 1}: URL=${roleDetailUrl}`);

      if (await roleDetail.hasApplyLink()) {
        await roleDetail.goToApply();
        await apply.waitForLoaded();
        console.log('Apply page reached');

        await apply.backToRole();
        await roleDetail.waitForLoaded();
      } else {
        console.log(`Apply button not visible for role ${i + 1} (may be admin user or closed role)`);
        await roleDetail.backToJobRoles();
        continue;
      }

      await roleDetail.backToJobRoles();
    }

    console.log('\nVerifying direct navigation to stored roles...');
    for (const roleUrl of roleUrls) {
      await roleDetail.gotoUrl(roleUrl);
      await roleDetail.waitForLoaded();
      console.log(`✓ Direct navigation successful: ${roleUrl}`);
    }

    console.log('\nVerifying breadcrumb trail...');

    let foundLink = false;
    for (let i = 0; i < roleUrls.length; i++) {
      await roleDetail.gotoUrl(roleUrls[i]);
      await roleDetail.waitForLoaded();
  
      if (await roleDetail.hasApplyLink()) {
        await roleDetail.goToApply();
        await apply.waitForLoaded();
  
        await apply.backToRole();
        await roleDetail.waitForUrl(roleUrls[i]);
  
        await roleDetail.backToJobRoles();
  
        console.log('✓ Breadcrumb trail (apply → detail → list) works correctly');
        foundLink = true;
        break;
      } else {
        console.log(`Apply button not visible for role ${i + 1}, skipping first breadcrumb test`);
        await roleDetail.backToJobRoles();
      }
    }
    
    if (!foundLink) {
      throw new Error(`No apply link found for any role, unable to verify breadcrumb trail`);
    }
  });
});
