import { test } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { RegisterPage } from "../pages/RegisterPage";
import { LoginPage } from "../pages/LoginPage";
import { JobRolesPage } from "../pages/JobRolesPage";
import { HeaderNav } from "../pages/HeaderNav";
import { JobRoleDetailPage } from "../pages/JobRoleDetailPage";
import { log } from "console";

test("new user can register an account and sign in to view job roles", async ({ page }) => {
    const home = new HomePage(page);
    const register = new RegisterPage(page);
    const login = new LoginPage(page);
    const header = new HeaderNav(page);
    const rolesPage = new JobRolesPage(page);
    const detailsPage = new JobRoleDetailPage(page);

    await home.goto();
    await home.clickLogin();
    await login.clickSignUpLink();

    const newUserEmail = `newuser${Date.now()}@example.com`;
    const newUserPassword = "NewPassword1!"

    await register.register(newUserEmail, newUserPassword);
    await register.waitForLoginReady();

    await login.goto();
    await login.waitForLoaded();
    await login.login(newUserEmail, newUserPassword);

    await rolesPage.waitForLoaded();
    await rolesPage.openFirstRole();

    await detailsPage.waitForLoaded();
    await detailsPage.waitForBackToJobRolesLink();
    await detailsPage.backToJobRoles();

    await rolesPage.waitForLoaded();
    await header.waitForLoggedInNav();
    await header.logout();
    await home.waitForLoaded();

    log(`Registered, logged in, viewed a job role, and signed out using email: ${newUserEmail}`);
});