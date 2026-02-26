import { type Locator, type Page } from '@playwright/test';
import { URL_PATTERNS } from '../helpers/appUrls';

export class ApplyPage {
  private static readonly DEFAULT_CV_PATH = 'playwright/data/cv-template.pdf';

  private readonly page: Page;
  private readonly heading: Locator;
  private readonly submitButton: Locator;
  private readonly cvInput: Locator;
  private readonly statusBanner: Locator;
  private readonly statusPill: Locator;
  private readonly backToRoleLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = this.page.getByRole('heading', { name: /Apply for/i });
    this.submitButton = this.page.getByRole('button', { name: /Submit application/i });
    this.cvInput = this.page.locator('input[name="cv"]');
    this.statusBanner = this.page.locator('.status-banner');
    this.statusPill = this.page.locator('.status-pill');
    this.backToRoleLink = this.page.getByRole('link', { name: /Back to role/i });
  }

  async waitForLoaded() {
    await this.heading.waitFor({ state: 'visible' });
  }

  async waitForSubmitReady() {
    await this.submitButton.waitFor({ state: 'visible' });
  }

  async getHeadingText(): Promise<string> {
    const text = await this.heading.first().textContent();
    return text?.trim() ?? '';
  }

  async uploadCv(filePath: string = ApplyPage.DEFAULT_CV_PATH) {
    await this.cvInput.setInputFiles(filePath);
  }

  async submit() {
    await this.submitButton.click();
  }

  async waitForSubmissionComplete() {
    try {
      await this.statusBanner.waitFor({ state: 'visible', timeout: 10000 });
    } catch {}
    try {
      await this.statusPill.waitFor({ state: 'visible', timeout: 10000 });
    } catch {}
  }

  async backToRole() {
    await this.backToRoleLink.click();
    await this.page.waitForURL(URL_PATTERNS.JOB_ROLE_DETAIL);
  }
}
