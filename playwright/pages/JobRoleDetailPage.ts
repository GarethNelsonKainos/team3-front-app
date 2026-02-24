import { type Locator, type Page } from '@playwright/test';
import { ApplicationsPanel } from './ApplicationsPanel';
import {
  buildJobRoleApplyPath,
  buildUrl,
  URL_PATTERNS,
} from './appUrls';

export class JobRoleDetailPage {
  private readonly page: Page;
  private readonly roleHeading: Locator;
  private readonly applyLink: Locator;
  private readonly backToJobRolesLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.roleHeading = this.page.locator('h1').first();
    this.applyLink = this.page.getByRole('link', { name: /Apply for this role/i });
    this.backToJobRolesLink = this.page.getByRole('link', { name: /Back to job roles/i });
  }

  async waitForLoaded() {
    await this.roleHeading.waitFor({ state: 'visible' });
  }

  async getRoleName(): Promise<string> {
    const roleName = await this.roleHeading.textContent();
    return roleName?.trim() ?? '';
  }

  async getDetailValue(label: string): Promise<string> {
    const row = this.page.locator('p', {
      has: this.page.locator('b', { hasText: `${label}:` }),
    }).first();
    const text = (await row.textContent())?.trim() ?? '';
    return text.replace(new RegExp(`^${label}:\\s*`), '').trim();
  }

  async goToApply() {
    if (await this.hasApplyLink()) {
      await this.applyLink.click();
    } else {
      const roleId = this.getRoleIdFromUrl();
      if (!roleId) {
        throw new Error('Could not determine role id from detail URL');
      }
      await this.page.goto(buildUrl(buildJobRoleApplyPath(roleId)));
    }

    await this.page.waitForURL(URL_PATTERNS.JOB_ROLE_APPLY);
  }

  async backToJobRoles() {
    await this.backToJobRolesLink.click();
    await this.page.waitForURL(URL_PATTERNS.JOB_ROLES);
  }

  async waitForBackToJobRolesLink() {
    await this.backToJobRolesLink.waitFor({ state: 'visible' });
  }

  async getApplyLinkCount(): Promise<number> {
    return this.applyLink.count();
  }

  async hasApplyLink(): Promise<boolean> {
    const count = await this.getApplyLinkCount();
    return count > 0;
  }

  getUrl(): string {
    return this.page.url();
  }

  getRoleIdFromUrl(): string | null {
    const match = this.page.url().match(/\/job-roles\/(\d+)/);
    return match ? match[1] : null;
  }

  async gotoUrl(url: string) {
    await this.page.goto(url);
    await this.page.waitForURL(url);
  }

  async waitForUrl(url: string) {
    await this.page.waitForURL(url);
  }

  applicationsPanel(): ApplicationsPanel {
    return new ApplicationsPanel(this.page);
  }
}
