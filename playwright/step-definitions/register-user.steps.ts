import { Given, Then, When } from '@cucumber/cucumber';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { expect } from 'vitest';

Given('I am on the registration page', async function () {
    const register = new RegisterPage(this.page);
    await register.goto();
    await register.waitForLoaded();
});

Then('I have entered valid personal information', async function() {
    const register = new RegisterPage(this.page);
    const validEmail = `testuser${Date.now()}@example.com`;
    const validPassword = 'ValidPassword123!';

    await register.fillRegisterInfo(validEmail, validPassword);
});

When('I click Sign Up', async function() {
    const register = new RegisterPage(this.page);
    await register.clickSignUp();
});

Then('I should be redirected to the login page', async function() {
    const login = new LoginPage(this.page);
    await login.waitForLoaded();
});

Then('I should see a successful registration notice', async function() {
    const login = new LoginPage(this.page);
    await login.waitForLoaded();

    const successMessage = await login.getSuccessMessage();
    const trimmedMessage = successMessage?.trim();
    expect(trimmedMessage).toBe('Registration successful. Please log in.');
});
