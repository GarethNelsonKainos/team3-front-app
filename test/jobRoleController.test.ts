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
		vi.mocked(axios.post).mockResolvedValue({} as any);
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

	it("POST /job-roles/:id/apply should show generic error if submission fails with no response", async () => {
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
			"An unexpected error occurred. Please try again.",
		);
		expect(vi.mocked(axios.post)).toHaveBeenCalled();
	});

	it("POST /job-roles/:id/apply should show backend message for 400 errors with message", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(mockRoleDetail);
		vi.mocked(axios.post).mockRejectedValueOnce({
			response: {
				status: 400,
				data: { message: "Invalid CV format or missing required documents" },
			},
		});

		const res = await request(app)
			.post("/job-roles/1/apply")
			.set("Cookie", "token=test-jwt-token")
			.attach("cv", Buffer.from("%PDF-1.4 test file"), {
				filename: "resume.pdf",
				contentType: "application/pdf",
			});

		expect(res.status).toBe(200);
		expect(res.text).toContain(
			"Invalid CV format or missing required documents",
		);
		expect(res.text).not.toContain("An unexpected error occurred");
	});

	it("POST /job-roles/:id/apply should show default message for 400 errors without message", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(mockRoleDetail);
		vi.mocked(axios.post).mockRejectedValueOnce({
			response: {
				status: 400,
				data: {},
			},
		});

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
	});

	it("POST /job-roles/:id/apply should show generic error for non-400 server errors", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(mockRoleDetail);
		vi.mocked(axios.post).mockRejectedValueOnce({
			response: {
				status: 500,
				data: { message: "Internal server error" },
			},
		});

		const res = await request(app)
			.post("/job-roles/1/apply")
			.set("Cookie", "token=test-jwt-token")
			.attach("cv", Buffer.from("%PDF-1.4 test file"), {
				filename: "resume.pdf",
				contentType: "application/pdf",
			});

		expect(res.status).toBe(200);
		expect(res.text).toContain(
			"An unexpected error occurred. Please try again.",
		);
		expect(res.text).not.toContain("Internal server error");
	});

	it("POST /job-roles/:id/apply should show generic error for errors without response", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(mockRoleDetail);
		vi.mocked(axios.post).mockRejectedValueOnce({
			message: "Network error",
		});

		const res = await request(app)
			.post("/job-roles/1/apply")
			.set("Cookie", "token=test-jwt-token")
			.attach("cv", Buffer.from("%PDF-1.4 test file"), {
				filename: "resume.pdf",
				contentType: "application/pdf",
			});

		expect(res.status).toBe(200);
		expect(res.text).toContain(
			"An unexpected error occurred. Please try again.",
		);
	});

	it("POST /job-roles/:id/apply should show not found if role missing", async () => {
		vi.mocked(jobRoleService.getJobRoleById).mockResolvedValue(undefined);
		const res = await request(app)
			.post("/job-roles/999/apply")
			.set("Cookie", "token=test-jwt-token")
			.type("form")
			.send({ cv: "fakefile.pdf" });
		expect(res.status).toBe(200);
		expect(res.text).toContain("Job role not found");
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
