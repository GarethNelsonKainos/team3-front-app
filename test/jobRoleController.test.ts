import path from "node:path";
import axios from "axios";
import cookieParser from "cookie-parser";
import express from "express";
import nunjucks from "nunjucks";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import jobRoleController from "../src/controllers/jobRoleController";
import jobRoleService from "../src/services/jobRoleService";

// Mock data for all tests
const mockRoles = [
	{
		jobRoleId: 1,
		roleName: "Dev",
		location: "Belfast",
		closingDate: "2026-03-01",
		responsibilities: "Ship features",
		sharepointUrl: "https://sharepoint.example/job-specs/1",
		numberOfOpenPositions: 2,
		capability: { capabilityId: 1, capabilityName: "Engineering" },
		band: { bandId: 1, bandName: "SSE" },
		status: { statusId: 1, statusName: "open" },
	},
	{
		jobRoleId: 2,
		roleName: "QA",
		location: "Dublin",
		closingDate: "2026-04-01",
		responsibilities: "Test features",
		sharepointUrl: "https://sharepoint.example/job-specs/2",
		numberOfOpenPositions: 1,
		capability: { capabilityId: 2, capabilityName: "Quality" },
		band: { bandId: 2, bandName: "SE" },
		status: { statusId: 1, statusName: "open" },
	},
];
const mockRoleDetail = {
	jobRoleId: 1,
	roleName: "Dev",
	description: "Build things",
	responsibilities: "Ship features",
	sharepointUrl: "https://sharepoint.example/job-specs/1",
	location: "Belfast",
	capability: { capabilityId: 1, capabilityName: "Engineering" },
	band: { bandId: 1, bandName: "SSE" },
	closingDate: "2026-03-01",
	status: { statusId: 1, statusName: "open" },
	numberOfOpenPositions: 2,
};

vi.mock("../src/services/jobRoleService");
vi.mock("axios", () => ({
	default: {
		post: vi.fn(),
	},
}));

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Set up Nunjucks for template rendering in tests
nunjucks.configure(path.join(__dirname, "../templates"), {
	autoescape: true,
	express: app,
});

app.use("/", jobRoleController);

