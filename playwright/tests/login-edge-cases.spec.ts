import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login edge cases', () => {
  test('shows validation for invalid email format', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('not-an-email', 'password123', { expectSuccess: false });
    const message = await login.getEmailValidationMessage();
    expect(message).toBeTruthy();
  });
});
