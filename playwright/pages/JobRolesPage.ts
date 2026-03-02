import { type Locator, type Page } from '@playwright/test';
import { buildUrl, ROUTES, URL_PATTERNS } from '../helpers/appUrls';

export interface RoleRowData {
  name: string;
  location: string;
  capability: string;
  band: string;
  closingDate: string;
}

export class JobRolesPage {
  private readonly page: Page;
  private readonly heading: Locator;
  private readonly roleRows: Locator;
  private readonly viewLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = this.page.getByRole('heading', { name: 'Open job roles' });
    this.roleRows = this.page.locator('.job-roles-table tbody tr');
    this.viewLinks = this.page.getByRole('link', { name: 'View' });
  }

  async goto() {
    await this.page.goto(buildUrl(ROUTES.JOB_ROLES));
  }

  async waitForLoaded() {
    await this.heading.waitFor({ state: 'visible' });
  }

  getRoleRow(index: number): Locator {
    return this.roleRows.nth(index);
  }

  async getRoleRowData(index: number): Promise<RoleRowData> {
    const row = this.getRoleRow(index);
    const cells = row.locator('td');
    const name = (await cells.nth(0).textContent())?.trim() ?? '';
    const location = (await cells.nth(2).textContent())?.trim() ?? '';
    const capability = (await cells.nth(3).textContent())?.trim() ?? '';
    const band = (await cells.nth(4).textContent())?.trim() ?? '';
    const closingDate = (await cells.nth(5).textContent())?.trim() ?? '';

    return { name, location, capability, band, closingDate };
  }

  async getViewLinksCount(): Promise<number> {
    return this.viewLinks.count();
  }

  async openRoleByIndex(index: number) {
    const row = this.getRoleRow(index);
    await row.getByRole('link', { name: 'View' }).click();
    await this.page.waitForURL(URL_PATTERNS.JOB_ROLE_DETAIL);
  }

  async openFirstRole() {
    await this.openRoleByIndex(0);
  }

  async waitForJobRoles() {
    await this.roleRows.first().waitFor({ state: 'visible' });
  } 
}