describe("jobRoleController", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(jobRoleService.getJobRoleApplications).mockResolvedValue([]);
		vi.mocked(jobRoleService.hireApplication).mockResolvedValue();
		vi.mocked(jobRoleService.rejectApplication).mockResolvedValue();
	});

	it("GET /job-roles should render job roles list", async () => {
		vi.mocked(jobRoleService.getOpenJobRoles).mockResolvedValue({
			roles: mockRoles,
			totalCount: 2,
		});
		const res = await request(app)
			.get("/job-roles")
			.set("Cookie", "token=test-jwt-token");
		expect(res.status).toBe(200);
		expect(res.text).toContain("Open job roles");
		expect(res.text).toContain("Dev");
		expect(res.text).toContain("QA");
		expect(vi.mocked(jobRoleService.getOpenJobRoles)).toHaveBeenCalledWith(
			expect.any(Object),
			"test-jwt-token",
		);
	});

	it("GET /job-roles should handle missing token cookie", async () => {
		vi.mocked(jobRoleService.getOpenJobRoles).mockResolvedValue({
			roles: [],
			totalCount: 0,
		});
		const res = await request(app).get("/job-roles"); // No Cookie header
		expect(res.status).toBe(200);
		expect(res.text).toContain("Open job roles"); // Page still renders
		expect(vi.mocked(jobRoleService.getOpenJobRoles)).toHaveBeenCalledWith(
			expect.any(Object),
			undefined,
		);
	});

	it("GET /job-roles should show last link when total count exists", async () => {
		vi.mocked(jobRoleService.getOpenJobRoles).mockResolvedValue({
			roles: mockRoles,
			totalCount: 25,
		});
		const res = await request(app).get("/job-roles");
		expect(res.status).toBe(200);
		expect(res.text).toContain("Page 1 of 3");
		expect(res.text).toContain(">Last<");
	});

	it("GET /job-roles should hide last link when total count is missing", async () => {
		vi.mocked(jobRoleService.getOpenJobRoles).mockResolvedValue({
			roles: mockRoles,
			totalCount: undefined,
		});
		const res = await request(app).get("/job-roles");
		expect(res.status).toBe(200);
		expect(res.text).toContain("Page 1");
		expect(res.text).not.toContain(">Last<");
	});

	it("GET /job-roles with valid ordering params should pass to service", async () => {
		vi.mocked(jobRoleService.getOpenJobRoles).mockResolvedValue({
			roles: mockRoles,
			totalCount: 2,
		});
		const res = await request(app).get(
			"/job-roles?orderBy=roleName&orderDir=asc",
		);
		expect(res.status).toBe(200);
		expect(jobRoleService.getOpenJobRoles).toHaveBeenCalledWith(
			expect.objectContaining({
				orderBy: "roleName",
				orderDir: "asc",
				limit: 11,
				offset: 0,
			}),
			undefined,
		);
	});

	it("GET /job-roles with invalid orderDir should ignore param", async () => {
		vi.mocked(jobRoleService.getOpenJobRoles).mockResolvedValue({
			roles: mockRoles,
			totalCount: 2,
		});
		const res = await request(app).get(
			"/job-roles?orderBy=roleName&orderDir=random",
		);
		expect(res.status).toBe(200);
		expect(jobRoleService.getOpenJobRoles).toHaveBeenCalledWith(
			expect.objectContaining({
				orderBy: "roleName",
				orderDir: undefined,
				limit: 11,
				offset: 0,
			}),
			undefined,
		);
	});

	it("GET /job-roles with invalid orderBy should ignore param", async () => {
		vi.mocked(jobRoleService.getOpenJobRoles).mockResolvedValue({
			roles: mockRoles,
			totalCount: 2,
		});
		const res = await request(app).get(
			"/job-roles?orderBy=notAColumn&orderDir=asc",
		);
		expect(res.status).toBe(200);
		expect(jobRoleService.getOpenJobRoles).toHaveBeenCalledWith(
			expect.objectContaining({
				orderBy: undefined,
				orderDir: "asc",
				limit: 11,
				offset: 0,
			}),
			undefined,
		);
	});

	it("GET /job-roles with no ordering params should not set them", async () => {
		vi.mocked(jobRoleService.getOpenJobRoles).mockResolvedValue({
			roles: mockRoles,
			totalCount: 2,
		});
		const res = await request(app).get("/job-roles");
		expect(res.status).toBe(200);
		expect(jobRoleService.getOpenJobRoles).toHaveBeenCalledWith(
			expect.objectContaining({
				orderBy: undefined,
				orderDir: undefined,
				limit: 11,
				offset: 0,
			}),
			undefined,
		);
	});

	it("GET /job-roles page=2 should set offset to 10", async () => {
		vi.mocked(jobRoleService.getOpenJobRoles).mockResolvedValue({
			roles: mockRoles,
			totalCount: 2,
		});
		const res = await request(app).get("/job-roles?page=2");
		expect(res.status).toBe(200);
		expect(jobRoleService.getOpenJobRoles).toHaveBeenCalledWith(
			expect.objectContaining({
				limit: 11,
				offset: 10,
			}),
			undefined,
		);
	});

	it("GET /job-roles/:id should render job role detail", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(mockRoleDetail);
		vi.mocked(jobRoleService.getJobRoleApplications).mockResolvedValue([]);
		const res = await request(app)
			.get("/job-roles/1")
			.set("Cookie", "token=test-jwt-token");
		expect(res.status).toBe(200);
		expect(res.text).toContain("Dev");
		expect(res.text).toContain("Build things");
		expect(res.text).toContain("Ship features");
		expect(vi.mocked(jobRoleService.getJobRoleById)).toHaveBeenCalledWith(
			"1",
			"test-jwt-token",
		);
		expect(
			vi.mocked(jobRoleService.getJobRoleApplications),
		).toHaveBeenCalledWith("1", "test-jwt-token");
	});

	it("GET /job-roles/:id should render applications list for admins", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(mockRoleDetail);
		vi.mocked(jobRoleService.getJobRoleApplications).mockResolvedValue([
			{
				applicationId: 101,
				applicationStatus: "InProgress",
				email: "candidate@example.com",
				cvUrl: "https://example-bucket.s3.amazonaws.com/cv.pdf",
			},
		]);

		const res = await request(app)
			.get("/job-roles/1")
			.set("Cookie", "token=test-jwt-token");

		expect(res.status).toBe(200);
		expect(res.text).toContain("Applications for this role");
		expect(res.text).toContain("candidate@example.com");
		expect(res.text).toContain("Hire");
		expect(res.text).toContain("Reject");
	});

	it("GET /job-roles/:id should hide applications list for non-admin users", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(mockRoleDetail);
		vi.mocked(jobRoleService.getJobRoleApplications).mockRejectedValue({
			response: { status: 403 },
		});

		const res = await request(app)
			.get("/job-roles/1")
			.set("Cookie", "token=test-jwt-token");

		expect(res.status).toBe(200);
		expect(res.text).not.toContain("Applications for this role");
	});

	it("POST /job-roles/:id/applications/:applicationId/hire should update and redirect", async () => {
		vi.mocked(jobRoleService.hireApplication).mockResolvedValue();

		const res = await request(app)
			.post("/job-roles/1/applications/101/hire")
			.set("Cookie", "token=test-jwt-token");

		expect(res.status).toBe(302);
		expect(res.headers.location).toContain("/job-roles/1?success=");
		expect(vi.mocked(jobRoleService.hireApplication)).toHaveBeenCalledWith(
			"101",
			"test-jwt-token",
		);
	});

	it("POST /job-roles/:id/applications/:applicationId/reject should update and redirect", async () => {
		vi.mocked(jobRoleService.rejectApplication).mockResolvedValue();

		const res = await request(app)
			.post("/job-roles/1/applications/101/reject")
			.set("Cookie", "token=test-jwt-token");

		expect(res.status).toBe(302);
		expect(res.headers.location).toContain("/job-roles/1?success=");
		expect(vi.mocked(jobRoleService.rejectApplication)).toHaveBeenCalledWith(
			"101",
			"test-jwt-token",
		);
	});

	it("GET /job-roles/:id should show not found if role missing", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(undefined);
		const res = await request(app)
			.get("/job-roles/999")
			.set("Cookie", "token=test-jwt-token");
		expect(res.status).toBe(200);
		expect(res.text).toContain("Job role not found");
	});
});

