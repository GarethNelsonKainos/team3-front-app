import express from "express";
import nunjucks from "nunjucks";
import path from "node:path";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import jobRoleService from "../src/services/jobRoleService";
import jobRoleController from "../src/controllers/jobRoleController";
// Mock data for all tests
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

vi.mock("../src/services/jobRoleService");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set up Nunjucks for template rendering in tests
nunjucks.configure(path.join(__dirname, "../templates"), {
	autoescape: true,
	express: app,
});

app.use("/", jobRoleController);

describe("jobRoleController", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("GET /job-roles should render job roles list", async () => {
		vi.mocked(jobRoleService.getOpenJobRoles).mockResolvedValue(mockRoles);
		const res = await request(app).get("/job-roles");
		expect(res.status).toBe(200);
		expect(res.text).toContain("Open job roles");
		expect(res.text).toContain("Dev");
		expect(res.text).toContain("QA");
	});

	it("GET /job-roles/:id should render job role detail", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(mockRoleDetail);
		const res = await request(app).get("/job-roles/1");
		expect(res.status).toBe(200);
		expect(res.text).toContain("Dev");
		expect(res.text).toContain("Build things");
		expect(res.text).toContain("Ship features");
	});

	it("GET /job-roles/:id should show not found if role missing", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(undefined);
		const res = await request(app).get("/job-roles/999");
		expect(res.status).toBe(200);
		expect(res.text).toContain("Job role not found");
	});
});

describe("jobRoleController apply routes", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("GET /job-roles/:id/apply should render apply form if role exists", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(mockRoleDetail);
		const res = await request(app).get("/job-roles/1/apply");
		expect(res.status).toBe(200);
		expect(res.text).toContain("Apply for Dev");
		expect(res.text).toContain("Upload your CV");
		expect(res.text).toContain("Submit application");
	});

	it("GET /job-roles/:id/apply should show not found if role missing", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(undefined);
		const res = await request(app).get("/job-roles/999/apply");
		expect(res.status).toBe(200);
		expect(res.text).toContain("Job role not found");
	});

	it("POST /job-roles/:id/apply should show confirmation if role exists", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(mockRoleDetail);
		const res = await request(app)
			.post("/job-roles/1/apply")
			.type("form")
			.send({ cv: "fakefile.pdf" });
		expect(res.status).toBe(200);
		expect(res.text).toContain("Your application has been submitted");
		expect(res.text).toContain("In progress");
	});

	it("POST /job-roles/:id/apply should show not found if role missing", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(undefined);
		const res = await request(app)
			.post("/job-roles/999/apply")
			.type("form")
			.send({ cv: "fakefile.pdf" });
		expect(res.status).toBe(200);
		expect(res.text).toContain("Job role not found");
	});

	it("GET /job-roles/:id should show apply button if open and positions > 0", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue({
			...mockRoleDetail,
			status: "open",
			numberOfOpenPositions: 2,
		});
		const res = await request(app).get("/job-roles/1");
		expect(res.status).toBe(200);
		expect(res.text).toContain("Apply for this role");
	});

	it("GET /job-roles/:id should NOT show apply button if closed or no positions", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue({
			...mockRoleDetail,
			status: "closed",
			numberOfOpenPositions: 0,
		});
		const res = await request(app).get("/job-roles/1");
		expect(res.status).toBe(200);
		expect(res.text).not.toContain("Apply for this role");
	});
});
