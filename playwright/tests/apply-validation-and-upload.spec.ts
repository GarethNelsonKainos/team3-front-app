import { test, expect } from '@playwright/test';
import { ApplyPage } from '../pages/ApplyPage';
import { buildUrl, buildJobRoleApplyPath } from '../helpers/appUrls';
import fs from 'fs';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { APPLICANT_CREDENTIALS } from '../helpers/auth';

test.describe('Apply flow validations and uploads', () => {
  test('shows validation for required fields', async ({ page }) => {
    test.skip(!APPLICANT_CREDENTIALS.email, 'APPLICANT_CREDENTIALS not configured in env');
    // navigate directly to apply page for role 1
    // login then navigate directly to apply page for role 21
    const login = new LoginPage(page);
    await login.goto();
    await login.login(APPLICANT_CREDENTIALS.email, APPLICANT_CREDENTIALS.password);
    await page.goto(buildUrl(buildJobRoleApplyPath(21)));
    const apply = new ApplyPage(page);
    await apply.waitForLoaded();
    await apply.waitForSubmitReady();

    // Submit without attaching a CV
    await apply.submit();

    // Expect some status banner to appear indicating validation/submission result
    await apply.waitForSubmissionComplete();
    const heading = await apply.getHeadingText();
    expect(heading).toBeTruthy();
  });

  test('rejects invalid file uploads (type/size)', async ({ page }) => {
    test.skip(!APPLICANT_CREDENTIALS.email, 'APPLICANT_CREDENTIALS not configured in env');
    // create a small invalid file (text) to upload
    const dataDir = path.join(process.cwd(), 'playwright', 'data');
    try { fs.mkdirSync(dataDir, { recursive: true }); } catch {}
    const invalidFile = path.join(dataDir, 'invalid.txt');
    fs.writeFileSync(invalidFile, 'this is not a pdf');

    const login = new LoginPage(page);
    await login.goto();
    await login.login(APPLICANT_CREDENTIALS.email, APPLICANT_CREDENTIALS.password);
    await page.goto(buildUrl(buildJobRoleApplyPath(21)));
    const apply = new ApplyPage(page);
    await apply.waitForLoaded();
    await apply.waitForSubmitReady();

    // upload invalid file and submit
    await apply.uploadCv(invalidFile);
    await apply.submit();

    // should show a status banner/pill (error)
    await apply.waitForSubmissionComplete();
    // cleanup
    try { fs.unlinkSync(invalidFile); } catch {}
  });
});
