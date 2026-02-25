import { type Locator, type Page } from '@playwright/test';
import { buildUrl, ROUTES, URL_PATTERNS } from '../helpers/appUrls';

export class RegisterPage {
  private readonly page: Page;
  private readonly heading: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signUpButton: Locator;
  private readonly loginButton: Locator;
  private readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = this.page.getByRole('heading', { name: 'Sign Up to Kainos Careers' });
    this.emailInput = this.page.getByLabel('Email');
    this.passwordInput = this.page.getByLabel('Password');
    this.signUpButton = this.page.getByRole('button', { name: 'Sign Up' });
    this.loginButton = this.page.getByRole('button', { name: 'Log in' });
    this.loginLink = this.page.getByRole('link', { name: 'Log In' });
  }

  async goto() {
    await this.page.goto(buildUrl(ROUTES.REGISTER));
  }

  async waitForLoaded() {
    await this.heading.waitFor({ state: 'visible' });
  }

  async register(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signUpButton.click();
  }

  async waitForLoginReady() {
    await this.loginButton.waitFor({ state: 'visible', timeout: 5000 });
  }

  async clickLoginLink() {
    await this.loginLink.waitFor({ state: 'visible' });
    await this.loginLink.click();
    await this.page.waitForURL(URL_PATTERNS.LOGIN);
  }
}
