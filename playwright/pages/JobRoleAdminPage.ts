import { JobRolesPage } from "./JobRolesPage";
import { type Locator, type Page } from "@playwright/test";

export class JobRoleAdminPage extends JobRolesPage {
    private readonly adminHeading : Locator
    private readonly applicationsTable: Locator
    private readonly firstApplicationLink: Locator

    constructor(page: Page) {
        super(page)
        this.adminHeading = page.getByRole('heading', { name: 'Applications for this role' })
        this.applicationsTable = page.getByRole('columnheader', { name: 'Applicant' })
        this.firstApplicationLink = page.getByRole('cell').nth(0).getByRole('link').nth(0)
    }

    async waitForLoaded() {
        await super.waitForLoaded()
        await this.adminHeading.waitFor({ state: 'visible' })
    }

    async hasApplications() {
        return await this.applicationsTable.isVisible()
    }

    async checkApplicationLinkExists() {
        return await this.firstApplicationLink.isVisible();
    }
}