describe("jobRoleController apply routes", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(jobRoleService.applyForJobRole).mockResolvedValue({
			applicationId: 1,
			userId: 2,
			jobRoleId: 1,
			applicationStatus: "InProgress",
			cvUrl: "applications/cv.pdf",
		});
	});

	it("GET /job-roles/:id/apply should render apply form if role exists", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(mockRoleDetail);
		const res = await request(app)
			.get("/job-roles/1/apply")
			.set("Cookie", "token=test-jwt-token");
		expect(res.status).toBe(200);
		expect(res.text).toContain("Apply for Dev");
		expect(res.text).toContain("Upload your CV");
		expect(res.text).toContain("Submit application");
		expect(vi.mocked(jobRoleService.getJobRoleById)).toHaveBeenCalledWith(
			"1",
			"test-jwt-token",
		);
	});

	it("GET /job-roles/:id/apply should show not found if role missing", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(undefined);
		const res = await request(app)
			.get("/job-roles/999/apply")
			.set("Cookie", "token=test-jwt-token");
		expect(res.status).toBe(200);
		expect(res.text).toContain("Job role not found");
	});

	it("POST /job-roles/:id/apply should show confirmation if role exists", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(mockRoleDetail);
		const res = await request(app)
			.post("/job-roles/1/apply")
			.set("Cookie", "token=test-jwt-token")
			.attach("cv", Buffer.from("%PDF-1.4 test file"), {
				filename: "resume.pdf",
				contentType: "application/pdf",
			});
		expect(res.status).toBe(200);
		expect(res.text).toContain("Your application has been submitted");
		expect(res.text).toContain("In progress");
		expect(vi.mocked(axios.post)).toHaveBeenCalled();
		expect(vi.mocked(jobRoleService.getJobRoleById)).toHaveBeenCalledWith(
			"1",
			"test-jwt-token",
		);
	});

	it("POST /job-roles/:id/apply should show upload validation error for invalid file type", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(mockRoleDetail);
		const res = await request(app)
			.post("/job-roles/1/apply")
			.set("Cookie", "token=test-jwt-token")
			.attach("cv", Buffer.from("not a cv"), {
				filename: "resume.png",
				contentType: "image/png",
			});

		expect(res.status).toBe(200);
		expect(res.text).toContain("Only PDF, DOC, and DOCX files are allowed.");
		expect(vi.mocked(axios.post)).not.toHaveBeenCalled();
	});

	it("POST /job-roles/:id/apply should show backend error if submission fails", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(mockRoleDetail);
		vi.mocked(axios.post).mockRejectedValueOnce(new Error("Backend down"));

		const res = await request(app)
			.post("/job-roles/1/apply")
			.set("Cookie", "token=test-jwt-token")
			.attach("cv", Buffer.from("%PDF-1.4 test file"), {
				filename: "resume.pdf",
				contentType: "application/pdf",
			});

		expect(res.status).toBe(200);
		expect(res.text).toContain(
			"Error submitting application. Please try again.",
		);
		expect(vi.mocked(axios.post)).toHaveBeenCalled();
	});

	it("POST /job-roles/:id/apply should show not found if role missing", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(undefined);
		const res = await request(app)
			.post("/job-roles/999/apply")
			.set("Cookie", "token=test-jwt-token")
			.attach("cv", Buffer.from("fake-pdf-content"), {
				filename: "fakefile.pdf",
				contentType: "application/pdf",
			});
		expect(res.status).toBe(200);
		expect(res.text).toContain("Job role not found");
	});

	it("POST /job-roles/:id/apply should show validation error when cv is missing", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(mockRoleDetail);
		const res = await request(app)
			.post("/job-roles/1/apply")
			.set("Cookie", "token=test-jwt-token");
		expect(res.status).toBe(200);
		expect(res.text).toContain("Please upload your CV as a PDF file.");
		expect(vi.mocked(jobRoleService.applyForJobRole)).not.toHaveBeenCalled();
	});

	it("GET /job-roles/:id should show apply button if open and positions > 0", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue({
			...mockRoleDetail,
			status: { statusId: 1, statusName: "open" },
			numberOfOpenPositions: 2,
		});
		const res = await request(app)
			.get("/job-roles/1")
			.set("Cookie", "token=test-jwt-token");
		expect(res.status).toBe(200);
		expect(res.text).toContain("Apply for this role");
	});

	it("GET /job-roles/:id should NOT show apply button if closed or no positions", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue({
			...mockRoleDetail,
			status: { statusId: 2, statusName: "closed" },
			numberOfOpenPositions: 0,
		});
		const res = await request(app)
			.get("/job-roles/1")
			.set("Cookie", "token=test-jwt-token");
		expect(res.status).toBe(200);
		expect(res.text).not.toContain("Apply for this role");
	});
});
