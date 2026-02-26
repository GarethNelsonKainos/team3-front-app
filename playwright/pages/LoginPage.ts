import { type Locator, type Page } from '@playwright/test';
import { buildUrl, ROUTES, URL_PATTERNS } from '../helpers/appUrls';

export class LoginPage {
  private readonly page: Page;
  private readonly heading: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly signUpLink: Locator;
  private readonly registrationMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = this.page.getByRole('heading', { name: 'Login to Kainos Careers' });
    this.emailInput = this.page.getByLabel('Email');
    this.passwordInput = this.page.getByLabel('Password');
    this.loginButton = this.page.getByRole('button', { name: 'Log in' });
    this.signUpLink = this.page.getByRole('link', { name: 'Sign Up' });
    this.registrationMessage = this.page.getByText('Registration successful. Please log in.');
  }

  async goto() {
    await this.page.goto(buildUrl(ROUTES.LOGIN));
  }

  async waitForLoaded() {
    await this.heading.waitFor({ state: 'visible' });
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForURL(URL_PATTERNS.JOB_ROLES);
  }

  async clickSignUpLink() {
    await this.signUpLink.waitFor({ state: 'visible' });
    await this.signUpLink.click();
    await this.page.waitForURL(URL_PATTERNS.REGISTER);
  }

  async getSuccessMessage() {
    await this.registrationMessage.waitFor({ state: 'visible' });
    return this.registrationMessage.textContent();
  }
}
