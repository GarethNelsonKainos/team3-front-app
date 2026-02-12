import express from "express";
import nunjucks from "nunjucks";
import path from "path";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import jobRoleController from "../src/controllers/jobRoleController";
import * as jobRoleService from "../src/services/jobRoleService";

vi.mock("../src/services/jobRoleService");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set up Nunjucks for template rendering in tests
nunjucks.configure(path.join(__dirname, "../templates"), {
	autoescape: true,
	express: app,
});

app.use("/job-roles", jobRoleController);

const mockRoles = [
	{ jobRoleId: 1, roleName: "Dev", status: "open" },
	{ jobRoleId: 2, roleName: "QA", status: "open" },
];
const mockRoleDetail = {
	jobRoleId: 1,
	roleName: "Dev",
	description: "Build things",
	responsibilities: "Ship features",
	sharepointUrl: "https://sharepoint.example/job-specs/1",
	location: "Belfast",
	capability: "Engineering",
	band: "SSE",
	closingDate: "2026-03-01",
	status: "open",
	numberOfOpenPositions: 2,
};

describe("jobRoleController", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("GET /job-roles should render job roles list", async () => {
		(jobRoleService.getOpenJobRoles as any).mockResolvedValue(mockRoles);
		const res = await request(app).get("/job-roles");
		expect(res.status).toBe(200);
		expect(res.text).toContain("Open job roles");
		expect(res.text).toContain("Dev");
		expect(res.text).toContain("QA");
	});

	it("GET /job-roles/:id should render job role detail", async () => {
		(jobRoleService.getJobRoleById as any).mockResolvedValue(mockRoleDetail);
		const res = await request(app).get("/job-roles/1");
		expect(res.status).toBe(200);
		expect(res.text).toContain("Dev");
		expect(res.text).toContain("Build things");
		expect(res.text).toContain("Ship features");
	});

	it("GET /job-roles/:id should show not found if role missing", async () => {
		(jobRoleService.getJobRoleById as any).mockResolvedValue(undefined);
		const res = await request(app).get("/job-roles/999");
		expect(res.status).toBe(200);
		expect(res.text).toContain("Job role not found");
	});
});
