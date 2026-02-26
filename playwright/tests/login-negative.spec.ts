import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage'; 

test('applicant cannot sign in with invalid credentials', async ({ page }) => {
    const login = new LoginPage(page);
    const invalidCredentials = {
        email: 'invalid@example.com',
        password: 'invalidpassword'
    };
    await login.goto();
    await login.login(invalidCredentials.email, invalidCredentials.password, { expectSuccess: false } );
    await login.assertErrorMessage('Invalid email or password');
});