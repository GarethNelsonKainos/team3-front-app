import { type Locator, type Page } from '@playwright/test';

export class HeaderNav {
  private readonly page: Page;
  private readonly nav: Locator;
  private readonly jobRolesLink: Locator;
  private readonly logoutButton: Locator;
  private readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = this.page.locator('nav');
    this.jobRolesLink = this.nav.getByRole('link', { name: 'Job roles' });
    this.logoutButton = this.nav.getByRole('button', { name: 'Logout' });
    this.loginLink = this.nav.getByRole('link', { name: 'Login' });
  }

  async waitForLoggedInNav() {
    await this.jobRolesLink.waitFor({ state: 'visible' });
    await this.logoutButton.waitFor({ state: 'visible' });
  }

  async waitForLoggedOutNav() {
    await this.loginLink.waitFor({ state: 'visible' });
  }

  async logout() {
    await this.logoutButton.click();
  }
}
