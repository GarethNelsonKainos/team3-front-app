import { type Locator, type Page } from '@playwright/test';
import { buildUrl, ROUTES, URL_PATTERNS } from './appUrls';

export class HomePage {
  private readonly page: Page;
  private readonly heading: Locator;
  private readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = this.page.getByRole('heading', { name: 'Welcome to Kainos Careers' });
    this.loginLink = this.page.getByRole('link', { name: 'Login' });
  }

  async goto() {
    await this.page.goto(buildUrl(ROUTES.HOME));
  }

  async waitForLoaded() {
    await this.heading.waitFor({ state: 'visible' });
  }

  async clickLogin() {
    await this.loginLink.click();
    await this.page.waitForURL(URL_PATTERNS.LOGIN);
  }
}
