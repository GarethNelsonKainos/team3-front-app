import { type Locator, type Page } from '@playwright/test';

export class ApplicationsPanel {
  private readonly page: Page;
  private readonly applicationsTable: Locator;
  private readonly rows: Locator;
  private readonly noApplicationsMessage: Locator;
  private readonly heading: Locator;
  private readonly cvLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.applicationsTable = page.locator('.job-roles-table');
    this.rows = page.locator('tbody tr');
    this.noApplicationsMessage = page.locator('.application-feedback.error');
    this.heading = this.page.getByRole('heading', { name: /Applications for this role/i });
    this.cvLinks = this.page.locator('a[href^="/api/applications/cv"]');
  }

  async waitForVisible() {
    await this.heading.waitFor({ state: 'visible' });
  }

  async getRowCount(): Promise<number> {
    if (await this.applicationsTable.isVisible()) {
      return await this.rows.count();
    }
    return 0;
  }

  async getCvLinkCount(): Promise<number> {
    return await this.cvLinks.count();
  }

  async hasNoApplicationsMessage(): Promise<boolean> {
    const text = await this.noApplicationsMessage.textContent().catch(() => '');
    return Boolean(text && text.includes('No applications found'));
  }

  async getFirstRowStatusText(): Promise<string> {
    if (!(await this.applicationsTable.isVisible())) {
      return '';
    }
    const statusCell = this.rows.first().locator('td').nth(1);
    return (await statusCell.textContent())?.trim() ?? '';
  }
}
